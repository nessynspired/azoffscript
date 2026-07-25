"use client";

import { useEffect, useRef } from "react";

/**
 * useScrollReveal — adds the `revealed` class when element enters viewport.
 * Works with .reveal, .reveal-stagger, .kinetic-ready classes from globals.css.
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal">...</div>
 *
 * Or for staggered children:
 *   <div ref={ref} className="reveal-stagger">
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *   </div>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = "0px 0px -10% 0px", once = true } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — reveal immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("revealed", "kinetic-ready");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed", "kinetic-ready");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("revealed", "kinetic-ready");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
