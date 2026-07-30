"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TREND_CAPTURES,
  STAGE_COLORS,
  DECISION_COLORS,
  getTrendsByStage,
  getTrendsByDecision,
  type TrendCaptureEntry,
  type TrendType,
  type TrendStage,
  type TrendDecision,
} from "@/lib/growth/trend-capture-system";
import { InfoTooltip } from "@/components/InfoTooltip";

const TREND_TYPES: TrendType[] = ["Format", "Topic", "Sound", "Phrase", "Hook"];
const STAGES: TrendStage[] = ["Rising", "Peaking", "Fading", "Watch"];
const DECISIONS: TrendDecision[] = ["Keep", "Modify", "Ignore"];

export default function TrendCaptureSystemPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TrendType | null>(null);
  const [stageFilter, setStageFilter] = useState<TrendStage | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<TrendDecision | null>(null);

  const filtered = TREND_CAPTURES.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (stageFilter && t.stage !== stageFilter) return false;
    if (decisionFilter && t.decision !== decisionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.whyItWorks.toLowerCase().includes(q) ||
        t.azOffScriptAdaptation.toLowerCase().includes(q) ||
        t.bestFormats.some((f) => f.toLowerCase().includes(q))
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
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Trend Capture System</h1>
        <InfoTooltip text="Document 6 of the Growth Intelligence System. This is not a list of trends — it is HOW we evaluate trends. Every trend gets a why it works, why people watch, an AZ Off Script adaptation, and a Keep / Modify / Ignore decision." />
        <p className="text-smoked-charcoal/70 mt-2">
          We don&rsquo;t chase trends. We study them, decide, and adapt on our terms.
        </p>
      </div>

      {/* Explainer */}
      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          The question is never &ldquo;is this trending?&rdquo; but &ldquo;can we make this uniquely AZ Off Script?&rdquo;
          Each trend entry captures the psychology behind it, what makes people watch, and how we would adapt it
          without losing our identity. Then we make a decision: Keep, Modify, or Ignore.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trends by name, why it works, or adaptation..."
          className="field"
        />

        {/* Type filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Type</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setTypeFilter(null)} className={`chip !text-[10px] ${!typeFilter ? "chip-copper" : "chip-cream"}`}>All</button>
            {TREND_TYPES.map((t) => {
              const count = TREND_CAPTURES.filter((x) => x.type === t).length;
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

        {/* Stage filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Stage</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setStageFilter(null)} className={`chip !text-[10px] ${!stageFilter ? "chip-copper" : "chip-cream"}`}>All</button>
            {STAGES.map((s) => {
              const count = getTrendsByStage(s).length;
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setStageFilter(s === stageFilter ? null : s)}
                  className={`chip !text-[10px] ${stageFilter === s ? "chip-copper" : "chip-cream"}`}
                >{STAGE_COLORS[s]} {s} ({count})</button>
              );
            })}
          </div>
        </div>

        {/* Decision filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Decision</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setDecisionFilter(null)} className={`chip !text-[10px] ${!decisionFilter ? "chip-copper" : "chip-cream"}`}>All</button>
            {DECISIONS.map((d) => {
              const count = getTrendsByDecision(d).length;
              if (count === 0) return null;
              return (
                <button
                  key={d}
                  onClick={() => setDecisionFilter(d === decisionFilter ? null : d)}
                  className={`chip !text-[10px] ${decisionFilter === d ? "chip-copper" : "chip-cream"}`}
                >{DECISION_COLORS[d]} {d} ({count})</button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} trends</p>

      {/* Trend cards — list, not grid, because these are detailed */}
      <div className="space-y-4">
        {filtered.map((t) => (
          <div key={t.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-display text-lg text-desert-night">{t.name}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip chip-cream !text-[9px]">{t.type}</span>
                <span className="chip chip-cream !text-[9px]">{STAGE_COLORS[t.stage]} {t.stage}</span>
                <span className="chip chip-copper !text-[9px]">{DECISION_COLORS[t.decision]} {t.decision}</span>
              </div>
            </div>

            <p className="text-xs text-smoked-charcoal/50">Found {t.dateFound}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-sandstone-cream/50 rounded-xl p-3">
                <p className="text-xs font-bold text-desert-night/50 uppercase">Why it works</p>
                <p className="text-sm text-desert-night mt-1">{t.whyItWorks}</p>
              </div>
              <div className="bg-sandstone-cream/50 rounded-xl p-3">
                <p className="text-xs font-bold text-desert-night/50 uppercase">Why people watch</p>
                <p className="text-sm text-desert-night mt-1">{t.whyPeopleWatch}</p>
              </div>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">AZ Off Script adaptation</p>
              <p className="text-sm text-desert-night mt-1">{t.azOffScriptAdaptation}</p>
            </div>

            {t.bestFormats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best formats:</span>
                {t.bestFormats.map((f) => (
                  <span key={f} className="chip chip-cream !text-[10px]">{f}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No trends match those filters.</p>
          <button
            onClick={() => { setTypeFilter(null); setStageFilter(null); setDecisionFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}
    </div>
  );
}
