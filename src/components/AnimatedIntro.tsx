"use client";

import { useEffect, useState } from "react";
import { MascotImage } from "@/components/MascotImage";

/**
 * AnimatedIntro — full-screen branded intro that plays once on first load.
 *
 * Uses a consistent warm desert gradient (copper → sunburst) regardless of
 * time of day. Previously switched to a dark navy gradient at night, which
 * made the whole page appear navy — now always warm and on-brand.
 *
 * Plays once per session (sessionStorage).
 */
export function AnimatedIntro() {
  // Start visible immediately (lazy initializer) — avoids the flash where the
  // body background shows before the intro mounts. On SSR, returns false so the
  // server doesn't render the overlay; on client first paint, it's already true.
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("azos-intro-played");
  });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      sessionStorage.setItem("azos-intro-played", "1");
      setTimeout(() => setVisible(false), 700);
    }, 3000);
    return () => clearTimeout(dismissTimer);
  }, [visible]);

  if (!visible) return null;

  // Consistent warm desert gradient — always on-brand, never navy
  const gradient = "linear-gradient(135deg, #8f4226 0%, #c96a3a 35%, #ff6a3d 65%, #ffd23f 100%)";
  const grainColor = "rgba(255,210,63,0.4), rgba(201,106,58,0.3), rgba(143,66,38,0.25)";
  const textColor = "#faf7f0";
  const subColor = "#ffd23f";
  const logoSrc = "/assets/logos/logo-official.png";

  return (
    <div
      suppressHydrationWarning
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
        exiting ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        background: gradient,
        backgroundSize: "200% 200%",
        animation: "introGradientShift 3s ease-in-out",
      }}
    >
      {/* Desert grain / sparkle overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${grainColor.split(",")[0]} 0%, transparent 3%), radial-gradient(circle at 70% 60%, ${grainColor.split(",")[1]} 0%, transparent 3%), radial-gradient(circle at 40% 80%, ${grainColor.split(",")[2]} 0%, transparent 3%), radial-gradient(circle at 85% 25%, ${grainColor.split(",")[0]} 0%, transparent 3%)`,
          backgroundSize: "300px 300px, 250px 250px, 200px 200px, 350px 350px",
          animation: "introGrainFloat 4s ease-in-out infinite alternate",
        }}
      />

      {/* Mascot — bounces in with spring easing */}
      <div
        className="relative z-10"
        style={{ animation: "introMascotIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
      >
        <MascotImage pose="peace" size={180} priority />
      </div>

      {/* Greeting — fades + slides up after mascot */}
      <div
        className="relative z-10 text-center mt-6"
        style={{ animation: "introTextIn 0.8s ease-out 0.5s both" }}
      >
        <h1
          className="font-display text-4xl md:text-6xl leading-tight"
          style={{ color: textColor, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        >
          Welcome to the room
        </h1>
        <p
          className="font-display text-lg md:text-2xl mt-2 tracking-wide"
          style={{ color: subColor, animation: "introSubtextIn 0.8s ease-out 0.8s both" }}
        >
          Arizona, our way.
        </p>
      </div>

      {/* Logo at bottom */}
      <div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))", animation: "introFadeIn 0.6s ease-out 1.2s both" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="AZ Off Script" className="h-7 w-auto opacity-60" />
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          setExiting(true);
          sessionStorage.setItem("azos-intro-played", "1");
          setTimeout(() => setVisible(false), 700);
        }}
        className="absolute right-6 text-xs font-bold uppercase tracking-wide transition z-20"
        style={{
          top: "calc(1.5rem + env(safe-area-inset-top, 0px))",
          color: "rgba(250,247,240,0.5)",
          animation: "introFadeIn 0.4s ease-out 0.6s both",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#faf7f0"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(250,247,240,0.5)"; }}
      >
        Skip →
      </button>

      <style>{`
        @keyframes introGradientShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes introGrainFloat {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes introMascotIn {
          0% { opacity: 0; transform: translateY(60px) scale(0.8) rotate(-5deg); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.05) rotate(2deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
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
