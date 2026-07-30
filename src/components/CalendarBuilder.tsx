"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { notifyMember } from "@/lib/notify";
import {
  QUICK_DROP_TEMPLATES,
  CONTENT_BUCKETS,
  type QuickDropTemplate,
  type EffortLabel,
} from "@/lib/quick-drop-templates";
import { nextSunday } from "@/lib/plan-defaults";
import {
  HOOKS,
  HOOK_TYPE_COLORS,
  type HookType,
} from "@/lib/growth/hook-library";
import {
  PROMPTS,
  TYPE_COLORS as PROMPT_TYPE_COLORS,
} from "@/lib/growth/prompt-intelligence";
import {
  CAPTION_FRAMEWORKS,
  PURPOSE_COLORS,
} from "@/lib/growth/caption-framework-library";
import {
  TRANSITIONS,
  DIFFICULTY_COLORS as TRANSITION_DIFF_COLORS,
} from "@/lib/transition-library";
import {
  RECORDING_STYLES,
  DIFFICULTY_COLORS as RECORDING_DIFF_COLORS,
} from "@/lib/recording-style-library";
import {
  SHOT_RECIPES,
} from "@/lib/shot-recipe-library";
import { ClipEditor } from "@/components/ClipEditor";
import { CreateFromLibraryModal } from "@/components/CreateFromLibraryModal";
import type { Database } from "@/lib/types/db";

type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name" | "nickname" | "role" | "can_plan_content">;
type Clip = Database["public"]["Tables"]["clips"]["Row"];

type LibraryTab = "hooks" | "prompts" | "captions" | "transitions" | "recording" | "recipes";

const LIBRARY_TABS: { id: LibraryTab; label: string; icon: string }[] = [
  { id: "hooks", label: "Hooks", icon: "🪝" },
  { id: "prompts", label: "Prompts", icon: "💡" },
  { id: "captions", label: "Captions", icon: "📝" },
  { id: "transitions", label: "Transitions", icon: "🎬" },
  { id: "recording", label: "Recording", icon: "📹" },
  { id: "recipes", label: "Shot Recipes", icon: "📋" },
];

export function CalendarBuilder({ member, members, isAdmin = false }: {
  member: { id: string; name: string };
  members: Member[];
  isAdmin?: boolean;
}) {
  const supabase = createClient();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  // Left panel — Ready Bank search/filter
  const [search, setSearch] = useState("");
  const [effortFilter, setEffortFilter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<QuickDropTemplate | null>(null);

  // Center — Calendar
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Right panel — Libraries
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("hooks");

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingClip, setEditingClip] = useState<Clip | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [liveDate, setLiveDate] = useState<string>("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [cutReadyBy, setCutReadyBy] = useState("");
  const [greenlightBy, setGreenlightBy] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const res = await supabase.from("clips").select("*").order("scheduled_date", { ascending: true });
    setClips(res.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Filter Ready Bank templates
  const filteredTemplates = useMemo(() => {
    return QUICK_DROP_TEMPLATES.filter((t) => {
      if (effortFilter && t.effort !== effortFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.bucket.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, effortFilter]);

  // When a template is selected, filter library items that match
  const matchingHooks = useMemo(() => {
    if (!selectedTemplate) return HOOKS.slice(0, 12);
    const matched = HOOKS.filter((h) => h.worksBestWith.includes(selectedTemplate.name));
    return matched.length > 0 ? matched : HOOKS.slice(0, 12);
  }, [selectedTemplate]);

  const matchingPrompts = useMemo(() => {
    if (!selectedTemplate) return PROMPTS.slice(0, 12);
    const matched = PROMPTS.filter((p) => p.worksBestWith.includes(selectedTemplate.name));
    return matched.length > 0 ? matched : PROMPTS.slice(0, 12);
  }, [selectedTemplate]);

  const matchingCaptions = useMemo(() => {
    if (!selectedTemplate) return CAPTION_FRAMEWORKS.slice(0, 6);
    const matched = CAPTION_FRAMEWORKS.filter((c) => c.worksBestWith.includes(selectedTemplate.name));
    return matched.length > 0 ? matched : CAPTION_FRAMEWORKS.slice(0, 6);
  }, [selectedTemplate]);

  // Calendar setup
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthStart = new Date(monthDate);
  monthStart.setDate(1 - monthStart.getDay());
  const monthDays = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(monthStart.getDate() + i);
    return d;
  });

  const isMonth = viewMode === "month";
  const days = isMonth ? monthDays : weekDays;
  const offset = isMonth ? monthOffset : weekOffset;

  const periodLabel = isMonth
    ? monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : `${weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  function clipsForDay(day: Date): Clip[] {
    if (!day) return [];
    const dayStr = day.toISOString().slice(0, 10);
    return clips.filter((c) => c.scheduled_date && c.scheduled_date.slice(0, 10) === dayStr);
  }

  function openScheduleModal(template: QuickDropTemplate) {
    setSelectedTemplate(template);
    setLiveDate(nextSunday().toISOString().slice(0, 10));
    setSubmittedBy("");
    setCutReadyBy("");
    setGreenlightBy("");
    setSelectedCrew([]);
    setShowScheduleModal(true);
  }

  async function createClip() {
    if (!selectedTemplate || !liveDate) return;
    setCreating(true);
    const { data: clip, error } = await supabase.from("clips").insert({
      title: selectedTemplate.name, type: "video", status: "Planned",
      category: selectedTemplate.bucket, submitted_by: member.id, submitted_by_name: member.name,
      template_id: selectedTemplate.id, destination: selectedTemplate.platforms[0] ?? null,
      clip_due_date: submittedBy || null, final_cut_due: cutReadyBy || null,
      approval_due: greenlightBy || null, scheduled_date: liveDate || null,
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
        notifyMember(supabase, id, "assignment", `You're on "${selectedTemplate.name}"${dropLabel}`, "/portal/drop")
      ));
    }
    await load();
    setCreating(false);
    setShowScheduleModal(false);
  }

  return (
    <div className="space-y-4">
      {/* Top bar — view toggle + period navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => { setViewMode("week"); setMonthOffset(0); }} className={`chip !text-xs ${viewMode === "week" ? "chip-copper" : "chip-cream"}`}>Week</button>
          <button onClick={() => { setViewMode("month"); setWeekOffset(0); }} className={`chip !text-xs ${viewMode === "month" ? "chip-copper" : "chip-cream"}`}>Month</button>
          {isAdmin && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm !text-xs ml-2">+ Create from Library</button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => isMonth ? setMonthOffset(monthOffset - 1) : setWeekOffset(weekOffset - 1)} className="text-desert-night/60 hover:text-desert-night text-lg px-2">←</button>
          <span className="font-display text-lg text-desert-night min-w-[180px] text-center">{periodLabel}</span>
          <button onClick={() => isMonth ? setMonthOffset(monthOffset + 1) : setWeekOffset(weekOffset + 1)} className="text-desert-night/60 hover:text-desert-night text-lg px-2">→</button>
          <button onClick={() => { setWeekOffset(0); setMonthOffset(0); }} className="chip chip-cream !text-[10px]">Today</button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT — Ready Bank templates */}
        <div className="lg:w-72 shrink-0">
          <div className="card p-3 space-y-3 lg:sticky lg:top-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-base text-desert-night">Ready Bank</p>
              <span className="text-[10px] text-smoked-charcoal/50">{filteredTemplates.length}</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formats..."
              className="field !text-xs !py-1.5 !px-2"
            />
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setEffortFilter(null)} className={`chip !text-[9px] !py-0.5 ${!effortFilter ? "chip-copper" : "chip-cream"}`}>All</button>
              {(["2-Min Drop", "5-Min Drop", "10-Min Drop", "Group Day"] as EffortLabel[]).map((e) => (
                <button key={e} onClick={() => setEffortFilter(e === effortFilter ? null : e)} className={`chip !text-[9px] !py-0.5 ${effortFilter === e ? "chip-copper" : "chip-cream"}`}>{e.replace(" Drop", "")}</button>
              ))}
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${selectedTemplate?.id === t.id ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <span className="font-bold text-xs text-desert-night leading-tight flex-1 min-w-0 truncate">{t.name}</span>
                  <span className="text-[8px] text-smoked-charcoal/50 shrink-0">{t.effort.replace(" Drop", "")}</span>
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <p className="text-xs text-smoked-charcoal/40 text-center py-4">No formats match.</p>
              )}
            </div>
          </div>
        </div>

        {/* CENTER — Calendar */}
        <div className="flex-1 min-w-0">
          <div className="card p-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-smoked-charcoal/50">Loading calendar…</p>
              </div>
            ) : isMonth ? (
              /* Month view — grid */
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-desert-night/40 uppercase pb-1">{d}</div>
                ))}
                {monthDays.map((day, i) => {
                  const dayClips = clipsForDay(day);
                  const isOtherMonth = day.getMonth() !== monthDate.getMonth();
                  const isToday = day.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] rounded-lg p-1.5 border ${isOtherMonth ? "bg-desert-night/[0.02] border-desert-night/5" : "bg-sandstone-cream/30 border-desert-night/10"} ${isToday ? "ring-1 ring-copper-clay/40" : ""}`}
                    >
                      <p className={`text-[10px] font-bold ${isOtherMonth ? "text-desert-night/20" : "text-desert-night/60"}`}>
                        {day.getDate()}
                      </p>
                      <div className="space-y-0.5 mt-0.5">
                        {dayClips.slice(0, 3).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setEditingClip(c)}
                            className="w-full text-left text-[9px] bg-copper-clay/15 hover:bg-copper-clay/30 text-copper-deep rounded px-1 py-0.5 truncate transition-colors"
                            title={`Click to edit: ${c.title}`}
                          >
                            {c.title}
                          </button>
                        ))}
                        {dayClips.length > 3 && (
                          <p className="text-[8px] text-smoked-charcoal/40">+{dayClips.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Week view — columns */
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((day, i) => {
                  const dayClips = clipsForDay(day);
                  const isToday = day.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
                  return (
                    <div key={i} className={`min-h-[300px] rounded-lg p-2 border ${isToday ? "bg-copper-clay/5 border-copper-clay/30" : "bg-sandstone-cream/20 border-desert-night/10"}`}>
                      <p className={`text-xs font-bold ${isToday ? "text-copper-deep" : "text-desert-night/60"}`}>
                        {day.toLocaleDateString(undefined, { weekday: "short" })}
                      </p>
                      <p className={`text-lg font-display ${isToday ? "text-copper-deep" : "text-desert-night"}`}>
                        {day.getDate()}
                      </p>
                      <div className="space-y-1 mt-1">
                        {dayClips.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setEditingClip(c)}
                            className="w-full text-left text-[10px] bg-copper-clay/15 hover:bg-copper-clay/30 text-copper-deep rounded px-1.5 py-1 truncate transition-colors"
                            title={`Click to edit: ${c.title}`}
                          >
                            {c.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected template — schedule bar */}
            {selectedTemplate && (
              <div className="mt-3 bg-copper-clay/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-copper-deep uppercase">Selected</p>
                  <p className="text-sm font-bold text-desert-night truncate">{selectedTemplate.name}</p>
                  <p className="text-[10px] text-smoked-charcoal/50">{selectedTemplate.bucket} · {selectedTemplate.effort}</p>
                </div>
                <button
                  onClick={() => openScheduleModal(selectedTemplate)}
                  className="btn btn-primary btn-sm shrink-0"
                >+ Schedule</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Libraries (admin only — contains brand IP) */}
        {isAdmin ? (
        <div className="lg:w-80 shrink-0">
          <div className="card p-3 space-y-3 lg:sticky lg:top-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-base text-desert-night">Libraries</p>
              {selectedTemplate && (
                <span className="text-[9px] text-cactus-teal font-bold">→ {selectedTemplate.name}</span>
              )}
            </div>

            {/* Library tabs */}
            <div className="flex flex-wrap gap-1">
              {LIBRARY_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLibraryTab(t.id)}
                  className={`chip !text-[9px] !py-0.5 ${libraryTab === t.id ? "chip-copper" : "chip-cream"}`}
                >{t.icon} {t.label}</button>
              ))}
            </div>

            {/* Library content — scrollable */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {libraryTab === "hooks" && (
                <>
                  <p className="text-[9px] text-smoked-charcoal/40 font-bold uppercase">{selectedTemplate ? `Matching hooks for ${selectedTemplate.name}` : "All hooks"}</p>
                  {matchingHooks.map((h) => (
                    <div key={h.id} className="bg-sandstone-cream/40 rounded-lg p-2">
                      <p className="text-xs text-desert-night font-bold leading-snug">&ldquo;{h.text}&rdquo;</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] text-copper-deep">{HOOK_TYPE_COLORS[h.type]} {h.type}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {libraryTab === "prompts" && (
                <>
                  <p className="text-[9px] text-smoked-charcoal/40 font-bold uppercase">{selectedTemplate ? `Matching prompts for ${selectedTemplate.name}` : "All prompts"}</p>
                  {matchingPrompts.map((p) => (
                    <div key={p.id} className="bg-sandstone-cream/40 rounded-lg p-2">
                      <p className="text-xs text-desert-night font-bold leading-snug">&ldquo;{p.text}&rdquo;</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] text-copper-deep">{PROMPT_TYPE_COLORS[p.type]} {p.type}</span>
                        <span className="text-[8px] text-smoked-charcoal/40">· {p.category}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {libraryTab === "captions" && (
                <>
                  <p className="text-[9px] text-smoked-charcoal/40 font-bold uppercase">{selectedTemplate ? `Matching caption frameworks` : "All caption frameworks"}</p>
                  {matchingCaptions.map((c) => (
                    <div key={c.id} className="bg-sandstone-cream/40 rounded-lg p-2">
                      <p className="text-xs text-desert-night font-bold leading-snug">{c.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{c.formula}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] text-copper-deep">{PURPOSE_COLORS[c.purpose]} {c.purpose}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {libraryTab === "transitions" && (
                <>
                  <p className="text-[9px] text-smoked-charcoal/40 font-bold uppercase">All transitions</p>
                  {TRANSITIONS.slice(0, 15).map((t) => (
                    <div key={t.id} className="bg-sandstone-cream/40 rounded-lg p-2">
                      <p className="text-xs text-desert-night font-bold leading-snug">{t.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{t.simpleDescription}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] text-copper-deep">{TRANSITION_DIFF_COLORS[t.difficulty]} {t.difficulty}</span>
                        <span className="text-[8px] text-smoked-charcoal/40">· {t.category}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {libraryTab === "recording" && (
                <>
                  <p className="text-[9px] text-smoked-charcoal/40 font-bold uppercase">Recording styles</p>
                  {RECORDING_STYLES.map((r) => (
                    <div key={r.id} className="bg-sandstone-cream/40 rounded-lg p-2">
                      <p className="text-xs text-desert-night font-bold leading-snug">{r.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{r.simpleDescription}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] text-copper-deep">{RECORDING_DIFF_COLORS[r.difficulty]} {r.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {libraryTab === "recipes" && (
                <>
                  <p className="text-[9px] text-smoked-charcoal/40 font-bold uppercase">Shot recipes</p>
                  {SHOT_RECIPES.slice(0, 10).map((r) => (
                    <div key={r.id} className="bg-sandstone-cream/40 rounded-lg p-2">
                      <p className="text-xs text-desert-night font-bold leading-snug">{r.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{r.goal}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] text-copper-deep">{r.category}</span>
                        <span className="text-[8px] text-smoked-charcoal/40">· {r.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Links to full libraries */}
            <div className="border-t border-desert-night/10 pt-2 flex flex-wrap gap-1">
              <Link href="/portal/growth/hooks" className="text-[9px] text-copper-deep hover:underline">Hooks →</Link>
              <Link href="/portal/growth/prompts" className="text-[9px] text-copper-deep hover:underline">Prompts →</Link>
              <Link href="/portal/growth/captions" className="text-[9px] text-copper-deep hover:underline">Captions →</Link>
              <Link href="/portal/transitions" className="text-[9px] text-copper-deep hover:underline">Transitions →</Link>
              <Link href="/portal/recording-styles" className="text-[9px] text-copper-deep hover:underline">Recording →</Link>
              <Link href="/portal/shot-recipes" className="text-[9px] text-copper-deep hover:underline">Recipes →</Link>
            </div>
          </div>
        </div>
        ) : null}
      </div>

      {/* Clip Editor — edit scheduled clips and attach library items */}
      {editingClip && (
        <ClipEditor
          clip={editingClip}
          onClose={() => setEditingClip(null)}
          onSaved={load}
        />
      )}

      {/* Create from Library — build a clip from scratch using library items */}
      {showCreateModal && (
        <CreateFromLibraryModal
          member={member}
          members={members}
          onClose={() => setShowCreateModal(false)}
          onCreated={load}
        />
      )}

      {/* Schedule modal */}
      {showScheduleModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-sandstone-cream rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-desert-night">{selectedTemplate.name}</h2>
                <p className="text-xs text-smoked-charcoal/50">{selectedTemplate.bucket} · {selectedTemplate.effort}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
            </div>

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
                <p className="label">Goes live</p>
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

            <button onClick={createClip} disabled={creating || !liveDate} className="btn btn-primary btn-lg w-full">
              {creating ? "Creating…" : `Add to calendar`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
