"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CustomCursor — desktop-only circular cursor that changes label on hover.
 * Hidden on mobile/tablet (CSS handles display:none under 1024px).
 * Reads data-cursor attribute on hovered elements to show context labels:
 *   data-cursor="watch" → "WATCH"
 *   data-cursor="pitch" → "PITCH"
 *   data-cursor="enter" → "ENTER"
 *   data-cursor="meet" → "MEET"
 *   data-cursor="open" → "OPEN"
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia("(max-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;
    const el: HTMLDivElement = cursor;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId = 0;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      el.classList.add("active");

      // Check what's under the cursor
      const target = e.target as HTMLElement;
      const cursorAttr = target.closest("[data-cursor]") as HTMLElement | null;
      if (cursorAttr) {
        setLabel(cursorAttr.dataset.cursor || "");
        el.classList.add("hovering");
      } else {
        setLabel("");
        el.classList.remove("hovering");
      }
    }

    function onMouseLeave() {
      el.classList.remove("active");
    }

    function animate() {
      // Smooth follow with lerp
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      el.style.left = `${cursorX}px`;
      el.style.top = `${cursorY}px`;
      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor">
      {label}
    </div>
  );
}
