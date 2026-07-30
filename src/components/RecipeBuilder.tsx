"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SHOT_RECIPES,
  DIFFICULTY_COLORS as RECIPE_DIFF_COLORS,
  type ShotRecipe,
} from "@/lib/shot-recipe-library";
import {
  RECORDING_STYLES,
  DIFFICULTY_COLORS as RECORDING_DIFF_COLORS,
  type RecordingStyle,
} from "@/lib/recording-style-library";
import {
  TRANSITIONS,
  DIFFICULTY_COLORS as TRANSITION_DIFF_COLORS,
  type Transition,
} from "@/lib/transition-library";
import type { Database } from "@/lib/types/db";

/** Accepts either the clips table Row or the clips_with_meta view Row */
type Clip = Database["public"]["Tables"]["clips"]["Row"] & {
  people_count?: number;
  approvals_total?: number;
  approvals_approved?: number;
  approvals_waiting?: number;
  approvals_blocked?: number;
};

export interface ClipRecipe {
  shotRecipeId: string | null;
  recordingStyleId: string | null;
  transitionId: string | null;
  goal: string;
  creatorTask: string;
  prompt: string;
  exampleResponse: string;
  finalVideoFlow: string[];
  part1Start: { label: string; instructions: string[] };
  part2Content: { label: string; instructions: string[] };
  part3End: { label: string; instructions: string[] };
  beforeRecording: string[];
  recordSteps: string[];
  submissionRules: string[];
  editStyle: string;
  adminOrder: string[];
  adminNotes: string;
  difficulty: string;
}

function emptyRecipe(): ClipRecipe {
  return {
    shotRecipeId: null,
    recordingStyleId: null,
    transitionId: null,
    goal: "",
    creatorTask: "",
    prompt: "",
    exampleResponse: "",
    finalVideoFlow: [],
    part1Start: { label: "Start Transition", instructions: [] },
    part2Content: { label: "Your Content", instructions: [] },
    part3End: { label: "End Transition", instructions: [] },
    beforeRecording: [],
    recordSteps: [],
    submissionRules: [],
    editStyle: "",
    adminOrder: [],
    adminNotes: "",
    difficulty: "Easy",
  };
}

function parseRecipe(raw: Record<string, unknown> | null): ClipRecipe {
  if (!raw) return emptyRecipe();
  const e = emptyRecipe();
  return {
    shotRecipeId: typeof raw.shotRecipeId === "string" ? raw.shotRecipeId : e.shotRecipeId,
    recordingStyleId: typeof raw.recordingStyleId === "string" ? raw.recordingStyleId : e.recordingStyleId,
    transitionId: typeof raw.transitionId === "string" ? raw.transitionId : e.transitionId,
    goal: typeof raw.goal === "string" ? raw.goal : e.goal,
    creatorTask: typeof raw.creatorTask === "string" ? raw.creatorTask : e.creatorTask,
    prompt: typeof raw.prompt === "string" ? raw.prompt : e.prompt,
    exampleResponse: typeof raw.exampleResponse === "string" ? raw.exampleResponse : e.exampleResponse,
    finalVideoFlow: Array.isArray(raw.finalVideoFlow) ? raw.finalVideoFlow as string[] : e.finalVideoFlow,
    part1Start: raw.part1Start && typeof raw.part1Start === "object"
      ? { label: typeof (raw.part1Start as Record<string, unknown>).label === "string" ? (raw.part1Start as Record<string, unknown>).label as string : e.part1Start.label,
          instructions: Array.isArray((raw.part1Start as Record<string, unknown>).instructions) ? (raw.part1Start as Record<string, unknown>).instructions as string[] : e.part1Start.instructions }
      : e.part1Start,
    part2Content: raw.part2Content && typeof raw.part2Content === "object"
      ? { label: typeof (raw.part2Content as Record<string, unknown>).label === "string" ? (raw.part2Content as Record<string, unknown>).label as string : e.part2Content.label,
          instructions: Array.isArray((raw.part2Content as Record<string, unknown>).instructions) ? (raw.part2Content as Record<string, unknown>).instructions as string[] : e.part2Content.instructions }
      : e.part2Content,
    part3End: raw.part3End && typeof raw.part3End === "object"
      ? { label: typeof (raw.part3End as Record<string, unknown>).label === "string" ? (raw.part3End as Record<string, unknown>).label as string : e.part3End.label,
          instructions: Array.isArray((raw.part3End as Record<string, unknown>).instructions) ? (raw.part3End as Record<string, unknown>).instructions as string[] : e.part3End.instructions }
      : e.part3End,
    beforeRecording: Array.isArray(raw.beforeRecording) ? raw.beforeRecording as string[] : e.beforeRecording,
    recordSteps: Array.isArray(raw.recordSteps) ? raw.recordSteps as string[] : e.recordSteps,
    submissionRules: Array.isArray(raw.submissionRules) ? raw.submissionRules as string[] : e.submissionRules,
    editStyle: typeof raw.editStyle === "string" ? raw.editStyle : e.editStyle,
    adminOrder: Array.isArray(raw.adminOrder) ? raw.adminOrder as string[] : e.adminOrder,
    adminNotes: typeof raw.adminNotes === "string" ? raw.adminNotes : e.adminNotes,
    difficulty: typeof raw.difficulty === "string" ? raw.difficulty : e.difficulty,
  };
}

/** Fill recipe from a Shot Recipe — auto-fills ALL fields */
function recipeFromShotRecipe(sr: ShotRecipe): ClipRecipe {
  return {
    shotRecipeId: sr.id,
    recordingStyleId: sr.recordingStyleId,
    transitionId: sr.transitionId,
    goal: sr.goal,
    creatorTask: sr.creatorTask,
    prompt: sr.prompt,
    exampleResponse: sr.exampleResponse ?? "",
    finalVideoFlow: [...sr.finalVideoFlow],
    part1Start: { label: sr.part1Start.label, instructions: [...sr.part1Start.instructions] },
    part2Content: { label: sr.part2Content.label, instructions: [...sr.part2Content.instructions] },
    part3End: { label: sr.part3End.label, instructions: [...sr.part3End.instructions] },
    beforeRecording: [...sr.beforeRecording],
    recordSteps: [...sr.recordSteps],
    submissionRules: [...sr.submissionRules],
    editStyle: sr.editStyle,
    adminOrder: [...sr.adminOrder],
    adminNotes: sr.adminNotes ?? "",
    difficulty: sr.difficulty,
  };
}

/** Fill just the recording-style-related fields from a RecordingStyle */
function applyRecordingStyle(r: ClipRecipe, rs: RecordingStyle): ClipRecipe {
  return {
    ...r,
    recordingStyleId: rs.id,
    beforeRecording: [
      "Vertical video",
      "Clear audio (no background noise)",
      "Good lighting (face the window or light)",
      "Phone stable (prop it up or hold steady)",
      "One continuous video (no cuts)",
    ],
    recordSteps: [...rs.howToRecord],
  };
}

/** Fill just the transition-related fields from a Transition */
function applyTransition(r: ClipRecipe, t: Transition): ClipRecipe {
  return {
    ...r,
    transitionId: t.id,
    part1Start: {
      label: `Start Transition — ${t.name}`,
      instructions: [...t.firstPersonSteps],
    },
    part3End: {
      label: `End Transition — ${t.name}`,
      instructions: [...t.nextPersonSteps],
    },
  };
}

export function RecipeBuilder({ clip, onClose, onSaved }: {
  clip: Clip;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [recipe, setRecipe] = useState<ClipRecipe>(() => parseRecipe(clip.recipe));
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showTransitionPicker, setShowTransitionPicker] = useState(false);

  // ── Pickers ──
  function pickShotRecipe(sr: ShotRecipe) {
    setRecipe(recipeFromShotRecipe(sr));
    setShowRecipePicker(false);
  }

  function pickRecordingStyle(rs: RecordingStyle) {
    setRecipe(prev => applyRecordingStyle(prev, rs));
    setShowStylePicker(false);
  }

  function pickTransition(t: Transition) {
    setRecipe(prev => applyTransition(prev, t));
    setShowTransitionPicker(false);
  }

  // ── List helpers ──
  function addListItem(field: "finalVideoFlow" | "beforeRecording" | "recordSteps" | "submissionRules" | "adminOrder", value: string) {
    if (!value.trim()) return;
    setRecipe(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
  }
  function removeListItem(field: "finalVideoFlow" | "beforeRecording" | "recordSteps" | "submissionRules" | "adminOrder", idx: number) {
    setRecipe(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  }
  function editListItem(field: "finalVideoFlow" | "beforeRecording" | "recordSteps" | "submissionRules" | "adminOrder", idx: number, value: string) {
    setRecipe(prev => ({ ...prev, [field]: prev[field].map((v, i) => i === idx ? value : v) }));
  }

  function addPartInstruction(part: "part1Start" | "part2Content" | "part3End", value: string) {
    if (!value.trim()) return;
    setRecipe(prev => ({ ...prev, [part]: { ...prev[part], instructions: [...prev[part].instructions, value.trim()] } }));
  }
  function removePartInstruction(part: "part1Start" | "part2Content" | "part3End", idx: number) {
    setRecipe(prev => ({ ...prev, [part]: { ...prev[part], instructions: prev[part].instructions.filter((_, i) => i !== idx) } }));
  }
  function editPartInstruction(part: "part1Start" | "part2Content" | "part3End", idx: number, value: string) {
    setRecipe(prev => ({ ...prev, [part]: { ...prev[part], instructions: prev[part].instructions.map((v, i) => i === idx ? value : v) } }));
  }

  // ── Save ──
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("clips").update({
      recipe: recipe as unknown as Record<string, unknown>,
    }).eq("id", clip.id);
    if (error) {
      alert(error.message);
    } else {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      onSaved();
    }
    setSaving(false);
  }

  // ── Clear recipe ──
  function clearRecipe() {
    if (!confirm("Clear the recipe? This removes all fields.")) return;
    setRecipe(emptyRecipe());
  }

  const selectedRecipe = recipe.shotRecipeId ? SHOT_RECIPES.find(r => r.id === recipe.shotRecipeId) : null;
  const selectedStyle = recipe.recordingStyleId ? RECORDING_STYLES.find(s => s.id === recipe.recordingStyleId) : null;
  const selectedTransition = recipe.transitionId ? TRANSITIONS.find(t => t.id === recipe.transitionId) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-sandstone-cream rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-sandstone-cream border-b border-desert-night/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] text-copper-deep font-bold uppercase">Recipe Builder</p>
            <h2 className="font-display text-xl text-desert-night">{clip.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {savedFlash && <span className="text-xs text-cactus-teal font-bold">✓ Saved!</span>}
            <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? "Saving…" : "Save Recipe"}
            </button>
            <button onClick={onClose} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Pick from bank ── */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Pick from Bank</p>
              {selectedRecipe && (
                <button onClick={clearRecipe} className="text-xs text-copper-deep hover:underline">Clear recipe</button>
              )}
            </div>
            <p className="text-xs text-smoked-charcoal/60">
              Pick a starting point. Everything auto-fills and you can edit any field below.
            </p>

            {/* Shot Recipe picker */}
            <div>
              <p className="label">Shot Recipe {selectedRecipe && <span className="text-xs text-cactus-teal">✓ {selectedRecipe.name}</span>}</p>
              <button onClick={() => setShowRecipePicker(!showRecipePicker)} className="field w-full text-left text-sm text-smoked-charcoal/70 hover:text-desert-night">
                {selectedRecipe ? `${selectedRecipe.name} — ${selectedRecipe.category} · ${selectedRecipe.contentFormatName}` : "Pick a shot recipe (optional starting point)…"}
              </button>
              {showRecipePicker && (
                <div className="mt-2 border border-desert-night/10 rounded-xl bg-white/50 max-h-72 overflow-y-auto p-2 space-y-1">
                  {SHOT_RECIPES.map(sr => (
                    <button key={sr.id} onClick={() => pickShotRecipe(sr)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-cactus-teal/10 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-desert-night font-bold">{sr.name}</p>
                        <p className="text-xs text-smoked-charcoal/50 mt-0.5">{sr.category} · {RECIPE_DIFF_COLORS[sr.difficulty]} {sr.difficulty}</p>
                        <p className="text-xs text-smoked-charcoal/60 mt-1 italic">{sr.goal}</p>
                        <p className="text-[10px] text-copper-deep/70 mt-0.5">Format: {sr.contentFormatName}</p>
                      </div>
                      {recipe.shotRecipeId === sr.id && <span className="text-cactus-teal text-sm shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recording Style picker */}
            <div>
              <p className="label">Recording Style {selectedStyle && <span className="text-xs text-cactus-teal">✓ {selectedStyle.name}</span>}</p>
              <button onClick={() => setShowStylePicker(!showStylePicker)} className="field w-full text-left text-sm text-smoked-charcoal/70 hover:text-desert-night">
                {selectedStyle ? `${selectedStyle.name} — ${RECORDING_DIFF_COLORS[selectedStyle.difficulty]} ${selectedStyle.difficulty} · ${selectedStyle.simpleDescription}` : "Pick a recording style (how to film)…"}
              </button>
              {showStylePicker && (
                <div className="mt-2 border border-desert-night/10 rounded-xl bg-white/50 max-h-72 overflow-y-auto p-2 space-y-1">
                  {RECORDING_STYLES.map(rs => (
                    <button key={rs.id} onClick={() => pickRecordingStyle(rs)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-cactus-teal/10 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-desert-night font-bold">{rs.name}</p>
                        <p className="text-xs text-smoked-charcoal/50 mt-0.5">{RECORDING_DIFF_COLORS[rs.difficulty]} {rs.difficulty}</p>
                        <p className="text-xs text-smoked-charcoal/60 mt-1 italic">{rs.simpleDescription}</p>
                        {rs.bestFor.length > 0 && (
                          <p className="text-[10px] text-copper-deep/70 mt-0.5">Best for: {rs.bestFor.join(", ")}</p>
                        )}
                      </div>
                      {recipe.recordingStyleId === rs.id && <span className="text-cactus-teal text-sm shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transition picker */}
            <div>
              <p className="label">Transition {selectedTransition && <span className="text-xs text-cactus-teal">✓ {selectedTransition.name}</span>}</p>
              <button onClick={() => setShowTransitionPicker(!showTransitionPicker)} className="field w-full text-left text-sm text-smoked-charcoal/70 hover:text-desert-night">
                {selectedTransition ? `${selectedTransition.name} — ${TRANSITION_DIFF_COLORS[selectedTransition.difficulty]} ${selectedTransition.difficulty} · ${selectedTransition.simpleDescription}` : "Pick a transition (how clips connect)…"}
              </button>
              {showTransitionPicker && (
                <div className="mt-2 border border-desert-night/10 rounded-xl bg-white/50 max-h-72 overflow-y-auto p-2 space-y-1">
                  {TRANSITIONS.map(t => (
                    <button key={t.id} onClick={() => pickTransition(t)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-cactus-teal/10 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-desert-night font-bold">{t.name}</p>
                        <p className="text-xs text-smoked-charcoal/50 mt-0.5">{TRANSITION_DIFF_COLORS[t.difficulty]} {t.difficulty} · {t.category}</p>
                        <p className="text-xs text-smoked-charcoal/60 mt-1 italic">{t.simpleDescription}</p>
                        <p className="text-[10px] text-copper-deep/70 mt-0.5">Viewer sees: {t.whatViewersSee}</p>
                      </div>
                      {recipe.transitionId === t.id && <span className="text-cactus-teal text-sm shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Assignment Overview ── */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Assignment Overview</p>
            <div>
              <p className="label">Goal</p>
              <textarea value={recipe.goal} onChange={e => setRecipe({ ...recipe, goal: e.target.value })}
                className="field w-full min-h-[60px]" placeholder="What should viewers do or feel?" />
            </div>
            <div>
              <p className="label">Creator Task</p>
              <textarea value={recipe.creatorTask} onChange={e => setRecipe({ ...recipe, creatorTask: e.target.value })}
                className="field w-full min-h-[60px]" placeholder="What does the creator need to do?" />
            </div>
            <div>
              <p className="label">Difficulty</p>
              <select value={recipe.difficulty} onChange={e => setRecipe({ ...recipe, difficulty: e.target.value })} className="field w-full">
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Advanced">🔴 Advanced</option>
              </select>
            </div>
          </div>

          {/* ── Prompt ── */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Prompt</p>
            <div>
              <p className="label">Prompt (what they respond to)</p>
              <textarea value={recipe.prompt} onChange={e => setRecipe({ ...recipe, prompt: e.target.value })}
                className="field w-full min-h-[60px]" placeholder="The prompt the creator reacts to…" />
            </div>
            <div>
              <p className="label">Example Response (optional)</p>
              <textarea value={recipe.exampleResponse} onChange={e => setRecipe({ ...recipe, exampleResponse: e.target.value })}
                className="field w-full min-h-[60px]" placeholder="An example they can use or make their own…" />
            </div>
          </div>

          {/* ── Final Video Flow ── */}
          <EditableList
            title="What the Final Video Looks Like"
            items={recipe.finalVideoFlow}
            onAdd={(v) => addListItem("finalVideoFlow", v)}
            onRemove={(i) => removeListItem("finalVideoFlow", i)}
            onEdit={(i, v) => editListItem("finalVideoFlow", i, v)}
            addPlaceholder="Add a step in the final video flow…"
          />

          {/* ── 3 Parts ── */}
          <PartEditor
            title="Part 1 — Start"
            part={recipe.part1Start}
            onLabelChange={(label) => setRecipe({ ...recipe, part1Start: { ...recipe.part1Start, label } })}
            onAdd={(v) => addPartInstruction("part1Start", v)}
            onRemove={(i) => removePartInstruction("part1Start", i)}
            onEdit={(i, v) => editPartInstruction("part1Start", i, v)}
          />
          <PartEditor
            title="Part 2 — Your Content"
            part={recipe.part2Content}
            onLabelChange={(label) => setRecipe({ ...recipe, part2Content: { ...recipe.part2Content, label } })}
            onAdd={(v) => addPartInstruction("part2Content", v)}
            onRemove={(i) => removePartInstruction("part2Content", i)}
            onEdit={(i, v) => editPartInstruction("part2Content", i, v)}
          />
          <PartEditor
            title="Part 3 — End"
            part={recipe.part3End}
            onLabelChange={(label) => setRecipe({ ...recipe, part3End: { ...recipe.part3End, label } })}
            onAdd={(v) => addPartInstruction("part3End", v)}
            onRemove={(i) => removePartInstruction("part3End", i)}
            onEdit={(i, v) => editPartInstruction("part3End", i, v)}
          />

          {/* ── Recording Instructions ── */}
          <EditableList
            title="Before Recording (checklist)"
            items={recipe.beforeRecording}
            onAdd={(v) => addListItem("beforeRecording", v)}
            onRemove={(i) => removeListItem("beforeRecording", i)}
            onEdit={(i, v) => editListItem("beforeRecording", i, v)}
            addPlaceholder="Add a pre-recording checklist item…"
          />
          <EditableList
            title="Record Steps"
            items={recipe.recordSteps}
            onAdd={(v) => addListItem("recordSteps", v)}
            onRemove={(i) => removeListItem("recordSteps", i)}
            onEdit={(i, v) => editListItem("recordSteps", i, v)}
            addPlaceholder="Add a recording step…"
          />
          <EditableList
            title="What to Send"
            items={recipe.submissionRules}
            onAdd={(v) => addListItem("submissionRules", v)}
            onRemove={(i) => removeListItem("submissionRules", i)}
            onEdit={(i, v) => editListItem("submissionRules", i, v)}
            addPlaceholder="Add a submission rule…"
          />

          {/* ── Admin Editing Recipe ── */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Admin Editing Recipe</p>
            <div>
              <p className="label">Edit Style</p>
              <input type="text" value={recipe.editStyle} onChange={e => setRecipe({ ...recipe, editStyle: e.target.value })}
                className="field w-full" placeholder="e.g., Fast-cut reactions" />
            </div>
            <div>
              <p className="label">Admin Notes</p>
              <textarea value={recipe.adminNotes} onChange={e => setRecipe({ ...recipe, adminNotes: e.target.value })}
                className="field w-full min-h-[60px]" placeholder="Notes for the editor…" />
            </div>
          </div>
          <EditableList
            title="Editing Order"
            items={recipe.adminOrder}
            onAdd={(v) => addListItem("adminOrder", v)}
            onRemove={(i) => removeListItem("adminOrder", i)}
            onEdit={(i, v) => editListItem("adminOrder", i, v)}
            addPlaceholder="Add a step in the editing order…"
          />

          {/* Save bar at bottom */}
          <div className="sticky bottom-0 bg-sandstone-cream border-t border-desert-night/10 px-6 py-3 flex items-center justify-between -mx-6 -mb-6">
            <p className="text-xs text-smoked-charcoal/50">
              {selectedRecipe ? `Based on: ${selectedRecipe.name}` : "Custom recipe"}
            </p>
            <div className="flex items-center gap-3">
              {savedFlash && <span className="text-xs text-cactus-teal font-bold">✓ Saved!</span>}
              <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">
                {saving ? "Saving…" : "Save Recipe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable list editor ──
function EditableList({ title, items, onAdd, onRemove, onEdit, addPlaceholder }: {
  title: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (idx: number) => void;
  onEdit: (idx: number, value: string) => void;
  addPlaceholder: string;
}) {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="card p-5 space-y-3">
      <p className="text-xs font-bold text-desert-night/50 uppercase">{title}</p>
      {items.length === 0 && (
        <p className="text-xs text-smoked-charcoal/40 italic">No items yet. Add one below.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-xs text-desert-night/30 font-bold mt-2">{i + 1}.</span>
          <input type="text" value={item} onChange={e => onEdit(i, e.target.value)}
            className="field flex-1 text-sm" />
          <button onClick={() => onRemove(i)} className="text-desert-night/30 hover:text-copper-deep text-lg mt-1">×</button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { onAdd(newItem); setNewItem(""); } }}
          className="field flex-1 text-sm" placeholder={addPlaceholder} />
        <button onClick={() => { onAdd(newItem); setNewItem(""); }}
          className="btn btn-cream btn-sm">+ Add</button>
      </div>
    </div>
  );
}

// ── Part editor (3 parts) ──
function PartEditor({ title, part, onLabelChange, onAdd, onRemove, onEdit }: {
  title: string;
  part: { label: string; instructions: string[] };
  onLabelChange: (label: string) => void;
  onAdd: (value: string) => void;
  onRemove: (idx: number) => void;
  onEdit: (idx: number, value: string) => void;
}) {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="card p-5 space-y-3">
      <p className="text-xs font-bold text-desert-night/50 uppercase">{title}</p>
      <div>
        <p className="label">Part Label</p>
        <input type="text" value={part.label} onChange={e => onLabelChange(e.target.value)}
          className="field w-full text-sm" />
      </div>
      {part.instructions.length === 0 && (
        <p className="text-xs text-smoked-charcoal/40 italic">No instructions yet. Add one below.</p>
      )}
      {part.instructions.map((inst, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-xs text-desert-night/30 font-bold mt-2">{i + 1}.</span>
          <input type="text" value={inst} onChange={e => onEdit(i, e.target.value)}
            className="field flex-1 text-sm" />
          <button onClick={() => onRemove(i)} className="text-desert-night/30 hover:text-copper-deep text-lg mt-1">×</button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { onAdd(newItem); setNewItem(""); } }}
          className="field flex-1 text-sm" placeholder="Add an instruction…" />
        <button onClick={() => { onAdd(newItem); setNewItem(""); }}
          className="btn btn-cream btn-sm">+ Add</button>
      </div>
    </div>
  );
}
