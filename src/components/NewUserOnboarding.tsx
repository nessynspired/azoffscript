"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";

/**
 * NewUserOnboarding — a "Start Here" checklist that shows on the lobby
 * for first-time crew members so they know exactly what to do.
 *
 * Tracks completion in localStorage. Auto-detects some steps by checking
 * Supabase (has public card, has assignments, has dropped a clip).
 * Once all steps are done (or the user dismisses it), it stays hidden.
 */

const STORAGE_KEY = "azos-onboarding-completed";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  // If true, completion is auto-detected (not just by clicking)
  autoDetect?: boolean;
}

const STEPS: OnboardingStep[] = [
  {
    id: "kit",
    title: "Set up your kit",
    description: "Add your photo, vibe, and bio. This is how you show up in the crew.",
    href: "/portal/my-kit",
    cta: "Open My Kit",
    autoDetect: true,
  },
  {
    id: "part",
    title: "Check your part",
    description: "See what you're assigned to film and when it's due. This is your to-do list.",
    href: "/portal/my-kit",
    cta: "See My Part",
    autoDetect: true,
  },
  {
    id: "drop",
    title: "Drop a clip",
    description: "Upload a video or paste a link from TikTok, Instagram, or YouTube. One take is fine.",
    href: "/portal/drop",
    cta: "Go to Drop",
    autoDetect: true,
  },
  {
    id: "ready-bank",
    title: "Browse the Ready Bank",
    description: "See all the content formats we use — from 2-minute reactions to group day challenges.",
    href: "/portal/ready-bank",
    cta: "Open Ready Bank",
  },
  {
    id: "run-sheet",
    title: "Check the Run Sheet",
    description: "See the full calendar — what's being filmed, what's being edited, what's going live.",
    href: "/portal/run-sheet",
    cta: "Open Run Sheet",
  },
];

export function NewUserOnboarding() {
  const { member } = useAuth();
  const supabase = createClient();
  const [visible, setVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [autoDetected, setAutoDetected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!member) return;

    // Don't show for admins — they built this, they know how it works
    if (member.role === "admin") return;

    // Check if already completed/dismissed
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.dismissed) return;
      setCompletedSteps(parsed.steps ?? []);
    }

    // Check if user clicked steps manually (from localStorage click tracking)
    const clickedSteps = JSON.parse(localStorage.getItem("azos-onboarding-clicks") ?? "[]");

    // Auto-detect completion of steps by checking Supabase
    (async () => {
      const [cardRes, assignmentRes, clipsRes] = await Promise.all([
        // Has a public card?
        supabase.from("approved_public_profile").select("id").eq("member_id", member.id).maybeSingle(),
        // Has assignments?
        supabase.from("content_assignments").select("id").eq("member_id", member.id).limit(1),
        // Has dropped any clips?
        supabase.from("clips").select("id").eq("submitted_by", member.id).limit(1),
      ]);

      const detected: Record<string, boolean> = {};
      if (cardRes.data) detected.kit = true;
      if ((assignmentRes.data ?? []).length > 0) detected.part = true;
      if ((clipsRes.data ?? []).length > 0) detected.drop = true;

      setAutoDetected(detected);

      // Merge auto-detected + clicked steps
      const allCompleted = Array.from(new Set([
        ...clickedSteps,
        ...Object.keys(detected),
      ]));

      setCompletedSteps(allCompleted);

      // If all steps are done, auto-dismiss
      if (STEPS.every((s) => allCompleted.includes(s.id))) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: true, steps: allCompleted }));
        setVisible(false);
        return;
      }

      setVisible(true);
    })();
  }, [member, supabase]);

  function markStepClicked(stepId: string) {
    const clicked = JSON.parse(localStorage.getItem("azos-onboarding-clicks") ?? "[]");
    if (!clicked.includes(stepId)) {
      clicked.push(stepId);
      localStorage.setItem("azos-onboarding-clicks", JSON.stringify(clicked));
    }
    setCompletedSteps((prev) => Array.from(new Set([...prev, stepId])));
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: true, steps: completedSteps }));
    setVisible(false);
  }

  if (!visible) return null;

  const completedCount = STEPS.filter((s) =>
    completedSteps.includes(s.id) || (s.autoDetect && autoDetected[s.id])
  ).length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="card p-5 md:p-6 border-2 border-copper-clay/30 bg-sandstone-cream/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <MascotImage pose="peace" size={56} />
          <div>
            <p className="text-copper-deep text-xs font-black uppercase tracking-wide">Start Here</p>
            <h2 className="font-display text-xl md:text-2xl text-desert-night leading-tight">
              New here? Do these {STEPS.length} things first.
            </h2>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-smoked-charcoal/40 hover:text-smoked-charcoal text-sm font-bold shrink-0"
          aria-label="Dismiss"
        >
          Got it ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-smoked-charcoal/60 font-bold">
            {completedCount} of {STEPS.length} done
          </p>
          <p className="text-xs text-smoked-charcoal/40">{progress}%</p>
        </div>
        <div className="h-2 bg-desert-night/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-copper-clay rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2 mt-4">
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(step.id) || (step.autoDetect && autoDetected[step.id]);
          return (
            <Link
              key={step.id}
              href={step.href}
              onClick={() => markStepClicked(step.id)}
              className={`flex items-start gap-3 rounded-xl p-3 transition ${
                isDone
                  ? "bg-cactus-teal/10 border border-cactus-teal/20"
                  : "bg-white/50 border border-desert-night/10 hover:border-copper-clay/40 hover:bg-white/80"
              }`}
            >
              {/* Step number / checkmark */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  isDone
                    ? "bg-cactus-teal text-bone-white"
                    : "bg-desert-night/10 text-desert-night"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isDone ? "text-desert-night/50 line-through" : "text-desert-night"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-smoked-charcoal/60 mt-0.5">{step.description}</p>
              </div>

              {/* CTA arrow */}
              {!isDone && (
                <span className="text-copper-clay text-xs font-bold shrink-0 mt-1">
                  {step.cta} →
                </span>
              )}
              {isDone && step.autoDetect && (
                <span className="text-cactus-teal text-[10px] font-bold shrink-0 mt-1">
                  ✓ done
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-smoked-charcoal/40 mt-4 text-center">
        One take is fine. No pressure to be perfect. Welcome to the room. 🌵
      </p>
    </div>
  );
}
