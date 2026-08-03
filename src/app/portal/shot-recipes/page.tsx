"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  SHOT_RECIPES,
  SHOT_RECIPE_CATEGORIES,
  SHOT_RECIPE_DIFFICULTIES,
  DIFFICULTY_COLORS,
  getRecipesByCategory,
  type ShotRecipe,
  type ShotRecipeCategory,
  type ShotRecipeDifficulty,
} from "@/lib/shot-recipe-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function ShotRecipesPage() {
  const { member } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ShotRecipeCategory | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<ShotRecipeDifficulty | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<ShotRecipe | null>(null);

  // Admin-only — this is the master library. Planners edit per-clip copies via RecipeBuilder.
  if (member && member.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-sm text-smoked-charcoal/60 mt-2">
          This is the master shot recipe library. Planners can pick recipes when building a clip&apos;s recipe.
        </p>
        <Link href="/portal/lobby" className="btn btn-secondary btn-sm mt-4">← Back to Lobby</Link>
      </div>
    );
  }

  const filtered = SHOT_RECIPES.filter((r) => {
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (difficultyFilter && r.difficulty !== difficultyFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.contentFormatName.toLowerCase().includes(q) ||
        r.prompt.toLowerCase().includes(q) ||
        r.goal.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Shot Recipes</h1>
        <InfoTooltip text="A Shot Recipe is the finished production pack. It combines content format + version + prompt + recording style + transition + editing recipe + caption into one ready-to-film assignment. A creator never has to understand strategy, editing, or production. They just get: 'Here is your assignment. Record this one video.'" />
        <p className="text-smoked-charcoal/70 mt-2">
          Ready-to-film assignments. Everything you need in one card — just hit record.
        </p>
      </div>

      {/* What is a shot recipe? — simple explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">What is a Shot Recipe?</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          The other libraries are ingredients. The Shot Recipe is the finished meal.
        </p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          Each recipe tells you exactly what video to make, how to record it, how to start,
          how to end, what to send, and how admin will put it together. You don&apos;t need to
          understand content strategy or editing. You just follow the steps.
        </p>
        <div className="mt-3 bg-white/50 rounded-xl p-3 text-sm text-smoked-charcoal/70">
          <p className="font-bold text-desert-night">Each recipe combines:</p>
          <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
            <span>📋 Content Format</span>
            <span>🔄 Version (A/B)</span>
            <span>❓ Prompt</span>
            <span>🎥 Recording Style</span>
            <span>🔗 Transition</span>
            <span>✂️ Editing Recipe</span>
            <span>📝 Caption Package</span>
            <span>🟢 Difficulty</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes by name, format, or prompt..."
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
            {SHOT_RECIPE_CATEGORIES.map((c) => {
              const count = getRecipesByCategory(c).length;
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
            {SHOT_RECIPE_DIFFICULTIES.map((d) => (
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
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"} ready to film
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
                <p className="text-xs text-smoked-charcoal/50 mt-0.5">{r.category} · {r.version}</p>
              </div>
              <span className="text-2xl shrink-0" title={r.difficulty}>
                {DIFFICULTY_COLORS[r.difficulty]}
              </span>
            </div>

            {/* Creator task */}
            <p className="text-sm text-smoked-charcoal/70">{r.creatorTask}</p>

            {/* Prompt */}
            <div className="bg-copper-clay/10 rounded-lg p-2">
              <p className="text-xs font-bold text-copper-deep uppercase">Prompt</p>
              <p className="text-sm text-desert-night mt-0.5 italic">&ldquo;{r.prompt}&rdquo;</p>
            </div>

            {/* Library references */}
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">📋 {r.contentFormatName}</span>
              <span className="chip chip-cream !text-[9px]">🎥 {r.recordingStyleName}</span>
              <span className="chip chip-cream !text-[9px]">🔗 {r.transitionName}</span>
            </div>

            {/* Difficulty + version */}
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{DIFFICULTY_COLORS[r.difficulty]} {r.difficulty}</span>
              <span className="chip chip-teal !text-[9px]">{r.version}</span>
            </div>

            <p className="text-xs text-copper-clay font-bold pt-1">Tap for full assignment →</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No recipes match those filters.</p>
          <button
            onClick={() => { setCategoryFilter(null); setDifficultyFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}

      {/* Detail modal */}
      {selectedRecipe && (
        <ShotRecipeDetailModal
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

function ShotRecipeDetailModal({ recipe, onClose }: { recipe: ShotRecipe; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-desert-night/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-w-2xl w-full p-6 my-auto max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-smoked-charcoal/40 hover:text-smoked-charcoal text-2xl"
          aria-label="Close"
        >×</button>

        {/* ===== 1. ASSIGNMENT OVERVIEW ===== */}
        <div className="flex items-start gap-3">
          <span className="text-3xl">{DIFFICULTY_COLORS[recipe.difficulty]}</span>
          <div>
            <p className="text-xs text-smoked-charcoal/50 font-bold uppercase">{recipe.category}</p>
            <h2 className="font-display text-2xl text-desert-night leading-tight">{recipe.name}</h2>
            <p className="text-xs text-cactus-teal font-bold mt-1">{recipe.version}</p>
          </div>
        </div>

        {/* Goal */}
        <div className="bg-cactus-teal/10 rounded-xl p-3 mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Goal</p>
          <p className="text-sm text-desert-night mt-1">{recipe.goal}</p>
        </div>

        {/* Creator task */}
        <div className="bg-copper-clay/10 rounded-xl p-3 mt-3">
          <p className="text-xs font-bold text-copper-deep uppercase">Your task</p>
          <p className="text-sm text-desert-night mt-1 font-bold">{recipe.creatorTask}</p>
        </div>

        {/* Library references */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-sandstone-cream/50 rounded-lg p-2">
            <p className="text-[10px] font-bold text-desert-night/50 uppercase">Content Format</p>
            <p className="text-sm text-desert-night">{recipe.contentFormatName}</p>
          </div>
          <div className="bg-sandstone-cream/50 rounded-lg p-2">
            <p className="text-[10px] font-bold text-desert-night/50 uppercase">Recording Style</p>
            <p className="text-sm text-desert-night">{recipe.recordingStyleName}</p>
          </div>
          <div className="bg-sandstone-cream/50 rounded-lg p-2">
            <p className="text-[10px] font-bold text-desert-night/50 uppercase">Transition</p>
            <p className="text-sm text-desert-night">{recipe.transitionName}</p>
          </div>
          <div className="bg-sandstone-cream/50 rounded-lg p-2">
            <p className="text-[10px] font-bold text-desert-night/50 uppercase">Difficulty</p>
            <p className="text-sm text-desert-night">{DIFFICULTY_COLORS[recipe.difficulty]} {recipe.difficulty}</p>
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-copper-clay/10 rounded-xl p-3 mt-4">
          <p className="text-xs font-bold text-copper-deep uppercase">Prompt</p>
          <p className="text-sm text-desert-night mt-1 italic">&ldquo;{recipe.prompt}&rdquo;</p>
          {recipe.exampleResponse && (
            <div className="mt-2 pt-2 border-t border-copper-clay/20">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Example response (use it or make it your own)</p>
              <p className="text-sm text-smoked-charcoal/80 mt-1">&ldquo;{recipe.exampleResponse}&rdquo;</p>
            </div>
          )}
        </div>

        {/* ===== 2. WHAT THE FINAL VIDEO LOOKS LIKE ===== */}
        <div className="mt-5">
          <p className="font-display text-lg text-desert-night">What the final video looks like</p>
          <div className="mt-2 space-y-1">
            {recipe.finalVideoFlow.map((step, i) => (
              <div key={i}>
                <p className="text-sm text-smoked-charcoal/70 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-desert-night/10 text-desert-night text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </p>
                {i < recipe.finalVideoFlow.length - 1 && (
                  <p className="text-desert-night/30 text-xs ml-3">↓</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== 3. YOUR VIDEO HAS 3 PARTS ===== */}
        <div className="mt-5">
          <p className="font-display text-lg text-desert-night">Your video has 3 parts</p>

          {/* Part 1 */}
          <div className="mt-3 bg-cactus-teal/10 rounded-xl p-3">
            <p className="text-xs font-bold text-cactus-teal uppercase">Part 1 — {recipe.part1Start.label}</p>
            <ol className="space-y-1 mt-2">
              {recipe.part1Start.instructions.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="text-cactus-teal font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Part 2 */}
          <div className="mt-2 bg-copper-clay/10 rounded-xl p-3">
            <p className="text-xs font-bold text-copper-deep uppercase">Part 2 — {recipe.part2Content.label}</p>
            <ol className="space-y-1 mt-2">
              {recipe.part2Content.instructions.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="text-copper-deep font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Part 3 */}
          <div className="mt-2 bg-desert-night/5 rounded-xl p-3">
            <p className="text-xs font-bold text-desert-night/60 uppercase">Part 3 — {recipe.part3End.label}</p>
            <ol className="space-y-1 mt-2">
              {recipe.part3End.instructions.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="text-desert-night/60 font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ===== 4. RECORDING INSTRUCTIONS ===== */}
        <div className="mt-5">
          <p className="font-display text-lg text-desert-night">Recording instructions</p>

          <div className="mt-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Before recording</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {recipe.beforeRecording.map((b, i) => (
                <span key={i} className="chip chip-cream !text-[10px]">✅ {b}</span>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Record</p>
            <ol className="space-y-1.5 mt-2">
              {recipe.recordSteps.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-desert-night/10 text-desert-night text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ===== 5. CREATOR SUBMISSION ===== */}
        <div className="mt-5 border-t border-desert-night/10 pt-4">
          <p className="font-display text-lg text-desert-night">What to send</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {recipe.submissionRules.map((s, i) => (
              <span key={i} className="chip chip-teal !text-[10px]">✅ {s}</span>
            ))}
          </div>
        </div>

        {/* ===== 6. ADMIN EDITING RECIPE ===== */}
        <div className="mt-5 border-t border-desert-night/10 pt-4">
          <p className="font-display text-lg text-desert-night">Admin editing recipe</p>
          <div className="bg-smoked-charcoal/5 rounded-xl p-3 mt-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Edit style</p>
            <p className="text-sm text-desert-night mt-0.5">{recipe.editStyle}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Order</p>
            <ol className="space-y-1 mt-2">
              {recipe.adminOrder.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="text-copper-clay font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {recipe.adminNotes && (
            <div className="mt-3 bg-sunburst-yellow/10 rounded-lg p-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Notes</p>
              <p className="text-sm text-smoked-charcoal/70 mt-0.5">{recipe.adminNotes}</p>
            </div>
          )}
        </div>

        {/* ===== 7. CAPTION PACKAGE ===== */}
        <div className="mt-5 border-t border-desert-night/10 pt-4">
          <p className="font-display text-lg text-desert-night">Caption package</p>
          <div className="space-y-3 mt-2">
            <div className="bg-cactus-teal/10 rounded-lg p-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Caption</p>
              <p className="text-sm text-desert-night mt-0.5">{recipe.caption}</p>
            </div>
            <div className="bg-copper-clay/10 rounded-lg p-2">
              <p className="text-xs font-bold text-copper-deep uppercase">Comment prompt</p>
              <p className="text-sm text-desert-night mt-0.5">{recipe.commentPrompt}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Search terms</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {recipe.searchTerms.map((s) => (
                  <span key={s} className="chip chip-cream !text-[10px]">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Hashtags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {recipe.hashtags.map((h) => (
                  <span key={h} className="text-[10px] text-copper-deep">{h} </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
