"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BRAND_MOATS,
  MOAT_TYPES,
  MOAT_TYPE_COLORS,
  type BrandMoat,
  type MoatType,
} from "@/lib/growth/brand-moat-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function BrandMoatLibraryPage() {
  const [moatTypeFilter, setMoatTypeFilter] = useState<MoatType | null>(null);

  const filtered = BRAND_MOATS.filter((m) => {
    if (moatTypeFilter && m.moatType !== moatTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Brand Moat Library</h1>
        <InfoTooltip text="Document 9 of the Growth Intelligence System. This answers the question: why should someone choose AZ Off Script instead of the thousands of other pages? A brand moat is the thing competitors cannot easily copy." />
        <p className="text-smoked-charcoal/70 mt-2">
          If we cannot articulate why we are different, the audience cannot either.
        </p>
      </div>

      {/* Explainer */}
      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          A brand moat is the thing nobody can copy. Formats can be imitated, sounds can be reused,
          but the real crew chemistry, the signature language, the local identity, the community feeling —
          those are defensible. This library names each moat, explains why it is hard to copy,
          and documents how we actively protect it.
        </p>
      </div>

      {/* Moat type filter */}
      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Moat type</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setMoatTypeFilter(null)} className={`chip !text-[10px] ${!moatTypeFilter ? "chip-copper" : "chip-cream"}`}>All</button>
          {MOAT_TYPES.map((t) => {
            const count = BRAND_MOATS.filter((m) => m.moatType === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setMoatTypeFilter(t === moatTypeFilter ? null : t)}
                className={`chip !text-[10px] ${moatTypeFilter === t ? "chip-copper" : "chip-cream"}`}
              >{MOAT_TYPE_COLORS[t]} {t} ({count})</button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} moats</p>

      {/* Moat cards */}
      <div className="space-y-4">
        {filtered.map((m) => (
          <div key={m.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-display text-lg text-desert-night">{m.name}</p>
              <span className="chip chip-copper !text-[9px]">{MOAT_TYPE_COLORS[m.moatType]} {m.moatType}</span>
            </div>

            <div className="bg-sandstone-cream/50 rounded-xl p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">What it is</p>
              <p className="text-sm text-desert-night mt-1">{m.whatItIs}</p>
            </div>

            <div className="bg-copper-clay/10 rounded-xl p-3">
              <p className="text-xs font-bold text-copper-deep uppercase">Why no one can copy it</p>
              <p className="text-sm text-desert-night mt-1">{m.whyNoOneCanCopyIt}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">How we protect it</p>
              <p className="text-sm text-desert-night mt-1">{m.howWeProtectIt}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Examples</p>
              <ul className="mt-1.5 space-y-1">
                {m.examples.map((e, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 italic flex gap-2">
                    <span className="text-copper-clay shrink-0">→</span>
                    <span>&ldquo;{e}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No moats match that filter.</p>
          <button
            onClick={() => setMoatTypeFilter(null)}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filter</button>
        </div>
      )}
    </div>
  );
}
