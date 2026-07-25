"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * ParallaxLayer — moves element based on scroll position.
 * speed: negative = moves slower (background), positive = moves faster (foreground)
 * Disabled on mobile and reduced-motion.
 *
 * Usage:
 *   <ParallaxLayer speed={-0.3}><PosterImage ... /></ParallaxLayer>
 */
export function ParallaxLayer({
  children,
  speed = -0.2,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refEl = ref.current;
    if (!refEl) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el: HTMLDivElement = refEl;

    let rafId = 0;

    function update() {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Only apply parallax when element is near viewport
      if (rect.bottom < -200 || rect.top > windowHeight + 200) {
        rafId = requestAnimationFrame(update);
        return;
      }
      const center = rect.top + rect.height / 2;
      const offset = (center - windowHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
      rafId = requestAnimationFrame(update);
    }

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [speed]);

  return (
    <div ref={ref} className={`parallax-layer ${className}`}>
      {children}
    </div>
  );
}
