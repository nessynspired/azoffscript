"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * MagneticButton — button/link that subtly pulls toward the cursor on desktop.
 * Disabled on mobile and reduced-motion.
 *
 * Usage:
 *   <MagneticButton><a href="/watch" className="btn btn-primary">Watch</a></MagneticButton>
 *   <MagneticButton strength={0.3}><button>Click</button></MagneticButton>
 */
export function MagneticButton({
  children,
  strength = 0.25,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refEl = ref.current;
    if (!refEl) return;
    if (window.matchMedia("(max-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el: HTMLDivElement = refEl;

    function onMouseMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    }

    function onMouseLeave() {
      el.style.transform = "translate(0, 0)";
    }

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`magnetic-btn inline-block ${className}`}>
      {children}
    </div>
  );
}
