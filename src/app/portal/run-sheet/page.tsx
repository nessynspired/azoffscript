"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyMember, notifyTaggedPeople, notifyAssignedPeople, notifyAdminsAndPlanners } from "@/lib/notify";
import { nextSunday } from "@/lib/plan-defaults";
import { QUICK_DROP_TEMPLATES, CONTENT_BUCKETS, getTemplate, getTemplatesByBucket, getExampleFor, type QuickDropTemplate, type EffortLabel } from "@/lib/quick-drop-templates";
import { MascotImage } from "@/components/MascotImage";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SocialEmbed } from "@/components/SocialEmbed";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ClipEditor } from "@/components/ClipEditor";
import { RecipeBuilder, type ClipRecipe } from "@/components/RecipeBuilder";
import { CreateFromLibraryModal } from "@/components/CreateFromLibraryModal";
import { FullReadyRecipeDetail, FullReadyRecipeCard } from "@/components/FullReadyRecipeDetail";
import { buildRecipeForInsert } from "@/lib/shot-recipe-library";
import {
  FULL_READY_RECIPES,
  fullReadyRecipeToClipRecipe,
  type FullReadyRecipe,
} from "@/lib/full-ready-recipes";
import type { Database, ClipStatus, Platform, AssignmentRole, AssignmentTaskType } from "@/lib/types/db";

type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];
type ClipPerson = Database["public"]["Tables"]["clip_people"]["Row"];
type Approval = Database["public"]["Tables"]["approvals"]["Row"];
type TrendRef = Database["public"]["Tables"]["trend_references"]["Row"];
type Assignment = Database["public"]["Tables"]["content_assignments"]["Row"];
type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name" | "nickname" | "role" | "can_plan_content" | "photo_url">;

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

// TikTok helpers — TikTok supports oembed-style embed via their embed platform
function isTikTokLink(url: string): boolean {
  return /tiktok\.com/i.test(url);
}

// Instagram helpers — Instagram posts/reels can be embedded via their embed platform
function isInstagramLink(url: string): boolean {
  return /instagram\.com/i.test(url);
}

// Facebook helpers — Facebook video posts can be embedded via their embed platform
function isFacebookLink(url: string): boolean {
  return /facebook\.com|fb\.watch|fb\.com/i.test(url);
}

/**
 * Detect the platform of a link for display purposes.
 * Returns "YouTube" | "TikTok" | "Instagram" | "Facebook" | "X" | null
 */
function linkPlatform(url: string): string | null {
  if (isYouTubeLink(url)) return "YouTube";
  if (isTikTokLink(url)) return "TikTok";
  if (isInstagramLink(url)) return "Instagram";
  if (isFacebookLink(url)) return "Facebook";
  if (/twitter\.com|x\.com/i.test(url)) return "X";
  return null;
}

// "Idea dropped by" vs "Clip dropped by" — based on what was actually submitted
function droppedByLabel(clip: { type: string; submitted_by_name: string }): string {
  const hasVideo = clip.type === "video" || clip.type === "final_cut";
  if (hasVideo) return `Clip dropped by ${clip.submitted_by_name}`;
  if (clip.type === "tiktok_link") return `Trend drop by ${clip.submitted_by_name}`;
  return `Idea dropped by ${clip.submitted_by_name}`;
}

// Clean display title for a clip — if the title is a raw URL (old link drops), show a clean label instead
function displayTitle(clip: { title: string; type: string; link?: string | null }): string {
  // If the title looks like a URL, replace it with a clean platform label
  if (clip.title && /^https?:\/\//i.test(clip.title)) {
    if (clip.link) {
      const platform = linkPlatform(clip.link);
      if (platform) return `${platform} drop`;
    }
    return "Link drop";
  }
  return clip.title;
}

export default function RunSheetPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [people, setPeople] = useState<Record<string, ClipPerson[]>>({});
  const [approvals, setApprovals] = useState<Record<string, Approval[]>>({});
  const [trends, setTrends] = useState<TrendRef[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"week" | "calendar" | "flow" | "board" | "trends" | "watch" | "planner">("week");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showCreateFromLibrary, setShowCreateFromLibrary] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [clipRes, trendRes, asgnRes, memRes] = await Promise.all([
      supabase.from("clips_with_meta").select("*").order("updated_at", { ascending: false }),
      supabase.from("trend_references").select("*").order("created_at", { ascending: false }),
      supabase.from("content_assignments").select("*").order("drop_by_date", { ascending: true }),
      supabase.from("members").select("id, name, nickname, role, can_plan_content, photo_url").order("name"),
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
      body: `${member.name} moved "${clip ? displayTitle(clip) : "a clip"}" to ${status}`,
    });
    // Notify tagged + assigned people about the status change
    const notifBody = `"${clip ? displayTitle(clip) : "A clip"}" moved to ${status}`;
    await notifyTaggedPeople(supabase, clipId, "status", notifBody, "/portal/run-sheet", member?.id);
    await notifyAssignedPeople(supabase, clipId, "status", notifBody, "/portal/run-sheet", member?.id);
    // If moved to Review, that means greenlights are needed — notify tagged people specifically
    if (status === "Review") {
      await notifyTaggedPeople(supabase, clipId, "approval", `Greenlight needed: "${clip ? displayTitle(clip) : "a clip"}"`, "/portal/ready", member?.id);
    }
    await load();
  }

  async function deleteClip(clipId: string) {
    if (!isAdmin && !member?.can_plan_content) return;
    const clip = clips.find((c) => c.id === clipId);
    if (!confirm(`Delete "${clip ? displayTitle(clip) : "this clip"}"? This can't be undone.`)) return;
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

  const TABS: { key: typeof tab; label: string; count?: number; info: string }[] = [
    { key: "week", label: "This Week", info: "Your default view — shows recent drops, your part (assignments), greenlights you need to give, deadlines this week, what's going live, and what's stuck. Good for a quick check-in." },
    ...(canPlanContent ? [{ key: "planner" as const, label: "Planner", info: "Planner dashboard — stuck clips, waiting assignments, clips ready for greenlight, and trends that need planning. Use this to keep things moving." }] : []),
    { key: "calendar", label: "Calendar", info: "Week or month view showing scheduled post dates, deadlines, and active themes. Planners can drag templates from the side panel onto the calendar to schedule them." },
    { key: "flow", label: "Studio Flow", count: productionClips.length, info: "Kanban pipeline showing videos moving through production: Dropped → Planned → Shot → Cutting → Review → Ready → Scheduled → Live → Vault. Only shows actual videos, not links or ideas." },
    { key: "board", label: "Assignment Board", count: assignments.length, info: "Shows who's been assigned to what. Planners can assign crew members to clips and track whether assignments are done, waiting, or overdue." },
    { key: "trends", label: "Trend Drops", count: trends.length, info: "TikTok trends and references the crew has dropped for inspiration. Planners can group trends into Weekly Heat themes and turn them into planned clips." },
    { key: "watch", label: "Watch", count: clips.filter((c) => c.status === "Live" || ((c.type === "video" || c.type === "final_cut" || c.type === "tiktok_link") && (c.file_path || c.link))).length, info: "Watch clips from the crew — dropped videos and posted content. Filter by platform or see fresh drops." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">The Run Sheet</h1>
            <InfoTooltip text="The central hub for all content — from raw drops to posted clips. Use the tabs below to switch between views: This Week (overview), Calendar (schedule), Studio Flow (production pipeline), and more. Click any clip to see details, tag people, set deadlines, or change status." />
          </div>
          <p className="text-smoked-charcoal/70 mt-2 text-lg">This is what&apos;s moving next.</p>
        </div>
        {canPlanContent && (
          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowCreateFromLibrary(true)}
                className="btn btn-secondary btn-sm"
              >
                📚 Create from Library
              </button>
            )}
            <button
              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              className="btn btn-primary btn-sm"
            >
              + Add Content
            </button>
          </div>
        )}
      </div>

      {/* Add Content form — free-form, no templates */}
      {showTemplatePicker && canPlanContent && (
        <AddContentForm
          member={member}
          members={members}
          onCreated={async () => { setShowTemplatePicker(false); await load(); }}
        />
      )}

      {/* Create from Library — admin only, exposes growth library items */}
      {showCreateFromLibrary && isAdmin && member && (
        <CreateFromLibraryModal
          member={{ id: member.id, name: member.name }}
          members={members}
          onClose={() => setShowCreateFromLibrary(false)}
          onCreated={async () => { setShowCreateFromLibrary(false); await load(); }}
        />
      )}

      {/* Tab bar — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-2 bg-desert-night/10 rounded-full p-1 w-fit overflow-x-auto max-w-full -mx-4 px-4 md:mx-0 md:px-1 md:flex-wrap">
        {TABS.map((t) => (
          <span key={t.key} className="relative inline-flex">
            <button
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-black uppercase whitespace-nowrap shrink-0 ${tab === t.key ? "bg-desert-night text-sunburst-yellow" : "text-desert-night"}`}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
            <InfoTooltip text={t.info} />
          </span>
        ))}
      </div>

      {/* THIS WEEK — everybody's quick overview */}
      {tab === "week" && (
        <ThisWeekTab
          clips={clips}
          people={people}
          approvals={approvals}
          assignments={assignments}
          currentMemberId={member?.id}
          onSelectClip={(id) => setSelectedClip(id)}
        />
      )}

      {/* CALENDAR — layered view with deadlines + posts + themes */}
      {tab === "calendar" && (
        <CalendarView
          clips={clips}
          canPlanContent={canPlanContent}
          member={member ? { id: member.id, name: member.name } : undefined}
          members={members}
          onRefresh={load}
          onSelectClip={(id) => setSelectedClip(id)}
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
          currentMemberId={member?.id}
          currentMemberName={member?.name}
          canPlanContent={canPlanContent}
          isAdmin={isAdmin}
          onRefresh={load}
        />
      )}

      {/* ASSIGNMENT BOARD — admin/planner view of who's doing what */}
      {tab === "board" && (
        <AssignmentBoardTab
          clips={clips}
          assignments={assignments}
          members={members}
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
          trends={trends}
          members={members}
          isAdmin={isAdmin}
          canPlanContent={canPlanContent}
          onSelectClip={(id) => setSelectedClip(id)}
          onRefresh={load}
        />
      )}

      {/* WATCH — posted/live videos */}
      {tab === "watch" && (
        <WatchTab clips={clips} onSelectClip={(id) => setSelectedClip(id)} />
      )}

      {selectedClip && (
        <ClipDetailModal
          clip={clips.find((c) => c.id === selectedClip)!}
          people={people[selectedClip] ?? []}
          approvals={approvals[selectedClip] ?? []}
          assignments={assignments.filter((a) => a.clip_id === selectedClip)}
          members={members}
          isAdmin={isAdmin}
          canPlanContent={canPlanContent}
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
  clip, people, approvals, isAdmin, onSelect,
}: {
  clip: ClipMeta;
  people: ClipPerson[];
  approvals: Approval[];
  isAdmin: boolean;
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
        <h3 className="font-bold text-desert-night leading-tight">{displayTitle(clip)}</h3>
        <p className="text-xs text-smoked-charcoal/60 mt-1">by {clip.submitted_by_name}</p>

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
 * Fetches a thumbnail from oEmbed for link-based clips.
 * Supports TikTok, YouTube, and Instagram (when CORS allows).
 * Falls back to a gradient placeholder with the platform name.
 */
function ClipThumbnail({ link }: { link: string }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (tried) return;
    setTried(true);

    // TikTok oEmbed (returns thumbnail_url)
    if (/tiktok\.com/i.test(link)) {
      fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(link)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.thumbnail_url) setThumb(data.thumbnail_url);
        })
        .catch(() => {});
    }

    // YouTube oEmbed (returns thumbnail_url)
    if (/youtube\.com|youtu\.be/i.test(link)) {
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`)
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
  const platform = linkPlatform(link);
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-sandstone-cream/40 font-display text-lg">
        {platform ?? "Link"}
      </span>
    </div>
  );
}

// ===========================================================================
// SCHEDULE CALENDAR PREVIEW — mini month grid shown beside the schedule form
// ===========================================================================
function ScheduleCalendarPreview({
  scheduledClips,
  pendingDates,
}: {
  scheduledClips: ClipMeta[];
  pendingDates: { submittedBy: string; cutReadyBy: string; greenlightBy: string; liveDate: string };
}) {
  // Show the month containing the "Goes live" date (or current month if none set)
  const refDateStr = pendingDates.liveDate || pendingDates.submittedBy || pendingDates.cutReadyBy || pendingDates.greenlightBy;
  const refDate = refDateStr ? new Date(refDateStr + "T12:00:00") : new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = new Date(refDate.getFullYear(), refDate.getMonth() + monthOffset, 1);
  const monthStart = new Date(monthDate);
  monthStart.setDate(1 - monthStart.getDay());
  const today = new Date();
  const monthDays = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(monthStart.getDate() + i);
    return d;
  });

  const DEADLINE_TYPES: { field: keyof ClipMeta; label: string }[] = [
    { field: "idea_due_date", label: "Spark" },
    { field: "clip_due_date", label: "Drop" },
    { field: "final_cut_due", label: "Cut" },
    { field: "approval_due", label: "Green" },
    { field: "scheduled_date", label: "Live" },
  ];

  // Pending dates the user is currently filling in (highlighted differently)
  const pendingSet = new Set<string>();
  (["submittedBy", "cutReadyBy", "greenlightBy", "liveDate"] as const).forEach((k) => {
    const v = pendingDates[k];
    if (v) pendingSet.add(new Date(v + "T12:00:00").toDateString());
  });

  const hasClipOnDay = (day: Date) =>
    scheduledClips.some((c) => {
      const dates = [c.scheduled_date, c.clip_due_date, c.approval_due, c.idea_due_date, c.final_cut_due, c.due_date].filter(Boolean);
      return dates.some((d) => new Date(d!).toDateString() === day.toDateString());
    });

  return (
    <div className="bg-desert-night/5 rounded-xl p-3 h-full">
      <div className="flex items-center justify-between mb-2">
        <p className="font-display text-sm text-desert-night">
          {monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button onClick={() => setMonthOffset(monthOffset - 1)} className="text-xs text-desert-night/60 hover:text-desert-night px-1">←</button>
          <button onClick={() => setMonthOffset(0)} className="text-[10px] text-desert-night/60 hover:text-desert-night px-1">Today</button>
          <button onClick={() => setMonthOffset(monthOffset + 1)} className="text-xs text-desert-night/60 hover:text-desert-night px-1">→</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-black uppercase text-desert-night/40">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {monthDays.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const isOtherMonth = day.getMonth() !== monthDate.getMonth();
          const hasClip = hasClipOnDay(day);
          const isPending = pendingSet.has(day.toDateString());
          return (
            <div
              key={day.toISOString()}
              className={`rounded text-center py-1 text-[10px] leading-tight ${
                isOtherMonth ? "text-smoked-charcoal/20" : "text-desert-night"
              } ${
                isPending ? "bg-copper-clay/40 font-black ring-1 ring-copper-clay" : isToday ? "bg-copper-deep/20 font-bold" : hasClip ? "bg-cactus-teal/20 font-bold" : ""
              }`}
              title={hasClip ? "Already scheduled" : isPending ? "Pending date" : ""}
            >
              {day.getDate()}
              {hasClip && <span className="block text-[7px] text-cactus-teal leading-none">●</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-2 space-y-1 text-[9px] text-smoked-charcoal/60">
        <p><span className="inline-block w-2 h-2 bg-cactus-teal/40 rounded-sm align-middle mr-1" /> Already on calendar</p>
        <p><span className="inline-block w-2 h-2 bg-copper-clay/60 rounded-sm align-middle mr-1" /> Date you entered (pending)</p>
      </div>
    </div>
  );
}

// ===========================================================================
// READY TO SCHEDULE — side panel in Calendar for pulling from Ready Bank
// ===========================================================================
function ReadyToSchedulePanel({ member, members, onRefresh, scheduledClips }: {
  member: { id: string; name: string };
  members: Member[];
  onRefresh: () => Promise<void>;
  scheduledClips: ClipMeta[];
}) {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [effortFilter, setEffortFilter] = useState<string | null>(null);
  const [actionTemplate, setActionTemplate] = useState<QuickDropTemplate | null>(null);
  const [liveDate, setLiveDate] = useState<string>(() => nextSunday().toISOString().slice(0, 10));
  const [submittedBy, setSubmittedBy] = useState<string>("");
  const [cutReadyBy, setCutReadyBy] = useState<string>("");
  const [greenlightBy, setGreenlightBy] = useState<string>("");
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
    const recipe = buildRecipeForInsert(template.shotRecipeId);
    const { data: clip, error } = await supabase.from("clips").insert({
      title: template.name, type: "video", status: "Planned",
      category: template.bucket, submitted_by: member.id, submitted_by_name: member.name,
      template_id: template.id, destination: template.platforms[0] ?? null,
      clip_due_date: submittedBy || null, final_cut_due: cutReadyBy || null,
      approval_due: greenlightBy || null, scheduled_date: liveDate || null,
      ...(recipe ? { recipe } : {}),
    }).select().single();
    if (error) { alert(error.message); setCreating(false); return; }
    if (selectedCrew.length > 0 && clip) {
      await supabase.from("content_assignments").insert(
        selectedCrew.map((crewId) => {
          const cm = members.find((m) => m.id === crewId);
          return {
            clip_id: clip.id, member_id: crewId, member_name: cm?.name ?? "",
            role: "On-Camera", task_type: "Drop a Clip",
            drop_by_date: submittedBy || null, is_required: true, created_by: member.id,
          };
        })
      );
      const dropLabel = submittedBy
        ? ` — Drop-by ${new Date(submittedBy + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
        : "";
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${template.name}"${dropLabel}`, "/portal/drop")
      ));
    }
    await onRefresh();
    setCreating(false);
    setActionTemplate(null);
    setSelectedCrew([]);
    setSubmittedBy(""); setCutReadyBy(""); setGreenlightBy("");
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
                onClick={() => { setActionTemplate(t); setLiveDate(nextSunday().toISOString().slice(0, 10)); setSubmittedBy(""); setCutReadyBy(""); setGreenlightBy(""); setSelectedCrew([]); }}
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

      {/* Action modal — with calendar preview on desktop */}
      {actionTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setActionTemplate(null)}>
          <div className="bg-sandstone-cream rounded-2xl p-6 w-full max-w-5xl flex flex-col lg:flex-row gap-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Left: form */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg text-desert-night">{actionTemplate.name}</h3>
                  <p className="text-xs text-smoked-charcoal/50">{actionTemplate.bucket} · {actionTemplate.effort}</p>
                </div>
                <button onClick={() => setActionTemplate(null)} className="text-desert-night/40 text-2xl">×</button>
              </div>
              <p className="text-xs text-smoked-charcoal/60 bg-cactus-teal/10 rounded p-2">{actionTemplate.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="label">Submitted by</p>
                  <input type="date" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} className="field w-full" />
                </div>
                <div>
                  <p className="label">Cut ready by</p>
                  <input type="date" value={cutReadyBy} onChange={(e) => setCutReadyBy(e.target.value)} className="field w-full" />
                </div>
                <div>
                  <p className="label">Greenlight by</p>
                  <input type="date" value={greenlightBy} onChange={(e) => setGreenlightBy(e.target.value)} className="field w-full" />
                </div>
                <div>
                  <p className="label">Goes live by</p>
                  <input type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} className="field w-full" />
                </div>
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

            {/* Right: calendar preview (desktop only) */}
            <div className="hidden lg:block lg:w-[420px] shrink-0">
              <ScheduleCalendarPreview
                scheduledClips={scheduledClips}
                pendingDates={{ submittedBy, cutReadyBy, greenlightBy, liveDate }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ clips, canPlanContent, member, members, onRefresh, onSelectClip }: {
  clips: ClipMeta[];
  canPlanContent?: boolean;
  member?: { id: string; name: string };
  members?: Member[];
  onRefresh?: () => Promise<void>;
  onSelectClip?: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"week" | "biweek" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const scheduled = clips.filter((c) => c.scheduled_date || c.clip_due_date || c.approval_due || c.idea_due_date || c.final_cut_due || c.due_date);
  const today = new Date();

  // Week view setup
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Bi-week view setup (14 days)
  const biweekStart = new Date(today);
  biweekStart.setDate(today.getDate() - today.getDay() + weekOffset * 14);
  const biweekDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(biweekStart);
    d.setDate(biweekStart.getDate() + i);
    return d;
  });

  // Month view setup
  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthStart = new Date(monthDate);
  monthStart.setDate(1 - monthStart.getDay()); // back to Sunday
  const monthDays = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(monthStart.getDate() + i);
    return d;
  });

  const DEADLINE_TYPES: { field: keyof ClipMeta; label: string; color: string }[] = [
    { field: "idea_due_date", label: "Spark-by", color: "text-cactus-teal" },
    { field: "clip_due_date", label: "Drop-by", color: "text-copper-deep" },
    { field: "final_cut_due", label: "Cut ready", color: "text-heat-orange" },
    { field: "approval_due", label: "Greenlight", color: "text-heat-orange" },
    { field: "scheduled_date", label: "Goes Live", color: "text-cactus-teal" },
  ];

  const isMonth = viewMode === "month";
  const isBiweek = viewMode === "biweek";
  const days = isMonth ? monthDays : isBiweek ? biweekDays : weekDays;
  const offset = isMonth ? monthOffset : weekOffset;
  const setOffset = isMonth ? setMonthOffset : setWeekOffset;
  const rangeLabel = isMonth
    ? monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : isBiweek
      ? `${biweekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${biweekDays[13].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : `${weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Navigation + view toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setOffset(offset - 1)} className="btn btn-ghost btn-sm">← Prev</button>
        <span className="font-display text-lg text-desert-night">{rangeLabel}</span>
        <button onClick={() => setOffset(offset + 1)} className="btn btn-ghost btn-sm">Next →</button>
        {offset !== 0 && (
          <button onClick={() => setOffset(0)} className="btn btn-secondary btn-sm ml-2">Today</button>
        )}
        <div className="ml-auto flex gap-1 bg-desert-night/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === "week" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
          >Week</button>
          <button
            onClick={() => setViewMode("biweek")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === "biweek" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
          >Bi-Week</button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === "month" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
          >Month</button>
        </div>
      </div>

      {/* Toggle for side panel (planners only) */}
      {canPlanContent && member && members && onRefresh && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            className={`btn btn-sm ${showSidePanel ? "btn-primary" : "btn-secondary"}`}
          >
            {showSidePanel ? "✕ Hide templates" : "+ Show Ready to Schedule"}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar grid.
            Week/bi-week: horizontal scroll with wide day columns (~3 visible at a time).
            Month view: 7-col grid with scrollable container. */}
        <div className="flex-1 min-w-0">
          {/* Day-of-week header — only for week/bi-week (month shows weekday inside cells) */}
          {!isMonth && (
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <div
                className="flex gap-1 md:gap-2 mb-1"
                style={{ minWidth: isBiweek ? "2520px" : "1260px" }}
              >
                {days.map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] md:text-xs font-black uppercase text-desert-night/50 py-1 shrink-0"
                    style={{ width: isBiweek ? "170px" : "170px", flex: "0 0 170px" }}
                  >
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week / Bi-week: horizontal scroll with wide day columns */}
          {!isMonth && (
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <div
                className="flex gap-1 md:gap-2"
                style={{ minWidth: isBiweek ? "2520px" : "1260px" }}
              >
                {days.map((day) => {
                  const isToday = day.toDateString() === today.toDateString();
                  const dayClips = scheduled.filter((c) => {
                    const dates = [c.scheduled_date, c.clip_due_date, c.approval_due, c.idea_due_date, c.final_cut_due, c.due_date].filter(Boolean);
                    return dates.some((d) => new Date(d!).toDateString() === day.toDateString());
                  });
                  return (
                    <div
                      key={day.toISOString()}
                      className={`card p-2 md:p-3 shrink-0 ${isToday ? "ring-2 ring-copper-clay" : ""}`}
                      style={{ width: "170px", flex: "0 0 170px", minHeight: isBiweek ? "120px" : "160px" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-display text-sm text-desert-night">
                          {day.toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                        <p className={`text-sm font-black ${isToday ? "text-copper-deep" : "text-smoked-charcoal/60"}`}>
                          {day.getDate()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        {dayClips.map((c) => {
                          const matchingDeadlines = DEADLINE_TYPES.filter((dt) => {
                            const val = c[dt.field] as string | null;
                            return val && new Date(val).toDateString() === day.toDateString();
                          });
                          const isLive = matchingDeadlines.some((d) => d.label === "Goes Live");
                          return (
                            <button
                              key={c.id}
                              onClick={() => onSelectClip?.(c.id)}
                              className={`rounded-lg p-2 w-full text-left block hover:-translate-y-0.5 transition-transform ${isLive ? "bg-cactus-teal/20" : "bg-copper-clay/15"}`}
                            >
                              <p className="font-bold text-desert-night text-xs leading-tight line-clamp-2">{displayTitle(c)}</p>
                              {matchingDeadlines.map((d) => (
                                <span key={d.label} className={`font-black ${d.color} block text-[10px]`}>{d.label}</span>
                              ))}
                              <span className={`chip ${STATUS_CHIP[c.status]} !text-[9px] !py-0.5 mt-1`}>{c.status}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month view: proper 7-col grid (no double nesting) */}
          {isMonth && (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-black uppercase text-desert-night/50 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const isToday = day.toDateString() === today.toDateString();
                  const isOtherMonth = day.getMonth() !== monthDate.getMonth();
                  const dayClips = scheduled.filter((c) => {
                    const dates = [c.scheduled_date, c.clip_due_date, c.approval_due, c.idea_due_date, c.final_cut_due, c.due_date].filter(Boolean);
                    return dates.some((d) => new Date(d!).toDateString() === day.toDateString());
                  });
                  return (
                    <div key={day.toISOString()} className={`card p-1 min-h-[90px] ${isToday ? "ring-2 ring-copper-clay" : ""} ${isOtherMonth ? "opacity-40" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className="font-display text-desert-night text-[10px]">
                          {day.toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                        <p className={`text-[10px] ${isToday ? "text-copper-deep font-black" : isOtherMonth ? "text-smoked-charcoal/30" : "text-smoked-charcoal/60"}`}>
                          {day.getDate()}
                        </p>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {dayClips.map((c) => {
                          const matchingDeadlines = DEADLINE_TYPES.filter((dt) => {
                            const val = c[dt.field] as string | null;
                            return val && new Date(val).toDateString() === day.toDateString();
                          });
                          const isLive = matchingDeadlines.some((d) => d.label === "Goes Live");
                          return (
                            <button
                              key={c.id}
                              onClick={() => onSelectClip?.(c.id)}
                              className={`rounded p-1 w-full text-left block hover:bg-copper-clay/25 transition ${isLive ? "bg-cactus-teal/20" : "bg-copper-clay/15"}`}
                            >
                              <p className="font-bold text-desert-night text-[9px] leading-tight line-clamp-1">{displayTitle(c)}</p>
                              {matchingDeadlines.map((d) => (
                                <span key={d.label} className={`font-black ${d.color} block text-[8px]`}>{d.label}</span>
                              ))}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {scheduled.length === 0 && (
            <div className="card p-6 text-center text-smoked-charcoal/60 mt-2">
              Nothing scheduled yet. Set deadlines on a clip from Studio Flow.
            </div>
          )}
        </div>

        {/* Ready to Schedule side panel — planner/admin only, toggleable */}
        {canPlanContent && member && members && onRefresh && showSidePanel && (
          <ReadyToSchedulePanel member={member} members={members} onRefresh={onRefresh} scheduledClips={clips.filter((c) => c.scheduled_date || c.clip_due_date || c.approval_due || c.idea_due_date || c.final_cut_due || c.due_date)} />
        )}
      </div>
    </div>
  );
}

function ClipDetailModal({
  clip, people, approvals, assignments, members, isAdmin, canPlanContent, currentMemberId, currentMemberName, onClose, onStatusChange, onDelete, onRefresh,
}: {
  clip: ClipMeta;
  people: ClipPerson[];
  approvals: Approval[];
  assignments: Assignment[];
  members: Member[];
  isAdmin: boolean;
  canPlanContent: boolean;
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
  const [deadlines, setDeadlines] = useState<Record<string, string>>({
    idea_due_date: clip.idea_due_date ?? "",
    clip_due_date: clip.clip_due_date ?? "",
    final_cut_due: clip.final_cut_due ?? "",
    approval_due: clip.approval_due ?? "",
    scheduled_date: clip.scheduled_date ?? "",
  });
  const [savingDeadlines, setSavingDeadlines] = useState(false);

  const [assignForm, setAssignForm] = useState({
    member_id: "",
    role: "On-Camera" as AssignmentRole,
    task_type: "Drop a Clip" as AssignmentTaskType,
    task_title: "",
    task_notes: "",
    drop_by_date: "",
    is_required: true,
  });
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showClipEditor, setShowClipEditor] = useState(false);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [attachingRecipe, setAttachingRecipe] = useState(false);

  // Attach a Full Ready Recipe from the library to this existing clip.
  // This copies the recipe content into the clip's recipe field — the master library is never modified.
  async function attachFullRecipe(recipe: FullReadyRecipe) {
    setAttachingRecipe(true);
    const recipePayload = fullReadyRecipeToClipRecipe(recipe);
    const { error } = await supabase.from("clips").update({
      recipe: recipePayload as unknown as Record<string, unknown>,
    }).eq("id", clip.id);
    setAttachingRecipe(false);
    if (error) {
      alert(error.message);
      return;
    }
    setShowRecipePicker(false);
    await onRefresh();
    // Open the recipe builder so the planner can customize it for this clip
    setShowRecipeBuilder(true);
  }

  async function createAssignment() {
    if (!assignForm.member_id || !currentMemberId) return;
    const m = members.find((mem) => mem.id === assignForm.member_id);
    if (!m) return;
    setSavingAssignment(true);
    const { error } = await supabase.from("content_assignments").insert({
      clip_id: clip.id,
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
      const notifBody = `You're on "${displayTitle(clip)}" — ${assignForm.role}`;
      await notifyMember(supabase, assignForm.member_id, "assignment", notifBody, "/portal/run-sheet");
    }
    setAssignForm({ member_id: "", role: "On-Camera", task_type: "Drop a Clip", task_title: "", task_notes: "", drop_by_date: "", is_required: true });
    setShowAssignForm(false);
    await onRefresh();
    setSavingAssignment(false);
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Remove this assignment?")) return;
    const { error } = await supabase.from("content_assignments").delete().eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  async function updateAssignmentStatus(id: string, status: string) {
    const completed_at = status === "Done" || status === "Greenlit" || status === "Dropped" ? new Date().toISOString() : null;
    const { error } = await supabase.from("content_assignments").update({ status, completed_at }).eq("id", id);
    if (error) alert(error.message);
    await onRefresh();
  }

  async function saveDeadlines() {
    setSavingDeadlines(true);
    const { error } = await supabase.from("clips").update({
      idea_due_date: deadlines.idea_due_date || null,
      clip_due_date: deadlines.clip_due_date || null,
      final_cut_due: deadlines.final_cut_due || null,
      approval_due: deadlines.approval_due || null,
      scheduled_date: deadlines.scheduled_date || null,
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
      body: `${currentMemberName ?? "Someone"} ${status === "Approved" ? "greenlit" : status === "Do Not Post" ? "said do not post" : "reviewed"} "${displayTitle(clip)}"`,
    });
    await onRefresh();
    setWorking(false);
  }

  // silence unused warning for onStatusChange when not admin
  void onStatusChange;

  return (
    <>
    <div className="fixed inset-0 z-50 bg-desert-night/70 flex items-center justify-center p-3 md:p-4" onClick={onClose}>
      <div
        className="card p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-3">
          <div className="min-w-0">
            {canPlanContent && <span className={`chip ${STATUS_CHIP[clip.status]}`}>{clip.status}</span>}
            <h2 className="font-display text-2xl md:text-3xl text-desert-night mt-2 leading-none break-words">{displayTitle(clip)}</h2>
            <p className="text-sm text-smoked-charcoal/60 mt-1">{droppedByLabel(clip)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap md:shrink-0">
            {canPlanContent && (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setShowRecipeBuilder(true)} className="btn btn-secondary btn-sm !text-xs">
                  📋 Build Recipe
                </button>
                <button onClick={() => setShowRecipePicker(true)} className="btn btn-secondary btn-sm !text-xs">
                  📋+ Attach from Ready Bank
                </button>
              </div>
            )}
            {isAdmin && (
              <button onClick={() => setShowClipEditor(true)} className="btn btn-secondary btn-sm !text-xs">
                📚 Edit with Libraries
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm ml-auto md:ml-0" aria-label="Close">✕</button>
          </div>
        </div>

        {clip.link && (
          <a href={clip.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-4">
            Open link →
          </a>
        )}

        {/* Video player — plays uploaded videos right in the modal */}
        {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
          <div className="mt-4 max-h-[500px]">
            <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[500px]" />
          </div>
        )}

        {/* Social embed for link clips — TikTok, Instagram, Facebook, YouTube */}
        {clip.link && !clip.file_path && (
          <div className="mt-4">
            <SocialEmbed url={clip.link} title={clip.title} />
          </div>
        )}

        {/* Admin-only fields — caption, brief, do-not-post notes are brand IP */}
        {isAdmin && clip.idea_text && <p className="mt-4 text-smoked-charcoal bg-sandstone-cream/50 rounded-xl p-4">{clip.idea_text}</p>}
        {isAdmin && clip.caption && <p className="mt-4 font-script text-xl text-desert-night">{clip.caption}</p>}
        {isAdmin && clip.do_not_post_notes && (
          <div className="mt-4 bg-copper-deep/15 border border-copper-clay rounded-xl p-3">
            <p className="text-xs font-black uppercase text-copper-deep">Do not post notes</p>
            <p className="text-sm text-desert-night mt-1">{clip.do_not_post_notes}</p>
          </div>
        )}

        {/* ===== CREW VIEW — prompt them, don't script them ===== */}
        {!canPlanContent && (
          <div className="mt-6 space-y-4">
            {/* Recipe — the full production pack built by the planner/admin */}
            {clip.recipe && (() => {
              const r = clip.recipe as Record<string, unknown>;
              const hasRecipe = r && (r.goal || r.creatorTask || r.prompt || (r.finalVideoFlow && (r.finalVideoFlow as string[]).length > 0));
              if (!hasRecipe) return null;
              const recipe = r as unknown as ClipRecipe;
              // Fall back to the stored fullReadyRecipe for fields that may be missing
              // on clips created before the toneMix/topic-specifics update
              const fr = (r.fullReadyRecipe ?? null) as Record<string, unknown> | null;
              const toneMix = (recipe.toneMix?.length ? recipe.toneMix : (fr?.toneMix as string[] | undefined)) ?? [];
              const whatYouAreMaking = recipe.whatYouAreMaking ?? (fr?.whatYouAreMaking as string | undefined);
              const introductionDirection = recipe.introductionDirection ?? (fr?.introductionDirection as string | undefined);
              const assignedMovementOrLine = recipe.assignedMovementOrLine ?? (fr?.assignedMovementOrLine as string | undefined);
              const makeItYourOwn = (recipe.makeItYourOwn?.length ? recipe.makeItYourOwn : (fr?.makeItYourOwn as string[] | undefined)) ?? [];
              const exampleDirections = (recipe.exampleDirections?.length ? recipe.exampleDirections : (fr?.exampleDirections as string[] | undefined)) ?? [];
              return (
                <div className="card p-5 bg-cactus-teal/10 space-y-4">
                  <div>
                    <p className="font-display text-lg text-desert-night">Your Assignment</p>
                    {recipe.difficulty && (
                      <p className="text-xs text-smoked-charcoal/60 mt-1">
                        {recipe.difficulty === "Easy" ? "🟢" : recipe.difficulty === "Medium" ? "🟡" : "🔴"} {recipe.difficulty}
                      </p>
                    )}
                    {toneMix.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-desert-night/50 uppercase">Tone:</span>
                        {toneMix.map((t: string) => (
                          <span key={t} className="chip chip-copper !text-[10px]">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {recipe.goal && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Goal</p>
                      <p className="text-sm text-desert-night mt-1">{recipe.goal}</p>
                    </div>
                  )}

                  {/* What You're Making — the actual topic */}
                  {whatYouAreMaking && (
                    <div className="bg-copper-clay/10 rounded-lg p-3">
                      <p className="text-xs font-bold text-copper-deep uppercase">What You&apos;re Making</p>
                      <p className="text-sm text-desert-night mt-1 font-bold">{whatYouAreMaking}</p>
                    </div>
                  )}

                  {/* Introduction Direction */}
                  {introductionDirection && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Introduction Direction</p>
                      <p className="text-sm text-desert-night mt-1 italic">{introductionDirection}</p>
                    </div>
                  )}

                  {/* Assigned Movement or Line */}
                  {assignedMovementOrLine && (
                    <div className="bg-sandstone-cream/70 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Assigned Movement or Line</p>
                      <p className="text-sm text-desert-night mt-1 italic font-script text-base">&ldquo;{assignedMovementOrLine}&rdquo;</p>
                    </div>
                  )}

                  {recipe.creatorTask && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Your Task</p>
                      <p className="text-sm text-desert-night mt-1">{recipe.creatorTask}</p>
                    </div>
                  )}

                  {recipe.prompt && (
                    <div className="bg-sandstone-cream/70 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Prompt</p>
                      <p className="text-sm text-desert-night mt-1 font-script text-base">&ldquo;{recipe.prompt}&rdquo;</p>
                      {recipe.exampleResponse && (
                        <div className="mt-2">
                          <p className="text-xs font-bold text-desert-night/50 uppercase">Example response (use it or make it your own)</p>
                          <p className="text-sm text-desert-night/70 mt-1 font-script text-base">&ldquo;{recipe.exampleResponse}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Example Directions — the type of responses, not scripts */}
                  {exampleDirections.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Example Directions <span className="font-normal lowercase">(not scripts — just the type)</span></p>
                      <ul className="mt-2 space-y-1">
                        {exampleDirections.map((ex, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-copper-deep">·</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Make It Your Own — creative freedom rules */}
                  {makeItYourOwn.length > 0 && (
                    <div className="bg-cactus-teal/5 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Make It Your Own</p>
                      <ul className="mt-2 space-y-1">
                        {makeItYourOwn.map((item, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-copper-deep">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What the final video looks like */}
                  {recipe.finalVideoFlow && recipe.finalVideoFlow.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">What the Final Video Looks Like</p>
                      <ol className="mt-2 space-y-1">
                        {recipe.finalVideoFlow.map((step, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-desert-night/40 font-bold">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* 3 Parts */}
                  {recipe.part1Start && recipe.part1Start.instructions.length > 0 && (
                    <div className="bg-sandstone-cream/50 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Part 1 — {recipe.part1Start.label}</p>
                      <ol className="mt-2 space-y-1">
                        {recipe.part1Start.instructions.map((inst, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-desert-night/40 font-bold">{i + 1}.</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recipe.part2Content && recipe.part2Content.instructions.length > 0 && (
                    <div className="bg-sandstone-cream/50 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Part 2 — {recipe.part2Content.label}</p>
                      <ol className="mt-2 space-y-1">
                        {recipe.part2Content.instructions.map((inst, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-desert-night/40 font-bold">{i + 1}.</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recipe.part3End && recipe.part3End.instructions.length > 0 && (
                    <div className="bg-sandstone-cream/50 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Part 3 — {recipe.part3End.label}</p>
                      <ol className="mt-2 space-y-1">
                        {recipe.part3End.instructions.map((inst, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-desert-night/40 font-bold">{i + 1}.</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Recording instructions */}
                  {recipe.beforeRecording && recipe.beforeRecording.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Before Recording</p>
                      <ul className="mt-2 space-y-1">
                        {recipe.beforeRecording.map((item, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-cactus-teal">✅</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipe.recordSteps && recipe.recordSteps.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Record</p>
                      <ol className="mt-2 space-y-1">
                        {recipe.recordSteps.map((step, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-desert-night/40 font-bold">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* What to send */}
                  {recipe.submissionRules && recipe.submissionRules.length > 0 && (
                    <div className="bg-heat-orange/10 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">What to Send</p>
                      <ul className="mt-2 space-y-1">
                        {recipe.submissionRules.map((rule, i) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-cactus-teal">✅</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-smoked-charcoal/50 text-center italic">
                    One take is fine. We are looking for real, not perfect.
                  </p>

                  {/* Transition Chain — per-creator position */}
                  {recipe.chainPositions && recipe.chainPositions.length > 0 && (() => {
                    const myPos = recipe.chainPositions.find(p => p.name === currentMemberName) ?? recipe.chainPositions.find(p => p.name?.toLowerCase() === (currentMemberName ?? "").toLowerCase());
                    if (!myPos) return null;
                    return (
                      <div className="bg-desert-night/5 rounded-lg p-3 border border-copper-clay/20">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display text-base text-desert-night">Your Transition Position</p>
                          <span className="chip chip-copper !text-[9px]">{myPos.role}</span>
                          <span className="text-[10px] text-smoked-charcoal/50">Position {myPos.position} of {myPos.totalCreators}</span>
                        </div>

                        <div className="mt-2 space-y-2 text-sm">
                          {myPos.previousCreator && (
                            <p className="text-smoked-charcoal/70">
                              <span className="text-copper-deep font-bold">After:</span> {myPos.previousCreator}
                            </p>
                          )}
                          {myPos.nextCreator && (
                            <p className="text-smoked-charcoal/70">
                              <span className="text-cactus-teal font-bold">Before:</span> {myPos.nextCreator}
                            </p>
                          )}
                          {myPos.object && (
                            <p className="text-smoked-charcoal/70">
                              <span className="text-heat-orange font-bold">Your object:</span> {myPos.object}
                            </p>
                          )}
                        </div>

                        {/* How your clip starts */}
                        <div className="mt-3 bg-cactus-teal/10 rounded-lg p-2">
                          <p className="text-xs font-bold text-cactus-teal uppercase">How Your Clip Starts</p>
                          <p className="text-sm text-desert-night mt-1">{myPos.transitionIn}</p>
                          {myPos.transitionInSteps.length > 0 && (
                            <ol className="mt-2 space-y-1">
                              {myPos.transitionInSteps.map((step, i) => (
                                <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                                  <span className="text-desert-night/40 font-bold">{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>

                        {/* Your content action */}
                        <div className="mt-2 bg-sandstone-cream/50 rounded-lg p-2">
                          <p className="text-xs font-bold text-desert-night/50 uppercase">Your Content</p>
                          <p className="text-sm text-desert-night mt-1">{myPos.contentAction}</p>
                        </div>

                        {/* How your clip ends */}
                        <div className="mt-2 bg-copper-clay/10 rounded-lg p-2">
                          <p className="text-xs font-bold text-copper-deep uppercase">How Your Clip Ends</p>
                          <p className="text-sm text-desert-night mt-1">{myPos.transitionOut}</p>
                          {myPos.transitionOutSteps.length > 0 && (
                            <ol className="mt-2 space-y-1">
                              {myPos.transitionOutSteps.map((step, i) => (
                                <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                                  <span className="text-desert-night/40 font-bold">{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>

                        {/* Direction */}
                        <p className="text-xs text-smoked-charcoal/60 mt-2">
                          <span className="font-bold">Direction:</span> {myPos.direction}
                        </p>

                        {/* Full chain preview — so they see the whole picture */}
                        <details className="mt-3">
                          <summary className="text-xs text-copper-deep cursor-pointer hover:underline">See the full chain →</summary>
                          <div className="mt-2 space-y-1 text-xs text-smoked-charcoal/70">
                            {recipe.chainPositions.map(pos => (
                              <div key={pos.position} className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-copper-deep w-4">{pos.position}.</span>
                                <span className={`font-bold ${pos.name === currentMemberName ? "text-copper-deep" : "text-desert-night"}`}>{pos.name}</span>
                                <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">{pos.role}</span>
                                {pos.object && <span className="chip chip-teal !text-[8px] !px-1.5 !py-0.5">{pos.object}</span>}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* Template — idea, vibe, what to drop, examples, make it yours (fallback if no recipe) */}
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
            {/* Recipe preview — show what's been built */}
            {clip.recipe && (() => {
              const r = clip.recipe as Record<string, unknown>;
              const hasRecipe = r && (r.goal || r.creatorTask || r.prompt);
              if (!hasRecipe) return null;
              const recipe = r as unknown as ClipRecipe;
              // Fall back to the stored fullReadyRecipe for fields that may be missing
              const fr = (r.fullReadyRecipe ?? null) as Record<string, unknown> | null;
              const toneMix = (recipe.toneMix?.length ? recipe.toneMix : (fr?.toneMix as string[] | undefined)) ?? [];
              const whatYouAreMaking = recipe.whatYouAreMaking ?? (fr?.whatYouAreMaking as string | undefined);
              const introductionDirection = recipe.introductionDirection ?? (fr?.introductionDirection as string | undefined);
              const assignedMovementOrLine = recipe.assignedMovementOrLine ?? (fr?.assignedMovementOrLine as string | undefined);
              const makeItYourOwn = (recipe.makeItYourOwn?.length ? recipe.makeItYourOwn : (fr?.makeItYourOwn as string[] | undefined)) ?? [];
              const exampleDirections = (recipe.exampleDirections?.length ? recipe.exampleDirections : (fr?.exampleDirections as string[] | undefined)) ?? [];
              return (
                <div className="mt-6 card p-5 bg-cactus-teal/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-desert-night">📋 Recipe</p>
                    <button onClick={() => setShowRecipeBuilder(true)} className="btn btn-cream btn-sm !text-xs">
                      Edit Recipe
                    </button>
                  </div>
                  {toneMix.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-desert-night/50 uppercase">Tone:</span>
                      {toneMix.map((t: string) => (
                        <span key={t} className="chip chip-copper !text-[10px]">{t}</span>
                      ))}
                    </div>
                  )}
                  {recipe.goal && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Goal</p>
                      <p className="text-sm text-desert-night mt-1">{recipe.goal}</p>
                    </div>
                  )}
                  {whatYouAreMaking && (
                    <div className="bg-copper-clay/10 rounded-lg p-3">
                      <p className="text-xs font-bold text-copper-deep uppercase">What You&apos;re Making</p>
                      <p className="text-sm text-desert-night mt-1 font-bold">{whatYouAreMaking}</p>
                    </div>
                  )}
                  {introductionDirection && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Introduction Direction</p>
                      <p className="text-sm text-desert-night mt-1 italic">{introductionDirection}</p>
                    </div>
                  )}
                  {assignedMovementOrLine && (
                    <div className="bg-sandstone-cream/70 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Assigned Movement or Line</p>
                      <p className="text-sm text-desert-night mt-1 italic font-script text-base">&ldquo;{assignedMovementOrLine}&rdquo;</p>
                    </div>
                  )}
                  {recipe.creatorTask && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Creator Task</p>
                      <p className="text-sm text-desert-night mt-1">{recipe.creatorTask}</p>
                    </div>
                  )}
                  {recipe.prompt && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Prompt</p>
                      <p className="text-sm text-desert-night mt-1 font-script text-base">&ldquo;{recipe.prompt}&rdquo;</p>
                    </div>
                  )}
                  {exampleDirections.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Example Directions <span className="font-normal lowercase">(not scripts — just the type)</span></p>
                      <ul className="mt-2 space-y-1">
                        {exampleDirections.map((ex: string, i: number) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-copper-deep">·</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {makeItYourOwn.length > 0 && (
                    <div className="bg-cactus-teal/5 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Make It Your Own</p>
                      <ul className="mt-2 space-y-1">
                        {makeItYourOwn.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                            <span className="text-copper-deep">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recipe.finalVideoFlow && recipe.finalVideoFlow.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Final Video Flow ({recipe.finalVideoFlow.length} steps)</p>
                      <p className="text-xs text-smoked-charcoal/60 mt-1">
                        {recipe.finalVideoFlow.map((s, i) => `${i + 1}. ${s}`).join(" → ")}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-smoked-charcoal/50">
                    {recipe.part1Start?.instructions.length || 0} start steps ·{" "}
                    {recipe.part2Content?.instructions.length || 0} content steps ·{" "}
                    {recipe.part3End?.instructions.length || 0} end steps ·{" "}
                    {recipe.recordSteps?.length || 0} record steps
                  </p>

                  {/* Transition Chain summary (admin view) */}
                  {recipe.chainPositions && recipe.chainPositions.length > 0 && (
                    <div className="mt-3 bg-desert-night/5 rounded-lg p-3">
                      <p className="text-xs font-bold text-desert-night/50 uppercase">Transition Chain</p>
                      <p className="text-xs text-smoked-charcoal/60 mt-1">
                        {recipe.assemblyMode} · {recipe.participantCount} creators · {recipe.transitionFamily} · {recipe.chainTier}
                        {recipe.chainStrategy && <span> · {recipe.chainStrategy}</span>}
                      </p>
                      <div className="mt-2 space-y-1">
                        {recipe.chainPositions.map(pos => (
                          <div key={pos.position} className="text-xs flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-copper-deep">{pos.position}.</span>
                            <span className="font-bold text-desert-night">{pos.name}</span>
                            <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">{pos.role}</span>
                            {pos.object && <span className="chip chip-teal !text-[8px] !px-1.5 !py-0.5">{pos.object}</span>}
                            <span className="text-smoked-charcoal/50">In: {pos.transitionIn.slice(0, 40)}{pos.transitionIn.length > 40 ? "…" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
                  <button onClick={saveDeadlines} className="btn btn-primary btn-sm mt-3" disabled={savingDeadlines}>
                    {savingDeadlines ? "Saving…" : "Save Timeline"}
                  </button>
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

        {/* Assignments — admin/planners can add crew to any existing clip */}
        {canPlanContent && (
          <div className="mt-6 card p-4 bg-sandstone-cream/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-desert-night">Assignments</h3>
              <button onClick={() => setShowAssignForm(!showAssignForm)} className="btn btn-primary btn-sm">
                {showAssignForm ? "Cancel" : "+ Assign Crew"}
              </button>
            </div>

            {assignments.length > 0 && (
              <div className="space-y-2 mb-4">
                {assignments.map((a) => {
                  const late = a.drop_by_date && new Date(a.drop_by_date) < new Date() && a.status !== "Done" && a.status !== "Greenlit" && a.status !== "Dropped";
                  return (
                    <div key={a.id} className={`bg-sandstone-cream/70 rounded-xl p-3 ${late ? "border-l-4 border-heat-orange" : ""}`}>
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
                          <select
                            className="field !py-1 !text-xs !w-auto"
                            value={a.status}
                            onChange={(e) => updateAssignmentStatus(a.id, e.target.value)}
                          >
                            {["Not Started", "In Progress", "Dropped", "Waiting on Vanessa", "Needs Tweak", "Greenlit", "Done", "Skipped", "Hold"].map((s) => (
                              <option key={s} value={s}>{assignmentStatusLabel(s)}</option>
                            ))}
                          </select>
                          <button onClick={() => deleteAssignment(a.id)} className="text-xs text-heat-orange hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {assignments.length === 0 && !showAssignForm && (
              <p className="text-sm text-smoked-charcoal/60 italic mb-4">No one assigned yet. Click + Assign Crew to add people.</p>
            )}

            {showAssignForm && (
              <div className="bg-sandstone-cream/70 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select className="field" value={assignForm.member_id} onChange={(e) => setAssignForm({ ...assignForm, member_id: e.target.value })}>
                    <option value="">Pick someone…</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <select className="field" value={assignForm.role} onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value as AssignmentRole })}>
                    {ASSIGNMENT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select className="field" value={assignForm.task_type} onChange={(e) => setAssignForm({ ...assignForm, task_type: e.target.value as AssignmentTaskType })}>
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
                  <button onClick={createAssignment} className="btn btn-primary btn-sm ml-auto" disabled={savingAssignment || !assignForm.member_id}>
                    {savingAssignment ? "Assigning…" : "Assign"}
                  </button>
                </div>
              </div>
            )}
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

      {/* Clip Editor — attach library items (hooks, prompts, captions, transitions, etc.) */}
      {showClipEditor && (
        <ClipEditor
          clip={clip}
          onClose={() => setShowClipEditor(false)}
          onSaved={() => { onRefresh(); setShowClipEditor(false); }}
        />
      )}

      {/* Recipe Builder — planner-accessible, no library IP exposed */}
      {showRecipeBuilder && (
        <RecipeBuilder
          clip={clip}
          members={members.map(m => ({ id: m.id, name: m.name }))}
          onClose={() => setShowRecipeBuilder(false)}
          onSaved={() => { onRefresh(); setShowRecipeBuilder(false); }}
        />
      )}

      {/* Recipe Picker — attach a Full Ready Recipe from the library to this clip */}
      {showRecipePicker && (
        <RecipePickerModal
          onClose={() => setShowRecipePicker(false)}
          onAttach={attachFullRecipe}
          attaching={attachingRecipe}
          clipTitle={clip.title}
        />
      )}
    </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Recipe Picker Modal — search and attach a Full Ready Recipe to an existing clip
// ---------------------------------------------------------------------------

function RecipePickerModal({
  onClose,
  onAttach,
  attaching,
  clipTitle,
}: {
  onClose: () => void;
  onAttach: (recipe: FullReadyRecipe) => Promise<void>;
  attaching: boolean;
  clipTitle: string;
}) {
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<"all" | "A — Current" | "B — Off Script">("all");
  const [detailRecipe, setDetailRecipe] = useState<FullReadyRecipe | null>(null);

  const filtered = FULL_READY_RECIPES.filter((r) => {
    if (versionFilter !== "all" && r.version !== versionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.creatorTask.toLowerCase().includes(q) ||
        r.transitionFamily.toLowerCase().includes(q);
    }
    return true;
  });

  // Try to find a recipe that matches the clip title
  const suggested = FULL_READY_RECIPES.find(r =>
    r.name.toLowerCase() === clipTitle.toLowerCase() ||
    clipTitle.toLowerCase().includes(r.name.toLowerCase()) ||
    r.name.toLowerCase().includes(clipTitle.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-sandstone-cream rounded-2xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-desert-night">Attach Full Recipe from Ready Bank</h2>
            <p className="text-xs text-smoked-charcoal/50 mt-1">
              Pick a recipe to copy into this clip. The full breakdown (steps, assembly plan, caption package) will be attached. You can edit it per-clip after — the master library stays untouched.
            </p>
          </div>
          <button onClick={onClose} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
        </div>

        {/* Suggested match */}
        {suggested && (
          <div className="bg-cactus-teal/10 rounded-xl p-3">
            <p className="text-xs font-bold text-cactus-teal uppercase">Suggested match for &ldquo;{clipTitle}&rdquo;</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-sm text-desert-night">{suggested.name}</p>
                <p className="text-[10px] text-smoked-charcoal/50">{suggested.category} · {suggested.effort} · {suggested.transitionFamily}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setDetailRecipe(suggested)} className="btn btn-cream btn-sm !text-xs">👁 View</button>
                <button
                  onClick={() => onAttach(suggested)}
                  disabled={attaching}
                  className="btn btn-primary btn-sm !text-xs"
                >{attaching ? "Attaching…" : "Attach →"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes by name, category, or content..."
          className="field"
        />

        {/* Version filter */}
        <div className="flex gap-2">
          <button onClick={() => setVersionFilter("all")} className={`chip !text-xs ${versionFilter === "all" ? "chip-copper" : "chip-cream"}`}>All</button>
          <button onClick={() => setVersionFilter("A — Current")} className={`chip !text-xs ${versionFilter === "A — Current" ? "chip-copper" : "chip-cream"}`}>A: Current</button>
          <button onClick={() => setVersionFilter("B — Off Script")} className={`chip !text-xs ${versionFilter === "B — Off Script" ? "chip-copper" : "chip-cream"}`}>B: Off Script</button>
        </div>

        {/* Recipe cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.slice(0, 20).map((r) => (
            <div key={r.id} className="card p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-desert-night leading-tight">{r.name}</p>
                  <p className="text-[10px] text-smoked-charcoal/50">{r.category} · {r.effort}</p>
                </div>
                <span className={`chip !text-[8px] !px-1.5 !py-0.5 shrink-0 ${r.version.startsWith("A") ? "chip-copper" : "chip-cream"}`}>
                  {r.version.startsWith("A") ? "A" : "B"}
                </span>
              </div>
              <p className="text-xs text-smoked-charcoal/70 line-clamp-2">{r.creatorTask}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setDetailRecipe(r)} className="btn btn-cream btn-sm !text-xs flex-1">👁 View</button>
                <button
                  onClick={() => onAttach(r)}
                  disabled={attaching}
                  className="btn btn-primary btn-sm !text-xs flex-1"
                >{attaching ? "…" : "Attach →"}</button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 20 && (
          <p className="text-xs text-smoked-charcoal/50 text-center">
            Showing 20 of {filtered.length}. Refine your search to see more.
          </p>
        )}

        {filtered.length === 0 && (
          <p className="text-sm text-smoked-charcoal/40 text-center py-6">No recipes match your search.</p>
        )}
      </div>

      {/* Full Ready Recipe Detail Modal (nested) */}
      {detailRecipe && (
        <FullReadyRecipeDetail
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
          canPlanContent={true}
          onPlan={(r) => {
            setDetailRecipe(null);
            onAttach(r);
          }}
        />
      )}
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
  clips, people, approvals, assignments, currentMemberId, onSelectClip,
}: {
  clips: ClipMeta[];
  people: Record<string, ClipPerson[]>;
  approvals: Record<string, Approval[]>;
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

  // Recent drops — the 6 most recently dropped clips of any type (video, tiktok link, idea)
  // This ensures fresh drops always have a visible home on the default tab
  const recentDrops = clips
    .filter((c) => c.status === "Dropped")
    .slice(0, 6);

  // My drops — clips this member submitted (so they can find and watch their own videos)
  const myDrops = clips
    .filter((c) => c.submitted_by === currentMemberId && (c.type === "video" || c.type === "final_cut" || c.type === "tiktok_link"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Recent Drops — fresh drops that haven't been planned yet, with embedded videos */}
      {recentDrops.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-2xl text-desert-night">📥 Recent Drops</h2>
            <span className="text-xs text-smoked-charcoal/50">{recentDrops.length} waiting to be planned</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDrops.map((clip) => (
              <button
                key={clip.id}
                onClick={() => onSelectClip(clip.id)}
                className="card overflow-hidden text-left hover:-translate-y-0.5 transition-transform"
              >
                {/* Video preview for uploaded videos */}
                {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                  <div className="bg-desert-night/5 max-h-[200px] overflow-hidden">
                    <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                  </div>
                )}
                {/* Embedded video for link drops — compact to keep card small */}
                {clip.type === "tiktok_link" && clip.link && (
                  <div className="bg-desert-night/5">
                    <SocialEmbed url={clip.link} title={clip.title} compact />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`chip !text-[9px] ${STATUS_CHIP[clip.status] ?? "chip-cream"}`}>{clip.status}</span>
                    {clip.type === "tiktok_link" && <span className="chip chip-teal !text-[9px]">{clip.link ? (linkPlatform(clip.link) ?? "Link") : "Link"}</span>}
                    {clip.type === "video" && <span className="chip chip-copper !text-[9px]">Video</span>}
                    {clip.type === "final_cut" && <span className="chip chip-copper !text-[9px]">Final Cut</span>}
                    {clip.category && <span className="chip chip-cream !text-[9px]">{clip.category}</span>}
                  </div>
                  <p className="font-bold text-desert-night text-sm leading-tight line-clamp-2">{displayTitle(clip)}</p>
                  <p className="text-xs text-smoked-charcoal/50 mt-1">{droppedByLabel(clip)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My Drops — clips this member submitted, with video playback */}
      {myDrops.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-2xl text-desert-night">🎬 My Drops</h2>
            <span className="text-xs text-smoked-charcoal/50">{myDrops.length} clip{myDrops.length > 1 ? "s" : ""} you dropped</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myDrops.map((clip) => (
              <button
                key={clip.id}
                onClick={() => onSelectClip(clip.id)}
                className="card overflow-hidden text-left hover:-translate-y-0.5 transition-transform"
              >
                {/* Video preview for uploaded videos */}
                {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                  <div className="bg-desert-night/5 max-h-[200px] overflow-hidden">
                    <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                  </div>
                )}
                {/* Embedded video for link drops */}
                {clip.type === "tiktok_link" && clip.link && (
                  <div className="bg-desert-night/5">
                    <SocialEmbed url={clip.link} title={clip.title} compact />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`chip !text-[9px] ${STATUS_CHIP[clip.status] ?? "chip-cream"}`}>{clip.status}</span>
                    {clip.type === "video" && <span className="chip chip-copper !text-[9px]">Video</span>}
                    {clip.type === "final_cut" && <span className="chip chip-copper !text-[9px]">Final Cut</span>}
                    {clip.type === "tiktok_link" && <span className="chip chip-teal !text-[9px]">Link</span>}
                  </div>
                  <p className="font-bold text-desert-night text-sm leading-tight line-clamp-2">{displayTitle(clip)}</p>
                  <p className="text-xs text-smoked-charcoal/50 mt-1">Tap to watch & edit →</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Your Part — assigned tasks (visual cards) */}
      {myAssignments.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-desert-night mb-1">Your Part</h2>
          <p className="text-sm text-smoked-charcoal/60 mb-3">{myAssignments.length} thing{myAssignments.length > 1 ? "s" : ""} you&apos;re on</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myAssignments.map((a) => {
              const clip = clips.find((c) => c.id === a.clip_id);
              const isOverdue = a.drop_by_date && new Date(a.drop_by_date) < now && a.status !== "Done" && a.status !== "Greenlit" && a.status !== "Dropped";
              // Mini timeline — only show deadlines that exist on the clip
              const miniDeadlines: { label: string; date: string }[] = [];
              if (clip?.clip_due_date) miniDeadlines.push({ label: "Drop-by", date: clip.clip_due_date });
              if (clip?.final_cut_due) miniDeadlines.push({ label: "Cut Ready", date: clip.final_cut_due });
              if (clip?.approval_due) miniDeadlines.push({ label: "Greenlight", date: clip.approval_due });
              if (clip?.scheduled_date) miniDeadlines.push({ label: "Goes Live", date: clip.scheduled_date });
              return (
                <div
                  key={a.id}
                  className={`card overflow-hidden flex flex-col ${isOverdue ? "border-2 border-heat-orange/40" : "border-2 border-copper-clay/30"}`}
                >
                  {/* Embedded video / link preview (if the clip has one) — compact to keep card small */}
                  {clip?.type === "tiktok_link" && clip.link && (
                    <div className="bg-desert-night/5">
                      <SocialEmbed url={clip.link} title={clip.title} compact />
                    </div>
                  )}
                  {/* Video player for uploaded videos — use object-contain so vertical videos aren't cropped */}
                  {clip?.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                    <div className="bg-desert-night/5">
                      <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                    </div>
                  )}

                  <div className="p-2 flex flex-col gap-1.5 flex-1">
                    {/* Status + platform chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`chip !text-[8px] !px-1.5 !py-0.5 ${ASSIGNMENT_STATUS_CHIP[a.status] ?? "chip-cream"}`}>{assignmentStatusLabel(a.status)}</span>
                      {clip && <span className={`chip !text-[8px] !px-1.5 !py-0.5 ${STATUS_CHIP[clip.status] ?? "chip-cream"}`}>{clip.status}</span>}
                      {clip?.type === "tiktok_link" && (
                        <span className="chip chip-teal !text-[8px] !px-1.5 !py-0.5">{clip.link ? (linkPlatform(clip.link) ?? "Link") : "Link"}</span>
                      )}
                      {clip?.type === "video" && <span className="chip chip-copper !text-[8px] !px-1.5 !py-0.5">Video</span>}
                      {clip?.type === "final_cut" && <span className="chip chip-copper !text-[8px] !px-1.5 !py-0.5">Final Cut</span>}
                      {clip?.category && <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">{clip.category}</span>}
                      {!a.is_required && <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">Optional</span>}
                    </div>

                    {/* Title — tap to open clip detail */}
                    <button onClick={() => onSelectClip(a.clip_id)} className="text-left min-w-0 group">
                      <p className="font-bold text-desert-night text-xs leading-tight line-clamp-2 group-hover:text-copper-deep">
                        {clip ? displayTitle(clip) : "Content item"}
                      </p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">Your role: {a.role}</p>
                    </button>

                    {/* Task title + notes */}
                    {a.task_title && <p className="text-xs text-desert-night leading-tight">{a.task_title}</p>}
                    {a.task_notes && <p className="text-[10px] text-smoked-charcoal/60 leading-tight">{a.task_notes}</p>}

                    {/* Mini timeline — compact deadline rows */}
                    {miniDeadlines.length > 0 && (
                      <div className="bg-sandstone-cream/40 rounded-lg p-1.5 space-y-0.5">
                        {miniDeadlines.map((d) => {
                          const past = new Date(d.date) < now;
                          return (
                            <div key={d.label} className="flex items-center justify-between text-[9px]">
                              <span className="text-smoked-charcoal/60 font-bold uppercase tracking-wide">{d.label}</span>
                              <span className={`font-bold ${past ? "text-heat-orange" : "text-copper-deep"}`}>
                                {past ? "⚠ " : ""}{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Your drop-by date */}
                    {a.drop_by_date && (
                      <p className={`text-[10px] font-bold ${isOverdue ? "text-heat-orange" : "text-copper-deep"}`}>
                        {isOverdue ? "⚠ Late — " : ""}Your drop-by: {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
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
                <p className="font-bold text-desert-night">{displayTitle(clip)}</p>
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
                    <p className="font-bold text-desert-night">{displayTitle(c)}</p>
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

      {/* Going live — with embedded videos for link drops */}
      {goingLive.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-desert-night mb-3">Going Live This Week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goingLive.map((c) => (
              <button key={c.id} onClick={() => onSelectClip(c.id)} className="card overflow-hidden text-left hover:-translate-y-0.5 transition-transform bg-cactus-teal/10">
                {/* Video player for uploaded videos, embed for link drops */}
                {c.file_path && (c.type === "video" || c.type === "final_cut") && (
                  <div className="bg-desert-night/5 max-h-[200px] overflow-hidden">
                    <VideoPlayer filePath={c.file_path} title={c.title} className="max-h-[200px] object-contain" />
                  </div>
                )}
                {c.type === "tiktok_link" && c.link && (
                  <div className="bg-desert-night/5">
                    <SocialEmbed url={c.link} title={c.title} compact />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-bold text-desert-night">{displayTitle(c)}</p>
                  <p className="text-xs text-cactus-teal font-black mt-1">
                    📅 {new Date(c.scheduled_date!).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  {c.destination && <span className="chip chip-teal !text-[10px] mt-2">📍 {c.destination}</span>}
                </div>
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
                  <p className="font-bold text-desert-night">{displayTitle(c)}</p>
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
      {upcomingDeadlines.length === 0 && goingLive.length === 0 && myApprovals.length === 0 && stuck.length === 0 && (
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
  trends, currentMemberId, currentMemberName, canPlanContent, isAdmin, onRefresh,
}: {
  trends: TrendRef[];
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
    });
    if (error) alert(error.message);
    setTitle(""); setUrl(""); setNotes(""); setPlatform("tiktok");
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
    // Use next Sunday as the default live date; other deadlines left blank for manual entry
    const liveDate = nextSunday();

    const { data: clip, error } = await supabase.from("clips").insert({
      title: `Quick Drop: ${trend.title}`,
      type: "tiktok_link",
      status: "Planned",
      link: trend.url,
      category: "Trends",
      submitted_by: currentMemberId,
      submitted_by_name: currentMemberName,
      scheduled_date: liveDate.toISOString(),
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
// ASSIGNMENT BOARD — admin/planner view of who's doing what
// ===========================================================================
function AssignmentBoardTab({
  clips, assignments, members, canPlanContent, currentMemberId, currentMemberName, onSelectClip, onRefresh,
}: {
  clips: ClipMeta[];
  assignments: Assignment[];
  members: Member[];
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
      const notifBody = `You're on "${clip ? displayTitle(clip) : "a clip"}" — ${assignForm.role}`;
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

            return (
              <div key={clip.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <button onClick={() => onSelectClip(clip.id)} className="text-left">
                      <h3 className="font-display text-xl text-desert-night hover:text-copper-deep transition-colors">{displayTitle(clip)}</h3>
                    </button>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`chip ${STATUS_CHIP[clip.status]} !text-[10px]`}>{clip.status}</span>
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
  clips, onSelectClip,
}: {
  clips: ClipMeta[];
  onSelectClip: (id: string) => void;
}) {
  // Show Live clips AND Dropped clips with videos — crew can watch each other's drops
  const watchableClips = clips
    .filter((c) => c.status === "Live" || ((c.type === "video" || c.type === "final_cut" || c.type === "tiktok_link") && (c.file_path || c.link)))
    .sort((a, b) => new Date(b.scheduled_date ?? b.updated_at).getTime() - new Date(a.scheduled_date ?? a.updated_at).getTime());
  const [filter, setFilter] = useState<"all" | "tiktok" | "instagram" | "youtube" | "facebook" | "dropped">("all");

  const filtered = filter === "all"
    ? watchableClips
    : filter === "dropped"
    ? watchableClips.filter((c) => c.status === "Dropped")
    : watchableClips.filter((c) => (c.destination ?? "").toLowerCase() === filter);

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

  if (watchableClips.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="inline-block"><MascotImage pose="shades" size={120} /></div>
        <p className="font-display text-2xl text-desert-night mt-4">No clips to watch yet.</p>
        <p className="text-smoked-charcoal/70 mt-2">
          When someone drops a video or a clip goes Live, it&apos;ll show up here.
        </p>
        <Link href="/portal/drop" className="btn btn-primary mt-6">Drop a clip →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-smoked-charcoal/70">
        Clips from the crew — dropped videos and posted content. Click to watch.
      </p>

      {/* Platform filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`chip !text-xs ${filter === "all" ? "chip-dark" : "chip-cream opacity-60 hover:opacity-100"}`}
        >All ({watchableClips.length})</button>
        {(["tiktok", "instagram", "youtube", "facebook"] as const).map((p) => {
          const count = watchableClips.filter((c) => (c.destination ?? "").toLowerCase() === p).length;
          if (count === 0) return null;
          return (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`chip !text-xs ${filter === p ? "chip-dark" : "chip-cream opacity-60 hover:opacity-100"}`}
            >{PLATFORM_LABEL[p]} ({count})</button>
          );
        })}
        {(() => {
          const droppedCount = watchableClips.filter((c) => c.status === "Dropped").length;
          if (droppedCount === 0) return null;
          return (
            <button
              onClick={() => setFilter("dropped")}
              className={`chip !text-xs ${filter === "dropped" ? "chip-dark" : "chip-cream opacity-60 hover:opacity-100"}`}
            >📥 Dropped ({droppedCount})</button>
          );
        })()}
      </div>

      {/* Clips grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((clip) => {
          const watchUrl = getWatchUrl(clip);
          const hasUploadedVideo = !!clip.file_path && (clip.type === "video" || clip.type === "final_cut");
          const isSocialLink = watchUrl && (isYouTubeLink(watchUrl) || isTikTokLink(watchUrl) || isInstagramLink(watchUrl) || isFacebookLink(watchUrl));
          return (
            <div key={clip.id} className="card overflow-hidden flex flex-col">
              {/* Video / embed area */}
              <div className="bg-desert-night/10 relative">
                {hasUploadedVideo ? (
                  <VideoPlayer filePath={clip.file_path!} title={clip.title} className="aspect-[9/16]" />
                ) : isSocialLink && watchUrl ? (
                  <div className="flex justify-center py-2">
                    <SocialEmbed url={watchUrl} title={clip.title} />
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
                  <h3 className="font-bold text-desert-night leading-tight hover:text-copper-deep transition-colors">{displayTitle(clip)}</h3>
                </button>
                <p className="text-xs text-smoked-charcoal/60 mt-1">by {clip.submitted_by_name}</p>

                {clip.scheduled_date && (
                  <p className="text-xs text-cactus-teal font-bold mt-2">
                    📅 {new Date(clip.scheduled_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}

                {watchUrl && !hasUploadedVideo && !isSocialLink && (
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-3 w-full">
                    Watch on {PLATFORM_LABEL[(clip.destination ?? "").toLowerCase()] ?? "platform"} →
                  </a>
                )}

                {/* Edit with libraries — for planners/admins */}
                <button onClick={() => onSelectClip(clip.id)} className="btn btn-ghost btn-sm !text-xs mt-2 w-full">
                  📚 Edit details & library items
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && watchableClips.length > 0 && (
        <div className="card p-6 text-center">
          <p className="text-smoked-charcoal/70">No clips on {PLATFORM_LABEL[filter]} yet.</p>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// PLANNER DASHBOARD — What's Stuck, Ready for Vanessa, Needs Planning
// ===========================================================================
function PlannerDashboard({
  clips, assignments, approvals, people, trends, members, isAdmin, canPlanContent, onSelectClip, onRefresh,
}: {
  clips: ClipMeta[];
  assignments: Assignment[];
  approvals: Record<string, Approval[]>;
  people: Record<string, ClipPerson[]>;
  trends: TrendRef[];
  members: Member[];
  isAdmin: boolean;
  canPlanContent: boolean;
  onSelectClip: (id: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const supabase = createClient();
  const now = new Date();

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

  // What's Moving — recent drops from the crew (uploaded videos AND link drops)
  // Shows the crew's latest drops so the planner can see them at a glance
  const recentLinkDrops = clips
    .filter((c) => c.status === "Dropped" && ((c.type === "tiktok_link" && c.link) || ((c.type === "video" || c.type === "final_cut") && c.file_path)))
    .slice(0, 6);

  async function sendReminder(assignment: Assignment) {
    const clip = clips.find((c) => c.id === assignment.clip_id);
    const member = members.find((m) => m.id === assignment.member_id);
    if (!clip || !member) return;
    await notifyMember(
      supabase,
      member.id,
      "reminder",
      `Reminder: "${displayTitle(clip)}" is waiting on you. Drop-by ${assignment.drop_by_date ? new Date(assignment.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "soon"}.`,
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
          {isAdmin ? "You have full access." : "You can plan and organize. Final say stays with the brand."}
        </p>
      </div>

      {/* In the Pipeline — ALL planned content with embedded videos */}
      {planningClips.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">📋 In the Pipeline</h3>
          <p className="text-sm text-smoked-charcoal/60 mb-3">Everything you&apos;ve planned. Tap any card to open the full detail.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {planningClips.map((clip) => {
              const clipAssignments = assignments.filter((a) => a.clip_id === clip.id);
              const hasCrew = clipAssignments.length > 0;
              return (
                <div
                  key={clip.id}
                  className="card overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform"
                >
                  {/* Video player for uploaded videos, embed for link drops */}
                  {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                    <div className="bg-desert-night/5">
                      <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[250px] object-contain" />
                    </div>
                  )}
                  {clip.type === "tiktok_link" && clip.link && (
                    <div className="bg-desert-night/5">
                      <SocialEmbed url={clip.link} title={clip.title} />
                    </div>
                  )}

                  <div className="p-3 flex flex-col gap-2 flex-1">
                    {/* Status + platform chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`chip !text-[9px] ${STATUS_CHIP[clip.status] ?? "chip-cream"}`}>{clip.status}</span>
                      {clip.type === "tiktok_link" && (
                        <span className="chip chip-teal !text-[9px]">{clip.link ? (linkPlatform(clip.link) ?? "Link") : "Link"}</span>
                      )}
                      {clip.type === "video" && <span className="chip chip-copper !text-[9px]">Video</span>}
                      {clip.type === "final_cut" && <span className="chip chip-copper !text-[9px]">Final Cut</span>}
                      {clip.category && <span className="chip chip-cream !text-[9px]">{clip.category}</span>}
                    </div>

                    {/* Title — tap to open */}
                    <button onClick={() => onSelectClip(clip.id)} className="text-left min-w-0 group">
                      <p className="font-bold text-desert-night text-sm leading-tight line-clamp-2 group-hover:text-copper-deep">
                        {displayTitle(clip)}
                      </p>
                    </button>

                    {/* Mini timeline */}
                    {(() => {
                      const miniDeadlines: { label: string; date: string }[] = [];
                      if (clip.clip_due_date) miniDeadlines.push({ label: "Drop-by", date: clip.clip_due_date });
                      if (clip.final_cut_due) miniDeadlines.push({ label: "Cut Ready", date: clip.final_cut_due });
                      if (clip.approval_due) miniDeadlines.push({ label: "Greenlight", date: clip.approval_due });
                      if (clip.scheduled_date) miniDeadlines.push({ label: "Goes Live", date: clip.scheduled_date });
                      if (miniDeadlines.length === 0) return null;
                      return (
                        <div className="bg-sandstone-cream/40 rounded-lg p-2 space-y-1">
                          {miniDeadlines.map((d) => {
                            const past = new Date(d.date) < now;
                            return (
                              <div key={d.label} className="flex items-center justify-between text-[10px]">
                                <span className="text-smoked-charcoal/60 font-bold uppercase tracking-wide">{d.label}</span>
                                <span className={`font-bold ${past ? "text-heat-orange" : "text-copper-deep"}`}>
                                  {past ? "⚠ " : ""}{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Crew assignment summary */}
                    <div className="flex items-center gap-1.5 mt-auto pt-1">
                      {hasCrew ? (
                        <>
                          <div className="flex -space-x-1.5">
                            {clipAssignments.slice(0, 3).map((a) => {
                              const cm = members.find((m) => m.id === a.member_id);
                              return (
                                <span key={a.id} className="w-6 h-6 rounded-full bg-copper-clay/30 flex items-center justify-center shrink-0 overflow-hidden border-2 border-sandstone-cream">
                                  {cm?.photo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={cm.photo_url} alt={cm?.name ?? a.member_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-display text-[8px] text-sandstone-cream">
                                      {(cm?.name ?? a.member_name).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-smoked-charcoal/60">
                            {clipAssignments.length} assigned
                          </span>
                        </>
                      ) : (
                        <span className="chip chip-cream !text-[9px]">No one assigned</span>
                      )}
                      {canPlanContent && (
                        <button
                          onClick={() => onSelectClip(clip.id)}
                          className="chip chip-dark !text-[9px] ml-auto hover:opacity-80"
                        >
                          + Assign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* What's Moving — recent link drops with embedded videos */}
      {recentLinkDrops.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">🔥 What&apos;s Moving</h3>
          <p className="text-sm text-smoked-charcoal/60 mb-3">Recent trend drops from the crew. Tap to open the full clip.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLinkDrops.map((clip) => {
              const dropper = members.find((m) => m.id === clip.submitted_by);
              return (
                <button
                  key={clip.id}
                  onClick={() => onSelectClip(clip.id)}
                  className="card overflow-hidden text-left hover:-translate-y-0.5 transition-transform"
                >
                  {/* Video player for uploaded videos, embed for link drops */}
                  <div className="bg-desert-night/5">
                    {clip.file_path && (clip.type === "video" || clip.type === "final_cut") ? (
                      <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[250px] object-contain" />
                    ) : clip.link ? (
                      <SocialEmbed url={clip.link} title={clip.title} />
                    ) : null}
                  </div>
                  {/* Info — with dropper's profile picture */}
                  <div className="p-3 flex items-center gap-2">
                    {/* Profile picture or initials */}
                    <span className="w-8 h-8 rounded-full bg-copper-clay/30 flex items-center justify-center shrink-0 overflow-hidden border-2 border-copper-clay/30">
                      {dropper?.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={dropper.photo_url} alt={clip.submitted_by_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-xs text-sandstone-cream">
                          {clip.submitted_by_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-desert-night text-sm truncate">{displayTitle(clip)}</p>
                      <p className="text-xs text-smoked-charcoal/60 mt-0.5 truncate">
                        {clip.submitted_by_name}
                        {clip.link && linkPlatform(clip.link) ? ` · ${linkPlatform(clip.link)}` : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* What's Stuck — overdue clips as visual cards */}
      {stuckClips.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">⚠ What&apos;s Stuck</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stuckClips.map((clip) => (
              <button
                key={clip.id}
                onClick={() => onSelectClip(clip.id)}
                className="card p-4 w-full text-left hover:-translate-y-0.5 transition-transform border-2 border-heat-orange/30"
              >
                {/* Video preview for uploaded videos, embed for link drops */}
                {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                  <div className="bg-desert-night/5 rounded-lg overflow-hidden mb-3 max-h-[200px]">
                    <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                  </div>
                )}
                {clip.type === "tiktok_link" && clip.link && (
                  <div className="bg-desert-night/5 rounded-lg overflow-hidden mb-3">
                    <SocialEmbed url={clip.link} title={clip.title} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night truncate">{displayTitle(clip)}</p>
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

      {/* Waiting on crew — assignments not yet dropped (visual cards) */}
      {waitingOn.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-desert-night mb-3">Waiting on crew</h3>
          {overdueAssignments.length > 0 && (
            <p className="text-sm text-heat-orange font-bold mb-2">
              {overdueAssignments.length} overdue — send reminders:
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {waitingOn.slice(0, 12).map((a) => {
              const clip = clips.find((c) => c.id === a.clip_id);
              const crewMember = members.find((m) => m.id === a.member_id);
              const isOverdue = a.drop_by_date && new Date(a.drop_by_date) < now;
              const crewInitials = (crewMember?.name ?? a.member_name).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              // Mini timeline — only show deadlines that exist on the clip
              const miniDeadlines: { label: string; date: string }[] = [];
              if (clip?.clip_due_date) miniDeadlines.push({ label: "Drop-by", date: clip.clip_due_date });
              if (clip?.final_cut_due) miniDeadlines.push({ label: "Cut Ready", date: clip.final_cut_due });
              if (clip?.approval_due) miniDeadlines.push({ label: "Greenlight", date: clip.approval_due });
              if (clip?.scheduled_date) miniDeadlines.push({ label: "Goes Live", date: clip.scheduled_date });
              return (
                <div
                  key={a.id}
                  className={`card overflow-hidden flex flex-col ${isOverdue ? "border-2 border-heat-orange/40" : ""}`}
                >
                  {/* Video player for uploaded videos, embed for link drops */}
                  {clip?.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                    <div className="bg-desert-night/5 max-h-[200px] overflow-hidden">
                      <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                    </div>
                  )}
                  {clip?.type === "tiktok_link" && clip.link && (
                    <div className="bg-desert-night/5">
                      <SocialEmbed url={clip.link} title={clip.title} />
                    </div>
                  )}

                  <div className="p-3 flex flex-col gap-2 flex-1">
                    {/* Status + platform chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {clip && <span className={`chip !text-[9px] ${STATUS_CHIP[clip.status] ?? "chip-cream"}`}>{clip.status}</span>}
                      {clip?.type === "tiktok_link" && (
                        <span className="chip chip-teal !text-[9px]">{clip.link ? (linkPlatform(clip.link) ?? "Link") : "Link"}</span>
                      )}
                      {clip?.category && <span className="chip chip-cream !text-[9px]">{clip.category}</span>}
                    </div>

                    {/* Title — tap to open clip detail */}
                    <button onClick={() => onSelectClip(a.clip_id)} className="text-left min-w-0 group">
                      <p className="font-bold text-desert-night text-sm leading-tight line-clamp-2 group-hover:text-copper-deep">
                        {clip ? displayTitle(clip) : "Content item"}
                      </p>
                    </button>

                    {/* Mini timeline — compact deadline rows */}
                    {miniDeadlines.length > 0 && (
                      <div className="bg-sandstone-cream/40 rounded-lg p-2 space-y-1">
                        {miniDeadlines.map((d) => {
                          const past = new Date(d.date) < now;
                          return (
                            <div key={d.label} className="flex items-center justify-between text-[10px]">
                              <span className="text-smoked-charcoal/60 font-bold uppercase tracking-wide">{d.label}</span>
                              <span className={`font-bold ${past ? "text-heat-orange" : "text-copper-deep"}`}>
                                {past ? "⚠ " : ""}{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Crew member waiting + remind button */}
                    <div className="flex items-center gap-2 mt-auto pt-1">
                      <span className="w-8 h-8 rounded-full bg-copper-clay/30 flex items-center justify-center shrink-0 overflow-hidden border-2 border-copper-clay/30">
                        {crewMember?.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={crewMember.photo_url} alt={crewMember?.name ?? a.member_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display text-[10px] text-sandstone-cream">{crewInitials}</span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-desert-night truncate">{crewMember?.name ?? a.member_name}</p>
                        <p className="text-[10px] text-smoked-charcoal/60 truncate">
                          {a.role}{a.drop_by_date && (
                            <span className={`ml-1 font-bold ${isOverdue ? "text-heat-orange" : "text-copper-deep"}`}>
                              {isOverdue ? "⚠ Late — " : ""}Drop-by {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
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
                      <button
                        onClick={() => onSelectClip(a.clip_id)}
                        className="chip chip-dark !text-[9px] shrink-0 hover:opacity-80"
                      >
                        + Assign
                      </button>
                    </div>
                  </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyForVanessa.map((clip) => {
              const clipApprovals = approvals[clip.id] ?? [];
              const approved = clipApprovals.filter((a) => a.status === "Approved" || a.status === "Approved With Edits").length;
              const total = clipApprovals.length;
              const allApproved = total > 0 && approved === total;
              return (
                <div key={clip.id} className="card p-3 flex flex-col gap-2">
                  {/* Video player for uploaded videos, embed for link drops */}
                  {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                    <div className="bg-desert-night/5 rounded-lg overflow-hidden max-h-[200px]">
                      <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                    </div>
                  )}
                  {clip.type === "tiktok_link" && clip.link && (
                    <div className="bg-desert-night/5 rounded-lg overflow-hidden">
                      <SocialEmbed url={clip.link} title={clip.title} />
                    </div>
                  )}
                  <button onClick={() => onSelectClip(clip.id)} className="text-left min-w-0 flex-1">
                    <p className="font-bold text-desert-night truncate">{displayTitle(clip)}</p>
                    <p className="text-xs text-smoked-charcoal/60 mt-0.5">
                      {allApproved ? "✅ All greenlit" : `${approved}/${total} greenlit`}
                    </p>
                  </button>
                  {allApproved && (
                    <button
                      onClick={() => moveToStatus(clip.id, "Scheduled")}
                      className="btn btn-primary btn-sm !text-xs shrink-0 w-full"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Trends waiting for review — visual cards with embedded videos */}
            {needsPlanningTrends.slice(0, 6).map((trend) => (
              <button
                key={trend.id}
                onClick={() => onSelectClip(trend.id)}
                className="card overflow-hidden text-left hover:-translate-y-0.5 transition-transform"
              >
                {trend.url && (
                  <div className="bg-desert-night/5">
                    <SocialEmbed url={trend.url} title={trend.title} />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-desert-night text-sm truncate">{trend.title}</p>
                  <p className="text-xs text-smoked-charcoal/60 mt-0.5 truncate">
                    {trend.submitted_by_name}
                    {trend.platform ? ` · ${trend.platform}` : ""}
                  </p>
                  <span className="chip chip-yellow !text-[9px] mt-2">Trend waiting for review</span>
                </div>
              </button>
            ))}
            {/* No one assigned — visual cards with embedded videos */}
            {clipsWithoutAssignments.slice(0, 6).map((clip) => (
              <button
                key={clip.id}
                onClick={() => onSelectClip(clip.id)}
                className="card overflow-hidden text-left hover:-translate-y-0.5 transition-transform border-2 border-copper-clay/20"
              >
                {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
                  <div className="bg-desert-night/5 max-h-[200px] overflow-hidden">
                    <VideoPlayer filePath={clip.file_path} title={clip.title} className="max-h-[200px] object-contain" />
                  </div>
                )}
                {clip.type === "tiktok_link" && clip.link && (
                  <div className="bg-desert-night/5">
                    <SocialEmbed url={clip.link} title={clip.title} />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-desert-night text-sm truncate">{displayTitle(clip)}</p>
                  <p className="text-xs text-smoked-charcoal/60 mt-1">
                    {clip.category ? `${clip.category} · ` : ""}Status: {clip.status}
                  </p>
                  <span className="chip chip-cream !text-[9px] mt-2">No one assigned</span>
                </div>
              </button>
            ))}
          </div>
          {needsPlanningTrends.length > 6 && (
            <button
              onClick={() => onSelectClip(needsPlanningTrends[0].id)}
              className="btn btn-secondary btn-sm !text-xs mt-3"
            >
              See all {needsPlanningTrends.length} trends →
            </button>
          )}
        </section>
      )}

      {/* Nothing to plan */}
      {planningClips.length === 0 && stuckClips.length === 0 && waitingOn.length === 0 && readyForVanessa.length === 0 && needsPlanningTrends.length === 0 && clipsWithoutAssignments.length === 0 && recentLinkDrops.length === 0 && (
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
function AddContentForm({
  member,
  members,
  onCreated,
}: {
  member?: Member;
  members: Member[];
  onCreated: () => Promise<void>;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exampleLink, setExampleLink] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [liveDate, setLiveDate] = useState<string>(() => nextSunday().toISOString().slice(0, 10));
  const [submittedBy, setSubmittedBy] = useState<string>("");
  const [cutReadyBy, setCutReadyBy] = useState<string>("");
  const [greenlightBy, setGreenlightBy] = useState<string>("");

  async function create() {
    if (!member || !title.trim()) return;
    setCreating(true);

    const { data: clip, error } = await supabase.from("clips").insert({
      title: title.trim(),
      type: exampleLink.trim() && /^https?:\/\//i.test(exampleLink.trim()) ? "tiktok_link" : "video",
      status: "Planned",
      link: exampleLink.trim() || null,
      idea_text: description.trim() || null,
      submitted_by: member.id,
      submitted_by_name: member.name,
      clip_due_date: submittedBy || null,
      final_cut_due: cutReadyBy || null,
      approval_due: greenlightBy || null,
      scheduled_date: liveDate || null,
    }).select().single();

    if (error || !clip) {
      alert(error?.message ?? "Could not create content");
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
          drop_by_date: submittedBy || null,
          is_required: true,
          created_by: member.id,
        };
      });
      await supabase.from("content_assignments").insert(assignmentInserts);
      const dropLabel = submittedBy
        ? ` — Drop-by ${new Date(submittedBy + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
        : "";
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${title.trim()}"${dropLabel}`, "/portal/drop")
      ));
    }

    await onCreated();
    setCreating(false);
  }

  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-display text-2xl text-desert-night">Add Content</h2>

      {/* Title */}
      <div>
        <p className="label">Title <span className="font-normal text-desert-night/40">(what&apos;s the content?)</span></p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. React to this TikTok trend"
          className="field w-full"
          autoFocus
        />
      </div>

      {/* Description / brief */}
      <div>
        <p className="label">Brief <span className="font-normal text-desert-night/40">(what they need to do, how long, any instructions)</span></p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Each person records a 15-second reaction. Keep it under 2 minutes total. Be expressive — don't hold back."
          className="field w-full min-h-[100px]"
        />
      </div>

      {/* Example clip link */}
      <div>
        <p className="label">Example clip link <span className="font-normal text-desert-night/40">(optional — paste a TikTok, Instagram, YouTube, etc.)</span></p>
        <input
          type="text"
          value={exampleLink}
          onChange={(e) => setExampleLink(e.target.value)}
          placeholder="https://www.tiktok.com/@user/video/123..."
          className="field w-full"
        />
        {exampleLink.trim() && /^https?:\/\//i.test(exampleLink.trim()) && (
          <div className="mt-2 bg-desert-night/5 rounded-lg overflow-hidden">
            <SocialEmbed url={exampleLink.trim()} title={title || "Example"} />
          </div>
        )}
      </div>

      {/* Deadline dates — all manual */}
      <div>
        <p className="label">Deadlines <span className="font-normal text-desert-night/40">(set the dates you want)</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div>
            <p className="text-xs font-bold text-desert-night/50 mb-1">Submitted by</p>
            <input type="date" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} className="field w-full" />
          </div>
          <div>
            <p className="text-xs font-bold text-desert-night/50 mb-1">Cut ready by</p>
            <input type="date" value={cutReadyBy} onChange={(e) => setCutReadyBy(e.target.value)} className="field w-full" />
          </div>
          <div>
            <p className="text-xs font-bold text-desert-night/50 mb-1">Greenlight by</p>
            <input type="date" value={greenlightBy} onChange={(e) => setGreenlightBy(e.target.value)} className="field w-full" />
          </div>
          <div>
            <p className="text-xs font-bold text-desert-night/50 mb-1">Goes live by</p>
            <input type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} className="field w-full" />
          </div>
        </div>
      </div>

      {/* Crew assignment */}
      {members.length > 0 && (
        <div>
          <p className="label">Assign crew <span className="font-normal text-desert-night/40">(optional — tap to select)</span></p>
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
      <button onClick={create} disabled={creating || !title.trim()} className="btn btn-primary btn-lg w-full">
        {creating ? "Posting…" : "Post it"}
      </button>
    </div>
  );
}
