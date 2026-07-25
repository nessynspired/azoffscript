"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import type { Database } from "@/lib/types/db";

type Activity = Database["public"]["Tables"]["activity"]["Row"];

export default function NotificationsPage() {
  const supabase = createClient();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setActivity(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

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
    return "🔔";
  }

  return (
    <main className="portal-shell px-4 pt-6">
      <div className="max-w-lg mx-auto pt-4">
        <h1 className="font-display text-4xl text-desert-night mb-6">What happened in the room</h1>

        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="animate-pulse-slow">
              <MascotImage pose="main" size={80} />
            </div>
            <p className="font-display text-xl text-desert-night">Loading…</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="card p-10 text-center">
            <MascotImage pose="peace" size={100} className="inline-block" />
            <p className="font-display text-2xl text-desert-night mt-4">Nothing yet.</p>
            <p className="text-smoked-charcoal/70 mt-2">
              When people drop clips, approve them, or change statuses, it shows up here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activity.map((item) => (
              <div key={item.id} className="card p-4 flex items-start gap-3">
                <span className="text-2xl shrink-0">{iconForKind(item.kind)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-desert-night font-bold leading-snug">{item.body}</p>
                  <p className="text-xs text-desert-night/40 mt-1">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
