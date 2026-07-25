"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { MascotImage } from "@/components/MascotImage";
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from "@/lib/notify";
import type { Database } from "@/lib/types/db";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type Activity = Database["public"]["Tables"]["activity"]["Row"];

export default function NotificationsPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const load = useCallback(async () => {
    if (!member) return;
    const [notifRes, actRes] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", member.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setNotifications(notifRes.data ?? []);
    setActivity(actRes.data ?? []);
    setLoading(false);
  }, [supabase, member]);

  useEffect(() => {
    load();
    // Check if push is supported + subscribed
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      isPushSubscribed().then(setPushEnabled);
    }
  }, [load]);

  // Realtime: listen for new notifications
  useEffect(() => {
    if (!member) return;
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const newNotif = payload.new as Notification;
        if (newNotif.user_id === member.id) {
          setNotifications((prev) => [newNotif, ...prev]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, member]);

  async function markAllRead() {
    if (!member) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", member.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function togglePush() {
    if (!member) return;
    setPushLoading(true);
    if (pushEnabled) {
      await unsubscribeFromPush(member.id);
      setPushEnabled(false);
    } else {
      const success = await subscribeToPush(member.id);
      setPushEnabled(success);
    }
    setPushLoading(false);
  }

  function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function iconForKind(kind: string): string {
    if (kind === "dropped") return "🎬";
    if (kind === "approved") return "✅";
    if (kind === "status") return "📌";
    if (kind === "tagged") return "🏷️";
    if (kind === "assignment") return "📋";
    if (kind === "approval") return "🟢";
    return "🔔";
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="portal-shell px-4 pt-6">
      <div className="max-w-lg mx-auto pt-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="font-display text-3xl md:text-4xl text-desert-night">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-secondary btn-sm">
              Mark all read
            </button>
          )}
        </div>

        {/* Push notification toggle */}
        {pushSupported && (
          <div className="card p-4 mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-desert-night">Phone notifications</p>
              <p className="text-xs text-smoked-charcoal/60 mt-0.5">
                {pushEnabled ? "On — you'll get push notifications on this device" : "Off — turn on to get alerts on your phone"}
              </p>
            </div>
            <button
              onClick={togglePush}
              className={`btn btn-sm ${pushEnabled ? "btn-danger" : "btn-primary"}`}
              disabled={pushLoading}
            >
              {pushLoading ? "…" : pushEnabled ? "Turn off" : "Turn on"}
            </button>
          </div>
        )}
        {!pushSupported && (
          <div className="card p-4 mb-4 bg-sandstone-cream/50">
            <p className="text-sm text-smoked-charcoal/70">
              💡 For phone notifications, install the app to your home screen and use a supported browser (Chrome, Edge, Firefox).
            </p>
          </div>
        )}

        {/* Your notifications */}
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="animate-pulse-slow">
              <MascotImage pose="main" size={80} />
            </div>
            <p className="font-display text-xl text-desert-night">Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-10 text-center">
            <MascotImage pose="peace" size={100} className="inline-block" />
            <p className="font-display text-2xl text-desert-night mt-4">No notifications yet.</p>
            <p className="text-smoked-charcoal/70 mt-2">
              When you&apos;re assigned to a clip, tagged, or something needs your greenlight, it shows up here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {notifications.map((item) => (
              <Link
                key={item.id}
                href={item.link ?? "/portal/notifications"}
                onClick={() => !item.read && markRead(item.id)}
                className={`card p-4 flex items-start gap-3 transition-all hover:-translate-y-0.5 ${!item.read ? "border-l-4 border-heat-orange" : "opacity-70"}`}
              >
                <span className="text-2xl shrink-0">{iconForKind(item.kind)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-desert-night font-bold leading-snug">{item.body}</p>
                  <p className="text-xs text-desert-night/40 mt-1">{timeAgo(item.created_at)}</p>
                </div>
                {!item.read && <span className="w-2 h-2 rounded-full bg-heat-orange shrink-0 mt-2" />}
              </Link>
            ))}
          </div>
        )}

        {/* Global activity feed */}
        {activity.length > 0 && (
          <div>
            <h2 className="font-display text-2xl text-desert-night mb-3">What&apos;s happening in the room</h2>
            <div className="space-y-2">
              {activity.map((item) => (
                <div key={item.id} className="card p-3 flex items-start gap-3 opacity-80">
                  <span className="text-xl shrink-0">{iconForKind(item.kind)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-desert-night leading-snug">{item.body}</p>
                    <p className="text-xs text-desert-night/40 mt-0.5">{timeAgo(item.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
