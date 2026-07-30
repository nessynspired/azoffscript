"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EDITING_RECIPES,
  EDITING_DIFFICULTIES,
  DIFFICULTY_COLORS,
  type EditingRecipe,
  type EditingDifficulty,
} from "@/lib/editing-recipe-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function EditingRecipesPage() {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<EditingDifficulty | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<EditingRecipe | null>(null);

  const filtered = EDITING_RECIPES.filter((r) => {
    if (difficultyFilter && r.difficulty !== difficultyFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        r.name.toLowerCase().includes(q) ||
        r.simpleDescription.toLowerCase().includes(q) ||
        r.bestUsedFor.some((b) => b.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Editing Recipes</h1>
        <InfoTooltip text="For Vanessa/admin/editor — not the creators. Once everyone sends their clips, this is how the final TikTok gets put together. Every type of content has a repeatable editing blueprint." />
        <p className="text-smoked-charcoal/70 mt-2">
          For admin. Once everyone sends their clips, how does the final video get put together?
        </p>
      </div>

      {/* What is an editing recipe? — simple explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">What is an editing recipe?</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          Instead of &ldquo;I have 20 videos. Now what?&rdquo; you have &ldquo;This is a Group Reaction edit. Follow this recipe.&rdquo;
        </p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          Every type of content has a repeatable editing blueprint — the structure, the steps,
          what to cut, and how to end it. This keeps the editing consistent and fast.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search editing recipes..."
          className="field"
        />

        {/* Difficulty filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDifficultyFilter(null)}
              className={`chip !text-xs ${!difficultyFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {EDITING_DIFFICULTIES.map((d) => (
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
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
      </p>

      {/* Recipe cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRecipe(r)}
            className="card p-5 text-left space-y-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg text-desert-night">{r.name}</p>
                {r.addToAny && (
                  <p className="text-[10px] text-cactus-teal font-bold mt-0.5">✨ Add to any format</p>
                )}
              </div>
              <span className="text-2xl shrink-0" title={r.difficulty}>
                {DIFFICULTY_COLORS[r.difficulty]}
              </span>
            </div>

            {/* Simple description */}
            <p className="text-sm text-smoked-charcoal/70">{r.simpleDescription}</p>

            {/* Best used for */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best for:</span>
              {r.bestUsedFor.slice(0, 3).map((b) => (
                <span key={b} className="text-[10px] text-cactus-teal">{b}{r.bestUsedFor.indexOf(b) < Math.min(r.bestUsedFor.length, 3) - 1 ? "," : ""}</span>
              ))}
              {r.bestUsedFor.length > 3 && (
                <span className="text-[10px] text-smoked-charcoal/40">+{r.bestUsedFor.length - 3}</span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{DIFFICULTY_COLORS[r.difficulty]} {r.difficulty}</span>
              <span className="chip chip-cream !text-[9px]">✂️ {r.editingStyle.split(".")[0]}</span>
            </div>

            <p className="text-xs text-copper-clay font-bold pt-1">Tap for full recipe →</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No recipes match those filters.</p>
          <button
            onClick={() => { setDifficultyFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}

      {/* Detail modal */}
      {selectedRecipe && (
        <EditingRecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
  );
}

function EditingRecipeDetailModal({ recipe, onClose }: { recipe: EditingRecipe; onClose: () => void }) {
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
          <span className="text-3xl">{DIFFICULTY_COLORS[recipe.difficulty]}</span>
          <div>
            <h2 className="font-display text-2xl text-desert-night leading-tight">{recipe.name}</h2>
            {recipe.addToAny && (
              <p className="text-xs text-cactus-teal font-bold mt-1">✨ Can be added to any format</p>
            )}
          </div>
        </div>

        {/* Simple description */}
        <p className="text-sm text-smoked-charcoal/70 mt-3">{recipe.simpleDescription}</p>

        {/* Best used for */}
        <div className="mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Best used for</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {recipe.bestUsedFor.map((b) => (
              <span key={b} className="chip chip-teal !text-[10px]">{b}</span>
            ))}
          </div>
        </div>

        {/* Final video structure */}
        <div className="mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Final video structure</p>
          <div className="mt-2 space-y-1">
            {recipe.finalVideoStructure.map((step, i) => (
              <div key={i}>
                <p className="text-sm text-smoked-charcoal/70 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-desert-night/10 text-desert-night text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </p>
                {i < recipe.finalVideoStructure.length - 1 && (
                  <p className="text-desert-night/30 text-xs ml-3">↓</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editing steps */}
        <div className="mt-4">
          <p className="text-xs font-bold text-copper-deep uppercase">Editing steps</p>
          <ol className="space-y-2 mt-2">
            {recipe.editingSteps.map((s, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-copper-clay/20 text-copper-deep text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <p>{s.step}</p>
                  {s.detail && <p className="text-xs text-smoked-charcoal/50 mt-0.5">{s.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Editing style */}
        <div className="bg-cactus-teal/10 rounded-xl p-3 mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Editing style</p>
          <p className="text-sm text-desert-night mt-1">{recipe.editingStyle}</p>
        </div>

        {/* Remove during edit */}
        {recipe.removeDuringEdit && recipe.removeDuringEdit.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-heat-orange uppercase">Remove during edit</p>
            <ul className="space-y-1 mt-1.5">
              {recipe.removeDuringEdit.map((r, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                  <span className="text-heat-orange shrink-0">❌</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Caption style */}
        <div className="bg-sandstone-cream/50 rounded-xl p-3 mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Caption style</p>
          <p className="text-sm text-desert-night mt-1">{recipe.captionStyle}</p>
        </div>

        {/* Ending examples */}
        {recipe.endingExamples && recipe.endingExamples.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Ending examples</p>
            <div className="space-y-1 mt-1.5">
              {recipe.endingExamples.map((e, i) => (
                <p key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                  <span className="text-copper-clay shrink-0">→</span>
                  <span className="italic">&ldquo;{e}&rdquo;</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="mt-4 flex items-center gap-2 border-t border-desert-night/10 pt-4">
          <span className="text-xs font-bold text-desert-night/50 uppercase">Difficulty:</span>
          <span className="chip chip-cream !text-xs">{DIFFICULTY_COLORS[recipe.difficulty]} {recipe.difficulty}</span>
        </div>
      </div>
    </div>
  );
}
