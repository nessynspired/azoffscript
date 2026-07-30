"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HOOKS,
  HOOK_TYPES,
  HOOK_TYPE_COLORS,
  getHooksByType,
  type Hook,
  type HookType,
} from "@/lib/growth/hook-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function HookLibraryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<HookType | null>(null);
  const [deliveryFilter, setDeliveryFilter] = useState<string | null>(null);

  const filtered = HOOKS.filter((h) => {
    if (typeFilter && h.type !== typeFilter) return false;
    if (deliveryFilter && h.delivery !== deliveryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return h.text.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q) ||
        h.worksBestWith.some((w) => w.toLowerCase().includes(q));
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
        <h1 className="font-display text-3xl md:text-4xl text-desert-night mt-2">Hook Library</h1>
        <InfoTooltip text="Document 2 of the Growth Intelligence System. The first 1-3 seconds. Not trends — hooks that work repeatedly. People decide immediately whether to keep watching." />
        <p className="text-smoked-charcoal/70 mt-2">
          The first 1-3 seconds. {HOOKS.length} hooks that work repeatedly, organized by purpose.
        </p>
      </div>

      {/* Explainer */}
      <div className="card p-4 bg-sandstone-cream/50">
        <p className="text-sm text-smoked-charcoal/70">
          Hooks are not trends. Trends come and go. Hooks are the opening lines that make people stop scrolling.
          This library will grow to hundreds. Each hook has a purpose, an effect, and content formats it pairs with.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hooks by text, type, or format..."
          className="field"
        />

        {/* Type filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Hook type</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setTypeFilter(null)} className={`chip !text-[10px] ${!typeFilter ? "chip-copper" : "chip-cream"}`}>All</button>
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

        {/* Delivery filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Delivery</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setDeliveryFilter(null)} className={`chip !text-xs ${!deliveryFilter ? "chip-copper" : "chip-cream"}`}>All</button>
            <button onClick={() => setDeliveryFilter("On-screen text")} className={`chip !text-xs ${deliveryFilter === "On-screen text" ? "chip-copper" : "chip-cream"}`}>On-screen text</button>
            <button onClick={() => setDeliveryFilter("Spoken")} className={`chip !text-xs ${deliveryFilter === "Spoken" ? "chip-copper" : "chip-cream"}`}>Spoken</button>
            <button onClick={() => setDeliveryFilter("Either")} className={`chip !text-xs ${deliveryFilter === "Either" ? "chip-copper" : "chip-cream"}`}>Either</button>
          </div>
        </div>
      </div>

      <p className="text-sm text-smoked-charcoal/60">{filtered.length} hooks</p>

      {/* Hook cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((h) => (
          <div key={h.id} className="card p-4 space-y-2">
            <p className="text-sm text-desert-night font-bold leading-snug">&ldquo;{h.text}&rdquo;</p>
            <p className="text-xs text-smoked-charcoal/60 italic">{h.effect}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-copper !text-[9px]">{HOOK_TYPE_COLORS[h.type]} {h.type}</span>
              <span className="chip chip-cream !text-[9px]">{h.delivery}</span>
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

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No hooks match those filters.</p>
          <button
            onClick={() => { setTypeFilter(null); setDeliveryFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}
    </div>
  );
}
