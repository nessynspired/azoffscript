"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyMember } from "@/lib/notify";
import {
  QUICK_DROP_TEMPLATES,
  CONTENT_BUCKETS,
  TOPIC_WORLDS,
  getTemplatesByBucket,
  type QuickDropTemplate,
  type EffortLabel,
  type TopicWorld,
} from "@/lib/quick-drop-templates";
import {
  OFF_SCRIPT_BY_TEMPLATE_ID,
  SCRIPT_LAYER_FILTERS,
  type OffScriptVersion,
} from "@/lib/off-script-versions";
import {
  FULL_READY_RECIPES,
  fullReadyRecipeToClipRecipe,
  type FullReadyRecipe,
  type RecipeVersion,
} from "@/lib/full-ready-recipes";
import { nextSunday } from "@/lib/plan-defaults";
import { InfoTooltip } from "@/components/InfoTooltip";
import { CalendarBuilder } from "@/components/CalendarBuilder";
import { FullReadyRecipeDetail, FullReadyRecipeCard } from "@/components/FullReadyRecipeDetail";
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
  const [topicWorldFilter, setTopicWorldFilter] = useState<TopicWorld | null>(null);
  const [versionFilter, setVersionFilter] = useState<"current" | "offscript" | "both">("current");
  const [scriptLayerFilters, setScriptLayerFilters] = useState<string[]>([]);

  // Saved templates (localStorage bookmarks)
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // View toggle — List vs Calendar Builder
  const [viewMode, setViewMode] = useState<"list" | "builder">("list");

  // Library toggle — Quick Formats vs Full Ready Recipes
  // Default to "full" so planners land on the complete recipe library with all steps.
  const [libraryMode, setLibraryMode] = useState<"quick" | "full">("full");

  // Full Ready Recipe detail modal
  const [detailRecipe, setDetailRecipe] = useState<FullReadyRecipe | null>(null);

  // When planning from a Full Ready Recipe, we store it here so createClip
  // can copy the full recipe content into the clip's recipe field.
  // This is a per-clip COPY — the master library is never modified.
  const [pendingFullRecipe, setPendingFullRecipe] = useState<FullReadyRecipe | null>(null);

  // Full Ready Recipe filters
  const [fullSearch, setFullSearch] = useState("");
  const [fullVersionFilter, setFullVersionFilter] = useState<"all" | RecipeVersion>("all");
  const [fullCategoryFilter, setFullCategoryFilter] = useState<string | null>(null);
  const [fullEffortFilter, setFullEffortFilter] = useState<string | null>(null);
  const [fullDifficultyFilter, setFullDifficultyFilter] = useState<string | null>(null);

  // Action modal
  const [actionTemplate, setActionTemplate] = useState<QuickDropTemplate | null>(null);
  const [actionMode, setActionMode] = useState<"week" | "date" | "assign" | null>(null);
  const [liveDate, setLiveDate] = useState<string>("");
  const [submittedBy, setSubmittedBy] = useState<string>("");
  const [cutReadyBy, setCutReadyBy] = useState<string>("");
  const [greenlightBy, setGreenlightBy] = useState<string>("");
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
    setSubmittedBy("");
    setCutReadyBy("");
    setGreenlightBy("");
    setPendingFullRecipe(null);
  }

  async function createClip() {
    if (!actionTemplate || !member || !liveDate) return;
    setCreating(true);

    // If planning from a Full Ready Recipe, copy its content into the clip's recipe.
    // This is a per-clip COPY — the master library (FULL_READY_RECIPES) is never modified.
    const recipePayload = pendingFullRecipe
      ? fullReadyRecipeToClipRecipe(pendingFullRecipe)
      : null;

    const clipInsert = {
      title: actionTemplate.name,
      type: "video" as const,
      status: "Planned" as const,
      category: actionTemplate.bucket,
      submitted_by: member.id,
      submitted_by_name: member.name,
      template_id: actionTemplate.id,
      destination: actionTemplate.platforms[0] ?? null,
      clip_due_date: submittedBy || null,
      final_cut_due: cutReadyBy || null,
      approval_due: greenlightBy || null,
      scheduled_date: liveDate || null,
      ...(recipePayload ? { recipe: recipePayload } : {}),
    };

    const { data: clip, error } = await supabase.from("clips").insert(clipInsert).select().single();

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
          drop_by_date: submittedBy || null,
          is_required: true,
          created_by: member.id,
        };
      });
      await supabase.from("content_assignments").insert(assignmentInserts);
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${actionTemplate.name}" — Drop-by ${submittedBy ? new Date(submittedBy + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "TBD"}`, "/portal/drop")
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
    if (topicWorldFilter && t.topicWorld !== topicWorldFilter) return false;
    if (tagFilters.includes("homeFriendly") && !t.homeFriendly) return false;
    if (tagFilters.includes("noTalking") && t.needsTalking) return false;
    if (tagFilters.includes("transition") && t.bucket !== "Transitions") return false;
    if (tagFilters.includes("arizona") && !t.bucket.includes("Arizona") && t.bucket !== "Arizona Moments") return false;
    if (tagFilters.includes("groupDay") && t.effort !== "Group Day") return false;
    if (tagFilters.includes("editHeavy") && !t.needsEditing) return false;

    // Version filter — "offscript" only shows templates that have a B version
    const offScript = OFF_SCRIPT_BY_TEMPLATE_ID.get(t.id);
    if (versionFilter === "offscript" && !offScript) return false;

    // Script Layer filter — template must match ALL selected script layer tags
    if (scriptLayerFilters.length > 0 && offScript) {
      const hasAll = scriptLayerFilters.every((f) => offScript.scriptTags.includes(f));
      if (!hasAll) return false;
    }
    if (scriptLayerFilters.length > 0 && !offScript) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchA = t.name.toLowerCase().includes(q) || t.bucket.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchB = offScript
        ? offScript.scriptTitle.toLowerCase().includes(q) ||
          offScript.scriptDescription.toLowerCase().includes(q) ||
          offScript.promptExamples.some((p) => p.toLowerCase().includes(q))
        : false;
      if (!matchA && !matchB) return false;
    }
    return true;
  });

  // Filter Full Ready Recipes
  const filteredFullRecipes = FULL_READY_RECIPES.filter((r) => {
    if (fullVersionFilter !== "all" && r.version !== fullVersionFilter) return false;
    if (fullCategoryFilter && r.category !== fullCategoryFilter) return false;
    if (fullEffortFilter && r.effort !== fullEffortFilter) return false;
    if (fullDifficultyFilter && r.difficulty !== fullDifficultyFilter) return false;
    if (fullSearch.trim()) {
      const q = fullSearch.toLowerCase();
      const matches =
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.topicWorld.toLowerCase().includes(q) ||
        r.creatorTask.toLowerCase().includes(q) ||
        r.contentAction.toLowerCase().includes(q) ||
        r.transitionFamily.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  // Unique categories from full recipes
  const fullRecipeCategories = [...new Set(FULL_READY_RECIPES.map(r => r.category))].sort();
  const fullRecipeEfforts = [...new Set(FULL_READY_RECIPES.map(r => r.effort))].sort();
  const fullRecipeDifficulties = [...new Set(FULL_READY_RECIPES.map(r => r.difficulty))].sort();

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-desert-night">Ready Bank</h1>
            <InfoTooltip text="A library of vetted, ready-to-use content templates and ideas. These are sparks from the Spark Board that have been approved for production. Planners can create scheduled clips from any template here — that sends them to the Run Sheet for the crew to film." />
            <p className="text-smoked-charcoal/70 mt-2">
              Vetted ideas and formats ready to pull into the calendar. Not posted. Not filmed. Just ready to plan.
            </p>
          </div>
          {/* View toggle */}
          <div className="flex flex-wrap gap-2">
            {/* Library toggle */}
            <div className="flex gap-1 bg-desert-night/10 rounded-lg p-1">
              <button
                onClick={() => setLibraryMode("quick")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${libraryMode === "quick" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
              >⚡ Quick Formats (60)</button>
              <button
                onClick={() => setLibraryMode("full")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${libraryMode === "full" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
              >📋 Full Recipes ({FULL_READY_RECIPES.length})</button>
            </div>
            {/* View toggle */}
            <div className="flex gap-1 bg-desert-night/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === "list" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
              >☰ List</button>
              <button
                onClick={() => setViewMode("builder")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === "builder" ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
              >📅 Calendar Builder</button>
            </div>
          </div>
        </div>
      </div>

      {/* Library mode explainer */}
      {libraryMode === "full" && (
        <div className="bg-cactus-teal/10 rounded-xl p-3 text-sm text-desert-night">
          <p className="font-bold">Full Ready Recipes — 96 complete assignments with step-by-step instructions</p>
          <p className="text-xs text-smoked-charcoal/70 mt-1">
            Each recipe includes the full creator breakdown: transition-in steps, content action steps, transition-out steps, group assembly plan (4/5/6-person), recording setup, what to send, admin editing recipe, and caption package. Click any card to see the full breakdown. Plan from any recipe — the full content copies into your clip so you can edit it per-clip without touching the master library.
          </p>
        </div>
      )}
      {libraryMode === "quick" && (
        <div className="bg-sandstone-cream/50 rounded-xl p-3 text-sm text-smoked-charcoal/70">
          <p className="font-bold text-desert-night">Quick Formats — 60 short-form templates</p>
          <p className="text-xs mt-1">
            Lightweight cards with caption starters, hashtags, and search phrases. For when you need a fast plan without the full step-by-step breakdown.
          </p>
        </div>
      )}

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

      {/* Calendar Builder view — 3-panel workspace */}
      {viewMode === "builder" && member && (
        <CalendarBuilder member={{ id: member.id, name: member.name }} members={members} isAdmin={member.role === "admin"} />
      )}

      {/* List view — filters + template cards (default) */}
      {viewMode === "list" && (
      <>
      {/* ===== Full Ready Recipes view ===== */}
      {libraryMode === "full" && (
        <>
        {/* Full Recipe Filters */}
        <div className="space-y-3">
          <input
            type="text"
            value={fullSearch}
            onChange={(e) => setFullSearch(e.target.value)}
            placeholder="Search full recipes by name, category, or content..."
            className="field"
          />

          {/* Version filter */}
          <div>
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Version</p>
            <div className="flex gap-2">
              <button onClick={() => setFullVersionFilter("all")} className={`chip !text-xs ${fullVersionFilter === "all" ? "chip-copper" : "chip-cream"}`}>All</button>
              <button onClick={() => setFullVersionFilter("A — Current")} className={`chip !text-xs ${fullVersionFilter === "A — Current" ? "chip-copper" : "chip-cream"}`}>A: Current (60)</button>
              <button onClick={() => setFullVersionFilter("B — Off Script")} className={`chip !text-xs ${fullVersionFilter === "B — Off Script" ? "chip-copper" : "chip-cream"}`}>B: Off Script (36)</button>
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFullCategoryFilter(null)} className={`chip !text-[10px] ${!fullCategoryFilter ? "chip-copper" : "chip-cream"}`}>All</button>
              {fullRecipeCategories.map((c) => (
                <button key={c} onClick={() => setFullCategoryFilter(c === fullCategoryFilter ? null : c)} className={`chip !text-[10px] ${fullCategoryFilter === c ? "chip-copper" : "chip-cream"}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Effort filter */}
          <div>
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Effort</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFullEffortFilter(null)} className={`chip !text-[10px] ${!fullEffortFilter ? "chip-copper" : "chip-cream"}`}>All</button>
              {fullRecipeEfforts.map((e) => (
                <button key={e} onClick={() => setFullEffortFilter(e === fullEffortFilter ? null : e)} className={`chip !text-[10px] ${fullEffortFilter === e ? "chip-copper" : "chip-cream"}`}>{e}</button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Difficulty</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFullDifficultyFilter(null)} className={`chip !text-[10px] ${!fullDifficultyFilter ? "chip-copper" : "chip-cream"}`}>All</button>
              {fullRecipeDifficulties.map((d) => (
                <button key={d} onClick={() => setFullDifficultyFilter(d === fullDifficultyFilter ? null : d)} className={`chip !text-[10px] ${fullDifficultyFilter === d ? "chip-copper" : "chip-cream"}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-smoked-charcoal/60">
          {filteredFullRecipes.length} {filteredFullRecipes.length === 1 ? "recipe" : "recipes"} ready to schedule
        </p>

        {/* Full Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFullRecipes.map((r) => (
            <FullReadyRecipeCard
              key={r.id}
              recipe={r}
              onClick={() => setDetailRecipe(r)}
            />
          ))}
        </div>

        {filteredFullRecipes.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-display text-2xl text-desert-night">No recipes match those filters.</p>
            <button
              onClick={() => { setFullSearch(""); setFullVersionFilter("all"); setFullCategoryFilter(null); setFullEffortFilter(null); setFullDifficultyFilter(null); }}
              className="btn btn-secondary btn-sm mt-4"
            >Clear filters</button>
          </div>
        )}
        </>
      )}

      {/* ===== Quick Formats view (existing) ===== */}
      {libraryMode === "quick" && (
      <>
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

        {/* Topic World filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Topic World</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTopicWorldFilter(null)}
              className={`chip !text-[10px] ${!topicWorldFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {TOPIC_WORLDS.map((w) => {
              const count = QUICK_DROP_TEMPLATES.filter((t) => t.topicWorld === w).length;
              if (count === 0) return null;
              return (
                <button
                  key={w}
                  onClick={() => setTopicWorldFilter(w === topicWorldFilter ? null : w)}
                  className={`chip !text-[10px] ${topicWorldFilter === w ? "chip-copper" : "chip-cream"}`}
                >{w}</button>
              );
            })}
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

        {/* Version filter — A: Current / B: Off Script / Both */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5 flex items-center gap-1">
            Version
            <InfoTooltip text="A: Current = the original format. B: Off Script = the deeper brand-native rewrite with social script / script break angle. Both = show every card with a toggle on each." />
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setVersionFilter("current")}
              className={`chip !text-xs ${versionFilter === "current" ? "chip-copper" : "chip-cream"}`}
            >A: Current</button>
            <button
              onClick={() => setVersionFilter("offscript")}
              className={`chip !text-xs ${versionFilter === "offscript" ? "chip-copper" : "chip-cream"}`}
            >B: Off Script</button>
            <button
              onClick={() => setVersionFilter("both")}
              className={`chip !text-xs ${versionFilter === "both" ? "chip-copper" : "chip-cream"}`}
            >Both</button>
          </div>
        </div>

        {/* Script Layer filter — only relevant when Off Script versions are visible */}
        {(versionFilter === "offscript" || versionFilter === "both") && (
          <div>
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5 flex items-center gap-1">
              Script Layer
              <InfoTooltip text="Filter by the type of social script being broken. A card matches if its Off Script version has ALL selected tags." />
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setScriptLayerFilters([])}
                className={`chip !text-[10px] ${scriptLayerFilters.length === 0 ? "chip-copper" : "chip-cream"}`}
              >All</button>
              {SCRIPT_LAYER_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setScriptLayerFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])}
                  className={`chip !text-[10px] ${scriptLayerFilters.includes(f) ? "chip-copper" : "chip-cream"}`}
                >{f}</button>
              ))}
            </div>
          </div>
        )}
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
            offScript={OFF_SCRIPT_BY_TEMPLATE_ID.get(t.id)}
            versionFilter={versionFilter}
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
            onClick={() => { setEffortFilter(null); setTagFilters([]); setBucketFilter(null); setTopicWorldFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}
      </>
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

      </> /* end list view */
      )}

      {/* Action modal */}
      {actionTemplate && actionMode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeAction}>
          <div className="bg-sandstone-cream rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-desert-night">{actionTemplate.name}</h2>
              <button onClick={closeAction} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
            </div>

            {pendingFullRecipe && (
              <div className="bg-cactus-teal/10 rounded-lg p-3 text-sm text-desert-night">
                <p className="font-bold">Full recipe attached</p>
                <p className="text-xs text-smoked-charcoal/70 mt-1">
                  The complete recipe (transition-in, content action, transition-out, assembly plan, caption package) will be copied into this clip. You can edit it per-clip on the Run Sheet — the master library stays untouched.
                </p>
              </div>
            )}

            {(actionMode === "week" || actionMode === "date" || actionMode === "assign") && (
              <div className="space-y-3">
                <div>
                  <p className="label">Submitted by</p>
                  <input
                    type="date"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    className="field !w-auto"
                  />
                </div>
                <div>
                  <p className="label">Cut ready by</p>
                  <input
                    type="date"
                    value={cutReadyBy}
                    onChange={(e) => setCutReadyBy(e.target.value)}
                    className="field !w-auto"
                  />
                </div>
                <div>
                  <p className="label">Greenlight by</p>
                  <input
                    type="date"
                    value={greenlightBy}
                    onChange={(e) => setGreenlightBy(e.target.value)}
                    className="field !w-auto"
                  />
                </div>
                <div>
                  <p className="label">Goes live by</p>
                  <input
                    type="date"
                    value={liveDate}
                    onChange={(e) => setLiveDate(e.target.value)}
                    className="field !w-auto"
                  />
                </div>
              </div>
            )}

            {actionMode === "assign" && (
              <div className="space-y-3">
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

      {/* Full Ready Recipe Detail Modal */}
      {detailRecipe && (
        <FullReadyRecipeDetail
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
          canPlanContent={isPlanner}
          onPlan={isPlanner ? (r) => {
            // Close the detail modal
            setDetailRecipe(null);
            // Store the full recipe so createClip copies it into the clip
            setPendingFullRecipe(r);
            // Find a matching QuickDropTemplate for the clip metadata
            const matchingTemplate = QUICK_DROP_TEMPLATES.find(t =>
              t.name.toLowerCase() === r.name.toLowerCase() ||
              t.id === r.id.replace(/_[ab]$/, "")
            );
            if (matchingTemplate) {
              openAction(matchingTemplate, "assign");
            } else {
              // No matching template — create a synthetic template from the recipe
              // so the action modal can still work
              const syntheticTemplate: QuickDropTemplate = {
                id: r.id,
                name: r.name,
                bucket: r.category,
                description: r.creatorTask,
                effort: r.effort as EffortLabel,
                timeEstimate: r.effort,
                homeFriendly: true,
                needsTalking: true,
                needsEditing: true,
                adminStitches: false,
                idea: r.creatorTask,
                vibe: r.topicWorld,
                whatToDrop: r.whatYouAreMaking,
                makeItYours: r.makeItYourOwn[0] ?? "",
                seoPhrase: r.searchTerms[0] ?? "",
                captionStarter: r.caption,
                hashtagStarter: r.hashtags,
                platforms: ["tiktok"],
                topicWorld: r.topicWorld as TopicWorld,
              };
              openAction(syntheticTemplate, "assign");
            }
          } : undefined}
        />
      )}
    </div>
  );
}

function ReadyBankCard({
  template, offScript, versionFilter, isSaved, isPlanner, onToggleSave, onAddToWeek, onAddToDate, onAssignCrew,
}: {
  template: QuickDropTemplate;
  offScript?: OffScriptVersion;
  versionFilter: "current" | "offscript" | "both";
  isSaved: boolean;
  isPlanner: boolean;
  onToggleSave: () => void;
  onAddToWeek: () => void;
  onAddToDate: () => void;
  onAssignCrew: () => void;
}) {
  // Default to B view when version filter is "offscript"
  const [showB, setShowB] = useState(versionFilter === "offscript");

  // Sync when version filter changes
  useEffect(() => {
    if (versionFilter === "offscript") setShowB(true);
    if (versionFilter === "current") setShowB(false);
  }, [versionFilter]);

  const hasB = !!offScript;

  return (
    <div className="card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg text-desert-night">
            {showB && offScript ? offScript.scriptTitle : template.name}
          </p>
          <p className="text-xs text-smoked-charcoal/50 mt-0.5">{template.bucket} · {template.topicWorld}</p>
        </div>
        <button onClick={onToggleSave} className="text-2xl shrink-0" title={isSaved ? "Saved" : "Save for later"}>
          {isSaved ? "🔖" : "📑"}
        </button>
      </div>

      {/* A/B toggle — only show if B version exists and version filter allows both */}
      {hasB && versionFilter === "both" && (
        <div className="flex gap-1 bg-desert-night/10 rounded-lg p-1 w-fit">
          <button
            onClick={() => setShowB(false)}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${!showB ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
          >A: Current</button>
          <button
            onClick={() => setShowB(true)}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${showB ? "bg-desert-night text-sandstone-cream" : "text-desert-night/60"}`}
          >B: Off Script</button>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="chip chip-cream !text-[9px]">{template.effort}</span>
        {template.homeFriendly && <span className="chip chip-cream !text-[9px]">🏠 Home</span>}
        {!template.needsTalking && <span className="chip chip-cream !text-[9px]">🤫 No talking</span>}
        {template.needsEditing && <span className="chip chip-cream !text-[9px]">✂️ Edit</span>}
        {template.adminStitches && <span className="chip chip-cream !text-[9px]">🔗 Stitch</span>}
        {showB && offScript && offScript.scriptTags.map((tag) => (
          <span key={tag} className="chip chip-copper !text-[9px]">{tag}</span>
        ))}
      </div>

      {/* ===== A: CURRENT VERSION ===== */}
      {!showB && (
        <>
          <p className="text-sm text-smoked-charcoal/70">{template.description}</p>

          {/* Clear instructions — what to do, what to send, examples */}
          {template.whatThisIs && (
            <div className="bg-desert-night/5 rounded-lg p-2 space-y-2">
              <div>
                <p className="text-xs font-bold text-desert-night/50 uppercase">What this is</p>
                <p className="text-sm text-desert-night">{template.whatThisIs}</p>
              </div>
              {template.whatEachPersonDoes && (
                <div>
                  <p className="text-xs font-bold text-desert-night/50 uppercase">What each person does</p>
                  <p className="text-sm text-desert-night">{template.whatEachPersonDoes}</p>
                </div>
              )}
              {template.whatToSend && (
                <div>
                  <p className="text-xs font-bold text-desert-night/50 uppercase">What to send</p>
                  <p className="text-sm text-desert-night">{template.whatToSend}</p>
                </div>
              )}
              {template.examplePrompts && template.examplePrompts.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-desert-night/50 uppercase">Example prompts</p>
                  <ul className="space-y-0.5">
                    {template.examplePrompts.map((p, i) => (
                      <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-1.5">
                        <span className="text-copper-clay shrink-0">→</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {template.whyItWorks && (
                <div>
                  <p className="text-xs font-bold text-desert-night/50 uppercase">Why it works</p>
                  <p className="text-sm text-desert-night">{template.whyItWorks}</p>
                </div>
              )}
              {template.bestFor && (
                <div>
                  <p className="text-xs font-bold text-desert-night/50 uppercase">Best for</p>
                  <p className="text-sm text-desert-night">{template.bestFor}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-cactus-teal/10 rounded-lg p-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Search phrase</p>
            <p className="text-sm text-desert-night font-bold">&ldquo;{template.seoPhrase}&rdquo;</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Caption starter</p>
            <p className="text-sm text-desert-night">{template.captionStarter}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {template.hashtagStarter.map((tag) => (
                <span key={tag} className="text-[10px] text-copper-deep">{tag} </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ===== B: OFF SCRIPT VERSION ===== */}
      {showB && offScript && (
        <>
          <p className="text-sm text-smoked-charcoal/70">{offScript.scriptDescription}</p>

          {/* The Script / The Break — the core of the B version */}
          <div className="space-y-2">
            <div className="bg-smoked-charcoal/5 rounded-lg p-2 border-l-3 border-smoked-charcoal/30">
              <p className="text-xs font-bold text-smoked-charcoal/50 uppercase">The Script</p>
              <p className="text-sm text-smoked-charcoal italic">&ldquo;{offScript.socialScript}&rdquo;</p>
            </div>
            <div className="bg-copper-clay/10 rounded-lg p-2 border-l-3 border-copper-clay">
              <p className="text-xs font-bold text-copper-deep uppercase">The Break</p>
              <p className="text-sm text-desert-night font-bold">{offScript.scriptBreak}</p>
            </div>
          </div>

          {/* Audience Mirror */}
          <div className="bg-cactus-teal/10 rounded-lg p-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Audience Mirror</p>
            <p className="text-sm text-desert-night">{offScript.audienceMirror}</p>
          </div>

          {/* Caption starter (B version) */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-desert-night/50 uppercase">B Caption Starter</p>
            <p className="text-sm text-desert-night">{offScript.scriptCaptionStarter}</p>
          </div>

          {/* Prompt examples */}
          {offScript.promptExamples.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Prompt Examples</p>
              <ul className="space-y-1">
                {offScript.promptExamples.map((p, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                    <span className="text-copper-clay shrink-0">→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Depth level */}
          <p className="text-[10px] text-smoked-charcoal/40 italic">Depth: {offScript.depthLevel}</p>
        </>
      )}

      {/* No B version available */}
      {showB && !hasB && (
        <p className="text-sm text-smoked-charcoal/40 italic">No Off Script version for this format yet.</p>
      )}

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
