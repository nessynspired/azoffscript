"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PROMPTS,
  PROMPT_TYPES,
  PROMPT_CATEGORIES,
  TYPE_COLORS,
  STATUS_COLORS,
  getPromptsByCategory,
  type Prompt,
  type PromptType,
  type PromptCategory,
} from "@/lib/prompt-library";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PlannerOnly } from "@/components/PlannerOnly";

export default function PromptsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PromptType | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | null>(null);

  const filtered = useMemo(() => {
    return PROMPTS.filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          p.text.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.worksBestWith.some((w) => w.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [search, typeFilter, categoryFilter]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map<PromptCategory, Prompt[]>();
    filtered.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Stats
  const evergreenCount = PROMPTS.filter((p) => p.type === "Evergreen").length;
  const seasonalCount = PROMPTS.filter((p) => p.type === "Seasonal").length;
  const trendingCount = PROMPTS.filter((p) => p.type === "Trending").length;
  const communityCount = PROMPTS.filter((p) => p.type === "Community").length;

  return (
    <PlannerOnly label="The Prompt Library">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Prompt Library</h1>
        <InfoTooltip text="The endless idea engine. Unlike the other libraries (which are built once), this is a living content bank that keeps getting fed — from what performs, what people comment, and what the crew naturally talks about." />
        <p className="text-smoked-charcoal/70 mt-2">
          The questions and prompts that keep the content machine running. Evergreen, seasonal, trending, and community-generated.
        </p>
      </div>

      {/* What is the prompt library? — explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">This library is different</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          The other libraries are built once and improved over time. This one is a <strong>living engine</strong> that keeps getting fed.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">{TYPE_COLORS.Evergreen}</p>
            <p className="text-xs font-bold text-desert-night mt-1">Evergreen</p>
            <p className="text-[10px] text-smoked-charcoal/50">Works anytime</p>
            <p className="text-sm font-display text-copper-deep mt-1">{evergreenCount}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">{TYPE_COLORS.Seasonal}</p>
            <p className="text-xs font-bold text-desert-night mt-1">Seasonal</p>
            <p className="text-[10px] text-smoked-charcoal/50">Updates yearly</p>
            <p className="text-sm font-display text-copper-deep mt-1">{seasonalCount}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">{TYPE_COLORS.Trending}</p>
            <p className="text-xs font-bold text-desert-night mt-1">Trending</p>
            <p className="text-[10px] text-smoked-charcoal/50">Weekly/monthly</p>
            <p className="text-sm font-display text-copper-deep mt-1">{trendingCount}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">{TYPE_COLORS.Community}</p>
            <p className="text-xs font-bold text-desert-night mt-1">Community</p>
            <p className="text-[10px] text-smoked-charcoal/50">From comments</p>
            <p className="text-sm font-display text-copper-deep mt-1">{communityCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="field"
        />

        {/* Type filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Type</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter(null)}
              className={`chip !text-xs ${!typeFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {PROMPT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t === typeFilter ? null : t)}
                className={`chip !text-xs ${typeFilter === t ? "chip-copper" : "chip-cream"}`}
              >{TYPE_COLORS[t]} {t}</button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`chip !text-[10px] ${!categoryFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {PROMPT_CATEGORIES.map((c) => {
              const count = getPromptsByCategory(c).length;
              if (count === 0) return null;
              return (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c === categoryFilter ? null : c)}
                  className={`chip !text-[10px] ${categoryFilter === c ? "chip-copper" : "chip-cream"}`}
                >{c} ({count})</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-smoked-charcoal/60">
        {filtered.length} {filtered.length === 1 ? "prompt" : "prompts"}
      </p>

      {/* Prompts grouped by category */}
      <div className="space-y-6">
        {grouped.map(([category, prompts]) => (
          <div key={category}>
            <h2 className="font-display text-xl text-desert-night mb-3">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prompts.map((p) => (
                <div key={p.id} className="card p-4 space-y-2">
                  {/* Prompt text */}
                  <p className="text-sm text-desert-night font-bold leading-snug">
                    &ldquo;{p.text}&rdquo;
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip chip-cream !text-[9px]">{TYPE_COLORS[p.type]} {p.type}</span>
                    {p.season && (
                      <span className="chip chip-cream !text-[9px]">📅 {p.season}</span>
                    )}
                    <span className="chip chip-cream !text-[9px]">{STATUS_COLORS[p.status]} {p.status}</span>
                  </div>

                  {/* Works best with */}
                  {p.worksBestWith.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best with:</span>
                      {p.worksBestWith.slice(0, 3).map((w) => (
                        <span key={w} className="text-[10px] text-cactus-teal">{w}{p.worksBestWith.indexOf(w) < Math.min(p.worksBestWith.length, 3) - 1 ? "," : ""}</span>
                      ))}
                      {p.worksBestWith.length > 3 && (
                        <span className="text-[10px] text-smoked-charcoal/40">+{p.worksBestWith.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Usage stats */}
                  {p.timesUsed !== undefined && p.timesUsed > 0 && (
                    <p className="text-[10px] text-smoked-charcoal/40">
                      Used {p.timesUsed}x{p.lastUsed && ` · Last: ${new Date(p.lastUsed).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No prompts match those filters.</p>
          <button
            onClick={() => { setTypeFilter(null); setCategoryFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
    </PlannerOnly>
  );
}
