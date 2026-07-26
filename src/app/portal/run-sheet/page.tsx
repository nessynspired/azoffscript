"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyMember, notifyTaggedPeople, notifyAssignedPeople, notifyAdminsAndPlanners } from "@/lib/notify";
import { HEAT_VIBES, POST_COUNTS, EFFORT_LEVELS, generateWeekPlan, calcDeadlinesFromLive, nextSunday, type PlannedItem } from "@/lib/plan-defaults";
import { QUICK_DROP_TEMPLATES, CONTENT_BUCKETS, getTemplate, getTemplatesByBucket, getExampleFor, type QuickDropTemplate, type EffortLabel } from "@/lib/quick-drop-templates";
import { MascotImage } from "@/components/MascotImage";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { Database, ClipStatus, Platform } from "@/lib/types/db";

type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];
type ClipPerson = Database["public"]["Tables"]["clip_people"]["Row"];
type Approval = Database["public"]["Tables"]["approvals"]["Row"];
type Theme = Database["public"]["Tables"]["content_themes"]["Row"];
type TrendRef = Database["public"]["Tables"]["trend_references"]["Row"];
type Assignment = Database["public"]["Tables"]["content_assignments"]["Row"];
type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name" | "nickname" | "role" | "can_plan_content">;

const STUDIO_FLOW: ClipStatus[] = [
  "Dropped", "Planned", "Shot", "Cutting", "Review", "Ready", "Scheduled", "Live", "Vault",
];

const STATUS_CHIP: Record<string, string> = {
  Dropped: "chip-cream",
  "Needs Info": "chip-yellow",
  Planned: "chip-cream",
  Shot: "chip-copper",
  Cutting: "chip-copper",
  Review: "chip-review",
  Ready: "chip-approved",
  Scheduled: "chip-teal",
  Live: "chip-dark",
  Vault: "chip-cream",
  Hold: "chip-hold",
  "Do Not Post": "chip-danger",
};

const APPROVAL_CHIP: Record<string, string> = {
  Waiting: "chip-waiting",
  Approved: "chip-approved",
  "Approved With Edits": "chip-edits",
  "Needs Review": "chip-review",
  "Do Not Post": "chip-danger",
  "No Tag": "chip-notag",
  "Don't Like How I Come Across": "chip-hold",
};

const ASSIGNMENT_STATUS_CHIP: Record<string, string> = {
  "Not Started": "chip-cream",
  "In Progress": "chip-yellow",
  "Dropped": "chip-approved",
  "Waiting on Vanessa": "chip-review",
  "Needs Tweak": "chip-edits",
  "Greenlit": "chip-approved",
  "Done": "chip-dark",
  "Skipped": "chip-cream",
  "Hold": "chip-hold",
};

// Display labels for assignment statuses — keeps "Waiting on Vanessa" as the
// DB value but shows a generic label to crew members.
const ASSIGNMENT_STATUS_LABEL: Record<string, string> = {
  "Waiting on Vanessa": "Waiting on Review",
};
function assignmentStatusLabel(s: string): string {
  return ASSIGNMENT_STATUS_LABEL[s] ?? s;
}

const ASSIGNMENT_ROLES = [
  "Lead", "On-Camera", "Reaction", "Clip Dropper", "Caption Help",
  "Trend Finder", "Editor", "Reviewer", "Planner", "Behind the Scenes",
];

const ASSIGNMENT_TASK_TYPES = [
  "Drop a Clip", "Drop a Link", "Answer Prompt", "Suggest Caption",
  "Greenlight Clip", "Edit/Stitch", "Schedule Post", "Bring Prop/Gear", "Show Up",
];

// YouTube helpers — used in modal + watch tab
function isYouTubeLink(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

function getYouTubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// "Idea dropped by" vs "Clip dropped by" — based on what was actually submitted
function droppedByLabel(clip: { type: string; submitted_by_name: string }): string {
  const hasVideo = clip.type === "video" || clip.type === "final_cut";
  if (hasVideo) return `Clip dropped by ${clip.submitted_by_name}`;
  if (clip.type === "tiktok_link") return `Trend drop by ${clip.submitted_by_name}`;
  return `Idea dropped by ${clip.submitted_by_name}`;
}

export default function RunSheetPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [people, setPeople] = useState<Record<string, ClipPerson[]>>({});
  const [approvals, setApprovals] = useState<Record<string, Approval[]>>({});
  const [themes, setThemes] = useState<Theme[]>([]);
  const [trends, setTrends] = useState<TrendRef[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"week" | "calendar" | "flow" | "board" | "trends" | "heat" | "watch" | "planner" | "readybank">("week");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [clipRes, themeRes, trendRes, asgnRes, memRes] = await Promise.all([
      supabase.from("clips_with_meta").select("*").order("updated_at", { ascending: false }),
      supabase.from("content_themes").select("*").order("start_date", { ascending: false }),
      supabase.from("trend_references").select("*").order("created_at", { ascending: false }),
      supabase.from("content_assignments").select("*").order("drop_by_date", { ascending: true }),
      supabase.from("members").select("id, name, nickname, role, can_plan_content").order("name"),
    ]);

    if (clipRes.error) {
      console.error("[run-sheet] clips_with_meta query failed:", clipRes.error.message);
      setLoadError(clipRes.error.message);
      setLoading(false);
      return;
    }
    setLoadError(null);

    const clipData = clipRes.data ?? [];
    setClips(clipData);
    setThemes(themeRes.data ?? []);
    setTrends(trendRes.data ?? []);
    setAssignments(asgnRes.data ?? []);
    setMembers(memRes.data ?? []);

    if (clipData.length > 0) {
      const clipIds = clipData.map((c) => c.id);
      const [pplRes, appRes] = await Promise.all([
        supabase.from("clip_people").select("*").in("clip_id", clipIds),
        supabase.from("approvals").select("*").in("clip_id", clipIds),
      ]);

      const pplMap: Record<string, ClipPerson[]> = {};
      (pplRes.data ?? []).forEach((p) => {
        (pplMap[p.clip_id] ??= []).push(p);
      });
      setPeople(pplMap);

      const appMap: Record<string, Approval[]> = {};
      (appRes.data ?? []).forEach((a) => {
        (appMap[a.clip_id] ??= []).push(a);
      });
      setApprovals(appMap);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("run-sheet")
      .on("postgres_changes", { event: "*", schema: "public", table: "clips" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "clip_people" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "content_themes" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "trend_references" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "content_assignments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, supabase]);

  async function changeStatus(clipId: string, status: ClipStatus) {
    if (!canPlanContent) return;
    const clip = clips.find((c) => c.id === clipId);
    const { error } = await supabase.from("clips").update({ status }).eq("id", clipId);
    if (error) { alert(error.message); return; }
    // Log activity so it shows in notifications
    await supabase.from("activity").insert({
      actor_id: member.id,
      actor_name: member.name,
      kind: "status",
      body: `${member.name} moved "${clip?.title ?? "a clip"}" to ${status}`,
    });
    // Notify tagged + assigned people about the status change
    const notifBody = `"${clip?.title ?? "A clip"}" moved to ${status}`;
    await notifyTaggedPeople(supabase, clipId, "status", notifBody, "/portal/run-sheet", member?.id);
    await notifyAssignedPeople(supabase, clipId, "status", notifBody, "/portal/run-sheet", member?.id);
    // If moved to Review, that means greenlights are needed — notify tagged people specifically
    if (status === "Review") {
      await notifyTaggedPeople(supabase, clipId, "approval", `Greenlight needed: "${clip?.title ?? "a clip"}"`, "/portal/ready", member?.id);
    }
    await load();
  }

  async function deleteClip(clipId: string) {
    if (!isAdmin && !member?.can_plan_content) return;
    const clip = clips.find((c) => c.id === clipId);
    if (!confirm(`Delete "${clip?.title ?? "this clip"}"? This can't be undone.`)) return;
    const { error } = await supabase.from("clips").delete().eq("id", clipId);
    if (error) { alert(error.message); return; }
    setSelectedClip(null);
    await load();
  }

  const isAdmin = member?.role === "admin";
  const canPlanContent = isAdmin || member?.can_plan_content === true;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-pulse-slow"><MascotImage pose="main" size={120} /></div>
        <p className="font-display text-2xl text-desert-night">Loading the run sheet…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="card p-8 max-w-lg mx-auto text-center mt-10">
        <h1 className="font-display text-3xl text-heat-orange">Can&apos;t load the Run Sheet</h1>
        <p className="text-smoked-charcoal/70 mt-3 text-sm">
          The database view <code className="bg-desert-night/10 px-1.5 py-0.5 rounded">clips_with_meta</code> may not exist yet.
        </p>
        <p className="text-xs text-smoked-charcoal/50 mt-2 font-mono break-all">{loadError}</p>
        <p className="text-sm text-smoked-charcoal/70 mt-4">
          Run <code className="bg-desert-night/10 px-1.5 py-0.5 rounded">supabase/create-clips-view.sql</code> in your
          Supabase Dashboard → SQL Editor.
        </p>
      </div>
    );
  }

  // Split clips: production = actual videos being made, ideas = links/ideas/trends
  const productionClips = clips.filter((c) => c.type === "video" || c.type === "final_cut");
  const themeMap = new Map(themes.map((t) => [t.id, t]));

  const TABS: { key: typeof tab; label: string; count?: number }[] = [
    { key: "week", label: "This Week" },
    ...(canPlanContent ? [{ key: "planner" as const, label: "Planner" }] : []),
    { key: "calendar", label: "Calendar" },
    { key: "flow", label: "Studio Flow", count: productionClips.length },
    ...(canPlanContent ? [{ key: "readybank" as const, label: "Ready Bank" }] : []),
    { key: "board", label: "Assignment Board", count: assignments.length },
    { key: "trends", label: "Trend Drops", count: trends.length },
    { key: "heat", label: "Weekly Heat", count: themes.length },
    { key: "watch", label: "Watch", count: clips.filter((c) => c.status === "Live").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">The Run Sheet</h1>
          <p className="text-smoked-charcoal/70 mt-2 text-lg">This is what&apos;s moving next.</p>
        </div>
        {canPlanContent && (
          <button
            onClick={() => setShowTemplatePicker(!showTemplatePicker)}
            className="btn btn-primary btn-sm"
          >
            + Create from Template
          </button>
        )}
      </div>

      {/* Template picker — quick create from a template */}
      {showTemplatePicker && canPlanContent && (
        <TemplatePicker
          member={member}
          members={members}
          onCreated={async () => { setShowTemplatePicker(false); await load(); }}
        />
      )}

      {/* Tab bar — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-2 bg-desert-night/10 rounded-full p-1 w-fit overflow-x-auto max-w-full -mx-4 px-4 md:mx-0 md:px-1 md:flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-black uppercase whitespace-nowrap shrink-0 ${tab === t.key ? "bg-desert-night text-sunburst-yellow" : "text-desert-night"}`}
          >
            {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {/* THIS WEEK — everybody's quick overview */}
      {tab === "week" && (
        <ThisWeekTab
          clips={clips}
          people={people}
          approvals={approvals}
          themes={themes}
          trends={trends}
          themeMap={themeMap}
          assignments={assignments}
          currentMemberId={member?.id}
          onSelectClip={(id) => setSelectedClip(id)}
        />
      )}

      {/* CALENDAR — layered view with deadlines + posts + themes */}
      {tab === "calendar" && (
        <CalendarView
          clips={clips}
          themes={themes}
          themeMap={themeMap}
          canPlanContent={canPlanContent}
          member={member ? { id: member.id, name: member.name } : undefined}
          members={members}
          onRefresh={load}
        />
      )}

      {/* STUDIO FLOW — Kanban pipeline */}
      {tab === "flow" && (
        <>
          {productionClips.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="inline-block"><MascotImage pose="main" size={120} /></div>
              <p className="font-display text-2xl text-desert-night mt-4">No videos in production yet.</p>
              <p className="text-smoked-charcoal/70 mt-2">Drop a video to start the assembly line.</p>
              <Link href="/portal/drop" className="btn btn-primary mt-6">Drop a Clip</Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 pb-4">
              <div className="flex gap-4 min-w-max">
                {STUDIO_FLOW.map((status) => {
                  const colClips = productionClips.filter((c) => c.status === status);
                  if (colClips.length === 0) return null;
                  return (
                    <div key={status} className="w-72 shrink-0">
                      <div className="sticky top-0 bg-sandstone-cream/95 backdrop-blur py-2 z-10">
                        <div className="flex items-center justify-between">
                          <span className={`chip ${STATUS_CHIP[status]}`}>{status}</span>
                          <span className="text-xs font-black text-desert-night/50">{colClips.length}</span>
                        </div>
                      </div>
                      <div className="space-y-3 mt-3">
                        {colClips.map((clip) => (
                          <ClipCard
                            key={clip.id}
                            clip={clip}
                            people={people[clip.id] ?? []}
                            approvals={approvals[clip.id] ?? []}
                            isAdmin={isAdmin}
                            themeName={clip.theme_id ? themeMap.get(clip.theme_id)?.name : undefined}
                            onSelect={() => setSelectedClip(clip.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* TREND DROPS — references and inspiration */}
      {tab === "trends" && (
        <TrendDropsTab
          trends={trends}
          themes={themes}
          currentMemberId={member?.id}
          currentMemberName={member?.name}
          canPlanContent={canPlanContent}
          isAdmin={isAdmin}
          onRefresh={load}
        />
      )}

      {/* WEEKLY HEAT — theme management */}
      {tab === "heat" && (
        <WeeklyHeatTab
          themes={themes}
          clips={clips}
          trends={trends}
          members={members}
          canPlanContent={canPlanContent}
          isAdmin={isAdmin}
          currentMemberId={member?.id}
          currentMemberName={member?.name}
          onRefresh={load}
        />
      )}

      {/* ASSIGNMENT BOARD — admin/planner view of who's doing what */}
      {tab === "board" && (
        <AssignmentBoardTab
          clips={clips}
          assignments={assignments}
          members={members}
          themes={themes}
          themeMap={themeMap}
          canPlanContent={canPlanContent}
          currentMemberId={member?.id}
          currentMemberName={member?.name}
          onSelectClip={(id) => setSelectedClip(id)}
          onRefresh={load}
        />
      )}

      {/* PLANNER — dashboard for planners (What's Stuck, Ready for Vanessa, Needs Planning) */}
      {tab === "planner" && canPlanContent && (
        <PlannerDashboard
          clips={clips}
          assignments={assignments}
          approvals={approvals}
          people={people}
          themes={themes}
          trends={trends}
          members={members}
          isAdmin={isAdmin}
          onSelectClip={(id) => setSelectedClip(id)}
          onRefresh={load}
        />
      )}

      {/* READY BANK — vetted ideas/templates ready to schedule */}
      {tab === "readybank" && canPlanContent && (
        <ReadyBankTab member={member} members={members} onRefresh={load} />
      )}

      {/* WATCH — posted/live videos */}
      {tab === "watch" && (
        <WatchTab clips={clips} themeMap={themeMap} onSelectClip={(id) => setSelectedClip(id)} />
      )}

      {selectedClip && (
        <ClipDetailModal
          clip={clips.find((c) => c.id === selectedClip)!}
          people={people[selectedClip] ?? []}
          approvals={approvals[selectedClip] ?? []}
          isAdmin={isAdmin}
          canPlanContent={canPlanContent}
          themes={themes}
          currentMemberId={member?.id}
          currentMemberName={member?.name}
          onClose={() => setSelectedClip(null)}
          onStatusChange={changeStatus}
          onDelete={deleteClip}
          onRefresh={load}
        />
      )}
    </div>
  );
}

function ClipCard({
  clip, people, approvals, isAdmin, themeName, onSelect,
}: {
  clip: ClipMeta;
  people: ClipPerson[];
  approvals: Approval[];
  isAdmin: boolean;
  themeName?: string;
  onSelect: () => void;
}) {
  const approved = approvals.filter((a) => a.status === "Approved" || a.status === "Approved With Edits").length;
  const hasLink = clip.link && clip.link.trim().length > 0;
  const isVideo = clip.type === "video" || clip.type === "final_cut";

  return (
    <button
      onClick={onSelect}
      className="card w-full text-left ticket-stub hover:-translate-y-0.5 transition-transform overflow-hidden"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-gradient-to-br from-desert-night to-night-deep overflow-hidden">
        {clip.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
        ) : hasLink ? (
          <ClipThumbnail link={clip.link!} />
        ) : isVideo ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">💡</span>
          </div>
        )}
        {/* Play icon overlay for links/videos */}
        {(hasLink || isVideo) && (
          <div className="absolute inset-0 flex items-center justify-center bg-desert-night/20">
            <div className="w-10 h-10 rounded-full bg-desert-night/60 flex items-center justify-center backdrop-blur">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5E6D3"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-2 right-2 chip ${clip.type === "final_cut" ? "chip-review" : "chip-cream"} !text-[10px]`}>
          {clip.type === "tiktok_link" ? "TikTok" : clip.type === "final_cut" ? "Final" : clip.type === "video" ? "Video" : clip.type}
        </span>
        {/* Category lane badge */}
        {clip.category && (
          <span className="absolute top-2 left-2 chip chip-dark !text-[9px]">{clip.category}</span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-bold text-desert-night leading-tight">{clip.title}</h3>
        <p className="text-xs text-smoked-charcoal/60 mt-1">by {clip.submitted_by_name}</p>

        {/* Weekly Heat badge */}
        {themeName && (
          <div className="mt-2">
            <span className="chip chip-copper !text-[10px]">🔥 {themeName}</span>
          </div>
        )}

        {/* Destination badge — where is this video going? */}
        {clip.destination && (
          <div className="mt-2">
            <span className="chip chip-teal !text-[10px]">📍 {clip.destination}</span>
          </div>
        )}

        {people.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {people.slice(0, 4).map((p) => (
              <span key={p.id} className="chip chip-teal !text-[10px] !py-0.5">{p.member_name.split(" ")[0]}</span>
            ))}
            {people.length > 4 && <span className="chip chip-cream !text-[10px] !py-0.5">+{people.length - 4}</span>}
          </div>
        )}

        {approvals.length > 0 && (
          <div className="mt-2 text-xs font-bold text-smoked-charcoal/70">
            {approved}/{approvals.length} greenlit
            {clip.approvals_blocked > 0 && (
              <span className="text-copper-deep"> · {clip.approvals_blocked} blocked</span>
            )}
          </div>
        )}

        {clip.scheduled_date && (
          <p className="text-xs text-cactus-teal font-bold mt-2">
            📅 Goes live: {new Date(clip.scheduled_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
        )}
        {clip.clip_due_date && !clip.scheduled_date && (
          <p className="text-xs text-copper-deep font-bold mt-2">
            Send clip by: {new Date(clip.clip_due_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
        )}
        {clip.approval_due && !clip.scheduled_date && (
          <p className="text-xs text-heat-orange font-bold mt-1">
            Greenlight by: {new Date(clip.approval_due).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
        )}
      </div>
    </button>
  );
}

/**
 * Fetches a thumbnail from TikTok/Instagram oEmbed for link-based clips.
 * Falls back to a gradient placeholder if the fetch fails (CORS, rate limit, etc).
 */
function ClipThumbnail({ link }: { link: string }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (tried) return;
    setTried(true);

    // Try TikTok oEmbed (returns thumbnail_url)
    if (link.includes("tiktok.com")) {
      fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(link)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.thumbnail_url) setThumb(data.thumbnail_url);
        })
        .catch(() => {});
    }
  }, [link, tried]);

  if (thumb) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thumb} alt="" className="w-full h-full object-cover" />;
  }

  // Gradient placeholder with platform label
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-sandstone-cream/40 font-display text-lg">
        {link.includes("tiktok.com") ? "TikTok" : link.includes("instagram.com") ? "Reel" : "Link"}
      </span>
    </div>
  );
}

// ===========================================================================
// READY TO SCHEDULE — side panel in Calendar for pulling from Ready Bank
// ===========================================================================
function ReadyToSchedulePanel({ member, members, onRefresh }: {
  member: { id: string; name: string };
  members: Member[];
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [effortFilter, setEffortFilter] = useState<string | null>(null);
  const [actionTemplate, setActionTemplate] = useState<QuickDropTemplate | null>(null);
  const [liveDate, setLiveDate] = useState<string>(() => nextSunday().toISOString().slice(0, 10));
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const filtered = QUICK_DROP_TEMPLATES.filter((t) => {
    if (effortFilter && t.effort !== effortFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.bucket.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  async function createClip(template: QuickDropTemplate) {
    if (!liveDate) return;
    setCreating(true);
    const deadlines = calcDeadlinesFromLive(new Date(liveDate + "T12:00:00"));
    const { data: clip, error } = await supabase.from("clips").insert({
      title: template.name, type: "video", status: "Planned",
      category: template.bucket, submitted_by: member.id, submitted_by_name: member.name,
      template_id: template.id, destination: template.platforms[0] ?? null,
      idea_due_date: deadlines.idea_due_date, clip_due_date: deadlines.clip_due_date,
      final_cut_due: deadlines.final_cut_due, approval_due: deadlines.approval_due,
      scheduled_date: deadlines.scheduled_date,
    }).select().single();
    if (error) { alert(error.message); setCreating(false); return; }
    if (selectedCrew.length > 0 && clip) {
      await supabase.from("content_assignments").insert(
        selectedCrew.map((crewId) => {
          const cm = members.find((m) => m.id === crewId);
          return {
            clip_id: clip.id, member_id: crewId, member_name: cm?.name ?? "",
            role: "On-Camera", task_type: "Drop a Clip",
            drop_by_date: deadlines.clip_due_date, is_required: true, created_by: member.id,
          };
        })
      );
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${template.name}"`, "/portal/drop")
      ));
    }
    await onRefresh();
    setCreating(false);
    setActionTemplate(null);
    setSelectedCrew([]);
  }

  return (
    <div className="lg:w-80 shrink-0">
      <div className="card p-4 md:p-3 space-y-3 md:space-y-2.5 lg:sticky lg:top-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg md:text-base text-desert-night">Ready to Schedule</p>
            <p className="text-xs md:text-[10px] text-smoked-charcoal/50">{filtered.length} ready · tap + to add</p>
          </div>
          <Link href="/portal/ready-bank" className="text-xs md:text-[10px] text-copper-deep font-bold hover:underline shrink-0">
            Full Bank →
          </Link>
        </div>

        {/* Search box */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search formats..."
          className="field !text-sm md:!text-xs !py-2.5 md:!py-1.5 !px-3 md:!px-2"
        />

        {/* Effort filter — compact row */}
        <div className="flex flex-wrap gap-1.5 md:gap-1">
          <button onClick={() => setEffortFilter(null)} className={`chip !text-xs md:!text-[9px] !py-1 md:!py-0.5 ${!effortFilter ? "chip-copper" : "chip-cream"}`}>All</button>
          {(["2-Min Drop", "5-Min Drop", "10-Min Drop", "Group Day"] as EffortLabel[]).map((e) => (
            <button key={e} onClick={() => setEffortFilter(e === effortFilter ? null : e)} className={`chip !text-xs md:!text-[9px] !py-1 md:!py-0.5 ${effortFilter === e ? "chip-copper" : "chip-cream"}`}>{e.replace(" Drop", "")}</button>
          ))}
        </div>

        {/* List — bigger touch targets on mobile, compact on desktop */}
        <div className="space-y-2 md:space-y-1 max-h-[500px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-sm md:text-xs text-smoked-charcoal/40 text-center py-4">No formats match.</p>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActionTemplate(t); setLiveDate(nextSunday().toISOString().slice(0, 10)); setSelectedCrew([]); }}
                className="w-full flex items-center gap-2 bg-sandstone-cream/40 hover:bg-copper-clay/15 rounded-lg px-3 md:px-2.5 py-3 md:py-1.5 text-left transition-colors group"
              >
                <span className="text-copper-deep font-black text-base md:text-sm shrink-0 group-hover:scale-110 transition-transform">+</span>
                <span className="font-bold text-sm md:text-xs text-desert-night leading-tight flex-1 min-w-0 truncate">{t.name}</span>
                <span className="text-[10px] md:text-[8px] text-smoked-charcoal/50 shrink-0">{t.effort.replace(" Drop", "")}</span>
                {!t.needsTalking && <span className="text-xs md:text-[10px] shrink-0" title="No talking">🤫</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Action modal */}
      {actionTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setActionTemplate(null)}>
          <div className="bg-sandstone-cream rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-desert-night">{actionTemplate.name}</h3>
                <p className="text-xs text-smoked-charcoal/50">{actionTemplate.bucket} · {actionTemplate.effort}</p>
              </div>
              <button onClick={() => setActionTemplate(null)} className="text-desert-night/40 text-2xl">×</button>
            </div>
            <p className="text-xs text-smoked-charcoal/60 bg-cactus-teal/10 rounded p-2">{actionTemplate.description}</p>
            <div>
              <p className="label">Goes live</p>
              <input type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} className="field !w-auto" />
            </div>
            <div>
              <p className="label">Assign crew <span className="font-normal text-desert-night/40">(optional)</span></p>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <button key={m.id} onClick={() => setSelectedCrew(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])} className={`chip !text-xs ${selectedCrew.includes(m.id) ? "chip-copper" : "chip-cream"}`}>{m.name}</button>
                ))}
              </div>
            </div>
            <button onClick={() => createClip(actionTemplate)} disabled={creating} className="btn btn-primary btn-lg w-full">
              {creating ? "Creating…" : "Add to calendar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ clips, themes, themeMap, canPlanContent, member, members, onRefresh }: {
  clips: ClipMeta[];
  themes: Theme[];
  themeMap: Map<string, Theme>;
  canPlanContent?: boolean;
  member?: { id: string; name: string };
  members?: Member[];
  onRefresh?: () => Promise<void>;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const scheduled = clips.filter((c) => c.scheduled_date || c.clip_due_date || c.approval_due || c.idea_due_date || c.final_cut_due || c.due_date);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Active themes for this week
  const weekThemes = themes.filter((t) => {
    if (!t.start_date && !t.end_date) return false;
    const ws = weekStart.getTime();
    const we = days[6].getTime();
    const ts = t.start_date ? new Date(t.start_date).getTime() : 0;
    const te = t.end_date ? new Date(t.end_date).getTime() : Date.now();
    return ts <= we && te >= ws;
  });

  const DEADLINE_TYPES: { field: keyof ClipMeta; label: string; color: string }[] = [
    { field: "idea_due_date", label: "Spark-by", color: "text-cactus-teal" },
    { field: "clip_due_date", label: "Drop-by", color: "text-copper-deep" },
    { field: "final_cut_due", label: "Cut ready", color: "text-heat-orange" },
    { field: "approval_due", label: "Greenlight", color: "text-heat-orange" },
    { field: "scheduled_date", label: "Goes Live", color: "text-cactus-teal" },
  ];

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="btn btn-ghost btn-sm">← Prev</button>
        <span className="font-display text-lg text-desert-night">
          {days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="btn btn-ghost btn-sm">Next →</button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="btn btn-secondary btn-sm ml-2">Today</button>
        )}
      </div>

      {/* Active Weekly Heat for this week */}
      {weekThemes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {weekThemes.map((t) => (
            <span key={t.id} className="chip chip-copper">🔥 {t.name}</span>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const dayClips = scheduled.filter((c) => {
            const dates = [c.scheduled_date, c.clip_due_date, c.approval_due, c.idea_due_date, c.final_cut_due, c.due_date].filter(Boolean);
            return dates.some((d) => new Date(d!).toDateString() === day.toDateString());
          });
          return (
            <div key={day.toISOString()} className={`card p-3 min-h-[120px] ${isToday ? "ring-2 ring-copper-clay" : ""}`}>
              <div className="flex items-center justify-between">
                <p className="font-display text-sm text-desert-night">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className={`text-xs ${isToday ? "text-copper-deep font-black" : "text-smoked-charcoal/60"}`}>{day.getDate()}</p>
              </div>
              <div className="space-y-2 mt-2">
                {dayClips.map((c) => {
                  // Find which deadline(s) match this day
                  const matchingDeadlines = DEADLINE_TYPES.filter((dt) => {
                    const val = c[dt.field] as string | null;
                    return val && new Date(val).toDateString() === day.toDateString();
                  });
                  const isLive = matchingDeadlines.some((d) => d.label === "Goes Live");
                  return (
                    <div key={c.id} className={`rounded-lg p-2 ${isLive ? "bg-cactus-teal/20" : "bg-copper-clay/15"}`}>
                      <p className="text-xs font-bold text-desert-night leading-tight">{c.title}</p>
                      {matchingDeadlines.map((d) => (
                        <span key={d.label} className={`text-[10px] font-black ${d.color} block`}>{d.label}</span>
                      ))}
                      <span className={`chip ${STATUS_CHIP[c.status]} !text-[10px] !py-0.5 mt-1`}>{c.status}</span>
                      {c.theme_id && themeMap.get(c.theme_id) && (
                        <span className="text-[10px] text-copper-deep block mt-1">🔥 {themeMap.get(c.theme_id)!.name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {scheduled.length === 0 && (
        <div className="card p-6 text-center text-smoked-charcoal/60">
          Nothing scheduled yet. Set deadlines on a clip from Studio Flow, or create a Weekly Heat.
        </div>
      )}

        {/* Ready to Schedule side panel — planner/admin only */}
        {canPlanContent && member && members && onRefresh && (
          <ReadyToSchedulePanel member={member} members={members} onRefresh={onRefresh} />
        )}
      </div>
    </div>
  );
}

function ClipDetailModal({
  clip, people, approvals, isAdmin, canPlanContent, themes, currentMemberId, currentMemberName, onClose, onStatusChange, onDelete, onRefresh,
}: {
  clip: ClipMeta;
  people: ClipPerson[];
  approvals: Approval[];
  isAdmin: boolean;
  canPlanContent: boolean;
  themes: Theme[];
  currentMemberId?: string;
  currentMemberName?: string;
  onClose: () => void;
  onStatusChange: (id: string, s: ClipStatus) => void;
  onDelete: (id: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const [editNote, setEditNote] = useState("");
  const [working, setWorking] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>(clip.theme_id ?? "");
  const [deadlines, setDeadlines] = useState<Record<string, string>>({
    idea_due_date: clip.idea_due_date ?? "",
    clip_due_date: clip.clip_due_date ?? "",
    final_cut_due: clip.final_cut_due ?? "",
    approval_due: clip.approval_due ?? "",
    scheduled_date: clip.scheduled_date ?? "",
  });
  const [savingDeadlines, setSavingDeadlines] = useState(false);

  async function saveDeadlines() {
    setSavingDeadlines(true);
    const { error } = await supabase.from("clips").update({
      idea_due_date: deadlines.idea_due_date || null,
      clip_due_date: deadlines.clip_due_date || null,
      final_cut_due: deadlines.final_cut_due || null,
      approval_due: deadlines.approval_due || null,
      scheduled_date: deadlines.scheduled_date || null,
      theme_id: selectedTheme || null,
    }).eq("id", clip.id);
    if (error) alert(error.message);
    await onRefresh();
    setSavingDeadlines(false);
  }

  // can the current user approve? must be tagged in the clip
  const myApproval = approvals.find((a) => a.member_id === currentMemberId);
  const canApprove = !!myApproval;

  async function setApproval(status: Database["public"]["Tables"]["approvals"]["Update"]["status"], note?: string) {
    if (!myApproval) return;
    setWorking(true);
    const { error } = await supabase
      .from("approvals")
      .update({ status, edit_note: note ?? null })
      .eq("id", myApproval.id);
    if (error) alert(error.message);
    // Log activity
    await supabase.from("activity").insert({
      actor_id: currentMemberId ?? null,
      actor_name: currentMemberName ?? "Someone",
      kind: "approved",
      body: `${currentMemberName ?? "Someone"} ${status === "Approved" ? "greenlit" : status === "Do Not Post" ? "said do not post" : "reviewed"} "${clip.title}"`,
    });
    await onRefresh();
    setWorking(false);
  }

  // silence unused warning for onStatusChange when not admin
  void onStatusChange;

  return (
    <div className="fixed inset-0 z-50 bg-desert-night/70 flex items-center justify-center p-3 md:p-4" onClick={onClose}>
      <div
        className="card p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {canPlanContent && <span className={`chip ${STATUS_CHIP[clip.status]}`}>{clip.status}</span>}
            <h2 className="font-display text-2xl md:text-3xl text-desert-night mt-2 leading-none break-words">{clip.title}</h2>
            <p className="text-sm text-smoked-charcoal/60 mt-1">{droppedByLabel(clip)}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">✕</button>
        </div>

        {clip.link && (
          <a href={clip.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-4">
            Open link →
          </a>
        )}

        {/* Video player — plays uploaded videos right in the modal */}
        {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
          <div className="mt-4">
            <VideoPlayer filePath={clip.file_path} title={clip.title} className="aspect-video" />
          </div>
        )}

        {/* YouTube embed for link clips */}
        {clip.link && isYouTubeLink(clip.link) && getYouTubeEmbed(clip.link) && (
          <div className="mt-4 aspect-video rounded-xl overflow-hidden">
            <iframe
              src={getYouTubeEmbed(clip.link)!}
              title={clip.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {clip.idea_text && <p className="mt-4 text-smoked-charcoal bg-sandstone-cream/50 rounded-xl p-4">{clip.idea_text}</p>}
        {clip.caption && <p className="mt-4 font-script text-xl text-desert-night">{clip.caption}</p>}
        {clip.do_not_post_notes && (
          <div className="mt-4 bg-copper-deep/15 border border-copper-clay rounded-xl p-3">
            <p className="text-xs font-black uppercase text-copper-deep">Do not post notes</p>
            <p className="text-sm text-desert-night mt-1">{clip.do_not_post_notes}</p>
          </div>
        )}

        {/* ===== CREW VIEW — prompt them, don't script them ===== */}
        {!canPlanContent && (
          <div className="mt-6 space-y-4">
            {/* Template — idea, vibe, what to drop, examples, make it yours */}
            {clip.template_id && getTemplate(clip.template_id) && (() => {
              const t = getTemplate(clip.template_id)!;
              return (
                <div className="card p-5 bg-cactus-teal/10 space-y-4">
                  <div>
                    <p className="font-display text-lg text-desert-night">{t.name}</p>
                    <p className="text-xs text-smoked-charcoal/60 mt-1">
                      ⏱ {t.timeEstimate} · {t.effort}
                    </p>
                  </div>

                  {/* Idea */}
                  <div>
                    <p className="text-xs font-bold text-desert-night/50 uppercase">Idea</p>
                    <p className="text-sm text-desert-night mt-1">{t.idea}</p>
                  </div>

                  {/* Vibe */}
                  <div>
                    <p className="text-xs font-bold text-desert-night/50 uppercase">Vibe</p>
                    <p className="text-sm text-desert-night mt-1">{t.vibe}</p>
                  </div>

                  {/* What to drop */}
                  <div>
                    <p className="text-xs font-bold text-desert-night/50 uppercase">What to drop</p>
                    <p className="text-sm text-desert-night mt-1">{t.whatToDrop}</p>
                  </div>

                  {/* Easy way to film */}
                  {t.easyWay && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Easy way to film</p>
                      <p className="text-sm text-desert-night mt-1">{t.easyWay}</p>
                    </div>
                  )}

                  {/* Transition options */}
                  {t.transitions && t.transitions.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Transition ideas</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.transitions.map((tr) => (
                          <span key={tr} className="chip chip-cream !text-[10px]">{tr}</span>
                        ))}
                      </div>
                      <p className="text-xs text-smoked-charcoal/50 mt-2">Pick one or do your own. Keep it simple.</p>
                    </div>
                  )}

                  {/* Examples — not scripts */}
                  {t.examples && t.examples.length > 0 && (
                    <div className="bg-sandstone-cream/70 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Examples if you&apos;re stuck</p>
                      <ul className="mt-2 space-y-1">
                        {t.examples.map((ex, i) => (
                          <li key={i} className={`text-sm font-script text-base ${ex.toLowerCase().includes((currentMemberName ?? "").split(" ")[0].toLowerCase()) ? "text-copper-deep font-bold" : "text-desert-night/70"}`}>
                            &ldquo;{ex}&rdquo;
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-smoked-charcoal/50 mt-2">Need a starting point? Use one of these or make it your own.</p>
                    </div>
                  )}

                  {/* Make it yours */}
                  <div className="bg-heat-orange/10 rounded-lg p-3">
                    <p className="text-xs font-bold text-heat-orange uppercase">Make it yours</p>
                    <p className="text-sm text-desert-night mt-1">{t.makeItYours}</p>
                  </div>

                  <p className="text-xs text-smoked-charcoal/50 text-center italic">
                    One take is fine. We are looking for real, not perfect.
                  </p>
                </div>
              );
            })()}

            {/* Crew drop-by — the only date they need to see */}
            {clip.clip_due_date && (
              <div className="card p-4 bg-heat-orange/10">
                <p className="text-xs font-bold text-desert-night/50 uppercase">Drop-by</p>
                <p className="font-display text-xl text-desert-night mt-1">
                  {new Date(clip.clip_due_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <p className="text-sm text-smoked-charcoal/60 mt-1">
                  {new Date(clip.clip_due_date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            )}

            {/* Goes live — only if already scheduled */}
            {clip.scheduled_date && clip.status === "Scheduled" && (
              <div className="card p-4 bg-cactus-teal/10">
                <p className="text-xs font-bold text-desert-night/50 uppercase">Goes Live</p>
                <p className="font-display text-xl text-desert-night mt-1">
                  {new Date(clip.scheduled_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
            )}

            {/* Greenlight — only if they have something to approve */}
            {canApprove && clip.approval_due && (
              <div className="card p-4 bg-sunburst-yellow/10">
                <p className="text-xs font-bold text-desert-night/50 uppercase">Greenlight By</p>
                <p className="font-display text-xl text-desert-night mt-1">
                  {new Date(clip.approval_due).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
            )}

            {/* Drop Mine button */}
            <Link href="/portal/drop" className="btn btn-primary btn-lg w-full">
              Drop Mine 🎬
            </Link>
            <p className="text-center text-xs text-desert-night/40">
              One take is fine. No pressure to be perfect.
            </p>
          </div>
        )}

        {/* ===== ADMIN VIEW — the full machine ===== */}
        {canPlanContent && (
          <>
            {/* Weekly Heat — deadlines with clean labels */}
            {(clip.idea_due_date || clip.clip_due_date || clip.final_cut_due || clip.approval_due || clip.scheduled_date) && (
              <div className="mt-6 card p-4 bg-sandstone-cream/50">
                <h3 className="font-display text-xl text-desert-night mb-3">Timeline</h3>
                <div className="space-y-2">
                  <DeadlineRow label="Crew Drop-by" value={clip.clip_due_date} canEdit={canPlanContent} fieldName="clip_due_date" deadlines={deadlines} setDeadlines={setDeadlines} />
                  <DeadlineRow label="Cut Ready" value={clip.final_cut_due} canEdit={canPlanContent} fieldName="final_cut_due" deadlines={deadlines} setDeadlines={setDeadlines} />
                  <DeadlineRow label="Greenlight By" value={clip.approval_due} canEdit={canPlanContent} fieldName="approval_due" deadlines={deadlines} setDeadlines={setDeadlines} />
                  <DeadlineRow label="Goes Live" value={clip.scheduled_date} canEdit={canPlanContent} fieldName="scheduled_date" deadlines={deadlines} setDeadlines={setDeadlines} />
                </div>
                {canPlanContent && (
                  <>
                    {/* Theme assignment */}
                    <div className="mt-3 pt-3 border-t border-desert-night/10">
                      <p className="label">Weekly Heat</p>
                      <select
                        className="field !w-auto"
                        value={selectedTheme}
                        onChange={(e) => setSelectedTheme(e.target.value)}
                      >
                        <option value="">No theme</option>
                        {themes.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={saveDeadlines} className="btn btn-primary btn-sm mt-3" disabled={savingDeadlines}>
                      {savingDeadlines ? "Saving…" : "Save Timeline + Theme"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Platform */}
            {clip.destination && (
              <div className="mt-4">
                <span className="chip chip-teal">📍 Platform: {clip.destination}</span>
              </div>
            )}

            {/* Crew submission status */}
            {people.length > 0 && (
              <div className="mt-4 card p-4">
                <h3 className="font-display text-lg text-desert-night mb-3">Crew</h3>
                <div className="space-y-2">
                  {people.map((p) => {
                    const approval = approvals.find((a) => a.member_id === p.member_id);
                    const status = approval?.status ?? "Waiting";
                    return (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="font-bold text-desert-night">{p.member_name}</span>
                        <span className={`chip !text-[9px] ${
                          status === "Approved" ? "chip-approved" :
                          status === "Do Not Post" ? "chip-danger" :
                          "chip-cream"
                        }`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Destination */}
        {clip.destination && (
          <div className="mt-4">
            <span className="chip chip-teal">📍 Going to: {clip.destination}</span>
          </div>
        )}

        {/* People + approvals */}
        {people.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display text-xl text-desert-night mb-3">Crew in this clip</h3>
            <div className="space-y-2">
              {people.map((p) => {
                const a = approvals.find((ap) => ap.member_id === p.member_id);
                return (
                  <div key={p.id} className="flex items-center justify-between bg-sandstone-cream/50 rounded-xl p-3">
                    <span className="font-bold text-desert-night">{p.member_name}</span>
                    {a ? (
                      <span className={`chip ${APPROVAL_CHIP[a.status]}`}>{a.status}</span>
                    ) : (
                      <span className="chip chip-cream">Not tagged for approval</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My approval actions */}
        {canApprove && (
          <div className="mt-6 card-dark p-4">
            <p className="text-sandstone-cream font-bold mb-3">Your greenlight</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setApproval("Approved")} className="btn btn-positive btn-sm" disabled={working}>
                Good to Go
              </button>
              <button onClick={() => setApproval("Approved With Edits", editNote || undefined)} className="btn btn-warning btn-sm" disabled={working}>
                Needs a Tweak
              </button>
              <button onClick={() => setApproval("Do Not Post")} className="btn btn-danger btn-sm" disabled={working}>
                Do Not Post Yet
              </button>
              <button onClick={() => setApproval("Don't Like How I Come Across", editNote || undefined)} className="btn btn-warning btn-sm" disabled={working}>
                Don&apos;t Like How I Come Across
              </button>
              <button onClick={() => setApproval("No Tag")} className="btn btn-secondary btn-sm" disabled={working}>
                Approve, Don&apos;t Tag Me
              </button>
            </div>
            <input
              className="field mt-3 !bg-white/10 !text-sandstone-cream !border-white/20"
              placeholder="Edit note (optional)"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
          </div>
        )}

        {/* Status changer — admin or content planners */}
        {canPlanContent && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="label">{isAdmin ? "Move to status (admin)" : "Move to status (planner)"}</p>
              <div className="flex flex-wrap gap-2">
                {STUDIO_FLOW.filter((s) => s !== clip.status).map((s) => (
                  <button key={s} onClick={() => onStatusChange(clip.id, s)} className="chip chip-cream hover:chip-copper transition-colors">
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => onStatusChange(clip.id, "Hold")}
                  className="chip chip-hold"
                >Hold — Comfort Review</button>
                {/* Do Not Post is admin-only — planners cannot override */}
                {isAdmin && (
                  <button
                    onClick={() => onStatusChange(clip.id, "Do Not Post")}
                    className="chip chip-danger"
                  >Do Not Post</button>
                )}
              </div>
            </div>
            {/* Delete — planners and admins */}
            {canPlanContent && (
              <div className="pt-4 border-t border-desert-night/10">
                <button
                  onClick={() => onDelete(clip.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete Clip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeadlineRow({
  label, value, canEdit, fieldName, deadlines, setDeadlines,
}: {
  label: string;
  value: string | null;
  canEdit: boolean;
  fieldName: string;
  deadlines: Record<string, string>;
  setDeadlines: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const formatted = value
    ? new Date(value).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-desert-night/70">{label}</span>
      {canEdit ? (
        <input
          type="date"
          className="field !py-1 !text-sm !w-auto"
          value={deadlines[fieldName] ? deadlines[fieldName].split("T")[0] : ""}
          onChange={(e) => setDeadlines({ ...deadlines, [fieldName]: e.target.value })}
        />
      ) : (
        <span className="text-sm font-bold text-desert-night">
          {formatted ?? "Not set"}
        </span>
      )}
    </div>
  );
}

// ===========================================================================
// THIS WEEK — everybody's quick overview
// ===========================================================================
function ThisWeekTab({
  clips, people, approvals, themes, trends, themeMap, assignments, currentMemberId, onSelectClip,
}: {
  clips: ClipMeta[];
  people: Record<string, ClipPerson[]>;
  approvals: Record<string, Approval[]>;
  themes: Theme[];
  trends: TrendRef[];
  themeMap: Map<string, Theme>;
  assignments: Assignment[];
  currentMemberId?: string;
  onSelectClip: (id: string) => void;
}) {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  const isThisWeek = (dateStr: string | null) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= now && d <= weekEnd;
  };

  // My clips — clips I'm tagged in
  const myClipIds = Object.entries(people)
    .filter(([, ppl]) => ppl.some((p) => p.member_id === currentMemberId))
    .map(([id]) => id);
  const myClips = clips.filter((c) => myClipIds.includes(c.id));
  const myApprovals = myClips
    .map((c) => ({ clip: c, approval: approvals[c.id]?.find((a) => a.member_id === currentMemberId) }))
    .filter((x) => x.approval && x.approval.status === "Waiting");

  // My assignments — "Your Part"
  const myAssignments = assignments
    .filter((a) => a.member_id === currentMemberId && a.status !== "Done" && a.status !== "Skipped" && a.status !== "Greenlit")
    .sort((a, b) => {
      const ad = a.drop_by_date ? new Date(a.drop_by_date).getTime() : Infinity;
      const bd = b.drop_by_date ? new Date(b.drop_by_date).getTime() : Infinity;
      return ad - bd;
    });

  // Upcoming deadlines this week
  const upcomingDeadlines = clips
    .filter((c) => {
      const dates = [c.clip_due_date, c.final_cut_due, c.approval_due, c.scheduled_date, c.idea_due_date];
      return dates.some(isThisWeek);
    })
    .sort((a, b) => {
      const aDate = [a.clip_due_date, a.final_cut_due, a.approval_due, a.scheduled_date, a.idea_due_date].filter(Boolean).sort()[0];
      const bDate = [b.clip_due_date, b.final_cut_due, b.approval_due, b.scheduled_date, b.idea_due_date].filter(Boolean).sort()[0];
      return new Date(aDate ?? 0).getTime() - new Date(bDate ?? 0).getTime();
    });

  // What's going live this week
  const goingLive = clips.filter((c) => isThisWeek(c.scheduled_date));
  // What's stuck
  const stuck = clips.filter((c) => c.status === "Hold" || c.status === "Do Not Post" ||
    (c.status === "Review" && c.approvals_blocked > 0));

  // Active themes
  const activeThemes = themes.filter((t) => t.status === "Active" || t.status === "Planning");

  return (
    <div className="space-y-6">
      {/* Active Weekly Heat */}
      {activeThemes.length > 0 && (
        <div className="card-dark p-5">
          <h2 className="font-display text-2xl text-sunburst-yellow mb-3">🔥 This Week&apos;s Heat</h2>
          <div className="space-y-3">
            {activeThemes.map((t) => {
              const themeClips = clips.filter((c) => c.theme_id === t.id);
              const themeTrends = trends.filter((tr) => tr.theme_id === t.id);
              return (
                <div key={t.id} className="bg-white/5 rounded-xl p-4">
                  <p className="font-display text-lg text-sandstone-cream">{t.name}</p>
                  {t.description && <p className="text-sm text-sandstone-cream/60 mt-1">{t.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="chip chip-copper !text-[10px]">{themeClips.length} clips</span>
                    <span className="chip chip-teal !text-[10px]">{themeTrends.length} trend drops</span>
                    {t.start_date && t.end_date && (
                      <span className="chip chip-cream !text-[10px]">
                        {new Date(t.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {new Date(t.end_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Your Part — assigned tasks */}
      {myAssignments.length > 0 && (
        <div className="card p-5 border-2 border-copper-clay/30">
          <h2 className="font-display text-2xl text-desert-night mb-1">Your Part</h2>
          <p className="text-sm text-smoked-charcoal/60 mb-3">{myAssignments.length} thing{myAssignments.length > 1 ? "s" : ""} you&apos;re on</p>
          <div className="space-y-3">
            {myAssignments.map((a) => {
              const clip = clips.find((c) => c.id === a.clip_id);
              const isOverdue = a.drop_by_date && new Date(a.drop_by_date) < now && a.status !== "Done" && a.status !== "Greenlit" && a.status !== "Dropped";
              return (
                <button key={a.id} onClick={() => onSelectClip(a.clip_id)} className="card p-4 w-full text-left hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-desert-night truncate">{clip?.title ?? "Content item"}</p>
                      <p className="text-xs text-smoked-charcoal/60 mt-0.5">Role: {a.role}</p>
                    </div>
                    <span className={`chip ${ASSIGNMENT_STATUS_CHIP[a.status] ?? "chip-cream"} !text-[10px] shrink-0`}>{assignmentStatusLabel(a.status)}</span>
                  </div>
                  {a.task_title && <p className="text-sm text-desert-night mt-2">{a.task_title}</p>}
                  {a.task_notes && <p className="text-xs text-smoked-charcoal/60 mt-1">{a.task_notes}</p>}
                  {a.drop_by_date && (
                    <p className={`text-xs font-bold mt-2 ${isOverdue ? "text-heat-orange" : "text-copper-deep"}`}>
                      {isOverdue ? "⚠ Late — " : ""}Drop-by: {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  )}
                  {!a.is_required && <span className="chip chip-cream !text-[9px] mt-2">Optional</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* My greenlights needed */}
      {myApprovals.length > 0 && (
        <div className="card p-5 border-2 border-heat-orange/30">
          <h2 className="font-display text-2xl text-desert-night mb-1">Your Greenlights</h2>
          <p className="text-sm text-smoked-charcoal/60 mb-3">{myApprovals.length} clip{myApprovals.length > 1 ? "s" : ""} waiting on you</p>
          <div className="space-y-2">
            {myApprovals.map(({ clip }) => (
              <button key={clip.id} onClick={() => onSelectClip(clip.id)} className="card p-3 w-full text-left hover:-translate-y-0.5 transition-transform">
                <p className="font-bold text-desert-night">{clip.title}</p>
                <span className="chip chip-waiting !text-[10px] mt-1">Waiting for your greenlight</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-desert-night mb-3">Coming Up This Week</h2>
          <div className="space-y-2">
            {upcomingDeadlines.map((c) => {
              const deadlines: { label: string; date: string; color: string }[] = [];
              if (isThisWeek(c.idea_due_date)) deadlines.push({ label: "Spark-by", date: c.idea_due_date!, color: "text-cactus-teal" });
              if (isThisWeek(c.clip_due_date)) deadlines.push({ label: "Drop-by", date: c.clip_due_date!, color: "text-copper-deep" });
              if (isThisWeek(c.final_cut_due)) deadlines.push({ label: "Cut ready", date: c.final_cut_due!, color: "text-heat-orange" });
              if (isThisWeek(c.approval_due)) deadlines.push({ label: "Greenlight", date: c.approval_due!, color: "text-heat-orange" });
              if (isThisWeek(c.scheduled_date)) deadlines.push({ label: "Goes Live", date: c.scheduled_date!, color: "text-cactus-teal" });
              return (
                <button key={c.id} onClick={() => onSelectClip(c.id)} className="card p-3 w-full text-left hover:-translate-y-0.5 transition-transform flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night">{c.title}</p>
                    {c.theme_id && themeMap.get(c.theme_id) && (
                      <span className="text-xs text-copper-deep">🔥 {themeMap.get(c.theme_id)!.name}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
                    {deadlines.map((d) => (
                      <span key={d.label} className={`text-xs font-black ${d.color} whitespace-nowrap`}>
                        {d.label}: {new Date(d.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Going live */}
      {goingLive.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-desert-night mb-3">Going Live This Week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goingLive.map((c) => (
              <button key={c.id} onClick={() => onSelectClip(c.id)} className="card p-4 text-left hover:-translate-y-0.5 transition-transform bg-cactus-teal/10">
                <p className="font-bold text-desert-night">{c.title}</p>
                <p className="text-xs text-cactus-teal font-black mt-1">
                  📅 {new Date(c.scheduled_date!).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </p>
                {c.destination && <span className="chip chip-teal !text-[10px] mt-2">📍 {c.destination}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stuck */}
      {stuck.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-heat-orange mb-3">⚠ Stuck / On Hold</h2>
          <div className="space-y-2">
            {stuck.map((c) => (
              <button key={c.id} onClick={() => onSelectClip(c.id)} className="card p-3 w-full text-left hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-desert-night">{c.title}</p>
                  <span className={`chip ${STATUS_CHIP[c.status]} !text-[10px]`}>{c.status}</span>
                </div>
                {c.approvals_blocked > 0 && (
                  <p className="text-xs text-copper-deep mt-1">{c.approvals_blocked} approval(s) blocked</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {upcomingDeadlines.length === 0 && goingLive.length === 0 && myApprovals.length === 0 && stuck.length === 0 && activeThemes.length === 0 && (
        <div className="card p-10 text-center">
          <div className="inline-block"><MascotImage pose="main" size={120} /></div>
          <p className="font-display text-2xl text-desert-night mt-4">All clear this week.</p>
          <p className="text-smoked-charcoal/70 mt-2">Nothing due, nothing stuck. Drop a clip or set some deadlines.</p>
          <Link href="/portal/drop" className="btn btn-primary mt-6">Drop a Clip</Link>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// TREND DROPS — references and inspiration
// ===========================================================================
function TrendDropsTab({
  trends, themes, currentMemberId, currentMemberName, canPlanContent, isAdmin, onRefresh,
}: {
  trends: TrendRef[];
  themes: Theme[];
  currentMemberId?: string;
  currentMemberName?: string;
  canPlanContent: boolean;
  isAdmin: boolean;
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [themeId, setThemeId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function addTrend() {
    if (!title.trim() || !url.trim() || !currentMemberId || !currentMemberName) return;
    setSaving(true);
    const { error } = await supabase.from("trend_references").insert({
      title: title.trim(),
      url: url.trim(),
      platform,
      submitted_by: currentMemberId,
      submitted_by_name: currentMemberName,
      notes: notes.trim() || null,
      theme_id: themeId || null,
    });
    if (error) alert(error.message);
    setTitle(""); setUrl(""); setNotes(""); setThemeId(""); setPlatform("tiktok");
    setShowForm(false);
    await onRefresh();
    setSaving(false);
  }

  async function updateTrendStatus(id: string, status: string) {
    const { error } = await supabase.from("trend_references").update({ status }).eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  async function deleteTrend(id: string) {
    if (!confirm("Remove this trend drop?")) return;
    const { error } = await supabase.from("trend_references").delete().eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  // Turn a trend into a quick drop clip — auto-fills everything with defaults
  async function turnIntoQuickDrop(trend: TrendRef) {
    if (!currentMemberId || !currentMemberName) return;
    // Auto-suggest: use the active Weekly Heat's end date, or next Sunday if none
    const activeTheme = themes.find((t) => t.status === "Active" || t.status === "Planning");
    const liveDate = activeTheme?.end_date ? new Date(activeTheme.end_date) : nextSunday();
    const deadlines = calcDeadlinesFromLive(liveDate);

    const { data: clip, error } = await supabase.from("clips").insert({
      title: `Quick Drop: ${trend.title}`,
      type: "tiktok_link",
      status: "Planned",
      link: trend.url,
      category: "Trends",
      submitted_by: currentMemberId,
      submitted_by_name: currentMemberName,
      theme_id: trend.theme_id ?? null,
      idea_due_date: deadlines.idea_due_date,
      clip_due_date: deadlines.clip_due_date,
      final_cut_due: deadlines.final_cut_due,
      approval_due: deadlines.approval_due,
      scheduled_date: deadlines.scheduled_date,
    }).select().single();

    if (error) { alert(error.message); return; }

    // Mark trend as Assigned
    await supabase.from("trend_references").update({ status: "Assigned" }).eq("id", trend.id);

    await onRefresh();
  }

  const TREND_CHIP: Record<string, string> = {
    New: "chip-cream",
    Watching: "chip-yellow",
    Assigned: "chip-copper",
    Used: "chip-approved",
    Passed: "chip-danger",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-smoked-charcoal/70">Trends, links, and inspiration the crew is watching. Anyone can drop one.</p>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          {showForm ? "Cancel" : "+ Drop a Trend"}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3">
          <input className="field" placeholder="Trend title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="field" placeholder="Paste the link" value={url} onChange={(e) => setUrl(e.target.value)} />
          <div className="flex gap-3">
            <select className="field !w-auto" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="other">Other</option>
            </select>
            {canPlanContent && (
              <select className="field !w-auto" value={themeId} onChange={(e) => setThemeId(e.target.value)}>
                <option value="">No Weekly Heat</option>
                {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>
          <textarea className="field min-h-[60px]" placeholder="How should we do this AZ style?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button onClick={addTrend} className="btn btn-primary" disabled={saving || !title.trim() || !url.trim()}>
            {saving ? "Dropping…" : "Drop It"}
          </button>
        </div>
      )}

      {trends.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="text-5xl">📡</span>
          <p className="font-display text-2xl text-desert-night mt-4">No trend drops yet.</p>
          <p className="text-smoked-charcoal/70 mt-2">See a trend on TikTok? Drop the link here so the crew can see it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((t) => {
            const theme = themes.find((th) => th.id === t.theme_id);
            const isMine = t.submitted_by === currentMemberId;
            return (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-desert-night truncate">{t.title}</h3>
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cactus-teal hover:underline truncate block">
                      {t.url}
                    </a>
                  </div>
                  <span className={`chip ${TREND_CHIP[t.status] ?? "chip-cream"} !text-[10px] shrink-0`}>{t.status}</span>
                </div>
                {t.notes && <p className="text-sm text-smoked-charcoal/70 mt-2">{t.notes}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="chip chip-dark !text-[10px]">{t.platform}</span>
                  <span className="text-xs text-smoked-charcoal/50">by {t.submitted_by_name}</span>
                  {theme && <span className="chip chip-copper !text-[10px]">🔥 {theme.name}</span>}
                </div>

                {/* Quick action buttons for planners */}
                {canPlanContent && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-desert-night/10">
                    <button onClick={() => updateTrendStatus(t.id, "Watching")} className="btn btn-secondary btn-sm !text-xs">Save Later</button>
                    <button onClick={() => turnIntoQuickDrop(t)} className="btn btn-primary btn-sm !text-xs">Turn Into Quick Drop</button>
                    {t.status !== "Used" && (
                      <button onClick={() => updateTrendStatus(t.id, "Used")} className="btn btn-secondary btn-sm !text-xs">Use This Week</button>
                    )}
                    <button onClick={() => updateTrendStatus(t.id, "Passed")} className="btn btn-ghost btn-sm !text-xs">Archive</button>
                  </div>
                )}

                {/* Status chips — planner+ or owner */}
                {(canPlanContent || isMine) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {["New", "Watching", "Assigned", "Used", "Passed"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateTrendStatus(t.id, s)}
                        className={`chip !text-[9px] ${t.status === s ? TREND_CHIP[s] ?? "chip-cream" : "chip-cream opacity-50 hover:opacity-100"}`}
                      >{s}</button>
                    ))}
                    {canPlanContent && (
                      <button onClick={() => deleteTrend(t.id)} className="chip chip-danger !text-[9px] ml-auto">Delete</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// WEEKLY HEAT — theme management
// ===========================================================================
function WeeklyHeatTab({
  themes, clips, trends, members, canPlanContent, isAdmin, currentMemberId, currentMemberName, onRefresh,
}: {
  themes: Theme[];
  clips: ClipMeta[];
  trends: TrendRef[];
  members: Member[];
  canPlanContent: boolean;
  isAdmin: boolean;
  currentMemberId?: string;
  currentMemberName?: string;
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Heat Builder state
  const [postCount, setPostCount] = useState(3);
  const [vibe, setVibe] = useState("easy_week");
  const [effort, setEffort] = useState("10min");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<PlannedItem[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  // Week start date — auto-suggested to next Sunday, but user can change it
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    const sun = nextSunday();
    return sun.toISOString().slice(0, 10);
  });

  async function createTheme() {
    if (!name.trim() || !currentMemberId) return;
    setSaving(true);
    const { error } = await supabase.from("content_themes").insert({
      name: name.trim(),
      description: description.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      created_by: currentMemberId,
    });
    if (error) alert(error.message);
    setName(""); setDescription(""); setStartDate(""); setEndDate("");
    setShowForm(false);
    await onRefresh();
    setSaving(false);
  }

  async function updateThemeStatus(id: string, status: string) {
    const { error } = await supabase.from("content_themes").update({ status }).eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  async function deleteTheme(id: string) {
    if (!confirm("Delete this Weekly Heat? Clips will keep their data but lose the theme link.")) return;
    const { error } = await supabase.from("content_themes").delete().eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  const STATUS_CHIP: Record<string, string> = {
    Planning: "chip-yellow",
    Active: "chip-copper",
    Wrapped: "chip-cream",
  };

  // Generate week plan and create clips + theme in the database
  async function generateAndCreateWeek() {
    if (!currentMemberId || !currentMemberName || !weekStartDate) return;
    setGenerating(true);

    const startDate = new Date(weekStartDate + "T12:00:00");
    const crewNames = selectedCrew.map((id) => members.find((m) => m.id === id)?.name ?? "").filter(Boolean);
    const plan = generateWeekPlan(postCount, vibe, effort, crewNames, startDate);
    setGeneratedPlan(plan);

    // Create the Weekly Heat theme
    const vibeLabel = HEAT_VIBES.find((v) => v.id === vibe)?.label ?? vibe;
    const weekEnd = new Date(startDate);
    weekEnd.setDate(startDate.getDate() + 6);

    const { data: theme, error: themeErr } = await supabase.from("content_themes").insert({
      name: `${vibeLabel} Week`,
      description: `${EFFORT_LEVELS.find((e) => e.id === effort)?.label ?? "10-Min Drop"} · ${postCount} posts`,
      start_date: startDate.toISOString(),
      end_date: weekEnd.toISOString(),
      status: "Planning",
      created_by: currentMemberId,
    }).select().single();

    if (themeErr) { alert(themeErr.message); setGenerating(false); return; }

    // Create clips for each planned item with auto-calculated deadlines
    const clipInserts = plan.map((item) => ({
      title: item.title,
      type: "video" as const,
      status: "Planned" as const,
      category: vibeLabel,
      submitted_by: currentMemberId,
      submitted_by_name: currentMemberName,
      theme_id: theme.id,
      template_id: selectedTemplate || null,
      idea_due_date: item.deadlines.idea_due_date,
      clip_due_date: item.deadlines.clip_due_date,
      final_cut_due: item.deadlines.final_cut_due,
      approval_due: item.deadlines.approval_due,
      scheduled_date: item.deadlines.scheduled_date,
    }));

    const { data: createdClips, error: clipsErr } = await supabase.from("clips").insert(clipInserts).select();
    if (clipsErr) { alert(clipsErr.message); setGenerating(false); return; }

    // Assign selected crew to each clip
    if (createdClips && selectedCrew.length > 0) {
      const assignmentInserts: Database["public"]["Tables"]["content_assignments"]["Insert"][] = [];
      for (const clip of createdClips) {
        for (const crewId of selectedCrew) {
          const crewMember = members.find((m) => m.id === crewId);
          if (!crewMember) continue;
          assignmentInserts.push({
            clip_id: clip.id,
            member_id: crewId,
            member_name: crewMember.name,
            role: "On-Camera",
            task_type: "Drop a Clip",
            drop_by_date: plan[0]?.deadlines.clip_due_date ?? null,
            is_required: true,
            created_by: currentMemberId,
          });
        }
      }
      if (assignmentInserts.length > 0) {
        await supabase.from("content_assignments").insert(assignmentInserts);
        // Notify assigned crew
        await Promise.all(selectedCrew.map((id) =>
          notifyMember(supabase, id, "assignment", `You're on this week's ${vibeLabel} Heat — Drop-by ${new Date(plan[0].deadlines.clip_due_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`, "/portal/drop")
        ));
      }
    }

    await onRefresh();
    setGenerating(false);
    setShowBuilder(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-smoked-charcoal/70">
          Weekly Heat is the big focus for the week. Build it in one tap, edit what you need.
        </p>
        {canPlanContent && (
          <div className="flex gap-2">
            <button onClick={() => { setShowBuilder(!showBuilder); setShowForm(false); }} className="btn btn-primary btn-sm">
              {showBuilder ? "Cancel" : "🔥 Build the Heat"}
            </button>
            <button onClick={() => { setShowForm(!showForm); setShowBuilder(false); }} className="btn btn-secondary btn-sm">
              {showForm ? "Cancel" : "+ Manual"}
            </button>
          </div>
        )}
      </div>

      {/* ===== HEAT BUILDER — one-tap planning ===== */}
      {showBuilder && canPlanContent && (
        <div className="card p-5 space-y-5">
          <h2 className="font-display text-2xl text-desert-night">Build the Heat</h2>

          {/* Week start date — auto-suggested, user can change */}
          <div>
            <p className="label">Week starts <span className="font-normal text-desert-night/40">(auto-set to next Sunday — change if needed)</span></p>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="field !w-auto"
            />
          </div>

          {/* Post count */}
          <div>
            <p className="label">How many posts this week?</p>
            <div className="flex gap-2">
              {POST_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setPostCount(n)}
                  className={`w-12 h-12 rounded-xl font-display text-xl ${postCount === n ? "bg-desert-night text-sunburst-yellow" : "bg-sandstone-cream/50 text-desert-night"}`}
                >{n}</button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <p className="label">What vibe?</p>
            <div className="flex flex-wrap gap-2">
              {HEAT_VIBES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVibe(v.id)}
                  className={`chip ${vibe === v.id ? "chip-copper" : "chip-cream"}`}
                  title={v.desc}
                >{v.label}</button>
              ))}
            </div>
          </div>

          {/* Effort */}
          <div>
            <p className="label">Effort level</p>
            <div className="flex flex-wrap gap-2">
              {EFFORT_LEVELS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEffort(e.id)}
                  className={`chip ${effort === e.id ? "chip-copper" : "chip-cream"}`}
                  title={e.desc}
                >{e.label}</button>
              ))}
            </div>
          </div>

          {/* Quick Drop Template — optional, organized by bucket */}
          <div>
            <p className="label">Format <span className="font-normal text-desert-night/40">(optional — adds instructions for crew)</span></p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => setSelectedTemplate("")}
                className={`chip ${!selectedTemplate ? "chip-copper" : "chip-cream"}`}
              >No template</button>
            </div>
            <div className="space-y-2">
              {CONTENT_BUCKETS.map((bucket) => {
                const templates = getTemplatesByBucket(bucket);
                if (templates.length === 0) return null;
                return (
                  <div key={bucket}>
                    <p className="text-xs font-bold text-desert-night/40 uppercase mb-1">{bucket}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {templates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplate(t.id)}
                          className={`chip !text-xs ${selectedTemplate === t.id ? "chip-copper" : "chip-cream"}`}
                          title={t.description}
                        >{t.name}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available crew */}
          {members.length > 0 && (
            <div>
              <p className="label">Who&apos;s available?</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedCrew(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                    className={`chip ${selectedCrew.includes(m.id) ? "chip-copper" : "chip-cream"}`}
                  >{m.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={generateAndCreateWeek}
            disabled={generating}
            className="btn btn-primary btn-lg w-full"
          >
            {generating ? "Building…" : "Generate Week"}
          </button>

          {/* Preview of what will be created */}
          {generatedPlan && (
            <div className="bg-sandstone-cream/50 rounded-xl p-4 space-y-2">
              <p className="font-bold text-desert-night text-sm">Here&apos;s what we&apos;re building:</p>
              {generatedPlan.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-bold text-desert-night">{item.title}</span>
                  <span className="text-cactus-teal font-bold">{item.dayLabel}</span>
                </div>
              ))}
              <p className="text-xs text-smoked-charcoal/60 mt-2">
                Deadlines auto-set: Drop-by 3 days before, Cut ready 2 days before, Greenlight 1 day before.
              </p>
            </div>
          )}
        </div>
      )}

      {showForm && canPlanContent && (
        <div className="card p-5 space-y-3">
          <input className="field" placeholder="Theme name" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea className="field min-h-[60px]" placeholder="What's the vibe?" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-3">
            <div>
              <label className="label">Start date</label>
              <input type="date" className="field !w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">End date</label>
              <input type="date" className="field !w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <button onClick={createTheme} className="btn btn-primary" disabled={saving || !name.trim()}>
            {saving ? "Creating…" : "Create Weekly Heat"}
          </button>
        </div>
      )}

      {themes.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="text-5xl">🔥</span>
          <p className="font-display text-2xl text-desert-night mt-4">No Weekly Heat yet.</p>
          <p className="text-smoked-charcoal/70 mt-2">
            {canPlanContent ? "Create one to start organizing your content by week." : "Ask an admin or planner to create one."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {themes.map((t) => {
            const themeClips = clips.filter((c) => c.theme_id === t.id);
            const themeTrends = trends.filter((tr) => tr.theme_id === t.id);
            return (
              <div key={t.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-2xl text-desert-night">{t.name}</h3>
                      <span className={`chip ${STATUS_CHIP[t.status] ?? "chip-cream"} !text-[10px]`}>{t.status}</span>
                    </div>
                    {t.description && <p className="text-sm text-smoked-charcoal/70 mt-1">{t.description}</p>}
                    {t.start_date && t.end_date && (
                      <p className="text-xs text-copper-deep font-bold mt-2">
                        {new Date(t.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {new Date(t.end_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  {canPlanContent && (
                    <div className="flex flex-col gap-1 shrink-0">
                      {["Planning", "Active", "Wrapped"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateThemeStatus(t.id, s)}
                          className={`chip !text-[9px] ${t.status === s ? STATUS_CHIP[s] : "chip-cream opacity-50 hover:opacity-100"}`}
                        >{s}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="chip chip-copper !text-[10px]">{themeClips.length} clips</span>
                  <span className="chip chip-teal !text-[10px]">{themeTrends.length} trend drops</span>
                </div>

                {/* Clips in this theme */}
                {themeClips.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {themeClips.map((c) => (
                      <div key={c.id} className="bg-sandstone-cream/50 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-desert-night truncate">{c.title}</p>
                          <span className={`chip ${STATUS_CHIP[c.status] ?? "chip-cream"} !text-[9px]`}>{c.status}</span>
                        </div>
                        {c.scheduled_date && (
                          <span className="text-xs text-cactus-teal font-bold shrink-0">
                            📅 {new Date(c.scheduled_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {canPlanContent && (
                  <button onClick={() => deleteTheme(t.id)} className="btn btn-danger btn-sm mt-4">Delete</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// ASSIGNMENT BOARD — admin/planner view of who's doing what
// ===========================================================================
function AssignmentBoardTab({
  clips, assignments, members, themes, themeMap, canPlanContent, currentMemberId, currentMemberName, onSelectClip, onRefresh,
}: {
  clips: ClipMeta[];
  assignments: Assignment[];
  members: Member[];
  themes: Theme[];
  themeMap: Map<string, Theme>;
  canPlanContent: boolean;
  currentMemberId?: string;
  currentMemberName?: string;
  onSelectClip: (id: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({
    member_id: "",
    role: "On-Camera",
    task_type: "Drop a Clip",
    task_title: "",
    task_notes: "",
    drop_by_date: "",
    is_required: true,
  });
  const [saving, setSaving] = useState(false);

  const clipsWithAssignments = clips.filter((c) => c.type === "video" || c.type === "final_cut");
  const assignmentsByClip = new Map<string, Assignment[]>();
  assignments.forEach((a) => {
    const arr = assignmentsByClip.get(a.clip_id) ?? [];
    arr.push(a);
    assignmentsByClip.set(a.clip_id, arr);
  });

  async function createAssignment(clipId: string) {
    if (!assignForm.member_id || !currentMemberId) return;
    const m = members.find((mem) => mem.id === assignForm.member_id);
    if (!m) return;
    setSaving(true);
    const { error } = await supabase.from("content_assignments").insert({
      clip_id: clipId,
      member_id: assignForm.member_id,
      member_name: m.name,
      role: assignForm.role,
      task_type: assignForm.task_type,
      task_title: assignForm.task_title || null,
      task_notes: assignForm.task_notes || null,
      drop_by_date: assignForm.drop_by_date || null,
      is_required: assignForm.is_required,
      created_by: currentMemberId,
    });
    if (error) {
      if (error.code === "23505") {
        alert("This person already has this task type on this clip.");
      } else {
        alert(error.message);
      }
    } else {
      // Notify the assigned person
      const clip = clips.find((c) => c.id === clipId);
      const notifBody = `You're on "${clip?.title ?? "a clip"}" — ${assignForm.role}`;
      await notifyMember(supabase, assignForm.member_id, "assignment", notifBody, "/portal/run-sheet");
    }
    setAssignForm({ member_id: "", role: "On-Camera", task_type: "Drop a Clip", task_title: "", task_notes: "", drop_by_date: "", is_required: true });
    setShowAssign(null);
    await onRefresh();
    setSaving(false);
  }

  async function updateAssignmentStatus(id: string, status: string) {
    const completed_at = status === "Done" || status === "Greenlit" || status === "Dropped" ? new Date().toISOString() : null;
    const { error } = await supabase.from("content_assignments").update({ status, completed_at }).eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Remove this assignment?")) return;
    const { error } = await supabase.from("content_assignments").delete().eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  const now = new Date();
  const isLate = (a: Assignment) => a.drop_by_date && new Date(a.drop_by_date) < now &&
    a.status !== "Done" && a.status !== "Greenlit" && a.status !== "Dropped" && a.status !== "Skipped";

  return (
    <div className="space-y-4">
      <p className="text-smoked-charcoal/70">
        Who&apos;s on what. Assign roles and tasks to crew members for each content item.
      </p>

      {clipsWithAssignments.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="text-5xl">📋</span>
          <p className="font-display text-2xl text-desert-night mt-4">No content items yet.</p>
          <p className="text-smoked-charcoal/70 mt-2">Drop a video first, then assign people to it.</p>
          <Link href="/portal/drop" className="btn btn-primary mt-6">Drop a Clip</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {clipsWithAssignments.map((clip) => {
            const clipAssignments = assignmentsByClip.get(clip.id) ?? [];
            const lead = clipAssignments.find((a) => a.role === "Lead");
            const lateCount = clipAssignments.filter(isLate).length;
            const doneCount = clipAssignments.filter((a) => a.status === "Done" || a.status === "Greenlit" || a.status === "Dropped").length;
            const theme = clip.theme_id ? themeMap.get(clip.theme_id) : null;

            return (
              <div key={clip.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <button onClick={() => onSelectClip(clip.id)} className="text-left">
                      <h3 className="font-display text-xl text-desert-night hover:text-copper-deep transition-colors">{clip.title}</h3>
                    </button>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`chip ${STATUS_CHIP[clip.status]} !text-[10px]`}>{clip.status}</span>
                      {theme && <span className="chip chip-copper !text-[10px]">🔥 {theme.name}</span>}
                      {lead && <span className="chip chip-yellow !text-[10px]">Lead: {lead.member_name}</span>}
                      {clipAssignments.length > 0 && (
                        <span className="chip chip-cream !text-[10px]">{doneCount}/{clipAssignments.length} done</span>
                      )}
                      {lateCount > 0 && <span className="chip chip-danger !text-[10px]">{lateCount} late</span>}
                    </div>
                  </div>
                  {canPlanContent && (
                    <button
                      onClick={() => {
                        setShowAssign(showAssign === clip.id ? null : clip.id);
                        setAssignForm({ member_id: "", role: "On-Camera", task_type: "Drop a Clip", task_title: "", task_notes: "", drop_by_date: "", is_required: true });
                      }}
                      className="btn btn-primary btn-sm shrink-0"
                    >
                      {showAssign === clip.id ? "Cancel" : "+ Assign"}
                    </button>
                  )}
                </div>

                {showAssign === clip.id && canPlanContent && (
                  <div className="mt-4 bg-sandstone-cream/50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select className="field" value={assignForm.member_id} onChange={(e) => setAssignForm({ ...assignForm, member_id: e.target.value })}>
                        <option value="">Pick someone…</option>
                        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <select className="field" value={assignForm.role} onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}>
                        {ASSIGNMENT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select className="field" value={assignForm.task_type} onChange={(e) => setAssignForm({ ...assignForm, task_type: e.target.value })}>
                        {ASSIGNMENT_TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="date" className="field" value={assignForm.drop_by_date} onChange={(e) => setAssignForm({ ...assignForm, drop_by_date: e.target.value })} title="Drop-by date" />
                    </div>
                    <input className="field" placeholder="Task title" value={assignForm.task_title} onChange={(e) => setAssignForm({ ...assignForm, task_title: e.target.value })} />
                    <textarea className="field min-h-[50px]" placeholder="What do they need to do?" value={assignForm.task_notes} onChange={(e) => setAssignForm({ ...assignForm, task_notes: e.target.value })} />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-desert-night">
                        <input type="checkbox" checked={assignForm.is_required} onChange={(e) => setAssignForm({ ...assignForm, is_required: e.target.checked })} />
                        Required
                      </label>
                      <button onClick={() => createAssignment(clip.id)} className="btn btn-primary btn-sm ml-auto" disabled={saving || !assignForm.member_id}>
                        {saving ? "Assigning…" : "Assign"}
                      </button>
                    </div>
                  </div>
                )}

                {clipAssignments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {clipAssignments.map((a) => {
                      const late = isLate(a);
                      return (
                        <div key={a.id} className={`bg-sandstone-cream/50 rounded-xl p-3 ${late ? "border-l-4 border-heat-orange" : ""}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-desert-night">{a.member_name}</span>
                                <span className="chip chip-dark !text-[9px]">{a.role}</span>
                                <span className="chip chip-cream !text-[9px]">{a.task_type}</span>
                                {!a.is_required && <span className="chip chip-cream !text-[9px]">Optional</span>}
                              </div>
                              {a.task_title && <p className="text-sm text-desert-night mt-1">{a.task_title}</p>}
                              {a.task_notes && <p className="text-xs text-smoked-charcoal/60 mt-1">{a.task_notes}</p>}
                              {a.drop_by_date && (
                                <p className={`text-xs font-bold mt-1 ${late ? "text-heat-orange" : "text-copper-deep"}`}>
                                  {late ? "⚠ Late — " : ""}Drop-by: {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`chip ${ASSIGNMENT_STATUS_CHIP[a.status] ?? "chip-cream"} !text-[9px]`}>{assignmentStatusLabel(a.status)}</span>
                              {canPlanContent && (
                                <select
                                  className="field !py-1 !text-xs !w-auto"
                                  value={a.status}
                                  onChange={(e) => updateAssignmentStatus(a.id, e.target.value)}
                                >
                                  {["Not Started", "In Progress", "Dropped", "Waiting on Vanessa", "Needs Tweak", "Greenlit", "Done", "Skipped", "Hold"].map((s) => (
                                    <option key={s} value={s}>{assignmentStatusLabel(s)}</option>
                                  ))}
                                </select>
                              )}
                              {canPlanContent && (
                                <button onClick={() => deleteAssignment(a.id)} className="text-xs text-heat-orange hover:underline">Remove</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {clipAssignments.length === 0 && !showAssign && (
                  <p className="text-sm text-smoked-charcoal/50 mt-3 italic">
                    {canPlanContent ? "No one assigned yet. Click + Assign to add people." : "No one assigned yet."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// WATCH — posted/live videos the crew can watch
// ===========================================================================
function WatchTab({
  clips, themeMap, onSelectClip,
}: {
  clips: ClipMeta[];
  themeMap: Map<string, Theme>;
  onSelectClip: (id: string) => void;
}) {
  const liveClips = clips
    .filter((c) => c.status === "Live")
    .sort((a, b) => new Date(b.scheduled_date ?? b.updated_at).getTime() - new Date(a.scheduled_date ?? a.updated_at).getTime());
  const [filter, setFilter] = useState<"all" | "tiktok" | "instagram" | "youtube" | "facebook">("all");

  const filtered = filter === "all"
    ? liveClips
    : liveClips.filter((c) => (c.destination ?? "").toLowerCase() === filter);

  const PLATFORM_LABEL: Record<string, string> = {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  };

  // Get a friendly embeddable/share URL — for TikTok/Instagram we link out, for YouTube we can embed
  function getWatchUrl(clip: ClipMeta): string | null {
    return clip.link ?? null;
  }

  function isYouTube(url: string): boolean {
    return /youtube\.com|youtu\.be/i.test(url);
  }

  function getYouTubeEmbedLocal(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  }

  if (liveClips.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="inline-block"><MascotImage pose="shades" size={120} /></div>
        <p className="font-display text-2xl text-desert-night mt-4">No clips posted yet.</p>
        <p className="text-smoked-charcoal/70 mt-2">
          When a clip goes Live, it&apos;ll show up here for the crew to watch.
        </p>
        <Link href="/portal/run-sheet" className="btn btn-secondary mt-6">Back to Run Sheet</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-smoked-charcoal/70">
        Clips that have gone live. Click to watch, or open the original post.
      </p>

      {/* Platform filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`chip !text-xs ${filter === "all" ? "chip-dark" : "chip-cream opacity-60 hover:opacity-100"}`}
        >All ({liveClips.length})</button>
        {(["tiktok", "instagram", "youtube", "facebook"] as const).map((p) => {
          const count = liveClips.filter((c) => (c.destination ?? "").toLowerCase() === p).length;
          if (count === 0) return null;
          return (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`chip !text-xs ${filter === p ? "chip-dark" : "chip-cream opacity-60 hover:opacity-100"}`}
            >{PLATFORM_LABEL[p]} ({count})</button>
          );
        })}
      </div>

      {/* Clips grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((clip) => {
          const watchUrl = getWatchUrl(clip);
          const ytEmbed = watchUrl && isYouTube(watchUrl) ? getYouTubeEmbedLocal(watchUrl) : null;
          const hasUploadedVideo = !!clip.file_path && (clip.type === "video" || clip.type === "final_cut");
          const theme = clip.theme_id ? themeMap.get(clip.theme_id) : null;
          return (
            <div key={clip.id} className="card overflow-hidden flex flex-col">
              {/* Video / thumbnail area */}
              <div className="bg-desert-night/10 relative">
                {hasUploadedVideo ? (
                  <VideoPlayer filePath={clip.file_path!} title={clip.title} className="aspect-[9/16]" />
                ) : ytEmbed ? (
                  <div className="aspect-[9/16]">
                    <iframe
                      src={ytEmbed}
                      title={clip.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : watchUrl ? (
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="aspect-[9/16] flex items-center justify-center group block">
                    <div className="w-16 h-16 rounded-full bg-desert-night/60 group-hover:bg-heat-orange/80 flex items-center justify-center backdrop-blur transition-colors">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#F5E6D3">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                ) : (
                  <div className="aspect-[9/16] flex items-center justify-center">
                    <MascotImage pose="shades" size={80} />
                  </div>
                )}
                {/* Platform badge */}
                {clip.destination && (
                  <span className="absolute top-3 left-3 chip chip-dark !text-[10px] z-10">
                    {PLATFORM_LABEL[(clip.destination ?? "").toLowerCase()] ?? clip.destination}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                <button onClick={() => onSelectClip(clip.id)} className="text-left">
                  <h3 className="font-bold text-desert-night leading-tight hover:text-copper-deep transition-colors">{clip.title}</h3>
                </button>
                <p className="text-xs text-smoked-charcoal/60 mt-1">by {clip.submitted_by_name}</p>

                {theme && (
                  <span className="chip chip-copper !text-[9px] mt-2 w-fit">🔥 {theme.name}</span>
                )}

                {clip.scheduled_date && (
                  <p className="text-xs text-cactus-teal font-bold mt-2">
                    📅 {new Date(clip.scheduled_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}

                {watchUrl && !ytEmbed && !hasUploadedVideo && (
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-3 w-full">
                    Watch on {PLATFORM_LABEL[(clip.destination ?? "").toLowerCase()] ?? "platform"} →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && liveClips.length > 0 && (
        <div className="card p-6 text-center">
          <p className="text-smoked-charcoal/70">No clips on {PLATFORM_LABEL[filter]} yet.</p>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// READY BANK TAB — vetted ideas/templates ready to schedule (inline in Run Sheet)
// ===========================================================================
function ReadyBankTab({ member, members, onRefresh }: {
  member?: { id: string; name: string; role: string; can_plan_content: boolean };
  members: Member[];
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const [effortFilter, setEffortFilter] = useState<string | null>(null);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [actionTemplate, setActionTemplate] = useState<QuickDropTemplate | null>(null);
  const [liveDate, setLiveDate] = useState<string>(() => nextSunday().toISOString().slice(0, 10));
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const TAG_FILTERS = [
    { id: "homeFriendly", label: "Home-Friendly" },
    { id: "noTalking", label: "No Talking" },
    { id: "transition", label: "Transition" },
    { id: "arizona", label: "Arizona" },
    { id: "groupDay", label: "Group Day" },
    { id: "editHeavy", label: "Edit Heavy" },
  ];

  const filtered = QUICK_DROP_TEMPLATES.filter((t) => {
    if (effortFilter && t.effort !== effortFilter) return false;
    if (tagFilters.includes("homeFriendly") && !t.homeFriendly) return false;
    if (tagFilters.includes("noTalking") && t.needsTalking) return false;
    if (tagFilters.includes("transition") && t.bucket !== "Transitions") return false;
    if (tagFilters.includes("arizona") && !t.bucket.includes("Arizona")) return false;
    if (tagFilters.includes("groupDay") && t.effort !== "Group Day") return false;
    if (tagFilters.includes("editHeavy") && !t.needsEditing) return false;
    return true;
  });

  async function createClip(template: QuickDropTemplate) {
    if (!member || !liveDate) return;
    setCreating(true);
    const deadlines = calcDeadlinesFromLive(new Date(liveDate + "T12:00:00"));
    const { data: clip, error } = await supabase.from("clips").insert({
      title: template.name,
      type: "video",
      status: "Planned",
      category: template.bucket,
      submitted_by: member.id,
      submitted_by_name: member.name,
      template_id: template.id,
      destination: template.platforms[0] ?? null,
      idea_due_date: deadlines.idea_due_date,
      clip_due_date: deadlines.clip_due_date,
      final_cut_due: deadlines.final_cut_due,
      approval_due: deadlines.approval_due,
      scheduled_date: deadlines.scheduled_date,
    }).select().single();
    if (error) { alert(error.message); setCreating(false); return; }
    if (selectedCrew.length > 0 && clip) {
      await supabase.from("content_assignments").insert(
        selectedCrew.map((crewId) => {
          const cm = members.find((m) => m.id === crewId);
          return {
            clip_id: clip.id, member_id: crewId, member_name: cm?.name ?? "",
            role: "On-Camera", task_type: "Drop a Clip",
            drop_by_date: deadlines.clip_due_date, is_required: true, created_by: member.id,
          };
        })
      );
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${template.name}"`, "/portal/drop")
      ));
    }
    await onRefresh();
    setCreating(false);
    setActionTemplate(null);
    setSelectedCrew([]);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-desert-night">Ready Bank</h2>
        <p className="text-sm text-smoked-charcoal/60 mt-1">Pull a format into the calendar instead of building from scratch.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setEffortFilter(null)} className={`chip !text-xs ${!effortFilter ? "chip-copper" : "chip-cream"}`}>All efforts</button>
        {(["2-Min Drop", "5-Min Drop", "10-Min Drop", "Group Day", "Edit Heavy"] as EffortLabel[]).map((e) => (
          <button key={e} onClick={() => setEffortFilter(e === effortFilter ? null : e)} className={`chip !text-xs ${effortFilter === e ? "chip-copper" : "chip-cream"}`}>{e}</button>
        ))}
        <span className="w-px bg-desert-night/10 mx-1" />
        {TAG_FILTERS.map((f) => (
          <button key={f.id} onClick={() => setTagFilters(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])} className={`chip !text-xs ${tagFilters.includes(f.id) ? "chip-copper" : "chip-cream"}`}>{f.label}</button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <div key={t.id} className="card p-4 space-y-2">
            <div>
              <p className="font-display text-base text-desert-night">{t.name}</p>
              <p className="text-xs text-smoked-charcoal/50">{t.bucket}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="chip chip-cream !text-[9px]">{t.effort}</span>
              {t.homeFriendly && <span className="chip chip-cream !text-[9px]">🏠</span>}
              {!t.needsTalking && <span className="chip chip-cream !text-[9px]">🤫</span>}
              {t.adminStitches && <span className="chip chip-cream !text-[9px]">🔗</span>}
            </div>
            <p className="text-xs text-smoked-charcoal/70 line-clamp-2">{t.description}</p>
            <div className="bg-cactus-teal/10 rounded p-1.5">
              <p className="text-[10px] font-bold text-desert-night/50 uppercase">SEO</p>
              <p className="text-xs text-desert-night font-bold">&ldquo;{t.seoPhrase}&rdquo;</p>
            </div>
            <button
              onClick={() => { setActionTemplate(t); setLiveDate(nextSunday().toISOString().slice(0, 10)); setSelectedCrew([]); }}
              className="btn btn-primary btn-sm !text-xs w-full"
            >Add to Calendar</button>
          </div>
        ))}
      </div>

      {/* Action modal */}
      {actionTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setActionTemplate(null)}>
          <div className="bg-sandstone-cream rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-desert-night">{actionTemplate.name}</h3>
              <button onClick={() => setActionTemplate(null)} className="text-desert-night/40 text-2xl">×</button>
            </div>
            <div>
              <p className="label">Goes live <span className="font-normal text-desert-night/40">(auto-set to next Sunday)</span></p>
              <input type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} className="field !w-auto" />
            </div>
            <div>
              <p className="label">Assign crew <span className="font-normal text-desert-night/40">(optional)</span></p>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <button key={m.id} onClick={() => setSelectedCrew(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])} className={`chip !text-xs ${selectedCrew.includes(m.id) ? "chip-copper" : "chip-cream"}`}>{m.name}</button>
                ))}
              </div>
            </div>
            <button onClick={() => createClip(actionTemplate)} disabled={creating} className="btn btn-primary btn-lg w-full">
              {creating ? "Creating…" : `Add to calendar`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// PLANNER DASHBOARD — What's Stuck, Ready for Vanessa, Needs Planning
// ===========================================================================
function PlannerDashboard({
  clips, assignments, approvals, people, themes, trends, members, isAdmin, onSelectClip, onRefresh,
}: {
  clips: ClipMeta[];
  assignments: Assignment[];
  approvals: Record<string, Approval[]>;
  people: Record<string, ClipPerson[]>;
  themes: Theme[];
  trends: TrendRef[];
  members: Member[];
  isAdmin: boolean;
  onSelectClip: (id: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const now = new Date();

  // Active theme
  const activeTheme = themes.find((t) => t.status === "Active" || t.status === "Planning");

  // Needs planning: trend drops that are New or Watching
  const needsPlanningTrends = trends.filter((t) => t.status === "New" || t.status === "Watching");

  // Clips in planning stages (Planned, Dropped, Cutting)
  const planningClips = clips.filter((c) => c.status === "Planned" || c.status === "Dropped" || c.status === "Cutting");

  // What's stuck: clips with past drop-by dates but no video submitted
  const stuckClips = planningClips.filter((c) => {
    if (!c.clip_due_date) return false;
    return new Date(c.clip_due_date) < now;
  });

  // Waiting on: assignments not yet dropped
  const waitingOn = assignments.filter((a) => a.status !== "Done" && a.status !== "Greenlit" && a.status !== "Dropped");
  const overdueAssignments = waitingOn.filter((a) => a.drop_by_date && new Date(a.drop_by_date) < now);

  // Ready for Vanessa: clips in Review status (need greenlight)
  const readyForVanessa = clips.filter((c) => c.status === "Review");

  // Clips with all approvals approved but not yet scheduled
  const approvedNotScheduled = clips.filter((c) => {
    if (c.status !== "Review") return false;
    const clipApprovals = approvals[c.id] ?? [];
    if (clipApprovals.length === 0) return false;
    return clipApprovals.every((a) => a.status === "Approved" || a.status === "Approved With Edits");
  });

  // Missing assignments: clips with no one assigned
  const clipsWithoutAssignments = planningClips.filter((c) => !assignments.some((a) => a.clip_id === c.id));

  async function sendReminder(assignment: Assignment) {
    const clip = clips.find((c) => c.id === assignment.clip_id);
    const member = members.find((m) => m.id === assignment.member_id);
    if (!clip || !member) return;
    await notifyMember(
      supabase,
      member.id,
      "reminder",
      `Reminder: "${clip.title}" is waiting on you. Drop-by ${assignment.drop_by_date ? new Date(assignment.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "soon"}.`,
      "/portal/drop",
    );
    alert(`Reminder sent to ${member.name}`);
  }

  async function moveToStatus(clipId: string, status: ClipStatus) {
    const { error } = await supabase.from("clips").update({ status }).eq("id", clipId);
    if (error) { alert(error.message); return; }
    await onRefresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl text-desert-night">Planner View</h2>
        <p className="text-smoked-charcoal/70 mt-1">
          {isAdmin ? "You have full admin access." : "You can plan and organize. Vanessa has final say."}
        </p>
      </div>

      {/* Active theme */}
      {activeTheme && (
        <div className="card-dark p-5">
          <p className="text-sunburst-yellow text-sm font-black uppercase">This Week&apos;s Heat</p>
          <p className="font-display text-2xl text-sandstone-cream mt-1">{activeTheme.name}</p>
          {activeTheme.description && <p className="text-sandstone-cream/60 text-sm mt-1">{activeTheme.description}</p>}
        </div>
      )}

      {/* Summary counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="font-display text-3xl text-desert-night">{needsPlanningTrends.length}</p>
          <p className="text-xs text-smoked-charcoal/60 mt-1">Trends to plan</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-3xl text-desert-night">{stuckClips.length}</p>
          <p className="text-xs text-smoked-charcoal/60 mt-1">Stuck / late</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-3xl text-desert-night">{waitingOn.length}</p>
          <p className="text-xs text-smoked-charcoal/60 mt-1">Waiting on crew</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-3xl text-desert-night">{readyForVanessa.length}</p>
          <p className="text-xs text-smoked-charcoal/60 mt-1">Ready for Review</p>
        </div>
      </div>

      {/* What's Stuck — overdue clips */}
      {stuckClips.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">⚠ What&apos;s Stuck</h3>
          <div className="space-y-2">
            {stuckClips.map((clip) => (
              <button
                key={clip.id}
                onClick={() => onSelectClip(clip.id)}
                className="card p-4 w-full text-left hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night truncate">{clip.title}</p>
                    <p className="text-xs text-heat-orange font-bold mt-0.5">
                      Drop-by was {new Date(clip.clip_due_date!).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="chip chip-danger !text-[9px] shrink-0">{clip.status}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Waiting on crew — assignments not yet dropped */}
      {waitingOn.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">Waiting on crew</h3>
          <div className="space-y-2">
            {overdueAssignments.length > 0 && (
              <p className="text-sm text-heat-orange font-bold mb-2">
                {overdueAssignments.length} overdue — send reminders:
              </p>
            )}
            {waitingOn.slice(0, 10).map((a) => {
              const clip = clips.find((c) => c.id === a.clip_id);
              const isOverdue = a.drop_by_date && new Date(a.drop_by_date) < now;
              return (
                <div key={a.id} className="card p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night text-sm truncate">{clip?.title ?? "Content item"}</p>
                    <p className="text-xs text-smoked-charcoal/60">
                      {a.member_name} · {a.role}
                      {a.drop_by_date && (
                        <span className={isOverdue ? "text-heat-orange font-bold" : ""}>
                          {" · "}Drop-by {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => sendReminder(a)}
                    className="btn btn-secondary btn-sm !text-xs shrink-0"
                  >
                    Remind
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Ready for Review — clips in Review status (need greenlight) */}
      {readyForVanessa.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">Ready for Review</h3>
          <div className="space-y-2">
            {readyForVanessa.map((clip) => {
              const clipApprovals = approvals[clip.id] ?? [];
              const approved = clipApprovals.filter((a) => a.status === "Approved" || a.status === "Approved With Edits").length;
              const total = clipApprovals.length;
              const allApproved = total > 0 && approved === total;
              return (
                <div key={clip.id} className="card p-4 flex items-center justify-between gap-3">
                  <button onClick={() => onSelectClip(clip.id)} className="text-left min-w-0 flex-1">
                    <p className="font-bold text-desert-night truncate">{clip.title}</p>
                    <p className="text-xs text-smoked-charcoal/60 mt-0.5">
                      {allApproved ? "✅ All greenlit" : `${approved}/${total} greenlit`}
                    </p>
                  </button>
                  {allApproved && (
                    <button
                      onClick={() => moveToStatus(clip.id, "Scheduled")}
                      className="btn btn-primary btn-sm !text-xs shrink-0"
                    >
                      Schedule
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Needs planning — trends + clips without assignments */}
      {(needsPlanningTrends.length > 0 || clipsWithoutAssignments.length > 0) && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">Needs planning</h3>
          <div className="space-y-2">
            {needsPlanningTrends.length > 0 && (
              <div className="card p-3 bg-sandstone-cream/50">
                <p className="text-sm font-bold text-desert-night mb-2">
                  {needsPlanningTrends.length} trend {needsPlanningTrends.length === 1 ? "drop" : "drops"} to review
                </p>
                <button
                  onClick={() => onSelectClip(needsPlanningTrends[0].id)}
                  className="btn btn-secondary btn-sm !text-xs"
                >
                  Go to Trend Drops →
                </button>
              </div>
            )}
            {clipsWithoutAssignments.length > 0 && (
              <div className="card p-3 bg-sandstone-cream/50">
                <p className="text-sm font-bold text-desert-night mb-2">
                  {clipsWithoutAssignments.length} {clipsWithoutAssignments.length === 1 ? "clip" : "clips"} with no one assigned
                </p>
                <div className="space-y-1">
                  {clipsWithoutAssignments.slice(0, 5).map((clip) => (
                    <button
                      key={clip.id}
                      onClick={() => onSelectClip(clip.id)}
                      className="text-sm text-copper-deep hover:underline block"
                    >
                      {clip.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Nothing to plan */}
      {stuckClips.length === 0 && waitingOn.length === 0 && readyForVanessa.length === 0 && needsPlanningTrends.length === 0 && clipsWithoutAssignments.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">Everything&apos;s moving.</p>
          <p className="text-smoked-charcoal/70 mt-2">Nothing stuck. Nothing waiting. You&apos;re all caught up.</p>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// TEMPLATE PICKER — quick create a clip from a Quick Drop Template
// ===========================================================================
function TemplatePicker({
  member,
  members,
  onCreated,
}: {
  member?: Member;
  members: Member[];
  onCreated: () => Promise<void>;
}) {
  const supabase = createClient();
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  // Goes-live date — auto-suggested to next Sunday, but user can change it
  const [liveDate, setLiveDate] = useState<string>(() => {
    const sun = nextSunday();
    return sun.toISOString().slice(0, 10); // YYYY-MM-DD for date input
  });

  const template = selectedId ? getTemplate(selectedId) : null;

  async function create() {
    if (!template || !member || !liveDate) return;
    setCreating(true);

    const deadlines = calcDeadlinesFromLive(new Date(liveDate + "T12:00:00"));

    const { data: clip, error } = await supabase.from("clips").insert({
      title: template.name,
      type: "video",
      status: "Planned",
      category: template.bucket,
      submitted_by: member.id,
      submitted_by_name: member.name,
      template_id: template.id,
      destination: template.platforms[0] ?? null,
      idea_due_date: deadlines.idea_due_date,
      clip_due_date: deadlines.clip_due_date,
      final_cut_due: deadlines.final_cut_due,
      approval_due: deadlines.approval_due,
      scheduled_date: deadlines.scheduled_date,
    }).select().single();

    if (error || !clip) {
      alert(error?.message ?? "Could not create clip");
      setCreating(false);
      return;
    }

    // Assign selected crew
    if (selectedCrew.length > 0) {
      const assignmentInserts = selectedCrew.map((crewId) => {
        const crewMember = members.find((m) => m.id === crewId);
        return {
          clip_id: clip.id,
          member_id: crewId,
          member_name: crewMember?.name ?? "",
          role: "On-Camera",
          task_type: "Drop a Clip",
          drop_by_date: deadlines.clip_due_date,
          is_required: true,
          created_by: member.id,
        };
      });
      await supabase.from("content_assignments").insert(assignmentInserts);
      // Notify crew
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${template.name}" — Drop-by ${new Date(deadlines.clip_due_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`, "/portal/drop")
      ));
    }

    await onCreated();
    setCreating(false);
  }

  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-display text-2xl text-desert-night">Create from Template</h2>

      {/* Template selection — organized by bucket */}
      <div>
        <p className="label">Pick a format</p>
        <div className="space-y-3 mt-2">
          {CONTENT_BUCKETS.map((bucket) => {
            const templates = getTemplatesByBucket(bucket);
            if (templates.length === 0) return null;
            return (
              <div key={bucket}>
                <p className="text-xs font-bold text-desert-night/40 uppercase mb-1.5">{bucket}</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`chip ${selectedId === t.id ? "chip-copper" : "chip-cream"}`}
                      title={t.description}
                    >{t.name}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template preview */}
      {template && (
        <div className="bg-sandstone-cream/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg text-desert-night">{template.name}</p>
            <span className="chip chip-cream !text-[9px]">{template.effort}</span>
          </div>
          <p className="text-sm text-smoked-charcoal/70">{template.description}</p>
          <p className="text-xs text-smoked-charcoal/50">⏱ {template.timeEstimate} · 🏠 {template.homeFriendly ? "Home-friendly" : "Needs setup"} · ✂️ {template.adminStitches ? "Admin stitches" : "No stitching"}</p>
          {template.maxSeconds && <p className="text-xs text-smoked-charcoal/50">Max {template.maxSeconds}s per person</p>}
          <div className="bg-white/50 rounded-lg p-3 mt-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Idea</p>
            <p className="text-sm text-desert-night mt-1">{template.idea}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Vibe</p>
            <p className="text-sm text-desert-night mt-1">{template.vibe}</p>
          </div>
          {template.transitions && template.transitions.length > 0 && (
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Transition ideas</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.transitions.map((tr) => <span key={tr} className="chip chip-cream !text-[10px]">{tr}</span>)}
              </div>
            </div>
          )}
          {template.examples && (
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Examples (not scripts)</p>
              <ul className="text-sm text-desert-night mt-1 space-y-1">
                {template.examples.map((line, i) => <li key={i} className="font-script text-base">&ldquo;{line}&rdquo;</li>)}
              </ul>
              <p className="text-xs text-smoked-charcoal/50 mt-2">Use these or make it their own.</p>
            </div>
          )}

          {/* SEO + caption + hashtags — admin/planner only */}
          <div className="bg-cactus-teal/10 rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Search phrase</p>
              <p className="text-sm text-desert-night mt-0.5 font-bold">&ldquo;{template.seoPhrase}&rdquo;</p>
              <p className="text-xs text-smoked-charcoal/50">Use in on-screen text, caption, hashtags, and website recap.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Caption starter</p>
              <p className="text-sm text-desert-night mt-0.5">{template.captionStarter}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Hashtags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.hashtagStarter.map((tag) => (
                  <span key={tag} className="chip chip-cream !text-[9px]">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goes-live date — auto-suggested, user can change */}
      {template && (
        <div>
          <p className="label">Goes live <span className="font-normal text-desert-night/40">(auto-set to next Sunday — change if needed)</span></p>
          <input
            type="date"
            value={liveDate}
            onChange={(e) => setLiveDate(e.target.value)}
            className="field !w-auto"
          />
          {liveDate && (
            <p className="text-xs text-smoked-charcoal/50 mt-1">
              Drop-by {new Date(liveDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              {" → "}Cut {new Date(new Date(liveDate + "T12:00:00").getTime() - 2 * 86400000).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              {" → "}Greenlight {new Date(new Date(liveDate + "T12:00:00").getTime() - 1 * 86400000).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* Crew assignment */}
      {template && members.length > 0 && (
        <div>
          <p className="label">Assign crew <span className="font-normal text-desert-night/40">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedCrew(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                className={`chip ${selectedCrew.includes(m.id) ? "chip-copper" : "chip-cream"}`}
              >{m.name}</button>
            ))}
          </div>
        </div>
      )}

      {/* Create button */}
      {template && (
        <button onClick={create} disabled={creating} className="btn btn-primary btn-lg w-full">
          {creating ? "Creating…" : `Create "${template.name}"`}
        </button>
      )}

      <p className="text-xs text-desert-night/40 text-center">
        Deadlines auto-set: Drop-by 3 days before, Cut ready 2 days before, Greenlight 1 day before, Goes live Sunday.
      </p>
    </div>
  );
}
