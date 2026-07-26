"use client";

import { useEffect, useRef, useState } from "react";
import { MascotImage } from "@/components/MascotImage";

/**
 * RoomEntrySplash — optional entry moment shown once on first visit.
 *
 * Replaces the auto-playing AnimatedIntro with a choice:
 *   [Play the vibe 🔊]  — plays /audio/room-is-open.mp3 while entering
 *   [Enter quiet 🤫]    — enters the site without audio
 *
 * Persists the choice in sessionStorage so it only shows once per session.
 */
export function RoomEntrySplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("azos-entry-played");
  });
  const [exiting, setExiting] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    // Preload the audio so it's ready when they tap "Play the vibe"
    audioRef.current = new Audio("/audio/room-is-open.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.loop = true;
    return () => {
      // Stop & release if component unmounts mid-playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [visible]);

  function enter(playVibe: boolean) {
    if (playVibe && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay/block — surface a tiny note but still enter
        setAudioError(true);
        return;
      });
    }
    setExiting(true);
    sessionStorage.setItem("azos-entry-played", "1");
    // Keep audio playing across the fade — it lives on the window via the ref,
    // but we need to detach it so cleanup doesn't kill it. Hand off to a
    // window-scoped holder so the audio keeps playing after unmount.
    if (playVibe && audioRef.current && !audioError) {
      (window as any).__azosEntryAudio = audioRef.current;
      audioRef.current = null; // detach so cleanup above won't pause it
    }
    setTimeout(() => setVisible(false), 800);
  }

  if (!visible) return null;

  return (
    <div
      suppressHydrationWarning
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #07111c 0%, #0d1b2a 40%, #8f4226 80%, #c96a3a 100%)",
        backgroundSize: "200% 200%",
        animation: "introGradientShift 4s ease-in-out",
      }}
    >
      {/* Desert sparkle overlay */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,210,63,0.5) 0%, transparent 3%), radial-gradient(circle at 70% 60%, rgba(201,106,58,0.4) 0%, transparent 3%), radial-gradient(circle at 40% 80%, rgba(255,106,61,0.35) 0%, transparent 3%), radial-gradient(circle at 85% 25%, rgba(255,210,63,0.4) 0%, transparent 3%)",
          backgroundSize: "300px 300px, 250px 250px, 200px 200px, 350px 350px",
          animation: "introGrainFloat 4s ease-in-out infinite alternate",
        }}
      />

      {/* Mascot */}
      <div
        className="relative z-10"
        style={{ animation: "introMascotIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
      >
        <MascotImage pose="peace" size={180} priority />
      </div>

      {/* The room is opening */}
      <div
        className="relative z-10 text-center mt-6 px-6"
        style={{ animation: "introTextIn 0.8s ease-out 0.5s both" }}
      >
        <h1
          className="font-display text-3xl md:text-5xl leading-tight"
          style={{ color: "#faf7f0", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          The room is opening.
        </h1>
        <p
          className="font-display text-base md:text-xl mt-4 italic"
          style={{ color: "rgba(250,247,240,0.7)" }}
        >
          The script said act normal.
        </p>
        <p
          className="font-display text-lg md:text-2xl mt-1 font-bold"
          style={{ color: "#ffd23f", animation: "introSubtextIn 0.8s ease-out 0.9s both" }}
        >
          The room said absolutely not.
        </p>
      </div>

      {/* Entry choice buttons */}
      <div
        className="relative z-10 flex flex-col sm:flex-row gap-3 mt-10"
        style={{ animation: "introFadeIn 0.6s ease-out 1.2s both" }}
      >
        <button
          onClick={() => enter(true)}
          className="btn btn-primary btn-lg !px-8 !py-4 !text-base flex items-center gap-2"
          style={{ background: "#c96a3a", borderColor: "#c96a3a" }}
        >
          <span className="text-xl">🔊</span>
          <span>Play the vibe</span>
        </button>
        <button
          onClick={() => enter(false)}
          className="btn btn-lg !px-8 !py-4 !text-base flex items-center gap-2 border-2"
          style={{
            background: "transparent",
            borderColor: "rgba(250,247,240,0.4)",
            color: "#faf7f0",
          }}
        >
          <span className="text-xl">🤫</span>
          <span>Enter quiet</span>
        </button>
      </div>

      {audioError && (
        <p
          className="relative z-10 text-xs mt-4 max-w-xs text-center"
          style={{ color: "rgba(250,247,240,0.6)" }}
        >
          Your browser blocked autoplay. Tap play again after entering.
        </p>
      )}

      {/* Logo at bottom */}
      <div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))", animation: "introFadeIn 0.6s ease-out 1.4s both" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logos/logo-official.png" alt="AZ Off Script" className="h-7 w-auto opacity-60" />
      </div>

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
