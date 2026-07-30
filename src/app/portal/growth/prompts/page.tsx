"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PROMPTS,
  PROMPT_CATEGORIES,
  PROMPT_TYPES,
  TYPE_COLORS,
  getPromptsByCategory,
  type PromptCategory,
  type PromptType,
} from "@/lib/growth/prompt-intelligence";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function PromptIntelligencePage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | null>(null);
  const [typeFilter, setTypeFilter] = useState<PromptType | null>(null);

  const filtered = useMemo(() => {
    return PROMPTS.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (typeFilter && p.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.text.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subTopic.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, categoryFilter, typeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<PromptCategory, typeof PROMPTS>();
    filtered.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Prompt Intelligence</h1>
        <InfoTooltip text="Document 4 of the Growth Intelligence System. The massive idea engine. Organized by category and sub-topic. This will eventually contain hundreds of prompts per category." />
        <p className="text-smoked-charcoal/70 mt-2">
          The massive idea engine. {PROMPTS.length} prompts across {PROMPT_CATEGORIES.length} categories.
        </p>
      </div>

      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          This is the living engine that keeps the content machine from running out of ideas.
          Organized by category and sub-topic so you can find the right prompt for the right format.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search prompts, categories, or sub-topics..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCategoryFilter(null)} className={`chip !text-[10px] ${!categoryFilter ? "chip-copper" : "chip-cream"}`}>All</button>
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

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Type</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTypeFilter(null)} className={`chip !text-xs ${!typeFilter ? "chip-copper" : "chip-cream"}`}>All</button>
          {PROMPT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? null : t)}
              className={`chip !text-xs ${typeFilter === t ? "chip-copper" : "chip-cream"}`}
            >{TYPE_COLORS[t]} {t}</button>
          ))}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} prompts</p>

      <div className="space-y-6">
        {grouped.map(([category, prompts]) => (
          <div key={category}>
            <h2 className="font-display text-xl text-desert-night mb-3">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prompts.map((p) => (
                <div key={p.id} className="card p-4 space-y-2">
                  <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{p.text}&rdquo;</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip chip-cream !text-[9px]">{TYPE_COLORS[p.type]} {p.type}</span>
                    <span className="chip chip-cream !text-[9px]">{p.subTopic}</span>
                  </div>
                  {p.worksBestWith.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best with:</span>
                      {p.worksBestWith.slice(0, 3).map((w) => (
                        <span key={w} className="text-[10px] text-cactus-teal">{w}{p.worksBestWith.indexOf(w) < Math.min(p.worksBestWith.length, 3) - 1 ? "," : ""}</span>
                      ))}
                    </div>
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
            onClick={() => { setCategoryFilter(null); setTypeFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}
    </div>
  );
}
