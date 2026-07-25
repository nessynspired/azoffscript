"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import type { Database, ClipStatus } from "@/lib/types/db";

type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];
type ClipPerson = Database["public"]["Tables"]["clip_people"]["Row"];
type Approval = Database["public"]["Tables"]["approvals"]["Row"];

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

export default function RunSheetPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [people, setPeople] = useState<Record<string, ClipPerson[]>>({});
  const [approvals, setApprovals] = useState<Record<string, Approval[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"production" | "ideas" | "all">("production");
  const [view, setView] = useState<"flow" | "calendar">("flow");
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: clipData, error } = await supabase
      .from("clips_with_meta")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[run-sheet] clips_with_meta query failed:", error.message);
      setLoadError(error.message);
      setLoading(false);
      return;
    }
    setLoadError(null);

    const clips = clipData ?? [];
    setClips(clips);

    if (clips.length > 0) {
      const clipIds = clips.map((c) => c.id);
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
    // realtime: refresh when clips/approvals change
    const channel = supabase
      .channel("run-sheet")
      .on("postgres_changes", { event: "*", schema: "public", table: "clips" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "clip_people" }, () => load())
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
    await load();
  }

  async function deleteClip(clipId: string) {
    if (member?.role !== "admin") return;
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
  const ideaClips = clips.filter((c) => c.type === "tiktok_link" || c.type === "idea");
  const displayClips = tab === "production" ? productionClips : tab === "ideas" ? ideaClips : clips;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">The Run Sheet</h1>
          <p className="text-smoked-charcoal/70 mt-2 text-lg">This is what&apos;s moving next.</p>
        </div>
      </div>

      {/* Tab bar — Production vs Ideas vs All */}
      <div className="flex gap-2 bg-desert-night/10 rounded-full p-1 w-fit">
        <button
          onClick={() => setTab("production")}
          className={`px-4 py-2 rounded-full text-sm font-black uppercase ${tab === "production" ? "bg-desert-night text-sunburst-yellow" : "text-desert-night"}`}
        >Production ({productionClips.length})</button>
        <button
          onClick={() => setTab("ideas")}
          className={`px-4 py-2 rounded-full text-sm font-black uppercase ${tab === "ideas" ? "bg-desert-night text-sunburst-yellow" : "text-desert-night"}`}
        >Ideas & Links ({ideaClips.length})</button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-full text-sm font-black uppercase ${tab === "all" ? "bg-desert-night text-sunburst-yellow" : "text-desert-night"}`}
        >All ({clips.length})</button>
      </div>

      {/* Sub-view toggle: Flow vs Calendar (only for production/all) */}
      {(tab === "production" || tab === "all") && displayClips.length > 0 && (
        <div className="flex gap-2 bg-desert-night/5 rounded-full p-1 w-fit">
          <button
            onClick={() => setView("flow")}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${view === "flow" ? "bg-copper-clay text-sandstone-cream" : "text-desert-night"}`}
          >Studio Flow</button>
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${view === "calendar" ? "bg-copper-clay text-sandstone-cream" : "text-desert-night"}`}
          >Calendar</button>
        </div>
      )}

      {displayClips.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="inline-block"><MascotImage pose="main" size={120} /></div>
          <p className="font-display text-2xl text-desert-night mt-4">
            {tab === "production" ? "No videos in production yet." : tab === "ideas" ? "No ideas or links yet." : "Nothing dropped yet."}
          </p>
          <p className="text-smoked-charcoal/70 mt-2">
            {tab === "production" ? "Drop a video to start the assembly line." : "Be the first to toss something in."}
          </p>
          <Link href="/portal/drop" className="btn btn-primary mt-6">Drop a Clip</Link>
        </div>
      ) : tab === "ideas" ? (
        /* IDEAS & LINKS — simple list, no pipeline */
        <div className="space-y-3">
          {ideaClips.map((clip) => (
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
      ) : view === "flow" ? (
        /* PRODUCTION / ALL — Kanban pipeline */
        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div className="flex gap-4 min-w-max">
            {STUDIO_FLOW.map((status) => {
              const colClips = displayClips.filter((c) => c.status === status);
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
      ) : (
        <CalendarView clips={displayClips} />
      )}

      {selectedClip && (
        <ClipDetailModal
          clip={clips.find((c) => c.id === selectedClip)!}
          people={people[selectedClip] ?? []}
          approvals={approvals[selectedClip] ?? []}
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
        <h3 className="font-bold text-desert-night leading-tight">{clip.title}</h3>
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

function CalendarView({ clips }: { clips: ClipMeta[] }) {
  const scheduled = clips.filter((c) => c.scheduled_date || c.clip_due_date || c.approval_due || c.idea_due_date || c.final_cut_due || c.due_date);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {days.map((day) => {
        const dayClips = scheduled.filter((c) => {
          const dates = [c.scheduled_date, c.clip_due_date, c.approval_due, c.idea_due_date, c.final_cut_due, c.due_date].filter(Boolean);
          return dates.some((d) => new Date(d!).toDateString() === day.toDateString());
        });
        return (
          <div key={day.toISOString()} className="card p-3 min-h-[120px]">
            <p className="font-display text-sm text-desert-night">
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </p>
            <p className="text-xs text-smoked-charcoal/60">{day.getDate()}</p>
            <div className="space-y-2 mt-2">
              {dayClips.map((c) => (
                <div key={c.id} className="bg-copper-clay/15 rounded-lg p-2">
                  <p className="text-xs font-bold text-desert-night leading-tight">{c.title}</p>
                  <span className={`chip ${STATUS_CHIP[c.status]} !text-[9px] !py-0.5 mt-1`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {scheduled.length === 0 && (
        <div className="md:col-span-7 card p-6 text-center text-smoked-charcoal/60">
          Nothing scheduled yet. Move a clip to Scheduled from the Studio Flow.
        </div>
      )}
    </div>
  );
}

function ClipDetailModal({
  clip, people, approvals, isAdmin, canPlanContent, currentMemberId, currentMemberName, onClose, onStatusChange, onDelete, onRefresh,
}: {
  clip: ClipMeta;
  people: ClipPerson[];
  approvals: Approval[];
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
      body: `${currentMemberName ?? "Someone"} ${status === "Approved" ? "greenlit" : status === "Do Not Post" ? "said do not post" : "reviewed"} "${clip.title}"`,
    });
    await onRefresh();
    setWorking(false);
  }

  // silence unused warning for onStatusChange when not admin
  void onStatusChange;

  return (
    <div className="fixed inset-0 z-50 bg-desert-night/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`chip ${STATUS_CHIP[clip.status]}`}>{clip.status}</span>
            <h2 className="font-display text-3xl text-desert-night mt-2 leading-none">{clip.title}</h2>
            <p className="text-sm text-smoked-charcoal/60 mt-1">dropped by {clip.submitted_by_name}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">✕</button>
        </div>

        {clip.link && (
          <a href={clip.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-4">
            Open link →
          </a>
        )}
        {clip.idea_text && <p className="mt-4 text-smoked-charcoal bg-sandstone-cream/50 rounded-xl p-4">{clip.idea_text}</p>}
        {clip.caption && <p className="mt-4 font-script text-xl text-desert-night">{clip.caption}</p>}
        {clip.do_not_post_notes && (
          <div className="mt-4 bg-copper-deep/15 border border-copper-clay rounded-xl p-3">
            <p className="text-xs font-black uppercase text-copper-deep">Do not post notes</p>
            <p className="text-sm text-desert-night mt-1">{clip.do_not_post_notes}</p>
          </div>
        )}

        {/* Weekly Heat — deadlines with branded language */}
        {(clip.idea_due_date || clip.clip_due_date || clip.final_cut_due || clip.approval_due || clip.scheduled_date || canPlanContent) && (
          <div className="mt-6 card p-4 bg-sandstone-cream/50">
            <h3 className="font-display text-xl text-desert-night mb-3">Weekly Heat</h3>
            <div className="space-y-2">
              <DeadlineRow label="Drop-by (ideas)" value={clip.idea_due_date} canEdit={canPlanContent} fieldName="idea_due_date" deadlines={deadlines} setDeadlines={setDeadlines} />
              <DeadlineRow label="Send your clip by" value={clip.clip_due_date} canEdit={canPlanContent} fieldName="clip_due_date" deadlines={deadlines} setDeadlines={setDeadlines} />
              <DeadlineRow label="Send your final by" value={clip.final_cut_due} canEdit={canPlanContent} fieldName="final_cut_due" deadlines={deadlines} setDeadlines={setDeadlines} />
              <DeadlineRow label="Greenlight by" value={clip.approval_due} canEdit={canPlanContent} fieldName="approval_due" deadlines={deadlines} setDeadlines={setDeadlines} />
              <DeadlineRow label="Goes live" value={clip.scheduled_date} canEdit={canPlanContent} fieldName="scheduled_date" deadlines={deadlines} setDeadlines={setDeadlines} />
            </div>
            {canPlanContent && (
              <button onClick={saveDeadlines} className="btn btn-primary btn-sm mt-3" disabled={savingDeadlines}>
                {savingDeadlines ? "Saving…" : "Save Deadlines"}
              </button>
            )}
          </div>
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
                <button
                  onClick={() => onStatusChange(clip.id, "Do Not Post")}
                  className="chip chip-danger"
                >Do Not Post</button>
              </div>
            </div>
            {/* Delete is admin-only */}
            {isAdmin && (
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
