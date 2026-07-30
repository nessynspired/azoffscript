"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SATURATED_MARKETS,
  SATURATION_COLORS,
  WHITE_SPACE_OPPORTUNITIES,
  ANTI_BRAND_RULES,
  getFloodedMarkets,
  getGrowingMarkets,
  type SaturatedMarket,
  type MarketSaturation,
} from "@/lib/growth/market-gap-intelligence";
import { InfoTooltip } from "@/components/InfoTooltip";

type Part = "saturated" | "whitespace" | "antibrand";

export default function MarketGapPage() {
  const [part, setPart] = useState<Part>("saturated");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Market Gap Intelligence</h1>
        <InfoTooltip text="Document 1 of the Growth Intelligence System. Understand where the market is crowded, where opportunities exist, and how AZ Off Script enters differently. This protects against becoming another generic creator page." />
        <p className="text-smoked-charcoal/70 mt-2">
          Where the market is crowded, where opportunities exist, and how AZ Off Script enters differently.
        </p>
      </div>

      {/* Part tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPart("saturated")}
          className={`chip !text-xs ${part === "saturated" ? "chip-copper" : "chip-cream"}`}
        >🌊 Saturated Markets ({SATURATED_MARKETS.length})</button>
        <button
          onClick={() => setPart("whitespace")}
          className={`chip !text-xs ${part === "whitespace" ? "chip-copper" : "chip-cream"}`}
        >🌱 White Space ({WHITE_SPACE_OPPORTUNITIES.length})</button>
        <button
          onClick={() => setPart("antibrand")}
          className={`chip !text-xs ${part === "antibrand" ? "chip-copper" : "chip-cream"}`}
        >🚫 What We Refuse ({ANTI_BRAND_RULES.length})</button>
      </div>

      {part === "saturated" && <SaturatedMarketsPart />}
      {part === "whitespace" && <WhiteSpacePart />}
      {part === "antibrand" && <AntiBrandPart />}
    </div>
  );
}

// ===== SATURATED MARKETS =====
function SaturatedMarketsPart() {
  const [search, setSearch] = useState("");
  const [satFilter, setSatFilter] = useState<MarketSaturation | null>(null);

  const filtered = SATURATED_MARKETS.filter((m) => {
    if (satFilter && m.saturation !== satFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return m.market.toLowerCase().includes(q) ||
        m.azOffScriptOpportunity.some((o) => o.toLowerCase().includes(q)) ||
        m.examplePrompts.some((p) => p.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="card p-4 bg-copper-clay/10">
        <p className="text-sm text-copper-deep">
          <strong>Part 1 — Saturated Markets.</strong> For each market: what everyone does, why it&apos;s a problem, and what AZ Off Script does instead.
          The opportunity is always the difference.
        </p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <span>🌊 Flooded: {getFloodedMarkets().length}</span>
          <span>👥 Crowded: {SATURATED_MARKETS.filter(m => m.saturation === "Crowded").length}</span>
          <span>⚔️ Competitive: {SATURATED_MARKETS.filter(m => m.saturation === "Competitive").length}</span>
          <span>🌱 Growing: {getGrowingMarkets().length}</span>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search markets, opportunities, or prompts..."
        className="field"
      />

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setSatFilter(null)} className={`chip !text-[10px] ${!satFilter ? "chip-copper" : "chip-cream"}`}>All</button>
        {(["Flooded", "Crowded", "Competitive", "Growing"] as MarketSaturation[]).map((s) => (
          <button
            key={s}
            onClick={() => setSatFilter(s === satFilter ? null : s)}
            className={`chip !text-[10px] ${satFilter === s ? "chip-copper" : "chip-cream"}`}
          >{SATURATION_COLORS[s]} {s}</button>
        ))}
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} markets</p>

      <div className="space-y-4">
        {filtered.map((m) => <SaturatedMarketCard key={m.id} market={m} />)}
      </div>
    </div>
  );
}

function SaturatedMarketCard({ market }: { market: SaturatedMarket }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-5 space-y-3">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg text-desert-night">{market.market}</p>
            <span className="chip chip-cream !text-[9px] mt-1">{SATURATION_COLORS[market.saturation]} {market.saturation}</span>
          </div>
          <span className="text-copper-clay text-xs font-bold">{expanded ? "▲ Close" : "▼ Expand"}</span>
        </div>
      </button>

      {!expanded && (
        <p className="text-sm text-smoked-charcoal/70">{market.problem}</p>
      )}

      {expanded && (
        <>
          {/* Current state */}
          <div className="bg-heat-orange/10 rounded-xl p-3">
            <p className="text-xs font-bold text-heat-orange uppercase">❌ Current market — what everyone does</p>
            <ul className="mt-2 space-y-1">
              {market.currentState.map((c, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                  <span className="text-heat-orange/50 shrink-0">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Problem */}
          <div className="bg-desert-night/5 rounded-xl p-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase">The problem</p>
            <p className="text-sm text-smoked-charcoal/70 mt-1">{market.problem}</p>
          </div>

          {/* AZ Off Script opportunity */}
          <div className="bg-cactus-teal/10 rounded-xl p-3">
            <p className="text-xs font-bold text-cactus-teal uppercase">✅ AZ Off Script — what we do instead</p>
            <ul className="mt-2 space-y-1">
              {market.azOffScriptOpportunity.map((o, i) => (
                <li key={i} className="text-sm text-desert-night flex gap-2">
                  <span className="text-cactus-teal shrink-0">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Best formats */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best formats:</span>
            {market.bestFormats.map((f) => (
              <span key={f} className="chip chip-cream !text-[10px]">{f}</span>
            ))}
          </div>

          {/* Example prompts */}
          <div className="bg-copper-clay/10 rounded-xl p-3">
            <p className="text-xs font-bold text-copper-deep uppercase">Example prompts</p>
            <ul className="mt-2 space-y-1">
              {market.examplePrompts.map((p, i) => (
                <li key={i} className="text-sm text-desert-night italic flex gap-2">
                  <span className="text-copper-clay shrink-0">→</span>
                  <span>&ldquo;{p}&rdquo;</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ===== WHITE SPACE =====
function WhiteSpacePart() {
  return (
    <div className="space-y-4">
      <div className="card p-4 bg-cactus-teal/10">
        <p className="text-sm text-cactus-teal">
          <strong>Part 2 — White Space Opportunities.</strong> Categories where AZ Off Script can own a lane.
          Each has a moat — the thing that makes it hard to copy.
        </p>
      </div>

      <div className="space-y-4">
        {WHITE_SPACE_OPPORTUNITIES.map((ws) => (
          <div key={ws.id} className="card p-5 space-y-3">
            <p className="font-display text-lg text-desert-night">{ws.opportunity}</p>

            <div className="bg-desert-night/5 rounded-xl p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">The lane</p>
              <p className="text-sm text-desert-night mt-1">{ws.lane}</p>
            </div>

            <div className="bg-heat-orange/10 rounded-xl p-3">
              <p className="text-xs font-bold text-heat-orange uppercase">Why no one owns it</p>
              <p className="text-sm text-smoked-charcoal/70 mt-1">{ws.whyNoOneOwnsIt}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">How we fill it</p>
              <p className="text-sm text-desert-night mt-1">{ws.howWeFillIt}</p>
            </div>

            <div className="bg-copper-clay/10 rounded-xl p-3">
              <p className="text-xs font-bold text-copper-deep uppercase">🛡️ The moat — why it's hard to copy</p>
              <p className="text-sm text-desert-night mt-1">{ws.moat}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best formats:</span>
              {ws.bestFormats.map((f) => (
                <span key={f} className="chip chip-cream !text-[10px]">{f}</span>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">How to measure success</p>
              <ul className="mt-1.5 space-y-1">
                {ws.successMetrics.map((s, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                    <span className="text-cactus-teal shrink-0">✓</span>
                    <span>{s}</span>
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

// ===== ANTI-BRAND =====
function AntiBrandPart() {
  return (
    <div className="space-y-4">
      <div className="card p-4 bg-heat-orange/10">
        <p className="text-sm text-heat-orange">
          <strong>Part 3 — What We Refuse To Become.</strong> The anti-brand list.
          These are the things that would destroy AZ Off Script&apos;s identity if we did them.
        </p>
      </div>

      <div className="space-y-3">
        {ANTI_BRAND_RULES.map((ab) => (
          <div key={ab.id} className="card p-5 space-y-3">
            <p className="font-display text-lg text-desert-night">❌ {ab.category}</p>

            <div className="bg-heat-orange/10 rounded-xl p-3">
              <p className="text-xs font-bold text-heat-orange uppercase">We refuse to become</p>
              <p className="text-sm text-smoked-charcoal/70 mt-1">{ab.refuse}</p>
            </div>

            <div className="bg-desert-night/5 rounded-xl p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Why</p>
              <p className="text-sm text-smoked-charcoal/70 mt-1">{ab.why}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">✅ Do instead</p>
              <p className="text-sm text-desert-night mt-1">{ab.doInstead}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-heat-orange uppercase">Specific behaviors to avoid</p>
              <ul className="mt-1.5 space-y-1">
                {ab.behaviors.map((b, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                    <span className="text-heat-orange shrink-0">✗</span>
                    <span>{b}</span>
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
