"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SEASONAL_OPPORTUNITIES,
  SEASONS,
  type Season,
  type SeasonalOpportunity,
} from "@/lib/growth/seasonal-opportunity-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function SeasonalOpportunitiesPage() {
  const [seasonFilter, setSeasonFilter] = useState<Season | null>(null);

  const seasonsToShow = seasonFilter ? [seasonFilter] : SEASONS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Seasonal Opportunities</h1>
        <InfoTooltip text="Document 7 of the Growth Intelligence System. Timing matters. Each season has its own emotional weight and conversation surface, especially in Arizona where the calendar hits differently. Plan early. Post intentionally." />
        <p className="text-smoked-charcoal/70 mt-2">
          Plan early. Post intentionally. Never let a season sneak up on us.
        </p>
      </div>

      {/* Explainer */}
      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          Seasonal content only works if we are early. Each season brings its own emotional weight —
          the holidays carry grief and expectations, Arizona summer carries isolation and survival,
          back to school carries mom guilt and friendship shifts. We map the moments ahead of time
          so we are ready when they arrive.
        </p>
      </div>

      {/* Season filter */}
      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Season</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setSeasonFilter(null)} className={`chip !text-[10px] ${!seasonFilter ? "chip-copper" : "chip-cream"}`}>All</button>
          {SEASONS.map((s) => {
            const count = SEASONAL_OPPORTUNITIES.filter((o) => o.season === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setSeasonFilter(s === seasonFilter ? null : s)}
                className={`chip !text-[10px] ${seasonFilter === s ? "chip-copper" : "chip-cream"}`}
              >{s} ({count})</button>
            );
          })}
        </div>
      </div>

      {/* Grouped display by season */}
      <div className="space-y-8">
        {seasonsToShow.map((season) => {
          const opportunities = SEASONAL_OPPORTUNITIES.filter((o) => o.season === season);
          if (opportunities.length === 0) return null;
          return (
            <div key={season} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl text-desert-night">{season}</h2>
                <span className="text-xs text-smoked-charcoal/50">{opportunities.length} opportunities</span>
              </div>
              <div className="space-y-3">
                {opportunities.map((o) => (
                  <SeasonalCard key={o.id} opportunity={o} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {seasonsToShow.every((s) => SEASONAL_OPPORTUNITIES.filter((o) => o.season === s).length === 0) && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No opportunities found.</p>
          <button
            onClick={() => setSeasonFilter(null)}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filter</button>
        </div>
      )}
    </div>
  );
}

function SeasonalCard({ opportunity }: { opportunity: SeasonalOpportunity }) {
  return (
    <div className="card p-5 space-y-3">
      <p className="font-display text-lg text-desert-night">{opportunity.opportunity}</p>

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase">Prompt ideas</p>
        <ul className="mt-1.5 space-y-1">
          {opportunity.promptIdeas.map((p, i) => (
            <li key={i} className="text-sm text-smoked-charcoal/70 italic flex gap-2">
              <span className="text-copper-clay shrink-0">→</span>
              <span>&ldquo;{p}&rdquo;</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best formats:</span>
        {opportunity.bestFormats.map((f) => (
          <span key={f} className="chip chip-cream !text-[10px]">{f}</span>
        ))}
      </div>

      <div className="bg-copper-clay/10 rounded-xl p-3">
        <p className="text-xs font-bold text-copper-deep uppercase">Timing notes</p>
        <p className="text-sm text-desert-night mt-1">{opportunity.timingNotes}</p>
      </div>
    </div>
  );
}
