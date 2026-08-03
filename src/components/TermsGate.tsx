"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import { CreatorReleaseModal } from "@/components/CreatorReleaseModal";
import { QUICK_TERMS_VERSION, WELCOME_COPY, QUICK_TERMS_COPY } from "@/lib/terms";
import type { Database } from "@/lib/types/db";

type Acceptance = Database["public"]["Tables"]["quick_terms_acceptances"]["Row"];

/**
 * TermsGate — shows on first login (or when terms version changes):
 *   1. Welcome popup
 *   2. Quick Room Rules (must check all boxes + agree)
 *
 * Blocks portal access until quick terms are accepted.
 */
export function TermsGate({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth();
  const supabase = createClient();
  const [phase, setPhase] = useState<"loading" | "welcome" | "terms" | "release" | "done">("loading");
  const [acceptance, setAcceptance] = useState<Acceptance | null>(null);
  const [creatorReleaseSigned, setCreatorReleaseSigned] = useState<boolean | null>(null);
  const [checked, setChecked] = useState<boolean[]>(QUICK_TERMS_COPY.checkboxes.map(() => false));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !member) return;
    // Admins bypass the terms gate entirely — they're the brand owner,
    // not bound by their own terms. No popup, no lock, no banner.
    if (member.role === "admin") {
      setPhase("done");
      return;
    }
    (async () => {
      // Check Quick Terms acceptance
      const { data } = await supabase
        .from("quick_terms_acceptances")
        .select("*")
        .eq("member_id", member.id)
        .eq("agreement_type", "quick_terms")
        .order("accepted_at", { ascending: false })
        .limit(1);

      const latest = (data ?? [])[0];
      setAcceptance(latest ?? null);

      // Check Creator Release signature (from agreement_signatures table OR quick_terms creator_release type)
      const { data: crAcceptances } = await supabase
        .from("quick_terms_acceptances")
        .select("*")
        .eq("member_id", member.id)
        .eq("agreement_type", "creator_release")
        .order("accepted_at", { ascending: false })
        .limit(1);
      const { data: signatures } = await supabase
        .from("agreement_signatures")
        .select("id")
        .eq("member_id", member.id)
        .limit(1);
      const hasSignedRelease = (signatures ?? []).length > 0 || !!(crAcceptances ?? [])[0];
      setCreatorReleaseSigned(hasSignedRelease);

      // If no acceptance, or version is outdated, show the flow
      if (!latest || latest.agreement_version !== QUICK_TERMS_VERSION) {
        setPhase("welcome");
      } else if (!hasSignedRelease) {
        // Quick terms accepted but Creator Release not signed — prompt for it
        setPhase("release");
      } else {
        setPhase("done");
      }
    })();
  }, [loading, member, supabase]);

  async function acceptTerms() {
    if (!member) return;
    const allChecked = checked.every(Boolean);
    if (!allChecked) return;

    setSubmitting(true);
    // Insert via client (RLS allows member to insert own)
    const { error } = await supabase
      .from("quick_terms_acceptances")
      .insert({
        user_id: member.user_id,
        member_id: member.id,
        agreement_type: "quick_terms",
        agreement_version: QUICK_TERMS_VERSION,
        accepted_checkbox_snapshot: QUICK_TERMS_COPY.checkboxes,
      });

    if (error) {
      // Try the API route as fallback (captures IP/UA server-side)
      try {
        await fetch("/api/quick-terms/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agreementVersion: QUICK_TERMS_VERSION,
            checkboxSnapshot: QUICK_TERMS_COPY.checkboxes,
          }),
        });
      } catch {
        alert("Could not save your agreement. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    // Skip the AnimatedIntro — the welcome popup already served as the intro
    sessionStorage.setItem("azos-intro-played", "1");
    setAcceptance({ ...((acceptance ?? {}) as Acceptance), agreement_version: QUICK_TERMS_VERSION });
    // After Quick Terms, check if Creator Release is signed
    if (creatorReleaseSigned === false) {
      setPhase("release");
    } else {
      setPhase("done");
    }
  }

  // Loading or done — render the portal.
  if (phase === "loading" || phase === "done") {
    return <>{children}</>;
  }

  // ===== WELCOME POPUP — mandatory, no skip =====
  if (phase === "welcome") {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-desert-night/80 backdrop-blur-sm overflow-y-auto">
          <div className="card max-w-lg w-full p-6 md:p-8 my-auto max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-center mb-4">
              <MascotImage pose="peace" size={120} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-desert-night text-center leading-tight">
              {WELCOME_COPY.title}
            </h2>
            <div className="text-sm text-smoked-charcoal/80 mt-4 leading-relaxed whitespace-pre-line">
              {WELCOME_COPY.body}
            </div>
            <button
              onClick={() => setPhase("terms")}
              className="btn btn-primary w-full mt-6"
            >
              {WELCOME_COPY.button} →
            </button>
            <p className="text-xs text-smoked-charcoal/50 text-center mt-3">
              You must agree to the room rules to enter.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ===== QUICK TERMS — mandatory, no skip =====
  if (phase === "terms") {
    const allChecked = checked.every(Boolean);
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-desert-night/80 backdrop-blur-sm overflow-y-auto">
          <div className="card max-w-lg w-full p-6 md:p-8 my-auto max-h-[90vh] overflow-y-auto relative">
            <h2 className="font-display text-2xl md:text-3xl text-desert-night leading-tight">
              {QUICK_TERMS_COPY.title}
            </h2>
            <p className="text-sm text-smoked-charcoal/70 mt-3 leading-relaxed">
              {QUICK_TERMS_COPY.intro}
            </p>

            <div className="space-y-3 mt-5">
              {/* Select all checkbox */}
              <label className="flex items-center gap-3 cursor-pointer bg-copper-clay/10 rounded-xl p-3 border-2 border-copper-clay/30 group sticky top-0">
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
                    onChange={(e) => setChecked((prev) => prev.map((c, idx) => idx === i ? e.target.checked : c))}
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
              disabled={!allChecked || submitting}
              className={`btn w-full mt-6 ${allChecked ? "btn-primary" : "btn-ghost opacity-50 cursor-not-allowed"}`}
            >
              {submitting ? "Saving…" : QUICK_TERMS_COPY.button}
            </button>

            {!allChecked && (
              <p className="text-xs text-smoked-charcoal/50 text-center mt-2">
                Please check all boxes to continue.
              </p>
            )}

            <p className="text-xs text-smoked-charcoal/50 mt-4 leading-relaxed border-t border-desert-night/10 pt-4">
              {QUICK_TERMS_COPY.footer}
            </p>
          </div>
        </div>
      </>
    );
  }

  // ===== CREATOR RELEASE MODAL — shows after Quick Terms if not yet signed =====
  // This is the popup with the summary + signature pad. Women sign right here,
  // no redirect to another page. Video uploads unlock once signed.
  if (phase === "release" && member) {
    return (
      <>
        {children}
        <CreatorReleaseModal
          member={{ id: member.id, name: member.name, email: member.email }}
          onSigned={() => {
            setCreatorReleaseSigned(true);
            setPhase("done");
          }}
          onSkip={() => setPhase("done")}
        />
      </>
    );
  }

  return <>{children}</>;
}
