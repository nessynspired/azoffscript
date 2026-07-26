"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useTermsStatus } from "@/lib/hooks/use-terms-status";
import { MascotImage } from "@/components/MascotImage";
import { QUICK_TERMS_VERSION, WELCOME_COPY, QUICK_TERMS_COPY } from "@/lib/terms";

/**
 * /portal/quick-terms — permanent home for the Quick Room Rules.
 *
 * Anyone can visit to:
 *   - Review the welcome message + rules anytime
 *   - Accept the current version if they haven't (or skipped the first-login modal)
 *   - See when they last accepted, and re-accept if the version bumps
 *
 * The first-login TermsGate modal is dismissible; this page is the always-
 * accessible place to actually agree. A sticky banner in the portal layout
 * links here until acceptance is recorded.
 */
export default function QuickTermsPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const status = useTermsStatus();

  const [checked, setChecked] = useState<boolean[]>(QUICK_TERMS_COPY.checkboxes.map(() => false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAccepted, setJustAccepted] = useState(false);

  async function acceptTerms() {
    if (!member) return;
    const allChecked = checked.every(Boolean);
    if (!allChecked) return;

    setSubmitting(true);
    setError(null);

    const { error: insertErr } = await supabase
      .from("quick_terms_acceptances")
      .insert({
        user_id: member.user_id,
        member_id: member.id,
        agreement_type: "quick_terms",
        agreement_version: QUICK_TERMS_VERSION,
        accepted_checkbox_snapshot: QUICK_TERMS_COPY.checkboxes,
      });

    if (insertErr) {
      // Fall back to the server route (captures IP/UA)
      try {
        const res = await fetch("/api/quick-terms/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agreementVersion: QUICK_TERMS_VERSION,
            checkboxSnapshot: QUICK_TERMS_COPY.checkboxes,
          }),
        });
        if (!res.ok) throw new Error("save failed");
      } catch {
        setError("Could not save your agreement. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setJustAccepted(true);
  }

  const allChecked = checked.every(Boolean);
  const accepted = status.quickTermsAccepted || justAccepted;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">
            Quick Room Rules
          </h1>
          <p className="text-smoked-charcoal/70 mt-2 text-lg">
            The basics that keep the room safe. Current version:{" "}
            <span className="font-bold">{QUICK_TERMS_VERSION}</span>
          </p>
        </div>
        <div className="hidden md:block shrink-0">
          <MascotImage pose="peace" size={100} />
        </div>
      </div>

      {/* Status card */}
      {status.loading ? null : accepted ? (
        <div className="card p-5 bg-cactus-teal/15 border-2 border-cactus-teal flex items-center gap-4">
          <MascotImage pose="peace" size={56} className="shrink-0" />
          <div className="flex-1">
            <p className="font-display text-xl text-cactus-teal">You&apos;re good to go.</p>
            <p className="text-sm text-smoked-charcoal/70">
              {status.quickTermsDate
                ? `Accepted ${new Date(status.quickTermsDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} (${status.quickTermsVersion}).`
                : `Accepted (${status.quickTermsVersion}).`}
            </p>
          </div>
        </div>
      ) : (
        <div className="card p-5 bg-copper-deep/10 border-2 border-copper-clay flex items-center gap-4">
          <MascotImage pose="main" size={56} className="shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-desert-night">You haven&apos;t agreed yet.</p>
            <p className="text-sm text-smoked-charcoal/70 mt-1">
              Review the rules below and tap &ldquo;I Agree&rdquo; to unlock dropping, approvals, and other portal actions.
            </p>
          </div>
        </div>
      )}

      {/* Welcome copy */}
      <div className="card p-6">
        <h2 className="font-display text-2xl text-desert-night leading-tight">{WELCOME_COPY.title}</h2>
        <div className="text-sm text-smoked-charcoal/80 mt-3 leading-relaxed whitespace-pre-line">
          {WELCOME_COPY.body}
        </div>
      </div>

      {/* Terms + checkboxes */}
      <div className="card p-6">
        <h2 className="font-display text-2xl text-desert-night leading-tight">{QUICK_TERMS_COPY.title}</h2>
        <p className="text-sm text-smoked-charcoal/70 mt-3 leading-relaxed">{QUICK_TERMS_COPY.intro}</p>

        <div className="space-y-3 mt-5">
          <label className="flex items-center gap-3 cursor-pointer bg-copper-clay/10 rounded-xl p-3 border-2 border-copper-clay/30 sticky top-2">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => setChecked(QUICK_TERMS_COPY.checkboxes.map(() => e.target.checked))}
              className="w-5 h-5 shrink-0 accent-copper-clay cursor-pointer"
            />
            <span className="text-sm font-bold text-desert-night">
              {allChecked ? "✓ All agreed" : "Select all — I agree to all the rules below"}
            </span>
          </label>

          {QUICK_TERMS_COPY.checkboxes.map((label, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => setChecked((prev) => prev.map((c, idx) => (idx === i ? e.target.checked : c)))}
                className="mt-1 w-5 h-5 shrink-0 accent-copper-clay cursor-pointer"
              />
              <span className="text-sm text-smoked-charcoal/80 leading-relaxed group-hover:text-desert-night transition">
                {label}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={acceptTerms}
          disabled={!allChecked || submitting || accepted}
          className={`btn w-full mt-6 ${allChecked && !accepted ? "btn-primary" : "btn-ghost opacity-50 cursor-not-allowed"}`}
        >
          {submitting ? "Saving…" : accepted ? "Already agreed" : QUICK_TERMS_COPY.button}
        </button>

        {!allChecked && !accepted && (
          <p className="text-xs text-smoked-charcoal/50 text-center mt-2">
            Please check all boxes to continue.
          </p>
        )}
        {error && (
          <p className="text-sm text-copper-deep font-bold text-center mt-2">{error}</p>
        )}

        <p className="text-xs text-smoked-charcoal/50 mt-4 leading-relaxed border-t border-desert-night/10 pt-4">
          {QUICK_TERMS_COPY.footer}
        </p>
      </div>

      {/* Back to portal */}
      <div className="text-center">
        <Link href="/portal/lobby" className="btn btn-secondary">Back to the Lobby</Link>
      </div>
    </div>
  );
}
