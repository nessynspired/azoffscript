"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { QUICK_TERMS_VERSION } from "@/lib/terms";
import type { Database } from "@/lib/types/db";

type Acceptance = Database["public"]["Tables"]["quick_terms_acceptances"]["Row"];
type Signature = Database["public"]["Tables"]["agreement_signatures"]["Row"];

export interface TermsStatus {
  quickTermsAccepted: boolean;
  quickTermsVersion: string | null;
  quickTermsDate: string | null;
  creatorReleaseSigned: boolean;
  creatorReleaseDate: string | null;
  revenueAddendumSigned: boolean;
  revenueAddendumDate: string | null;
  loading: boolean;
}

/**
 * useTermsStatus — checks the current user's terms acceptance status.
 * Used by the Drop page (to lock uploads) and My Kit (Terms Status card).
 */
export function useTermsStatus(): TermsStatus {
  const { member } = useAuth();
  const supabase = createClient();
  const [status, setStatus] = useState<TermsStatus>({
    quickTermsAccepted: false,
    quickTermsVersion: null,
    quickTermsDate: null,
    creatorReleaseSigned: false,
    creatorReleaseDate: null,
    revenueAddendumSigned: false,
    revenueAddendumDate: null,
    loading: true,
  });

  useEffect(() => {
    if (!member) return;
    (async () => {
      // Quick terms acceptances
      const { data: acceptances } = await supabase
        .from("quick_terms_acceptances")
        .select("*")
        .eq("member_id", member.id)
        .order("accepted_at", { ascending: false });

      const qtAcceptances = (acceptances ?? []).filter((a) => a.agreement_type === "quick_terms");
      const latestQT = qtAcceptances[0];
      const crAcceptances = (acceptances ?? []).filter((a) => a.agreement_type === "creator_release");
      const latestCR = crAcceptances[0];
      const raAcceptances = (acceptances ?? []).filter((a) => a.agreement_type === "revenue_addendum");
      const latestRA = raAcceptances[0];

      // Also check the full agreement_signatures table (the signed Creator Release)
      const { data: signatures } = await supabase
        .from("agreement_signatures")
        .select("*")
        .eq("member_id", member.id)
        .order("created_at", { ascending: false });

      const hasSignedRelease = (signatures ?? []).length > 0 || !!latestCR;

      setStatus({
        quickTermsAccepted: !!latestQT && latestQT.agreement_version === QUICK_TERMS_VERSION,
        quickTermsVersion: latestQT?.agreement_version ?? null,
        quickTermsDate: latestQT?.accepted_at ?? null,
        creatorReleaseSigned: hasSignedRelease,
        creatorReleaseDate: latestCR?.accepted_at ?? signatures?.[0]?.created_at ?? null,
        revenueAddendumSigned: !!latestRA,
        revenueAddendumDate: latestRA?.accepted_at ?? null,
        loading: false,
      });
    })();
  }, [member, supabase]);

  return status;
}
