"use client";

import { useState } from "react";
import Link from "next/link";
import {
  // Market gaps
  MARKET_GAPS,
  type MarketGap,
  // Advantages
  CONTENT_ADVANTAGES,
  type ContentAdvantage,
  // Hooks
  HOOKS,
  HOOK_TYPES,
  HOOK_TYPE_COLORS,
  getHooksByType,
  type Hook,
  type HookType,
  // Captions
  CAPTION_FRAMEWORKS,
  CAPTION_TYPES,
  STATUS_COLORS,
  getCaptionsByType,
  type CaptionFramework,
  type CaptionType,
  // Comment prompts
  COMMENT_PROMPTS,
  COMMENT_PROMPT_TYPES,
  type CommentPrompt,
  type CommentPromptType,
  // Search
  SEARCH_KEYWORDS,
  SEARCH_CATEGORIES,
  PERFORMANCE_COLORS,
  getKeywordsByCategory,
  type SearchKeyword,
  type SearchCategory,
  // Trends
  TREND_CAPTURES,
  TREND_TYPES,
  STAGE_COLORS,
  type TrendCapture,
  type TrendType,
  // Do not chase
  DO_NOT_CHASE,
  type DoNotChase,
  // Trend filter
  TREND_FILTER,
} from "@/lib/discovery-library";
import { InfoTooltip } from "@/components/InfoTooltip";
import { PlannerOnly } from "@/components/PlannerOnly";

type Tab = "gaps" | "advantages" | "hooks" | "captions" | "comments" | "search" | "trends" | "filter" | "dont";

export default function DiscoveryPage() {
  const [tab, setTab] = useState<Tab>("gaps");

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "gaps", label: "Market Gaps", icon: "🎯", count: MARKET_GAPS.length },
    { id: "advantages", label: "Advantages", icon: "🛡️", count: CONTENT_ADVANTAGES.length },
    { id: "hooks", label: "Hooks", icon: "🪝", count: HOOKS.length },
    { id: "captions", label: "Captions", icon: "📝", count: CAPTION_FRAMEWORKS.length },
    { id: "comments", label: "Comments", icon: "💬", count: COMMENT_PROMPTS.length },
    { id: "search", label: "Search", icon: "🔍", count: SEARCH_KEYWORDS.length },
    { id: "trends", label: "Trends", icon: "📈", count: TREND_CAPTURES.length },
    { id: "filter", label: "Trend Filter", icon: "✅" },
    { id: "dont", label: "Don't Chase", icon: "🚫", count: DO_NOT_CHASE.length },
  ];

  return (
    <PlannerOnly label="The Discovery Library">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Discovery Library</h1>
        <InfoTooltip text="How do we make sure people find us AND remember us? Not: how do we copy what everyone else is doing. This is a living library AND a brand protection library." />
        <p className="text-smoked-charcoal/70 mt-2">
          How people find us — and how we stay different. The question is not &ldquo;what is trending?&rdquo; but &ldquo;what is trending that we can make uniquely AZ Off Script?&rdquo;
        </p>
      </div>

      {/* Strategy explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">This library is different</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          The market is flooded. Everyone is making the same content. This library stops AZ Off Script
          from becoming another copy/paste creator group. It&apos;s not just captions and hashtags —
          it protects the <strong>brand identity</strong>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">🎯</p>
            <p className="text-xs font-bold text-desert-night mt-1">Market Gaps</p>
            <p className="text-[10px] text-smoked-charcoal/50">Where we differ</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">🛡️</p>
            <p className="text-xs font-bold text-desert-night mt-1">Advantages</p>
            <p className="text-[10px] text-smoked-charcoal/50">What protects us</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">🚫</p>
            <p className="text-xs font-bold text-desert-night mt-1">Don&apos;t Chase</p>
            <p className="text-[10px] text-smoked-charcoal/50">What we avoid</p>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <p className="text-2xl">✅</p>
            <p className="text-xs font-bold text-desert-night mt-1">Trend Filter</p>
            <p className="text-[10px] text-smoked-charcoal/50">Before using a trend</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`chip !text-xs ${tab === t.id ? "chip-copper" : "chip-cream"}`}
          >
            {t.icon} {t.label}{t.count !== undefined && ` (${t.count})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "gaps" && <MarketGapsTab />}
      {tab === "advantages" && <AdvantagesTab />}
      {tab === "hooks" && <HooksTab />}
      {tab === "captions" && <CaptionsTab />}
      {tab === "comments" && <CommentsTab />}
      {tab === "search" && <SearchTab />}
      {tab === "trends" && <TrendsTab />}
      {tab === "filter" && <TrendFilterTab />}
      {tab === "dont" && <DoNotChaseTab />}

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
    </PlannerOnly>
  );
}

// ===== MARKET GAPS TAB =====
function MarketGapsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-copper-clay/10 rounded-xl p-3">
        <p className="text-xs text-copper-deep">
          <strong>Market gaps.</strong> Find areas where everyone is already making content, then find the AZ Off Script difference.
          The flooded version is what everyone does. The AZ Off Script angle is what we do instead.
        </p>
      </div>

      <div className="space-y-4">
        {MARKET_GAPS.map((gap) => (
          <div key={gap.id} className="card p-5 space-y-4">
            <p className="font-display text-lg text-desert-night">{gap.market}</p>

            {/* Flooded */}
            <div className="bg-heat-orange/10 rounded-xl p-3">
              <p className="text-xs font-bold text-heat-orange uppercase">❌ Flooded — what everyone does</p>
              <ul className="mt-2 space-y-1">
                {gap.flooded.map((f, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                    <span className="text-heat-orange/50 shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AZ Off Script angle */}
            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">✅ AZ Off Script — what we do instead</p>
              <ul className="mt-2 space-y-1">
                {gap.azOffScriptAngle.map((a, i) => (
                  <li key={i} className="text-sm text-desert-night flex gap-2">
                    <span className="text-cactus-teal shrink-0">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best formats */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best formats:</span>
              {gap.bestFormats.map((f) => (
                <span key={f} className="chip chip-cream !text-[10px]">{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== ADVANTAGES TAB =====
function AdvantagesTab() {
  return (
    <div className="space-y-4">
      <div className="bg-cactus-teal/10 rounded-xl p-3">
        <p className="text-xs text-cactus-teal">
          <strong>Content advantages.</strong> This is the part that protects us from being another page.
          These are the things nobody can easily copy.
        </p>
      </div>

      <div className="space-y-4">
        {CONTENT_ADVANTAGES.map((adv) => (
          <div key={adv.id} className="card p-5 space-y-3">
            <p className="font-display text-lg text-desert-night">{adv.advantage}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-heat-orange/10 rounded-xl p-3">
                <p className="text-xs font-bold text-heat-orange uppercase">Most creators</p>
                <p className="text-sm text-smoked-charcoal/70 mt-1">{adv.mostCreators}</p>
              </div>
              <div className="bg-cactus-teal/10 rounded-xl p-3">
                <p className="text-xs font-bold text-cactus-teal uppercase">AZ Off Script</p>
                <p className="text-sm text-desert-night mt-1">{adv.azOffScript}</p>
              </div>
            </div>

            <div className="bg-copper-clay/10 rounded-xl p-3">
              <p className="text-xs font-bold text-copper-deep uppercase">Why it matters</p>
              <p className="text-sm text-desert-night mt-1">{adv.whyItMatters}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Examples</p>
              <ul className="mt-1.5 space-y-1">
                {adv.examples.map((e, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                    <span className="text-copper-clay shrink-0">→</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== HOOKS TAB =====
function HooksTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<HookType | null>(null);

  const filtered = HOOKS.filter((h) => {
    if (typeFilter && h.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return h.text.toLowerCase().includes(q) || h.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-sunburst-yellow/10 rounded-xl p-3">
        <p className="text-xs text-desert-night/70">
          <strong>🪝 Hook library.</strong> Not trends. Hooks that work repeatedly.
          These are the opening lines that make people stop scrolling.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search hooks..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Hook type</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={`chip !text-[10px] ${!typeFilter ? "chip-copper" : "chip-cream"}`}
          >All</button>
          {HOOK_TYPES.map((t) => {
            const count = getHooksByType(t).length;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t === typeFilter ? null : t)}
                className={`chip !text-[10px] ${typeFilter === t ? "chip-copper" : "chip-cream"}`}
              >{HOOK_TYPE_COLORS[t]} {t} ({count})</button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} hooks</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((h) => (
          <div key={h.id} className="card p-4 space-y-2">
            <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{h.text}&rdquo;</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-copper !text-[9px]">{HOOK_TYPE_COLORS[h.type]} {h.type}</span>
            </div>
            {h.worksBestWith.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best with:</span>
                {h.worksBestWith.slice(0, 3).map((w) => (
                  <span key={w} className="text-[10px] text-cactus-teal">{w}{h.worksBestWith.indexOf(w) < Math.min(h.worksBestWith.length, 3) - 1 ? "," : ""}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CAPTIONS TAB =====
function CaptionsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CaptionType | null>(null);

  const filtered = CAPTION_FRAMEWORKS.filter((c) => {
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
              <span className="chip chip-cream !text-[9px]">{STATUS_COLORS[c.status]} {c.status}</span>
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
      <div className="bg-copper-clay/10 rounded-xl p-3">
        <p className="text-xs text-copper-deep">
          <strong>Comment strategy.</strong> Comments are part of the content engine. TikTok positions
          comments and community response as a major part of discovery and trust. Don&apos;t end with
          &ldquo;follow for more&rdquo; — end with a question.
        </p>
      </div>

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

      <div className="bg-cactus-teal/10 rounded-xl p-3">
        <p className="text-xs text-cactus-teal">
          <strong>Tip:</strong> Binary questions (yes/no, guilty/not guilty) get the most comments.
          Open questions get longer comments. Tag prompts drive shares.
          Community prompts feed back into the Prompt Library.
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

// ===== TRENDS TAB =====
function TrendsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TrendType | null>(null);

  const filtered = TREND_CAPTURES.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.azOffScriptVersion.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-sunburst-yellow/10 rounded-xl p-3">
        <p className="text-xs text-desert-night/70">
          <strong>📈 Trend capture.</strong> This changes weekly. For each trend: why it works,
          how AZ Off Script makes it ours, and which formats to use. Run every trend through the
          Trend Filter before using it.
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

      <div className="space-y-4">
        {filtered.map((t) => (
          <div key={t.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg text-desert-night">{t.name}</p>
                <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{t.type}</p>
              </div>
              <span className="text-3xl shrink-0" title={t.stage}>
                {STAGE_COLORS[t.stage]}
              </span>
            </div>

            <div className="bg-desert-night/5 rounded-lg p-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Why it works</p>
              <p className="text-sm text-smoked-charcoal/70 mt-0.5">{t.whyItWorks}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">AZ Off Script version — how we make it ours</p>
              <p className="text-sm text-desert-night mt-1">{t.azOffScriptVersion}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{STAGE_COLORS[t.stage]} {t.stage}</span>
              {t.bestFormats.map((f) => (
                <span key={f} className="chip chip-cream !text-[9px]">{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== TREND FILTER TAB =====
function TrendFilterTab() {
  return (
    <div className="space-y-4">
      <div className="card p-5 bg-copper-clay/10">
        <p className="font-display text-lg text-desert-night">Before using any trend, ask:</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2">
          Run every trend through these 4 questions. If it doesn&apos;t pass, don&apos;t use it —
          or add an AZ Off Script twist until it does.
        </p>
      </div>

      <div className="space-y-3">
        {TREND_FILTER.map((q, i) => (
          <div key={q.id} className="card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-copper-clay text-bone-white text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="font-display text-lg text-desert-night">{q.question}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-cactus-teal/10 rounded-xl p-3">
                <p className="text-xs font-bold text-cactus-teal uppercase">✅ Good answer</p>
                <p className="text-sm text-desert-night mt-1">{q.goodAnswer}</p>
              </div>
              <div className="bg-heat-orange/10 rounded-xl p-3">
                <p className="text-xs font-bold text-heat-orange uppercase">❌ Bad answer</p>
                <p className="text-sm text-smoked-charcoal/70 mt-1">{q.badAnswer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-sunburst-yellow/10">
        <p className="text-sm text-desert-night">
          <strong>If a trend fails the filter:</strong> Don&apos;t use it as-is. Either skip it,
          or find the AZ Off Script twist that makes it pass. The twist is usually:
          multiple women, real conversation, local angle, or debate format.
        </p>
      </div>
    </div>
  );
}

// ===== DO NOT CHASE TAB =====
function DoNotChaseTab() {
  return (
    <div className="space-y-4">
      <div className="card p-5 bg-heat-orange/10">
        <p className="font-display text-lg text-desert-night">Things we DO NOT chase</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2">
          AZ Off Script should avoid becoming any of these. These markets are already crowded,
          and they don&apos;t fit who we are. This list protects the brand identity.
        </p>
      </div>

      <div className="space-y-3">
        {DO_NOT_CHASE.map((d) => (
          <div key={d.id} className="card p-5 space-y-3">
            <p className="font-display text-lg text-desert-night">❌ {d.category}</p>

            <div className="bg-heat-orange/10 rounded-xl p-3">
              <p className="text-xs font-bold text-heat-orange uppercase">Avoid</p>
              <p className="text-sm text-smoked-charcoal/70 mt-1">{d.avoid}</p>
            </div>

            <div className="bg-desert-night/5 rounded-xl p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Why we don&apos;t chase this</p>
              <p className="text-sm text-smoked-charcoal/70 mt-1">{d.why}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">✅ Do instead</p>
              <p className="text-sm text-desert-night mt-1">{d.doInstead}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
