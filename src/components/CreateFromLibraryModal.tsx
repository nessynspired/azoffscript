"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyMember } from "@/lib/notify";
import { nextSunday } from "@/lib/plan-defaults";
import {
  HOOKS,
  HOOK_TYPE_COLORS,
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
  buildRecipeForInsert,
} from "@/lib/shot-recipe-library";
import {
  QUICK_DROP_TEMPLATES,
} from "@/lib/quick-drop-templates";
import type { Database } from "@/lib/types/db";

type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name">;

type LibraryTab = "format" | "hooks" | "prompts" | "captions" | "transitions" | "recording" | "recipes" | "notes";

const LIBRARY_TABS: { id: LibraryTab; label: string; icon: string }[] = [
  { id: "format", label: "Format", icon: "🎬" },
  { id: "hooks", label: "Hooks", icon: "🪝" },
  { id: "prompts", label: "Prompts", icon: "💡" },
  { id: "captions", label: "Captions", icon: "📝" },
  { id: "transitions", label: "Transitions", icon: "🔀" },
  { id: "recording", label: "Recording", icon: "📹" },
  { id: "recipes", label: "Recipes", icon: "📋" },
  { id: "notes", label: "Notes", icon: "✏️" },
];

interface ProductionNotes {
  hooks: string[];
  prompts: string[];
  captions: string[];
  transitions: string[];
  recordingStyle: string | null;
  shotRecipe: string | null;
  notes: string;
}

export function CreateFromLibraryModal({ member, members, onClose, onCreated }: {
  member: { id: string; name: string };
  members: Member[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();
  const [tab, setTab] = useState<LibraryTab>("format");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  // Clip details
  const [title, setTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState(nextSunday().toISOString().slice(0, 10));
  const [clipDueDate, setClipDueDate] = useState("");
  const [finalCutDue, setFinalCutDue] = useState("");
  const [approvalDue, setApprovalDue] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  // Library selections
  const [notes, setNotes] = useState<ProductionNotes>({
    hooks: [], prompts: [], captions: [], transitions: [],
    recordingStyle: null, shotRecipe: null, notes: "",
  });

  function toggleArrayItem(field: "hooks" | "prompts" | "captions" | "transitions", id: string) {
    setNotes(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id],
    }));
  }

  function setSingle(field: "recordingStyle" | "shotRecipe", id: string) {
    setNotes(prev => ({ ...prev, [field]: prev[field] === id ? null : id }));
  }

  function selectTemplate(id: string) {
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
      // Don't clear title — user might have customized it
    } else {
      setSelectedTemplateId(id);
      const t = QUICK_DROP_TEMPLATES.find(x => x.id === id);
      if (t && !title.trim()) setTitle(t.name);
    }
  }

  async function create() {
    if (!title.trim()) return;
    setCreating(true);

    const template = selectedTemplateId ? QUICK_DROP_TEMPLATES.find(t => t.id === selectedTemplateId) : null;

    // Auto-attach recipe: prefer a shot recipe the user explicitly picked in
    // the Recipes tab; otherwise fall back to the template's linked shotRecipeId.
    const recipeShotRecipeId = notes.shotRecipe ?? template?.shotRecipeId;
    const recipe = buildRecipeForInsert(recipeShotRecipeId);

    const { data: clip, error } = await supabase.from("clips").insert({
      title: title.trim(),
      type: "video",
      status: "Planned",
      submitted_by: member.id,
      submitted_by_name: member.name,
      category: template?.bucket ?? null,
      template_id: selectedTemplateId ?? null,
      destination: template?.platforms[0] ?? null,
      caption: caption || null,
      clip_due_date: clipDueDate || null,
      final_cut_due: finalCutDue || null,
      approval_due: approvalDue || null,
      scheduled_date: scheduledDate || null,
      production_notes: notes as unknown as Record<string, unknown>,
      ...(recipe ? { recipe } : {}),
    }).select().single();

    if (error || !clip) {
      alert(error?.message ?? "Could not create clip");
      setCreating(false);
      return;
    }

    // Assign crew
    if (selectedCrew.length > 0) {
      await supabase.from("content_assignments").insert(
        selectedCrew.map((crewId) => {
          const cm = members.find((m) => m.id === crewId);
          return {
            clip_id: clip.id, member_id: crewId, member_name: cm?.name ?? "",
            role: "On-Camera", task_type: "Drop a Clip",
            drop_by_date: clipDueDate || null, is_required: true, created_by: member.id,
          };
        })
      );
      const dropLabel = clipDueDate
        ? ` — Drop-by ${new Date(clipDueDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
        : "";
      await Promise.all(selectedCrew.map((id) =>
        notifyMember(supabase, id, "assignment", `You're on "${title.trim()}"${dropLabel}`, "/portal/drop")
      ));
    }

    onCreated();
    setCreating(false);
    onClose();
  }

  // Filtered items
  const filteredHooks = HOOKS.filter(h => !search.trim() || h.text.toLowerCase().includes(search.toLowerCase()));
  const filteredPrompts = PROMPTS.filter(p => !search.trim() || p.text.toLowerCase().includes(search.toLowerCase()));
  const filteredCaptions = CAPTION_FRAMEWORKS.filter(c => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredTransitions = TRANSITIONS.filter(t => !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredTemplates = QUICK_DROP_TEMPLATES.filter(t => !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.bucket.toLowerCase().includes(search.toLowerCase()));

  // Count attached items
  const attachedCount = notes.hooks.length + notes.prompts.length + notes.captions.length + notes.transitions.length + (notes.recordingStyle ? 1 : 0) + (notes.shotRecipe ? 1 : 0) + (notes.notes ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-sandstone-cream rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-sandstone-cream border-b border-desert-night/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] text-copper-deep font-bold uppercase">Create from Library</p>
            <h2 className="font-display text-xl text-desert-night">Build a clip from scratch</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={create} disabled={creating || !title.trim()} className="btn btn-primary btn-sm">
              {creating ? "Creating…" : "Create Clip"}
            </button>
            <button onClick={onClose} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Title + dates */}
          <div className="card p-4 space-y-3">
            <div>
              <p className="label">Title <span className="font-normal text-desert-night/40">(what's the content?)</span></p>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Name this clip…" className="field w-full" autoFocus />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="label">Drop by</p>
                <input type="date" value={clipDueDate} onChange={e => setClipDueDate(e.target.value)} className="field w-full" />
              </div>
              <div>
                <p className="label">Cut ready</p>
                <input type="date" value={finalCutDue} onChange={e => setFinalCutDue(e.target.value)} className="field w-full" />
              </div>
              <div>
                <p className="label">Greenlight</p>
                <input type="date" value={approvalDue} onChange={e => setApprovalDue(e.target.value)} className="field w-full" />
              </div>
              <div>
                <p className="label">Goes live</p>
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="field w-full" />
              </div>
            </div>
            <div>
              <p className="label">Caption <span className="font-normal text-desert-night/40">(optional)</span></p>
              <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption…" className="field w-full" />
            </div>
            {members.length > 0 && (
              <div>
                <p className="label">Assign crew <span className="font-normal text-desert-night/40">(optional)</span></p>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((m) => (
                    <button key={m.id} onClick={() => setSelectedCrew(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])} className={`chip !text-xs ${selectedCrew.includes(m.id) ? "chip-copper" : "chip-cream"}`}>{m.name}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attached items summary */}
          <div className="card p-3 flex items-center gap-2 flex-wrap">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Attached: {attachedCount}</p>
            {attachedCount === 0 && <p className="text-xs text-smoked-charcoal/40">Use the tabs below to build this clip from the libraries.</p>}
            {notes.hooks.length > 0 && <span className="chip chip-copper !text-[9px]">🪝 {notes.hooks.length}</span>}
            {notes.prompts.length > 0 && <span className="chip chip-copper !text-[9px]">💡 {notes.prompts.length}</span>}
            {notes.captions.length > 0 && <span className="chip chip-copper !text-[9px]">📝 {notes.captions.length}</span>}
            {notes.transitions.length > 0 && <span className="chip chip-copper !text-[9px]">🔀 {notes.transitions.length}</span>}
            {notes.recordingStyle && <span className="chip chip-copper !text-[9px]">📹 1</span>}
            {notes.shotRecipe && <span className="chip chip-copper !text-[9px]">📋 1</span>}
            {notes.notes && <span className="chip chip-copper !text-[9px]">✏️ Notes</span>}
            {selectedTemplateId && <span className="chip chip-copper !text-[9px]">🎬 Format</span>}
          </div>

          {/* Library tabs */}
          <div className="flex flex-wrap gap-1.5">
            {LIBRARY_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearch(""); }}
                className={`chip !text-xs ${tab === t.id ? "chip-copper" : "chip-cream"}`}
              >{t.icon} {t.label}</button>
            ))}
          </div>

          {/* Search — hide for notes tab */}
          {tab !== "notes" && (
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab}…`}
              className="field"
            />
          )}

          {/* Library content */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {/* FORMAT — pick a Ready Bank template (optional) */}
            {tab === "format" && (
              <>
                <p className="text-xs text-smoked-charcoal/50">Pick a content format from the Ready Bank (optional — or build from scratch with the other tabs).</p>
                {filteredTemplates.map(t => {
                  const selected = selectedTemplateId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t.id)}
                      className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-desert-night font-bold leading-snug">{t.name}</p>
                          <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{t.bucket} · {t.effort}</p>
                          <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{t.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* HOOKS */}
            {tab === "hooks" && filteredHooks.map(h => {
              const selected = notes.hooks.includes(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => toggleArrayItem("hooks", h.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{h.text}&rdquo;</p>
                      <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{HOOK_TYPE_COLORS[h.type]} {h.type} · {h.delivery}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* PROMPTS */}
            {tab === "prompts" && filteredPrompts.map(p => {
              const selected = notes.prompts.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleArrayItem("prompts", p.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{p.text}&rdquo;</p>
                      <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{PROMPT_TYPE_COLORS[p.type]} {p.type} · {p.category} · {p.subTopic}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* CAPTIONS */}
            {tab === "captions" && filteredCaptions.map(c => {
              const selected = notes.captions.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleArrayItem("captions", c.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-desert-night font-bold leading-snug">{c.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{PURPOSE_COLORS[c.purpose]} {c.purpose} · {c.formula}</p>
                      {c.examples.length > 0 && <p className="text-[10px] text-cactus-teal italic mt-0.5">e.g. &ldquo;{c.examples[0]}&rdquo;</p>}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* TRANSITIONS */}
            {tab === "transitions" && filteredTransitions.map(t => {
              const selected = notes.transitions.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleArrayItem("transitions", t.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-desert-night font-bold leading-snug">{t.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{TRANSITION_DIFF_COLORS[t.difficulty]} {t.difficulty} · {t.category}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{t.simpleDescription}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* RECORDING STYLES — single select */}
            {tab === "recording" && RECORDING_STYLES.map(r => {
              const selected = notes.recordingStyle === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSingle("recordingStyle", r.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-desert-night font-bold leading-snug">{r.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{RECORDING_DIFF_COLORS[r.difficulty]} {r.difficulty}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{r.simpleDescription}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* SHOT RECIPES — single select */}
            {tab === "recipes" && SHOT_RECIPES.map(r => {
              const selected = notes.shotRecipe === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSingle("shotRecipe", r.id)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${selected ? "bg-copper-clay/20 ring-1 ring-copper-clay/40" : "bg-sandstone-cream/40 hover:bg-copper-clay/10"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${selected ? "bg-copper-clay border-copper-clay text-white" : "border-desert-night/20"}`}>{selected ? "✓" : ""}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-desert-night font-bold leading-snug">{r.name}</p>
                      <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{r.category} · {r.difficulty}</p>
                      <p className="text-[10px] text-smoked-charcoal/60 mt-0.5">{r.goal}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* NOTES */}
            {tab === "notes" && (
              <div className="space-y-3">
                <p className="text-sm text-smoked-charcoal/60">Add any production notes for this clip — instructions, ideas, reminders, anything that doesn't fit in the other tabs.</p>
                <textarea
                  value={notes.notes}
                  onChange={e => setNotes(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Production notes…"
                  rows={8}
                  className="field w-full resize-y"
                />
              </div>
            )}
          </div>

          {/* Create button at bottom too */}
          <button onClick={create} disabled={creating || !title.trim()} className="btn btn-primary btn-lg w-full">
            {creating ? "Creating…" : `Create "${title.trim() || "clip"}" on calendar`}
          </button>
        </div>
      </div>
    </div>
  );
}
