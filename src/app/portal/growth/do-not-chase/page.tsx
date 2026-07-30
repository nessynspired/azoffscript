"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DO_NOT_CHASE_RULES,
  SEVERITY_COLORS,
  getRulesBySeverity,
  type DoNotChaseRule,
  type DoNotChaseSeverity,
} from "@/lib/growth/do-not-chase-rules";
import { InfoTooltip } from "@/components/InfoTooltip";

const SEVERITIES: DoNotChaseSeverity[] = ["Brand Killer", "Brand Diluter", "Brand Distractor"];

export default function DoNotChaseRulesPage() {
  const [severityFilter, setSeverityFilter] = useState<DoNotChaseSeverity | null>(null);

  const filtered = DO_NOT_CHASE_RULES.filter((r) => {
    if (severityFilter && r.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/portal/growth" className="text-xs text-copper-clay font-bold">← Growth Library</Link>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Do Not Chase Rules</h1>
        <InfoTooltip text="Document 8 of the Growth Intelligence System. The guardrails that protect the brand from chasing growth that would cost us our identity. Growth is only worth it if we grow as ourselves." />
        <p className="text-smoked-charcoal/70 mt-2">
          What we refuse to become — and why.
        </p>
      </div>

      {/* Warning-style explainer */}
      <div className="card p-5 bg-heat-orange/10">
        <p className="font-display text-lg text-heat-orange">Read this before you chase</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          Every rule here is something the algorithm rewards but that would dilute, distract, or kill
          what makes AZ Off Script different. These are not preferences. They are the lines we do not cross.
          When the temptation to chase shows up, these rules keep us honest.
        </p>
      </div>

      {/* Severity filter */}
      <div>
        <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Severity</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setSeverityFilter(null)} className={`chip !text-[10px] ${!severityFilter ? "chip-copper" : "chip-cream"}`}>All</button>
          {SEVERITIES.map((s) => {
            const count = getRulesBySeverity(s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setSeverityFilter(s === severityFilter ? null : s)}
                className={`chip !text-[10px] ${severityFilter === s ? "chip-copper" : "chip-cream"}`}
              >{SEVERITY_COLORS[s]} {s} ({count})</button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} rules</p>

      {/* Rule cards */}
      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-display text-lg text-desert-night">❌ {r.category}</p>
              <span className="chip chip-copper !text-[9px]">{SEVERITY_COLORS[r.severity]} {r.severity}</span>
            </div>

            <div className="bg-heat-orange/10 rounded-xl p-3">
              <p className="text-xs font-bold text-heat-orange uppercase">We refuse</p>
              <p className="text-sm text-desert-night mt-1">{r.refuse}</p>
            </div>

            <div className="bg-sandstone-cream/50 rounded-xl p-3">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Why</p>
              <p className="text-sm text-desert-night mt-1">{r.why}</p>
            </div>

            <div className="bg-cactus-teal/10 rounded-xl p-3">
              <p className="text-xs font-bold text-cactus-teal uppercase">Do instead</p>
              <p className="text-sm text-desert-night mt-1">{r.doInstead}</p>
            </div>

            <div className="border-t border-desert-night/10 pt-3">
              <p className="text-xs font-bold text-heat-orange uppercase">Behaviors to avoid</p>
              <ul className="mt-1.5 space-y-1">
                {r.behaviors.map((b, i) => (
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

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No rules match that filter.</p>
          <button
            onClick={() => setSeverityFilter(null)}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filter</button>
        </div>
      )}
    </div>
  );
}
