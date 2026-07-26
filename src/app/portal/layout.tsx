"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PortalTopBar, PortalBottomNav } from "@/components/PortalNav";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { MascotImage } from "@/components/MascotImage";
import { TermsGate } from "@/components/TermsGate";
import { QuickTermsBanner } from "@/components/QuickTermsBanner";

function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, member, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-pulse-slow">
          <MascotImage pose="main" size={120} />
        </div>
        <p className="font-display text-2xl text-desert-night">Opening the room…</p>
      </main>
    );
  }

  // member row may briefly not exist right after signup if trigger is delayed
  const memberName = member?.name ?? user.email?.split("@")[0] ?? "Crew";
  const memberRole = member?.role ?? "member";

  return (
    <TermsGate>
      <div className="portal-shell">
        <PortalTopBar memberName={memberName} memberRole={memberRole} />
        <QuickTermsBanner />
        <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>
        <PortalBottomNav />
        <PWAInstallPrompt />
      </div>
    </TermsGate>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortalShell>{children}</PortalShell>
    </AuthProvider>
  );
}
