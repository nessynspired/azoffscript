"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

/**
 * InfoTooltip — a small "ⓘ" icon that shows a tooltip on hover (desktop)
 * or tap (mobile). Used to explain what a page, tab, or feature does
 * without cluttering the UI.
 *
 * Usage:
 *   <InfoTooltip text="This page shows all the clips waiting to be planned." />
 *   <InfoTooltip label="What is this?">Longer explanation with paragraphs.</InfoTooltip>
 */
interface InfoTooltipProps {
  /** Short tooltip text (for simple cases) */
  text?: string;
  /** Optional label shown next to the icon (e.g. "What is this?") */
  label?: string;
  /** Rich content for the tooltip (overrides `text`) */
  children?: ReactNode;
  /** Dark variant for use on dark backgrounds (nav bar, dark cards) */
  dark?: boolean;
}

export function InfoTooltip({ text, label, children, dark = false }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click (for mobile tap behavior)
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const content = children ?? text;
  if (!content) return null;

  return (
    <span ref={ref} className="relative inline-flex items-center">
      {label && (
        <span className={`text-xs font-bold mr-1 ${dark ? "text-sandstone-cream/60" : "text-smoked-charcoal/50"}`}>
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors ${
          dark
            ? "text-sandstone-cream/50 hover:text-sunburst-yellow hover:bg-white/10"
            : "text-smoked-charcoal/40 hover:text-copper-clay hover:bg-copper-clay/10"
        }`}
        aria-label="More info"
      >
        ⓘ
      </button>
      {open && (
        <span
          className={`absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl p-3 text-xs leading-relaxed shadow-[var(--shadow-lift)] animate-pop ${
            dark
              ? "bg-desert-night text-sandstone-cream/90 border border-copper-clay/30"
              : "bg-bone-white text-desert-night border border-copper-clay/20"
          }`}
          style={{ whiteSpace: "normal" }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/**
 * PageHeader — consistent header for portal pages with an optional
 * info tooltip explaining what the page does.
 *
 * Usage:
 *   <PageHeader title="Spark Board" info="Drop raw content ideas here. Vote on ideas you like." />
 *   <PageHeader title="Run Sheet" info="...">Extra content below title</PageHeader>
 */
interface PageHeaderProps {
  title: string;
  info?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, info, children, className = "" }: PageHeaderProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">{title}</h1>
        {info && <InfoTooltip text={info} />}
      </div>
      {children}
    </div>
  );
}
