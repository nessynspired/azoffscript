"use client";

import Link from "next/link";
import { useTermsStatus } from "@/lib/hooks/use-terms-status";

/**
 * QuickTermsBanner — sticky reminder shown at the top of the portal when the
 * current user hasn't accepted the latest Quick Room Rules.
 *
 * Dismissed TermsGate modals let the user into the portal; this banner keeps
 * the rules one tap away and makes it clear certain actions are locked until
 * they accept.
 */
export function QuickTermsBanner() {
  const { quickTermsAccepted, loading } = useTermsStatus();

  if (loading || quickTermsAccepted) return null;

  return (
    <div className="bg-copper-clay text-sandstone-cream border-b-2 border-copper-deep">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold flex-1 min-w-0">
          🌵 You haven&apos;t agreed to the Quick Room Rules yet. Some actions are locked until you do.
        </p>
        <Link
          href="/portal/quick-terms"
          className="bg-sandstone-cream text-copper-deep font-extrabold text-sm px-4 py-1.5 rounded-full hover:bg-white transition-colors shrink-0"
        >
          Review &amp; Agree →
        </Link>
      </div>
    </div>
  );
}
