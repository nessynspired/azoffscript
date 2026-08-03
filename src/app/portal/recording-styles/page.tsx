"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  RECORDING_STYLES,
  RECORDING_DIFFICULTIES,
  DIFFICULTY_COLORS,
  type RecordingStyle,
  type RecordingDifficulty,
} from "@/lib/recording-style-library";
import { InfoTooltip } from "@/components/InfoTooltip";

export default function RecordingStylesPage() {
  const { member } = useAuth();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<RecordingDifficulty | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RecordingStyle | null>(null);

  // Admin-only — this is the master library. Planners edit per-clip copies via RecipeBuilder.
  if (member && member.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-sm text-smoked-charcoal/60 mt-2">
          This is the master recording style library. Planners can pick recording styles when building a clip&apos;s recipe.
        </p>
        <Link href="/portal/lobby" className="btn btn-secondary btn-sm mt-4">← Back to Lobby</Link>
      </div>
    );
  }

  const filtered = RECORDING_STYLES.filter((s) => {
    if (difficultyFilter && s.difficulty !== difficultyFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        s.name.toLowerCase().includes(q) ||
        s.simpleDescription.toLowerCase().includes(q) ||
        s.bestFor.some((b) => b.toLowerCase().includes(q)) ||
        s.exampleFormats.some((f) => f.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Recording Styles</h1>
        <InfoTooltip text="This is how you film the actual content. Not the transition (that's how clips connect). This is the feeling and method — direct to camera, natural moment, reaction, POV, etc." />
        <p className="text-smoked-charcoal/70 mt-2">
          How should you film this video? Pick a style that fits you and the content.
        </p>
      </div>

      {/* What is a recording style? — simple explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">What is a recording style?</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          This is <strong>not</strong> the transition. The transition is how clips connect.
          The recording style is the <strong>feeling and method of filming</strong> the actual content.
        </p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          This prevents every video from looking the same. A creator assigned
          &ldquo;Real Quick&rdquo; using &ldquo;Natural Life Moment&rdquo; style would film while making coffee.
          The same &ldquo;Real Quick&rdquo; using &ldquo;Direct To Camera&rdquo; style would be sitting and talking.
          Same content, different feel.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recording styles..."
          className="field"
        />

        {/* Difficulty filter */}
        <div>
          <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDifficultyFilter(null)}
              className={`chip !text-xs ${!difficultyFilter ? "chip-copper" : "chip-cream"}`}
            >All</button>
            {RECORDING_DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d === difficultyFilter ? null : d)}
                className={`chip !text-xs ${difficultyFilter === d ? "chip-copper" : "chip-cream"}`}
              >{DIFFICULTY_COLORS[d]} {d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-smoked-charcoal/60">
        {filtered.length} {filtered.length === 1 ? "style" : "styles"}
      </p>

      {/* Style cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStyle(s)}
            className="card p-5 text-left space-y-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg text-desert-night">{s.name}</p>
              </div>
              <span className="text-2xl shrink-0" title={s.difficulty}>
                {DIFFICULTY_COLORS[s.difficulty]}
              </span>
            </div>

            {/* Simple description */}
            <p className="text-sm text-smoked-charcoal/70">{s.simpleDescription}</p>

            {/* Feel like */}
            <div className="bg-copper-clay/10 rounded-lg p-2">
              <p className="text-xs font-bold text-copper-deep uppercase">Feel like</p>
              <p className="text-sm text-desert-night italic mt-0.5">&ldquo;{s.feelLike}&rdquo;</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="chip chip-cream !text-[9px]">{DIFFICULTY_COLORS[s.difficulty]} {s.difficulty}</span>
              {s.bestFor.slice(0, 3).map((b) => (
                <span key={b} className="chip chip-cream !text-[9px]">{b}</span>
              ))}
              {s.bestFor.length > 3 && (
                <span className="chip chip-cream !text-[9px]">+{s.bestFor.length - 3}</span>
              )}
            </div>

            {/* Example formats */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-smoked-charcoal/40 font-bold">Pairs with:</span>
              {s.exampleFormats.slice(0, 2).map((f) => (
                <span key={f} className="text-[10px] text-cactus-teal">{f}{s.exampleFormats.indexOf(f) < Math.min(s.exampleFormats.length, 2) - 1 ? "," : ""}</span>
              ))}
            </div>

            <p className="text-xs text-copper-clay font-bold pt-1">Tap for full instructions →</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">No styles match those filters.</p>
          <button
            onClick={() => { setDifficultyFilter(null); setSearch(""); }}
            className="btn btn-secondary btn-sm mt-4"
          >Clear filters</button>
        </div>
      )}

      {/* Detail modal */}
      {selectedStyle && (
        <RecordingStyleDetailModal
          style={selectedStyle}
          onClose={() => setSelectedStyle(null)}
        />
      )}

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
  );
}

function RecordingStyleDetailModal({ style, onClose }: { style: RecordingStyle; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-desert-night/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-w-lg w-full p-6 my-auto max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-smoked-charcoal/40 hover:text-smoked-charcoal text-2xl"
          aria-label="Close"
        >×</button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl">{DIFFICULTY_COLORS[style.difficulty]}</span>
          <div>
            <h2 className="font-display text-2xl text-desert-night leading-tight">{style.name}</h2>
          </div>
        </div>

        {/* Simple description */}
        <p className="text-sm text-smoked-charcoal/70 mt-3">{style.simpleDescription}</p>

        {/* Feel like */}
        <div className="bg-copper-clay/10 rounded-xl p-3 mt-4">
          <p className="text-xs font-bold text-copper-deep uppercase">You should feel like</p>
          <p className="text-sm text-desert-night italic mt-1">&ldquo;{style.feelLike}&rdquo;</p>
        </div>

        {/* Example */}
        {style.example && (
          <div className="bg-sandstone-cream/50 rounded-xl p-3 mt-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Example</p>
            <p className="text-sm text-smoked-charcoal/70 mt-1">{style.example}</p>
          </div>
        )}

        {/* How to record */}
        <div className="mt-4">
          <p className="text-xs font-bold text-cactus-teal uppercase">How to record</p>
          <ol className="space-y-1.5 mt-2">
            {style.howToRecord.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-cactus-teal/20 text-cactus-teal text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Everyday activities */}
        {style.everydayActivities && style.everydayActivities.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Everyday activities you can use</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {style.everydayActivities.map((a) => (
                <span key={a} className="chip chip-cream !text-[10px]">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Your reaction can be */}
        {style.yourReactionCanBe && style.yourReactionCanBe.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Your reaction can be</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {style.yourReactionCanBe.map((r) => (
                <span key={r} className="chip chip-cream !text-[10px]">{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Best for */}
        <div className="mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Best for</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {style.bestFor.map((b) => (
              <span key={b} className="chip chip-teal !text-[10px]">{b}</span>
            ))}
          </div>
        </div>

        {/* Example formats */}
        <div className="mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Example content formats</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {style.exampleFormats.map((f) => (
              <span key={f} className="chip chip-copper !text-[10px]">{f}</span>
            ))}
          </div>
        </div>

        {/* Works well with transitions */}
        <div className="mt-4">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Works well with transitions</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {style.worksWellWithTransitions.map((t) => (
              <span key={t} className="chip chip-cream !text-[10px]">{t}</span>
            ))}
          </div>
        </div>

        {/* Avoid */}
        <div className="mt-4 border-t border-desert-night/10 pt-4">
          <p className="text-xs font-bold text-heat-orange uppercase">Avoid</p>
          <ul className="space-y-1 mt-1.5">
            {style.avoid.map((a, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/70 flex gap-2">
                <span className="text-heat-orange shrink-0">❌</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Difficulty */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-bold text-desert-night/50 uppercase">Difficulty:</span>
          <span className="chip chip-cream !text-xs">{DIFFICULTY_COLORS[style.difficulty]} {style.difficulty}</span>
        </div>
      </div>
    </div>
  );
}
