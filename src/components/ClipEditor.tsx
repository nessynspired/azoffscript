"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
} from "@/lib/shot-recipe-library";
import type { Database } from "@/lib/types/db";

/** Accepts either the clips table Row or the clips_with_meta view Row */
type Clip = Database["public"]["Tables"]["clips"]["Row"] & {
  people_count?: number;
  approvals_total?: number;
  approvals_approved?: number;
  approvals_waiting?: number;
  approvals_blocked?: number;
};

type LibraryTab = "hooks" | "prompts" | "captions" | "transitions" | "recording" | "recipes" | "notes";

const LIBRARY_TABS: { id: LibraryTab; label: string; icon: string }[] = [
  { id: "hooks", label: "Hooks", icon: "🪝" },
  { id: "prompts", label: "Prompts", icon: "💡" },
  { id: "captions", label: "Captions", icon: "📝" },
  { id: "transitions", label: "Transitions", icon: "🎬" },
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

function parseNotes(raw: Record<string, unknown> | null): ProductionNotes {
  if (!raw) return { hooks: [], prompts: [], captions: [], transitions: [], recordingStyle: null, shotRecipe: null, notes: "" };
  return {
    hooks: Array.isArray(raw.hooks) ? raw.hooks as string[] : [],
    prompts: Array.isArray(raw.prompts) ? raw.prompts as string[] : [],
    captions: Array.isArray(raw.captions) ? raw.captions as string[] : [],
    transitions: Array.isArray(raw.transitions) ? raw.transitions as string[] : [],
    recordingStyle: typeof raw.recordingStyle === "string" ? raw.recordingStyle : null,
    shotRecipe: typeof raw.shotRecipe === "string" ? raw.shotRecipe : null,
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

export function ClipEditor({ clip, onClose, onSaved }: {
  clip: Clip;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [tab, setTab] = useState<LibraryTab>("hooks");
  const [notes, setNotes] = useState<ProductionNotes>(() => parseNotes(clip.production_notes));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Editable clip fields
  const [title, setTitle] = useState(clip.title);
  const [scheduledDate, setScheduledDate] = useState(clip.scheduled_date?.slice(0, 10) ?? "");
  const [clipDueDate, setClipDueDate] = useState(clip.clip_due_date?.slice(0, 10) ?? "");
  const [finalCutDue, setFinalCutDue] = useState(clip.final_cut_due?.slice(0, 10) ?? "");
  const [approvalDue, setApprovalDue] = useState(clip.approval_due?.slice(0, 10) ?? "");
  const [caption, setCaption] = useState(clip.caption ?? "");

  // Toggle functions for multi-select library items
  function toggleArrayItem(field: "hooks" | "prompts" | "captions" | "transitions", id: string) {
    setNotes(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id],
    }));
  }

  function setSingle(field: "recordingStyle" | "shotRecipe", id: string) {
    setNotes(prev => ({ ...prev, [field]: prev[field] === id ? null : id }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("clips").update({
      title,
      scheduled_date: scheduledDate || null,
      clip_due_date: clipDueDate || null,
      final_cut_due: finalCutDue || null,
      approval_due: approvalDue || null,
      caption: caption || null,
      production_notes: notes as unknown as Record<string, unknown>,
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

  // Filtered library items based on search
  const filteredHooks = HOOKS.filter(h => !search.trim() || h.text.toLowerCase().includes(search.toLowerCase()));
  const filteredPrompts = PROMPTS.filter(p => !search.trim() || p.text.toLowerCase().includes(search.toLowerCase()));
  const filteredCaptions = CAPTION_FRAMEWORKS.filter(c => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) || c.formula.toLowerCase().includes(search.toLowerCase()));
  const filteredTransitions = TRANSITIONS.filter(t => !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.simpleDescription.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-sandstone-cream rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-sandstone-cream border-b border-desert-night/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] text-copper-deep font-bold uppercase">Editing clip</p>
            <h2 className="font-display text-xl text-desert-night">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {savedFlash && <span className="text-xs text-cactus-teal font-bold">✓ Saved!</span>}
            <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={onClose} className="text-desert-night/40 hover:text-desert-night text-2xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Clip details — editable */}
          <div className="card p-4 space-y-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Clip Details</p>
            <div>
              <p className="label">Title</p>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="field w-full" />
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
              <p className="label">Caption</p>
              <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption…" className="field w-full" />
            </div>
          </div>

          {/* Selected items summary */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Attached Library Items</p>
            <div className="flex flex-wrap gap-1.5">
              {notes.hooks.length === 0 && notes.prompts.length === 0 && notes.captions.length === 0 && notes.transitions.length === 0 && !notes.recordingStyle && !notes.shotRecipe && !notes.notes && (
                <p className="text-xs text-smoked-charcoal/40">No library items attached yet. Use the tabs below to add hooks, prompts, captions, transitions, and more.</p>
              )}
              {notes.hooks.map(id => {
                const h = HOOKS.find(x => x.id === id);
                if (!h) return null;
                return <span key={id} className="chip chip-copper !text-[9px]">🪝 {h.text.slice(0, 30)}…</span>;
              })}
              {notes.prompts.map(id => {
                const p = PROMPTS.find(x => x.id === id);
                if (!p) return null;
                return <span key={id} className="chip chip-copper !text-[9px]">💡 {p.text.slice(0, 30)}…</span>;
              })}
              {notes.captions.map(id => {
                const c = CAPTION_FRAMEWORKS.find(x => x.id === id);
                if (!c) return null;
                return <span key={id} className="chip chip-copper !text-[9px]">📝 {c.name}</span>;
              })}
              {notes.transitions.map(id => {
                const t = TRANSITIONS.find(x => x.id === id);
                if (!t) return null;
                return <span key={id} className="chip chip-copper !text-[9px]">🎬 {t.name}</span>;
              })}
              {notes.recordingStyle && (() => {
                const r = RECORDING_STYLES.find(x => x.id === notes.recordingStyle);
                if (!r) return null;
                return <span className="chip chip-copper !text-[9px]">📹 {r.name}</span>;
              })()}
              {notes.shotRecipe && (() => {
                const r = SHOT_RECIPES.find(x => x.id === notes.shotRecipe);
                if (!r) return null;
                return <span className="chip chip-copper !text-[9px]">📋 {r.name}</span>;
              })()}
              {notes.notes && <span className="chip chip-copper !text-[9px]">✏️ Notes</span>}
            </div>
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

          {/* Library content — selectable items */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
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

            {/* NOTES — free text */}
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
        </div>
      </div>
    </div>
  );
}
