"use client";

import { useEffect, useState } from "react";
import { MascotImage } from "@/components/MascotImage";

/**
 * AnimatedIntro — full-screen branded intro that plays once on first load.
 * Blue background, mascot bounces in, time-based greeting fades in,
 * then the whole thing slides up to reveal the site.
 *
 * Shows once per session (sessionStorage) so refreshes don't replay it.
 */
export function AnimatedIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("azos-intro-played")) {
      return;
    }
    setVisible(true);

    // Auto-dismiss after 2.8s
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      sessionStorage.setItem("azos-intro-played", "1");
      // Remove from DOM after the slide-up animation
      setTimeout(() => setVisible(false), 700);
    }, 2800);

    return () => clearTimeout(dismissTimer);
  }, []);

  if (!visible) return null;

  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour >= 5 && hour < 12) greeting = "Good morning";
  else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17 && hour < 21) greeting = "Good evening";
  else greeting = "Good night";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
        exiting ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        background: "linear-gradient(135deg, #07111c 0%, #0d1b2a 50%, #2a6b5b 100%)",
      }}
    >
      {/* Subtle desert grain overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,210,63,0.3) 0%, transparent 3%), radial-gradient(circle at 70% 60%, rgba(201,106,58,0.25) 0%, transparent 3%), radial-gradient(circle at 40% 80%, rgba(59,145,125,0.3) 0%, transparent 3%), radial-gradient(circle at 85% 25%, rgba(255,210,63,0.3) 0%, transparent 3%)",
          backgroundSize: "300px 300px, 250px 250px, 200px 200px, 350px 350px",
        }}
      />

      {/* Mascot — bounces in from below */}
      <div
        className="relative z-10 animate-intro-mascot"
        style={{
          animation: "introMascotIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        <MascotImage pose="peace" size={180} priority />
      </div>

      {/* Greeting — fades + slides up after mascot */}
      <div
        className="relative z-10 text-center mt-6"
        style={{
          animation: "introTextIn 0.8s ease-out 0.4s both",
        }}
      >
        <h1
          className="font-display text-4xl md:text-6xl text-white leading-tight"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        >
          {greeting}
        </h1>
        <p
          className="font-display text-lg md:text-2xl text-sunburst-yellow mt-2 tracking-wide"
          style={{ animation: "introSubtextIn 0.8s ease-out 0.7s both" }}
        >
          Arizona, our way.
        </p>
      </div>

      {/* Logo at bottom — fades in last */}
      <div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        style={{ animation: "introFadeIn 0.6s ease-out 1s both" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logos/logo-white.png" alt="AZ Off Script" className="h-7 w-auto opacity-60" />
      </div>

      {/* Skip button — for impatient visitors */}
      <button
        onClick={() => {
          setExiting(true);
          sessionStorage.setItem("azos-intro-played", "1");
          setTimeout(() => setVisible(false), 700);
        }}
        className="absolute top-6 right-6 text-white/40 hover:text-white/80 text-xs font-bold uppercase tracking-wide transition z-20"
        style={{ animation: "introFadeIn 0.4s ease-out 0.5s both" }}
      >
        Skip →
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes introMascotIn {
          0% { opacity: 0; transform: translateY(60px) scale(0.8); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes introTextIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes introSubtextIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes introFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
