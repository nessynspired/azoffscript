"use client";

import { useState } from "react";
import Link from "next/link";
import {
  // Captions
  CAPTION_TEMPLATES,
  CAPTION_TYPES,
  CAPTION_STATUS_COLORS,
  getCaptionsByType,
  type CaptionTemplate,
  type CaptionType,
  // Search
  SEARCH_KEYWORDS,
  SEARCH_CATEGORIES,
  PERFORMANCE_COLORS,
  getKeywordsByCategory,
  type SearchKeyword,
  type SearchCategory,
  // Comment prompts
  COMMENT_PROMPTS,
  COMMENT_PROMPT_TYPES,
  type CommentPrompt,
  type CommentPromptType,
  // Trends
  TRENDS,
  TREND_TYPES,
  STAGE_COLORS,
  type Trend,
  type TrendType,
} from "@/lib/discovery-library";
import { InfoTooltip } from "@/components/InfoTooltip";

type Tab = "captions" | "search" | "comments" | "trends";

export default function DiscoveryPage() {
  const [tab, setTab] = useState<Tab>("captions");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Discovery Library</h1>
        <InfoTooltip text="How people find us. This is a LIVING library — it changes frequently based on TikTok changes, trends, search behavior, and what's performing. Not a permanent production library." />
        <p className="text-smoked-charcoal/70 mt-2">
          How people find us. Captions, search keywords, comment prompts, and trend monitoring. This library is living — it updates continuously.
        </p>
      </div>

      {/* Architecture explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">This library is different</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          The production libraries (content formats, transitions, recording styles, editing recipes) are built once.
          This library changes because phrases get stale, search behavior shifts, hashtags rise and fall, and trends come and go.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">📝</p>
            <p className="text-xs font-bold text-desert-night mt-1">Captions</p>
            <p className="text-[10px] text-smoked-charcoal/50">Phrases get stale</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">🔍</p>
            <p className="text-xs font-bold text-desert-night mt-1">Search</p>
            <p className="text-[10px] text-smoked-charcoal/50">Behavior shifts</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">💬</p>
            <p className="text-xs font-bold text-desert-night mt-1">Comments</p>
            <p className="text-[10px] text-smoked-charcoal/50">Drives engagement</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">📈</p>
            <p className="text-xs font-bold text-desert-night mt-1">Trends</p>
            <p className="text-[10px] text-smoked-charcoal/50">Rise and fall</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("captions")}
          className={`chip !text-xs ${tab === "captions" ? "chip-copper" : "chip-cream"}`}
        >📝 Captions ({CAPTION_TEMPLATES.length})</button>
        <button
          onClick={() => setTab("search")}
          className={`chip !text-xs ${tab === "search" ? "chip-copper" : "chip-cream"}`}
        >🔍 Search ({SEARCH_KEYWORDS.length})</button>
        <button
          onClick={() => setTab("comments")}
          className={`chip !text-xs ${tab === "comments" ? "chip-copper" : "chip-cream"}`}
        >💬 Comments ({COMMENT_PROMPTS.length})</button>
        <button
          onClick={() => setTab("trends")}
          className={`chip !text-xs ${tab === "trends" ? "chip-copper" : "chip-cream"}`}
        >📈 Trends ({TRENDS.length})</button>
      </div>

      {/* Tab content */}
      {tab === "captions" && <CaptionsTab />}
      {tab === "search" && <SearchTab />}
      {tab === "comments" && <CommentsTab />}
      {tab === "trends" && <TrendsTab />}

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
  );
}

// ===== CAPTIONS TAB =====
function CaptionsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CaptionType | null>(null);

  const filtered = CAPTION_TEMPLATES.filter((c) => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.text.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search captions..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Caption type</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={`chip !text-[10px] ${!typeFilter ? "chip-copper" : "chip-cream"}`}
          >All</button>
          {CAPTION_TYPES.map((t) => {
            const count = getCaptionsByType(t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t === typeFilter ? null : t)}
                className={`chip !text-[10px] ${typeFilter === t ? "chip-copper" : "chip-cream"}`}
              >{t} ({count})</button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} captions</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="card p-4 space-y-2">
            <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{c.text}&rdquo;</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-copper !text-[9px]">{c.type}</span>
              <span className="chip chip-cream !text-[9px]">{CAPTION_STATUS_COLORS[c.status]} {c.status}</span>
            </div>
            {c.worksBestWith.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best with:</span>
                {c.worksBestWith.slice(0, 3).map((w) => (
                  <span key={w} className="text-[10px] text-cactus-teal">{w}{c.worksBestWith.indexOf(w) < Math.min(c.worksBestWith.length, 3) - 1 ? "," : ""}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== SEARCH TAB =====
function SearchTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SearchCategory | null>(null);

  const filtered = SEARCH_KEYWORDS.filter((k) => {
    if (categoryFilter && k.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return k.keyword.toLowerCase().includes(q) || k.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search keywords..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`chip !text-[10px] ${!categoryFilter ? "chip-copper" : "chip-cream"}`}
          >All</button>
          {SEARCH_CATEGORIES.map((c) => {
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

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} keywords</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((k) => (
          <div key={k.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-desert-night font-bold">{k.keyword}</p>
              {k.performance && (
                <span className="text-lg shrink-0" title={k.performance}>
                  {PERFORMANCE_COLORS[k.performance]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{k.category}</span>
              {k.performance && (
                <span className="chip chip-cream !text-[9px]">{PERFORMANCE_COLORS[k.performance]} {k.performance}</span>
              )}
            </div>
            {k.relatedTo && k.relatedTo.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Related:</span>
                {k.relatedTo.map((r) => (
                  <span key={r} className="text-[10px] text-copper-deep">{r}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== COMMENTS TAB =====
function CommentsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CommentPromptType | null>(null);

  const filtered = COMMENT_PROMPTS.filter((c) => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.text.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search comment prompts..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Type</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={`chip !text-[10px] ${!typeFilter ? "chip-copper" : "chip-cream"}`}
          >All</button>
          {COMMENT_PROMPT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? null : t)}
              className={`chip !text-[10px] ${typeFilter === t ? "chip-copper" : "chip-cream"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="bg-copper-clay/10 rounded-xl p-3">
        <p className="text-xs text-copper-deep">
          <strong>Tip:</strong> Binary questions (yes/no, guilty/not guilty) get the most comments.
          Open questions get longer comments. Tag prompts drive shares.
        </p>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} comment prompts</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="card p-4 space-y-2">
            <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{c.text}&rdquo;</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-copper !text-[9px]">{c.type}</span>
            </div>
            {c.worksBestWith.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best with:</span>
                {c.worksBestWith.slice(0, 3).map((w) => (
                  <span key={w} className="text-[10px] text-cactus-teal">{w}{c.worksBestWith.indexOf(w) < Math.min(c.worksBestWith.length, 3) - 1 ? "," : ""}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== TRENDS TAB =====
function TrendsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TrendType | null>(null);

  const filtered = TRENDS.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.howToUse.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-sunburst-yellow/10 rounded-xl p-3">
        <p className="text-xs text-desert-night/70">
          <strong>📈 Trend monitoring.</strong> These get updated weekly/monthly.
          Track what&apos;s rising, peaking, and fading so we know when to lean in or move on.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search trends..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Type</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={`chip !text-[10px] ${!typeFilter ? "chip-copper" : "chip-cream"}`}
          >All</button>
          {TREND_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? null : t)}
              className={`chip !text-[10px] ${typeFilter === t ? "chip-copper" : "chip-cream"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} trends</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <div key={t.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-desert-night font-bold">{t.name}</p>
                <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{t.type}</p>
              </div>
              <span className="text-2xl shrink-0" title={t.stage}>
                {STAGE_COLORS[t.stage]}
              </span>
            </div>
            <div className="bg-cactus-teal/10 rounded-lg p-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">How to use</p>
              <p className="text-sm text-desert-night mt-0.5">{t.howToUse}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{STAGE_COLORS[t.stage]} {t.stage}</span>
              <span className="chip chip-cream !text-[9px]">{t.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
