"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TRANSITIONS,
  TRANSITION_CATEGORIES,
  TRANSITION_DIFFICULTIES,
  DIFFICULTY_COLORS,
  getTransitionsByCategory,
  type Transition,
  type TransitionCategory,
  type TransitionDifficulty,
} from "@/lib/transition-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function TransitionsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TransitionCategory | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<TransitionDifficulty | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null);

  const filtered = TRANSITIONS.filter((t) => {
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (difficultyFilter && t.difficulty !== difficultyFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        t.name.toLowerCase().includes(q) ||
        t.simpleDescription.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.worksBestWith.some((w) => w.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Transitions</h1>
        <InfoTooltip text="A transition is the action that connects one person's video to the next person's video. It's how clips flow together. This library shows you exactly what to do — no experience needed." />
        <p className="text-smoked-charcoal/70 mt-2">
          How to connect your clip to the next person&apos;s clip. Step-by-step. No fancy words.
        </p>
      </div>

      {/* What is a transition? — simple explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">What is a transition?</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          A transition is the action that connects one person&apos;s video to the next person&apos;s video.
          It&apos;s the moment where one creator leaves the screen and another creator enters.
        </p>
        <div className="mt-3 bg-white/50 rounded-xl p-3 text-sm text-smoked-charcoal/70">
          <p className="font-bold text-desert-night">Example:</p>
          <p className="mt-1">
            <span className="text-copper-clay font-bold">Person 1:</span> Throws a makeup brush toward the camera.
          </p>
          <p className="text-center text-desert-night/40 my-1">↓</p>
          <p>
            <span className="text-cactus-teal font-bold">Person 2:</span> Acts like the brush hit them and starts their video.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transitions..."
          className="field"
        />

        {/* Category filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`chip !text-[10px] ${!categoryFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {TRANSITION_CATEGORIES.map((c) => {
              const count = getTransitionsByCategory(c).length;
              if (count === 0) return null;
              return (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c === categoryFilter ? null : c)}
                  className={`chip !text-[10px] ${categoryFilter === c ? "chip-copper" : "chip-cream"}`}
                >{c}</button>
              );
            })}
          </div>
        </div>

        {/* Difficulty filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDifficultyFilter(null)}
              className={`chip !text-xs ${!difficultyFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {TRANSITION_DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d === difficultyFilter ? null : d)}
                className={`chip !text-xs ${difficultyFilter === d ? "chip-copper" : "chip-cream"}`}
              >{DIFFICULTY_COLORS[d]} {d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-smoked-charcoal/60">
        {filtered.length} {filtered.length === 1 ? "transition" : "transitions"}
      </p>

      {/* Transition cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTransition(t)}
            className="card p-5 text-left space-y-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg text-desert-night">{t.name}</p>
                <p className="text-xs text-smoked-charcoal/50 mt-0.5">{t.category}</p>
              </div>
              <span className="text-2xl shrink-0" title={t.difficulty}>
                {DIFFICULTY_COLORS[t.difficulty]}
              </span>
            </div>

            {/* Simple description */}
            <p className="text-sm text-smoked-charcoal/70">{t.simpleDescription}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{DIFFICULTY_COLORS[t.difficulty]} {t.difficulty}</span>
              {t.worksBestWith.slice(0, 3).map((w) => (
                <span key={w} className="chip chip-cream !text-[9px]">{w}</span>
              ))}
              {t.worksBestWith.length > 3 && (
                <span className="chip chip-cream !text-[9px]">+{t.worksBestWith.length - 3}</span>
              )}
            </div>

            {/* Needs */}
            {t.needs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Needs:</span>
                {t.needs.map((n, i) => (
                  <span key={i} className="text-[10px] text-smoked-charcoal/50">{n}{i < t.needs.length - 1 ? "," : ""}</span>
                ))}
              </div>
            )}

            <p className="text-xs text-copper-clay font-bold pt-1">Tap for full instructions →</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No transitions match those filters.</p>
          <button
            onClick={() => { setCategoryFilter(null); setDifficultyFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}

      {/* Detail modal */}
      {selectedTransition && (
        <TransitionDetailModal
          transition={selectedTransition}
          onClose={() => setSelectedTransition(null)}
        />
      )}

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
  );
}

function TransitionDetailModal({ transition, onClose }: { transition: Transition; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-desert-night/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-w-lg w-full p-6 my-auto max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-smoked-charcoal/40 hover:text-smoked-charcoal text-2xl"
          aria-label="Close"
        >×</button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl">{DIFFICULTY_COLORS[transition.difficulty]}</span>
          <div>
            <p className="text-xs text-smoked-charcoal/50 font-bold uppercase">{transition.category}</p>
            <h2 className="font-display text-2xl text-desert-night leading-tight">{transition.name}</h2>
          </div>
        </div>

        {/* Simple description */}
        <p className="text-sm text-smoked-charcoal/70 mt-3">{transition.simpleDescription}</p>

        {/* What viewers see */}
        <div className="bg-cactus-teal/10 rounded-xl p-3 mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">What viewers see</p>
          <p className="text-sm text-desert-night mt-1">{transition.whatViewersSee}</p>
        </div>

        {/* Example */}
        <div className="bg-sandstone-cream/50 rounded-xl p-3 mt-3">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Example</p>
          <p className="text-sm text-smoked-charcoal/70 mt-1">{transition.example}</p>
        </div>

        {/* First person steps */}
        <div className="mt-4">
          <p className="text-xs font-bold text-copper-deep uppercase">First person (ending their clip)</p>
          <ol className="space-y-1.5 mt-2">
            {transition.firstPersonSteps.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-copper-clay/20 text-copper-deep text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Next person steps */}
        <div className="mt-4">
          <p className="text-xs font-bold text-cactus-teal uppercase">Next person (starting their clip)</p>
          <ol className="space-y-1.5 mt-2">
            {transition.nextPersonSteps.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-cactus-teal/20 text-cactus-teal text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Suggested objects */}
        {transition.suggestedObjects && transition.suggestedObjects.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Suggested objects</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {transition.suggestedObjects.map((obj) => (
                <span key={obj} className="chip chip-cream !text-[10px]">{obj}</span>
              ))}
            </div>
          </div>
        )}

        {/* Works best with */}
        <div className="mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Works best with</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {transition.worksBestWith.map((w) => (
              <span key={w} className="chip chip-teal !text-[10px]">{w}</span>
            ))}
          </div>
        </div>

        {/* Needs */}
        <div className="mt-4 border-t border-desert-night/10 pt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">What you need</p>
          <ul className="space-y-1 mt-1.5">
            {transition.needs.map((n, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                <span className="text-copper-clay shrink-0">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Difficulty */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-bold text-desert-night/50 uppercase">Difficulty:</span>
          <span className="chip chip-cream !text-xs">{DIFFICULTY_COLORS[transition.difficulty]} {transition.difficulty}</span>
        </div>
      </div>
    </div>
  );
}
