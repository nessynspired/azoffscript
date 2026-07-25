"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import { AnimatedIntro } from "@/components/AnimatedIntro";
import { getTemplate, getExampleFor } from "@/lib/quick-drop-templates";
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
  const [plannerStats, setPlannerStats] = useState<{ stuck: number; waiting: number; readyForVanessa: number; trendsToPlan: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlanner = member?.role === "admin" || member?.can_plan_content === true;

  useEffect(() => {
    async function load() {
      if (!member) { setLoading(false); return; }
      const isPlannerUser = member.role === "admin" || member.can_plan_content === true;
      const [actRes, reviewRes, readyRes, schedRes, clipsRes, themesRes, asgnRes, trendsRes, allAssignmentsRes] = await Promise.all([
        supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "Review"),
        supabase.from("ideas").select("id", { count: "exact", head: true }).eq("status", "Planned"),
        supabase.from("clips").select("id", { count: "exact", head: true }).eq("status", "Scheduled"),
        supabase.from("clips_with_meta").select("*").order("updated_at", { ascending: false }).limit(20),
        supabase.from("content_themes").select("*").order("start_date", { ascending: false }).limit(5),
        supabase.from("content_assignments").select("*").eq("member_id", member.id).order("drop_by_date", { ascending: true }),
        // Planner stats
        isPlannerUser ? supabase.from("trend_references").select("id", { count: "exact", head: true }).in("status", ["New", "Watching"]) : Promise.resolve(null),
        isPlannerUser ? supabase.from("content_assignments").select("status, drop_by_date").in("status", ["Assigned", "Waiting"]) : Promise.resolve(null),
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

      // Planner stats
      if (isPlannerUser && trendsRes && allAssignmentsRes) {
        const now = new Date();
        const stuck = (clipsRes.data ?? []).filter((c) =>
          (c.status === "Planned" || c.status === "Dropped" || c.status === "Cutting") &&
          c.clip_due_date && new Date(c.clip_due_date) < now
        ).length;
        const waiting = (allAssignmentsRes.data ?? []).length;
        const overdueWaiting = (allAssignmentsRes.data ?? []).filter((a: { drop_by_date?: string | null }) =>
          a.drop_by_date && new Date(a.drop_by_date) < now
        ).length;
        setPlannerStats({
          stuck: overdueWaiting > 0 ? stuck + overdueWaiting : stuck,
          waiting,
          readyForVanessa: reviewRes.count ?? 0,
          trendsToPlan: trendsRes.count ?? 0,
        });
      }

      setLoading(false);
    }
    load();
  }, [supabase, member]);

  const firstName = member?.name?.split(" ")[0] ?? "Crew";

  return (
    <>
    <AnimatedIntro />
    <div className="space-y-8">
      {/* Hero welcome band — primary poster background */}
      <section className="hero-band p-6 md:p-10 relative overflow-hidden min-h-[380px] md:min-h-[460px] flex items-end">
        <div className="absolute inset-0 opacity-40">
          <PosterImage poster="primary" fill priority alt="AZ Off Script desert poster" />
        </div>
        <div className="absolute right-4 bottom-0 z-10 hidden sm:block">
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

      {/* YOUR WEEK — one clean card with quick drop buttons */}
      <section>
        <div className="card-dark p-6">
          {myAssignments.length > 0 ? (
            <>
              {/* Next deadline */}
              {(() => {
                const next = myAssignments[0];
                const clip = assignmentClips[next.clip_id];
                const now = new Date();
                const isLate = next.drop_by_date && new Date(next.drop_by_date) < now;
                const template = clip?.template_id ? getTemplate(clip.template_id) : null;
                return (
                  <div className="mt-3">
                    <p className={`text-2xl font-display ${isLate ? "text-heat-orange" : "text-sandstone-cream"}`}>
                      {isLate ? "⚠ Late — " : ""}Drop-by {next.drop_by_date ? new Date(next.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "TBD"}
                    </p>
                    <p className="text-sandstone-cream/70 mt-1">{clip?.title ?? "Content item"}</p>
                    {template && (
                      <p className="text-sunburst-yellow/70 text-sm mt-0.5">
                        ⏱ {template.timeEstimate} · {template.effort}
                      </p>
                    )}

                    {/* Template — idea, vibe, examples (prompt, don't script) */}
                    {template && (
                      <div className="mt-3 bg-white/5 rounded-xl p-3 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-sunburst-yellow/60 uppercase">Idea</p>
                          <p className="text-sm text-sandstone-cream/90 mt-1">{template.idea}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-sunburst-yellow/60 uppercase">Vibe</p>
                          <p className="text-sm text-sandstone-cream/90 mt-1">{template.vibe}</p>
                        </div>
                        {template.examples && (
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-xs font-bold text-sunburst-yellow/60 uppercase">Examples if you&apos;re stuck</p>
                            <p className="text-sm text-sandstone-cream font-script text-base mt-1">
                              &ldquo;{getExampleFor(template, firstName)}&rdquo;
                            </p>
                            <p className="text-xs text-sandstone-cream/40 mt-1">Use it or make it your own.</p>
                          </div>
                        )}
                        <p className="text-xs text-sandstone-cream/50 italic">
                          One take is fine. We are looking for real, not perfect.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* More assignments count */}
              {myAssignments.length > 1 && (
                <p className="text-sandstone-cream/50 text-sm mt-2">
                  + {myAssignments.length - 1} more on your plate
                </p>
              )}

              {/* Drop Mine button — big and obvious */}
              <Link href="/portal/drop" className="block bg-heat-orange text-bone-white rounded-xl p-4 text-center font-display text-lg hover:-translate-y-0.5 transition-transform mt-5">
                Drop Mine 🎬
              </Link>

              <p className="text-sandstone-cream/40 text-xs mt-3 text-center">
                One take is fine. No pressure to be perfect.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-display text-sandstone-cream mt-3">You&apos;re clear this week.</p>
              <p className="text-sandstone-cream/60 mt-1">Nothing due. Drop something when you feel it.</p>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <Link href="/portal/drop" className="bg-heat-orange text-bone-white rounded-xl p-3 text-center font-bold text-sm hover:-translate-y-0.5 transition-transform">
                  🔗 Drop a Link
                </Link>
                <Link href="/portal/drop" className="bg-cactus-teal text-bone-white rounded-xl p-3 text-center font-bold text-sm hover:-translate-y-0.5 transition-transform">
                  🎬 Drop a Clip
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* PLANNER CARD — only for admins + planners */}
      {isPlanner && plannerStats && (
        <section>
          <div className="card p-5 border-l-4 border-copper-clay">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-copper-deep text-sm font-black uppercase">Planner View</p>
                <p className="font-display text-xl text-desert-night mt-1">What needs your attention</p>
              </div>
              <Link href="/portal/run-sheet" className="btn btn-secondary btn-sm shrink-0">
                Open Planner →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-sandstone-cream/50 rounded-xl p-3 text-center">
                <p className="font-display text-2xl text-desert-night">{plannerStats.stuck}</p>
                <p className="text-xs text-smoked-charcoal/60">Stuck / late</p>
              </div>
              <div className="bg-sandstone-cream/50 rounded-xl p-3 text-center">
                <p className="font-display text-2xl text-desert-night">{plannerStats.waiting}</p>
                <p className="text-xs text-smoked-charcoal/60">Waiting on crew</p>
              </div>
              <div className="bg-sandstone-cream/50 rounded-xl p-3 text-center">
                <p className="font-display text-2xl text-desert-night">{plannerStats.readyForVanessa}</p>
                <p className="text-xs text-smoked-charcoal/60">Ready for Review</p>
              </div>
              <div className="bg-sandstone-cream/50 rounded-xl p-3 text-center">
                <p className="font-display text-2xl text-desert-night">{plannerStats.trendsToPlan}</p>
                <p className="text-xs text-smoked-charcoal/60">Trends to plan</p>
              </div>
            </div>
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
                <Link key={c.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                  <p className="font-bold text-desert-night">{c.title}</p>
                  <span className="chip chip-copper !text-xs md:!text-[10px] shrink-0 whitespace-nowrap">
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
    </>
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
