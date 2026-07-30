"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SEARCH_KEYWORDS,
  PERFORMANCE_COLORS,
  getKeywordsByCategory,
  type SearchKeywordIntelligence,
  type SearchCategory,
  type KeywordPerformance,
} from "@/lib/growth/search-keyword-intelligence";
import { InfoTooltip } from "@/components/InfoTooltip";

const CATEGORIES: SearchCategory[] = [
  "Local SEO",
  "Community Search",
  "Relationship Search",
  "Parenting Search",
  "Adulting Search",
  "Beauty Search",
  "Cultural Search",
  "Brand Search",
];

const PERFORMANCES: KeywordPerformance[] = ["High", "Medium", "Low", "New", "Fading"];

export default function SearchKeywordIntelligencePage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SearchCategory | null>(null);
  const [performanceFilter, setPerformanceFilter] = useState<KeywordPerformance | null>(null);

  const filtered = SEARCH_KEYWORDS.filter((k) => {
    if (categoryFilter && k.category !== categoryFilter) return false;
    if (performanceFilter && k.performance !== performanceFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        k.keyword.toLowerCase().includes(q) ||
        k.category.toLowerCase().includes(q) ||
        (k.notes?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Search Keyword Intelligence</h1>
        <InfoTooltip text="Document 5 of the Growth Intelligence System. The search terms that lead real people to AZ Off Script. Organized by category and tracked by performance so fading keywords get archived and rising ones get prioritized." />
        <p className="text-smoked-charcoal/70 mt-2">
          Stop guessing. Start answering the questions people are already typing.
        </p>
      </div>

      {/* Explainer */}
      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          Search keywords are the bridge between what people want and what we make.
          Each keyword is tracked by performance so we know what is growing, what is fading,
          and where new demand is forming. When a keyword fades, we stop forcing it. When one rises, we lean in.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search keywords, categories, or notes..."
          className="field"
        />

        {/* Category filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setCategoryFilter(null)} className={`chip !text-[10px] ${!categoryFilter ? "chip-copper" : "chip-cream"}`}>All</button>
            {CATEGORIES.map((c) => {
              const count = getKeywordsByCategory(c).length;
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

        {/* Performance filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Performance</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setPerformanceFilter(null)} className={`chip !text-[10px] ${!performanceFilter ? "chip-copper" : "chip-cream"}`}>All</button>
            {PERFORMANCES.map((p) => (
              <button
                key={p}
                onClick={() => setPerformanceFilter(p === performanceFilter ? null : p)}
                className={`chip !text-[10px] ${performanceFilter === p ? "chip-copper" : "chip-cream"}`}
              >{PERFORMANCE_COLORS[p]} {p}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} keywords</p>

      {/* Keyword cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((k) => (
          <div key={k.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-lg text-desert-night">{k.keyword}</p>
              <span className="chip chip-copper !text-[9px]">{PERFORMANCE_COLORS[k.performance]} {k.performance}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{k.category}</span>
            </div>

            {k.relatedTo && k.relatedTo.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Related to:</span>
                {k.relatedTo.map((r) => {
                  const related = SEARCH_KEYWORDS.find((x) => x.id === r);
                  return (
                    <span key={r} className="text-[10px] text-cactus-teal">
                      {related ? related.keyword : r}
                    </span>
                  );
                })}
              </div>
            )}

            {k.searchVolume && (
              <div className="bg-copper-clay/10 rounded-lg px-3 py-1.5">
                <span className="text-[10px] font-bold text-copper-deep uppercase">Volume: </span>
                <span className="text-xs text-desert-night">{k.searchVolume}</span>
              </div>
            )}

            {k.notes && (
              <p className="text-xs text-smoked-charcoal/60 italic">{k.notes}</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No keywords match those filters.</p>
          <button
            onClick={() => { setCategoryFilter(null); setPerformanceFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}
    </div>
  );
}
