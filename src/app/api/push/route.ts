import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

/**
 * POST /api/push
 * Sends a web push notification to one or more subscriptions.
 *
 * Body:
 *   {
 *     subscriptions: [{ endpoint, p256dh, auth_key }, ...],
 *     payload: { title, body, url }
 *   }
 *
 * This is called from the client (src/lib/notify.ts) after inserting
 * an in-app notification. The VAPID private key lives server-side only.
 */

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:hello@azoffscript.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

interface PushSub {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 500 });
  }

  let body: { subscriptions: PushSub[]; payload: PushPayload };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.subscriptions || !Array.isArray(body.subscriptions) || body.subscriptions.length === 0) {
    return NextResponse.json({ error: "No subscriptions provided" }, { status: 400 });
  }

  const payload = JSON.stringify({
    title: body.payload.title ?? "AZ Off Script",
    body: body.payload.body ?? "",
    url: body.payload.url ?? "/portal/notifications",
  });

  // Send to each subscription in parallel
  const results = await Promise.allSettled(
    body.subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth_key,
          },
        },
        payload,
      ),
    ),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ succeeded, failed });
}
