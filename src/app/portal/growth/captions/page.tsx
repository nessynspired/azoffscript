"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CAPTION_FRAMEWORKS,
  FRAMEWORK_PURPOSES,
  PURPOSE_COLORS,
  getFrameworksByPurpose,
  type CaptionFramework,
  type CaptionFrameworkPurpose,
} from "@/lib/growth/caption-framework-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function CaptionFrameworksPage() {
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState<CaptionFrameworkPurpose | null>(null);

  const filtered = CAPTION_FRAMEWORKS.filter((f) => {
    if (purposeFilter && f.purpose !== purposeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.examples.some((e) => e.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Caption Frameworks</h1>
        <InfoTooltip text="Document 3 of the Growth Intelligence System. Not individual captions — frameworks. Because captions change, but the formulas stay. Each framework has a formula, a purpose, and examples." />
        <p className="text-smoked-charcoal/70 mt-2">
          Frameworks, not individual captions. The formulas stay. The examples rotate.
        </p>
      </div>

      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          A caption framework is a <strong>formula</strong> for constructing captions.
          The examples can be swapped out. The formula is permanent. This keeps captions
          fresh without losing the brand voice.
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search frameworks, formulas, or examples..."
        className="field"
      />

      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Purpose</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setPurposeFilter(null)} className={`chip !text-[10px] ${!purposeFilter ? "chip-copper" : "chip-cream"}`}>All</button>
          {FRAMEWORK_PURPOSES.map((p) => {
            const count = getFrameworksByPurpose(p).length;
            if (count === 0) return null;
            return (
              <button
                key={p}
                onClick={() => setPurposeFilter(p === purposeFilter ? null : p)}
                className={`chip !text-[10px] ${purposeFilter === p ? "chip-copper" : "chip-cream"}`}
              >{PURPOSE_COLORS[p]} {p} ({count})</button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} frameworks</p>

      <div className="space-y-4">
        {filtered.map((f) => (
          <div key={f.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-lg text-desert-night">{f.name}</p>
              <span className="chip chip-copper !text-[9px]">{PURPOSE_COLORS[f.purpose]} {f.purpose}</span>
            </div>

            <div className="bg-copper-clay/10 rounded-xl p-3">
              <p className="text-xs font-bold text-copper-deep uppercase">Formula</p>
              <p className="text-sm text-desert-night mt-1 font-bold">{f.formula}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">Why it works</p>
              <p className="text-sm text-desert-night mt-1">{f.whyItWorks}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Examples</p>
              <ul className="mt-1.5 space-y-1">
                {f.examples.map((e, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 italic flex gap-2">
                    <span className="text-copper-clay shrink-0">→</span>
                    <span>&ldquo;{e}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-smoked-charcoal/40 font-bold">Best with:</span>
              {f.worksBestWith.map((w) => (
                <span key={w} className="chip chip-cream !text-[10px]">{w}</span>
              ))}
            </div>

            <div className="border-t border-desert-night/10 pt-3">
              <p className="text-xs font-bold text-heat-orange uppercase">Avoid</p>
              <ul className="mt-1.5 space-y-1">
                {f.avoid.map((a, i) => (
                  <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                    <span className="text-heat-orange shrink-0">✗</span>
                    <span>{a}</span>
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
