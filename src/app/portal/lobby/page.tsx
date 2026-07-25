"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import type { Database } from "@/lib/types/db";

type Activity = Database["public"]["Tables"]["activity"]["Row"];
type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];
type Theme = Database["public"]["Tables"]["content_themes"]["Row"];
type Assignment = Database["public"]["Tables"]["content_assignments"]["Row"];

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
  const [dueThisWeek, setDueThisWeek] = useState<ClipMeta[]>([]);
  const [activeThemes, setActiveThemes] = useState<Theme[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [assignmentClips, setAssignmentClips] = useState<Record<string, ClipMeta>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!member) { setLoading(false); return; }
      const [actRes, reviewRes, readyRes, schedRes, clipsRes, themesRes, asgnRes] = await Promise.all([
        supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "Review"),
        supabase.from("ideas").select("id", { count: "exact", head: true }).eq("status", "Planned"),
        supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "Scheduled"),
        supabase.from("clips_with_meta").select("*").order("updated_at", { ascending: false }).limit(20),
        supabase.from("content_themes").select("*").order("start_date", { ascending: false }).limit(5),
        supabase.from("content_assignments").select("*").eq("member_id", member.id).order("drop_by_date", { ascending: true }),
      ]);
      setActivity(actRes.data ?? []);
      setHeat({
        needsReview: reviewRes.count ?? 0,
        readyToFilm: readyRes.count ?? 0,
        scheduledToday: schedRes.count ?? 0,
      });
      setActiveThemes((themesRes.data ?? []).filter((t) => t.status === "Active" || t.status === "Planning"));

      // What's due this week
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);
      const due = (clipsRes.data ?? []).filter((c) => {
        const dates = [c.clip_due_date, c.final_cut_due, c.approval_due, c.scheduled_date, c.idea_due_date];
        return dates.some((d) => d && new Date(d) >= now && new Date(d) <= weekEnd);
      }).slice(0, 5);
      setDueThisWeek(due);

      // My assignments ("Your Part")
      const activeAssignments = (asgnRes.data ?? []).filter((a) => a.status !== "Done" && a.status !== "Skipped" && a.status !== "Greenlit");
      setMyAssignments(activeAssignments);
      // Build clip lookup for assignments
      const clipMap: Record<string, ClipMeta> = {};
      (clipsRes.data ?? []).forEach((c) => { clipMap[c.id] = c; });
      setAssignmentClips(clipMap);

      setLoading(false);
    }
    load();
  }, [supabase, member]);

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

      {/* Your Part — assignments */}
      {myAssignments.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">Your Part</h2>
          <div className="space-y-2">
            {myAssignments.slice(0, 4).map((a) => {
              const clip = assignmentClips[a.clip_id];
              const now = new Date();
              const isLate = a.drop_by_date && new Date(a.drop_by_date) < now;
              return (
                <Link key={a.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-desert-night truncate">{clip?.title ?? "Content item"}</p>
                      <p className="text-xs text-smoked-charcoal/60 mt-0.5">{a.role} · {a.task_type}</p>
                      {a.task_title && <p className="text-sm text-desert-night mt-1">{a.task_title}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {a.drop_by_date && (
                        <span className={`text-xs font-bold ${isLate ? "text-heat-orange" : "text-copper-deep"}`}>
                          {isLate ? "⚠ Late — " : ""}Drop-by {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      )}
                      <span className="chip chip-cream !text-[9px]">{a.status}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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

      {/* Active Weekly Heat */}
      {activeThemes.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">🔥 Weekly Heat</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {activeThemes.map((t) => (
              <Link key={t.id} href="/portal/run-sheet" className="card-dark p-5 min-w-[280px] shrink-0 hover:-translate-y-0.5 transition-transform">
                <p className="font-display text-xl text-sunburst-yellow">{t.name}</p>
                {t.description && <p className="text-sm text-sandstone-cream/60 mt-1">{t.description}</p>}
                {t.start_date && t.end_date && (
                  <p className="text-xs text-sandstone-cream/50 mt-2">
                    {new Date(t.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {new Date(t.end_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What's Due This Week */}
      {dueThisWeek.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">Coming Up This Week</h2>
          <div className="space-y-2">
            {dueThisWeek.map((c) => {
              const deadlines: { label: string; date: string }[] = [];
              if (c.idea_due_date) deadlines.push({ label: "Spark-by", date: c.idea_due_date });
              if (c.clip_due_date) deadlines.push({ label: "Drop-by", date: c.clip_due_date });
              if (c.final_cut_due) deadlines.push({ label: "Cut ready", date: c.final_cut_due });
              if (c.approval_due) deadlines.push({ label: "Greenlight", date: c.approval_due });
              if (c.scheduled_date) deadlines.push({ label: "Goes Live", date: c.scheduled_date });
              const next = deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
              return (
                <Link key={c.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-4">
                  <p className="font-bold text-desert-night truncate">{c.title}</p>
                  <span className="chip chip-copper !text-[10px] shrink-0">
                    {next.label}: {new Date(next.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
