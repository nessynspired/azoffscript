"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import type { Database } from "@/lib/types/db";

type Activity = Database["public"]["Tables"]["activity"]["Row"];
type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];

interface Heat {
  needsReview: number;
  readyToFilm: number;
  scheduledToday: number;
}

export default function LobbyPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [heat, setHeat] = useState<Heat>({ needsReview: 0, readyToFilm: 0, scheduledToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [actRes, reviewRes, readyRes, schedRes] = await Promise.all([
        supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "Review"),
        supabase.from("ideas").select("id", { count: "exact", head: true }).eq("status", "Planned"),
        supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "Scheduled"),
      ]);
      setActivity(actRes.data ?? []);
      setHeat({
        needsReview: reviewRes.count ?? 0,
        readyToFilm: readyRes.count ?? 0,
        scheduledToday: schedRes.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [supabase]);

  const firstName = member?.name?.split(" ")[0] ?? "Crew";

  return (
    <div className="space-y-8">
      {/* Hero welcome band — primary poster background */}
      <section className="hero-band p-6 md:p-10 relative overflow-hidden min-h-[380px] md:min-h-[460px] flex items-end">
        <div className="absolute inset-0 opacity-40">
          <PosterImage poster="primary" fill priority alt="AZ Off Script desert poster" />
        </div>
        <div className="absolute right-4 bottom-0 z-10">
          <MascotImage pose="main" size={280} />
        </div>
        <div className="relative z-10 max-w-2xl pb-2">
          <span className="chip chip-yellow mb-3">First Wave</span>
          <h1 className="font-display text-4xl md:text-6xl text-sandstone-cream leading-none drop-shadow-lg">
            Hey, {firstName} — what&apos;s moving today?
          </h1>
          <p className="text-sandstone-cream/90 mt-3 text-lg drop-shadow">
            Clips, ideas, approvals, and the next thing we&apos;re posting.
          </p>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">Jump in</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            href="/portal/drop"
            label="Send Your Clip"
            sub="Upload your final or paste a link."
            color="bg-heat-orange"
            pose="main"
          />
          <QuickAction
            href="/portal/sparks"
            label="Spark an Idea"
            sub="Questions, games, trends, chaos."
            color="bg-sunburst-yellow"
            pose="peace"
            dark
          />
          <QuickAction
            href="/portal/ready"
            label="Greenlight Clips"
            sub="Approve clips you're in before they post."
            color="bg-cactus-teal"
            pose="shades"
          />
          <QuickAction
            href="/portal/run-sheet"
            label="Check the Run Sheet"
            sub="See what's due and what's posting."
            color="bg-copper-clay"
            pose="main"
          />
        </div>
      </section>

      {/* What's Moving */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">What&apos;s Moving</h2>
        {loading ? (
          <div className="card p-6 text-smoked-charcoal/50">Loading the room…</div>
        ) : activity.length === 0 ? (
          <div className="card p-6 flex items-center gap-4">
            <MascotImage pose="main" size={64} />
            <div>
              <p className="font-bold text-desert-night">Nothing moving yet.</p>
              <p className="text-sm text-smoked-charcoal/70">Be the first to drop something in.</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {activity.map((a) => (
              <div key={a.id} className="card p-4 min-w-[260px] shrink-0 sticker">
                <p className="text-sm text-desert-night font-bold">{a.body}</p>
                <p className="text-xs text-smoked-charcoal/60 mt-1">{a.actor_name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* This Week's Heat */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">This Week&apos;s Heat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HeatCard count={heat.needsReview} label="clips need your greenlight" tone="review" />
          <HeatCard count={heat.readyToFilm} label="ideas ready to film" tone="spark" />
          <HeatCard count={heat.scheduledToday} label="posts scheduled" tone="ready" />
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  label,
  sub,
  color,
  pose,
  dark,
}: {
  href: string;
  label: string;
  sub: string;
  color: string;
  pose: "main" | "shades" | "peace";
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${color} ${dark ? "text-desert-night" : "text-bone-white"} relative overflow-hidden group transition-transform hover:-translate-y-1 p-5 rounded-[var(--radius-card)]`}
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      <div className="absolute -right-3 -bottom-3 opacity-30 group-hover:opacity-50 transition-opacity">
        <MascotImage pose={pose} size={80} />
      </div>
      <div className="relative z-10">
        <h3 className="font-display text-2xl leading-none">{label}</h3>
        <p className={`text-sm mt-2 ${dark ? "text-desert-night/80" : "text-bone-white/85"}`}>{sub}</p>
      </div>
    </Link>
  );
}

function HeatCard({ count, label, tone }: { count: number; label: string; tone: "review" | "spark" | "ready" }) {
  const chipClass =
    tone === "review" ? "chip-review" : tone === "spark" ? "chip-yellow" : "chip-approved";
  return (
    <div className="card p-6 cut-corner">
      <span className={`chip ${chipClass} mb-3`}>{count === 0 ? "All clear" : "Heat"}</span>
      <p className="font-display text-5xl text-desert-night leading-none">{count}</p>
      <p className="text-sm text-smoked-charcoal/70 mt-2 font-bold">{label}</p>
    </div>
  );
}
