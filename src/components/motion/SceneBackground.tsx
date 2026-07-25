"use client";

import { useEffect } from "react";

/**
 * SceneBackground — shifts the body background color as user scrolls through scenes.
 * Each section with data-scene="dark|cream|charcoal" sets the background.
 * Disabled on reduced-motion (keeps default cream).
 */
export function SceneBackground() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        // Find the most visible scene section
        let bestTarget: Element | null = null;
        let bestRatio = 0;
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestTarget = entry.target;
          }
        });

        if (bestTarget && bestRatio > 0.3) {
          const scene = (bestTarget as HTMLElement).dataset.scene;
          document.body.classList.remove("bg-scene-dark", "bg-scene-cream", "bg-scene-charcoal");
          if (scene === "dark") document.body.classList.add("bg-scene-dark");
          else if (scene === "charcoal") document.body.classList.add("bg-scene-charcoal");
          else document.body.classList.add("bg-scene-cream");
        }
      },
      { threshold: [0.3, 0.5, 0.7] }
    );

    document.querySelectorAll("[data-scene]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
