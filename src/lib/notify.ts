/**
 * Notification helper — sends in-app notifications + web push.
 *
 * Usage:
 *   import { notifyMember, notifyMembers, notifyTaggedPeople } from "@/lib/notify";
 *
 *   await notifyMember(supabase, sholandaId, "assignment", "You're on 'Red Flag or Real Life' — Drop-by Thursday", "/portal/run-sheet");
 */

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/db";

type SupabaseClient = ReturnType<typeof createClient>;
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type PushSubRow = Database["public"]["Tables"]["push_subscriptions"]["Row"];

// ===========================================================================
// In-app notifications (notifications table)
// ===========================================================================

/**
 * Send a notification to a single member.
 * Inserts into the notifications table (shows in their notification area + bell badge).
 * Also attempts to send a web push if they have push subscriptions.
 */
export async function notifyMember(
  supabase: SupabaseClient,
  memberId: string,
  kind: string,
  body: string,
  link?: string,
): Promise<void> {
  // Insert in-app notification
  await supabase.from("notifications").insert({
    user_id: memberId,
    kind,
    body,
    link: link ?? null,
  });

  // Try to send web push
  await sendPushToMember(supabase, memberId, body, link);
}

/**
 * Send a notification to multiple members.
 */
export async function notifyMembers(
  supabase: SupabaseClient,
  memberIds: string[],
  kind: string,
  body: string,
  link?: string,
): Promise<void> {
  if (memberIds.length === 0) return;

  // Insert in-app notifications (batch)
  await supabase.from("notifications").insert(
    memberIds.map((id) => ({
      user_id: id,
      kind,
      body,
      link: link ?? null,
    })),
  );

  // Send web push to each
  await Promise.all(memberIds.map((id) => sendPushToMember(supabase, id, body, link)));
}

/**
 * Notify everyone tagged in a clip (clip_people).
 */
export async function notifyTaggedPeople(
  supabase: SupabaseClient,
  clipId: string,
  kind: string,
  body: string,
  link?: string,
  excludeMemberId?: string,
): Promise<void> {
  const { data: people } = await supabase
    .from("clip_people")
    .select("member_id")
    .eq("clip_id", clipId);

  const ids = (people ?? [])
    .map((p) => p.member_id)
    .filter((id) => id !== excludeMemberId);

  await notifyMembers(supabase, ids, kind, body, link);
}

/**
 * Notify everyone assigned to a clip (content_assignments).
 */
export async function notifyAssignedPeople(
  supabase: SupabaseClient,
  clipId: string,
  kind: string,
  body: string,
  link?: string,
  excludeMemberId?: string,
): Promise<void> {
  const { data: assignments } = await supabase
    .from("content_assignments")
    .select("member_id")
    .eq("clip_id", clipId);

  const ids = (assignments ?? [])
    .map((a) => a.member_id)
    .filter((id) => id !== excludeMemberId);

  // Deduplicate
  const uniqueIds = [...new Set(ids)];
  await notifyMembers(supabase, uniqueIds, kind, body, link);
}

/**
 * Notify all admins + content planners.
 */
export async function notifyAdminsAndPlanners(
  supabase: SupabaseClient,
  kind: string,
  body: string,
  link?: string,
  excludeMemberId?: string,
): Promise<void> {
  const { data: members } = await supabase
    .from("members")
    .select("id")
    .or("role.eq.admin,can_plan_content.eq.true");

  const ids = (members ?? [])
    .map((m) => m.id)
    .filter((id) => id !== excludeMemberId);

  await notifyMembers(supabase, ids, kind, body, link);
}

// ===========================================================================
// Web Push (phone + desktop notifications)
// ===========================================================================

/**
 * Send a web push notification to all of a member's subscribed devices.
 * Calls the server-side API route which uses the VAPID private key.
 */
async function sendPushToMember(
  supabase: SupabaseClient,
  memberId: string,
  body: string,
  link?: string,
): Promise<void> {
  try {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("member_id", memberId);

    if (!subs || subs.length === 0) return;

    // Call our API route to send the push (server-side, uses VAPID private key)
    await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptions: subs,
        payload: {
          title: "AZ Off Script",
          body,
          url: link ?? "/portal/notifications",
        },
      }),
    });
  } catch (err) {
    // Push failures shouldn't break the app — just log
    console.warn("[notify] push send failed:", err);
  }
}

// ===========================================================================
// Push subscription management (client-side)
// ===========================================================================

/**
 * Convert a base64 string to Uint8Array (for VAPID applicationServerKey).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe the current device to web push notifications.
 * Asks for notification permission, creates a push subscription,
 * and saves it to the database.
 *
 * Returns true if subscription succeeded, false otherwise.
 */
export async function subscribeToPush(memberId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  // Get VAPID public key from server
  const vapidRes = await fetch("/api/push/vapid");
  if (!vapidRes.ok) return false;
  const { publicKey } = await vapidRes.json();
  if (!publicKey) return false;

  // Ask for permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  // Get service worker registration
  const reg = await navigator.serviceWorker.ready;

  // Subscribe to push
  let subscription: PushSubscription;
  try {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  } catch (err) {
    console.warn("[push] subscribe failed:", err);
    return false;
  }

  // Save subscription to database
  const supabase = createClient();
  const sub = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").insert({
    member_id: memberId,
    endpoint: subscription.endpoint,
    p256dh: sub.keys?.p256dh ?? "",
    auth_key: sub.keys?.auth ?? "",
  });

  if (error) {
    // If it's a duplicate (unique constraint), that's fine
    if (error.code !== "23505") {
      console.warn("[push] save failed:", error.message);
      return false;
    }
  }

  return true;
}

/**
 * Unsubscribe the current device from web push.
 */
export async function unsubscribeFromPush(memberId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    const supabase = createClient();
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("member_id", memberId)
      .eq("endpoint", subscription.endpoint);
  }

  return true;
}

/**
 * Check if the current device is subscribed to push.
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  return !!subscription;
}
