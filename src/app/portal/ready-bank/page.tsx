"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyMember } from "@/lib/notify";
import {
  QUICK_DROP_TEMPLATES,
  CONTENT_BUCKETS,
  getTemplatesByBucket,
  type QuickDropTemplate,
  type EffortLabel,
} from "@/lib/quick-drop-templates";
import { calcDeadlinesFromLive, nextSunday } from "@/lib/plan-defaults";
import type { Database } from "@/lib/types/db";

type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name" | "nickname" | "role" | "can_plan_content">;
type Idea = Database["public"]["Tables"]["ideas"]["Row"];

// Filter chips
const EFFORT_FILTERS: EffortLabel[] = ["2-Min Drop", "5-Min Drop", "10-Min Drop", "Group Day", "Edit Heavy"];
const TAG_FILTERS = [
  { id: "homeFriendly", label: "Home-Friendly" },
  { id: "noTalking", label: "No Talking Needed" },
  { id: "transition", label: "Transition" },
  { id: "arizona", label: "Arizona" },
  { id: "groupDay", label: "Group Day" },
  { id: "editHeavy", label: "Edit Heavy" },
];

export default function ReadyBankPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [plannedIdeas, setPlannedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [effortFilter, setEffortFilter] = useState<string | null>(null);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [bucketFilter, setBucketFilter] = useState<string | null>(null);

  // Saved templates (localStorage bookmarks)
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Action modal
  const [actionTemplate, setActionTemplate] = useState<QuickDropTemplate | null>(null);
  const [actionMode, setActionMode] = useState<"week" | "date" | "assign" | null>(null);
  const [liveDate, setLiveDate] = useState<string>("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const isPlanner = member?.role === "admin" || member?.can_plan_content === true;

  const load = useCallback(async () => {
    if (!member) { setLoading(false); return; }
    const [membersRes, ideasRes] = await Promise.all([
      supabase.from("members").select("id, name, nickname, role, can_plan_content").order("name"),
      supabase.from("ideas").select("*").eq("status", "Planned").order("updated_at", { ascending: false }),
    ]);
    setMembers(membersRes.data ?? []);
    setPlannedIdeas(ideasRes.data ?? []);
    setLoading(false);
  }, [supabase, member]);

  useEffect(() => {
    load();
    // Load saved bookmarks from localStorage
    const saved = localStorage.getItem("ready-bank-saved");
    if (saved) setSavedIds(JSON.parse(saved));
  }, [load]);

  function toggleSaved(id: string) {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("ready-bank-saved", JSON.stringify(next));
      return next;
    });
  }

  function openAction(template: QuickDropTemplate, mode: "week" | "date" | "assign") {
    setActionTemplate(template);
    setActionMode(mode);
    const sun = nextSunday();
    setLiveDate(sun.toISOString().slice(0, 10));
    setSelectedCrew([]);
  }

  function closeAction() {
    setActionTemplate(null);
    setActionMode(null);
    setSelectedCrew([]);
  }

  async function createClip() {
    if (!actionTemplate || !member || !liveDate) return;
    setCreating(true);
    const deadlines = calcDeadlinesFromLive(new Date(liveDate + "T12:00:00"));

    const { data: clip, error } = await supabase.from("clips").insert({
      title: actionTemplate.name,
      type: "video",
      status: "Planned",
      category: actionTemplate.bucket,
      submitted_by: member.id,
      submitted_by_name: member.name,
      template_id: actionTemplate.id,
      destination: actionTemplate.platforms[0] ?? null,
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

    // Assign crew if selected
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
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${actionTemplate.name}" — Drop-by ${new Date(deadlines.clip_due_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`, "/portal/drop")
      ));
    }

    setCreating(false);
    closeAction();
    alert(`"${actionTemplate.name}" added to the calendar!`);
  }

  // Filter templates
  const filteredTemplates = QUICK_DROP_TEMPLATES.filter((t) => {
    if (effortFilter && t.effort !== effortFilter) return false;
    if (bucketFilter && t.bucket !== bucketFilter) return false;
    if (tagFilters.includes("homeFriendly") && !t.homeFriendly) return false;
    if (tagFilters.includes("noTalking") && t.needsTalking) return false;
    if (tagFilters.includes("transition") && t.bucket !== "Transitions") return false;
    if (tagFilters.includes("arizona") && !t.bucket.includes("Arizona") && t.bucket !== "Arizona Moments") return false;
    if (tagFilters.includes("groupDay") && t.effort !== "Group Day") return false;
    if (tagFilters.includes("editHeavy") && !t.needsEditing) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.bucket.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-pulse-slow text-4xl">🏦</div>
        <p className="font-display text-2xl text-desert-night">Loading the Ready Bank…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Ready Bank</h1>
        <p className="text-smoked-charcoal/70 mt-2">
          Vetted ideas and formats ready to pull into the calendar. Not posted. Not filmed. Just ready to plan.
        </p>
      </div>

      {/* Flow explanation */}
      <div className="card p-4 bg-sandstone-cream/50">
        <div className="flex flex-wrap items-center gap-2 text-sm text-smoked-charcoal/70">
          <Link href="/portal/sparks" className="chip chip-cream hover:chip-copper transition-colors">Spark Board</Link>
          <span>→</span>
          <span className="chip chip-copper">Ready Bank</span>
          <span>→</span>
          <Link href="/portal/run-sheet" className="chip chip-cream hover:chip-copper transition-colors">Run Sheet</Link>
          <span>→</span>
          <span className="chip chip-teal">Greenlit</span>
        </div>
        <p className="text-xs text-smoked-charcoal/50 mt-2">
          Spark Board = messy ideas · Ready Bank = usable ideas · Run Sheet = scheduled ideas · Greenlit = approved final clips
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category, or description..."
          className="field"
        />

        {/* Effort filters */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Effort</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEffortFilter(null)}
              className={`chip !text-xs ${!effortFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {EFFORT_FILTERS.map((e) => (
              <button
                key={e}
                onClick={() => setEffortFilter(e === effortFilter ? null : e)}
                className={`chip !text-xs ${effortFilter === e ? "chip-copper" : "chip-cream"}`}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-2">
            {TAG_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTagFilters(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])}
                className={`chip !text-xs ${tagFilters.includes(f.id) ? "chip-copper" : "chip-cream"}`}
              >{f.label}</button>
            ))}
          </div>
        </div>

        {/* Bucket filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setBucketFilter(null)}
              className={`chip !text-[10px] ${!bucketFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {CONTENT_BUCKETS.map((b) => {
              const count = getTemplatesByBucket(b).length;
              if (count === 0) return null;
              return (
                <button
                  key={b}
                  onClick={() => setBucketFilter(b === bucketFilter ? null : b)}
                  className={`chip !text-[10px] ${bucketFilter === b ? "chip-copper" : "chip-cream"}`}
                >{b}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-smoked-charcoal/60">
        {filteredTemplates.length} {filteredTemplates.length === 1 ? "format" : "formats"} ready to schedule
      </p>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((t) => (
          <ReadyBankCard
            key={t.id}
            template={t}
            isSaved={savedIds.includes(t.id)}
            isPlanner={isPlanner}
            onToggleSave={() => toggleSaved(t.id)}
            onAddToWeek={() => openAction(t, "week")}
            onAddToDate={() => openAction(t, "date")}
            onAssignCrew={() => openAction(t, "assign")}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No formats match those filters.</p>
          <button
            onClick={() => { setEffortFilter(null); setTagFilters([]); setBucketFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}

      {/* Planned ideas from Spark Board */}
      {plannedIdeas.length > 0 && (
        <section className="pt-6">
          <h2 className="font-display text-2xl text-desert-night mb-3">From the Spark Board</h2>
          <p className="text-sm text-smoked-charcoal/60 mb-4">Ideas promoted from the Spark Board, ready to schedule.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedIdeas.map((idea) => (
              <div key={idea.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg text-desert-night">{idea.title}</p>
                  <span className="chip chip-teal !text-[9px]">Planned</span>
                </div>
                {idea.notes && <p className="text-sm text-smoked-charcoal/70">{idea.notes}</p>}
                {idea.category && <span className="chip chip-cream !text-[10px]">{idea.category}</span>}
                {isPlanner && (
                  <Link href="/portal/run-sheet" className="btn btn-primary btn-sm !text-xs block text-center mt-2">
                    Add to Calendar →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action modal */}
      {actionTemplate && actionMode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeAction}>
          <div className="bg-sandstone-cream rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-desert-night">{actionTemplate.name}</h2>
              <button onClick={closeAction} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
            </div>

            {actionMode === "week" && (
              <div className="space-y-3">
                <p className="text-sm text-smoked-charcoal/70">
                  This will create a Planned clip with deadlines auto-set for next Sunday.
                </p>
                <p className="text-xs text-smoked-charcoal/50">
                  Drop-by 3 days before · Cut ready 2 days before · Greenlight 1 day before · Goes live Sunday
                </p>
              </div>
            )}

            {actionMode === "date" && (
              <div className="space-y-3">
                <p className="label">Goes live date</p>
                <input
                  type="date"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="field !w-auto"
                />
                {liveDate && (
                  <p className="text-xs text-smoked-charcoal/50">
                    Drop-by {new Date(liveDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
            )}

            {actionMode === "assign" && (
              <div className="space-y-3">
                <p className="label">Goes live date</p>
                <input
                  type="date"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="field !w-auto"
                />
                <p className="label">Assign crew</p>
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

            <button
              onClick={createClip}
              disabled={creating || !liveDate}
              className="btn btn-primary btn-lg w-full"
            >
              {creating ? "Creating…" : `Add "${actionTemplate.name}" to calendar`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadyBankCard({
  template, isSaved, isPlanner, onToggleSave, onAddToWeek, onAddToDate, onAssignCrew,
}: {
  template: QuickDropTemplate;
  isSaved: boolean;
  isPlanner: boolean;
  onToggleSave: () => void;
  onAddToWeek: () => void;
  onAddToDate: () => void;
  onAssignCrew: () => void;
}) {
  return (
    <div className="card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg text-desert-night">{template.name}</p>
          <p className="text-xs text-smoked-charcoal/50 mt-0.5">{template.bucket}</p>
        </div>
        <button onClick={onToggleSave} className="text-2xl shrink-0" title={isSaved ? "Saved" : "Save for later"}>
          {isSaved ? "🔖" : "📑"}
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="chip chip-cream !text-[9px]">{template.effort}</span>
        {template.homeFriendly && <span className="chip chip-cream !text-[9px]">🏠 Home</span>}
        {!template.needsTalking && <span className="chip chip-cream !text-[9px]">🤫 No talking</span>}
        {template.needsEditing && <span className="chip chip-cream !text-[9px]">✂️ Edit</span>}
        {template.adminStitches && <span className="chip chip-cream !text-[9px]">🔗 Stitch</span>}
      </div>

      {/* Description */}
      <p className="text-sm text-smoked-charcoal/70">{template.description}</p>

      {/* SEO phrase */}
      <div className="bg-cactus-teal/10 rounded-lg p-2">
        <p className="text-xs font-bold text-desert-night/50 uppercase">Search phrase</p>
        <p className="text-sm text-desert-night font-bold">&ldquo;{template.seoPhrase}&rdquo;</p>
      </div>

      {/* Caption + hashtags */}
      <div className="space-y-1">
        <p className="text-xs font-bold text-desert-night/50 uppercase">Caption starter</p>
        <p className="text-sm text-desert-night">{template.captionStarter}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {template.hashtagStarter.map((tag) => (
            <span key={tag} className="text-[10px] text-copper-deep">{tag} </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      {isPlanner ? (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-desert-night/10">
          <button onClick={onAddToWeek} className="btn btn-primary btn-sm !text-xs">Add to This Week</button>
          <button onClick={onAddToDate} className="btn btn-secondary btn-sm !text-xs">Add to Date</button>
          <button onClick={onAssignCrew} className="btn btn-secondary btn-sm !text-xs">Assign Crew</button>
          <button onClick={onToggleSave} className="btn btn-ghost btn-sm !text-xs">{isSaved ? "Saved" : "Save Later"}</button>
        </div>
      ) : (
        <div className="pt-2 border-t border-desert-night/10">
          <button onClick={onToggleSave} className="btn btn-ghost btn-sm !text-xs w-full">{isSaved ? "🔖 Saved" : "Save for later"}</button>
        </div>
      )}
    </div>
  );
}
