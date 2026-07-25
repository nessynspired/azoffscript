"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types/db";

/**
 * Portal navigation.
 * Desktop: top "studio bar" with primary items + "More" dropdown.
 * Mobile: bottom nav with oversized center Drop button + "More" sheet.
 */

type NavItem = { href: string; label: string; adminOnly?: boolean };

const PRIMARY_NAV: NavItem[] = [
  { href: "/portal/lobby", label: "Lobby" },
  { href: "/portal/drop", label: "Drop" },
  { href: "/portal/run-sheet", label: "Run Sheet" },
  { href: "/portal/crew", label: "Crew" },
  { href: "/portal/my-kit", label: "My Kit" },
];

const MORE_NAV: NavItem[] = [
  { href: "/portal/ready", label: "Ready" },
  { href: "/portal/sparks", label: "Sparks" },
  { href: "/portal/gear-board", label: "Gear", adminOnly: true },
  { href: "/portal/invites", label: "Invites", adminOnly: true },
  { href: "/portal/brand-locker", label: "Locker" },
  { href: "/portal/ground-rules", label: "How It Works" },
  { href: "/portal/money-side", label: "Money" },
  { href: "/portal/notifications", label: "Notifications" },
];

const MOBILE_PRIMARY: NavItem[] = [
  { href: "/portal/lobby", label: "Lobby" },
  { href: "/portal/run-sheet", label: "Run Sheet" },
  { href: "/portal/drop", label: "Drop", center: true } as NavItem,
  { href: "/portal/crew", label: "Crew" },
];

interface PortalNavProps {
  memberName: string;
  memberRole: UserRole;
  unreadNotifications?: number;
}

export function PortalTopBar({
  memberName,
  memberRole,
  unreadNotifications = 0,
}: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const visibleMore = MORE_NAV.filter((item) => !item.adminOnly || memberRole === "admin");
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-desert-night text-sandstone-cream border-b-2 border-copper-clay/40 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center gap-6">
        <Link href="/portal/lobby" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl tracking-tight text-sunburst-yellow">AZ</span>
          <span className="font-display text-2xl tracking-tight">Off Script</span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-full text-sm font-extrabold uppercase tracking-wide transition-colors ${
                isActive(item.href)
                  ? "bg-copper-clay text-bone-white"
                  : "text-sandstone-cream/80 hover:text-sunburst-yellow hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-3 py-2 rounded-full text-sm font-extrabold uppercase tracking-wide transition-colors flex items-center gap-1 ${
                moreOpen || visibleMore.some((i) => isActive(i.href))
                  ? "bg-copper-clay text-bone-white"
                  : "text-sandstone-cream/80 hover:text-sunburst-yellow hover:bg-white/5"
              }`}
            >
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d={moreOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-2 bg-desert-night border border-copper-clay/40 rounded-2xl py-2 min-w-[180px] shadow-[var(--shadow-lift)] animate-pop">
                {visibleMore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
                      isActive(item.href)
                        ? "text-sunburst-yellow bg-white/5"
                        : "text-sandstone-cream/80 hover:text-sunburst-yellow hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    {item.href === "/portal/notifications" && unreadNotifications > 0 && (
                      <span className="bg-sunburst-yellow text-desert-night text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/portal/my-kit"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
          >
            <span className="font-extrabold text-sm">{memberName}</span>
            <span
              className={`chip ${
                memberRole === "admin" ? "chip-yellow" : "chip-teal"
              } !py-0.5 !px-2 !text-[10px]`}
            >
              {memberRole === "admin" ? "Admin" : "Crew"}
            </span>
          </Link>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-wide text-sandstone-cream/70 hover:text-heat-orange hover:bg-white/5 transition-colors"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

export function PortalBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-desert-night border-t-2 border-copper-clay/40">
        <div className="flex items-end justify-around h-[72px] px-2">
          {MOBILE_PRIMARY.map((item) => {
            const active = isActive(item.href);
            if ("center" in item && item.center) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-6 flex flex-col items-center"
                  aria-label={item.label}
                >
                  <span
                    className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-desert-night shadow-[var(--shadow-lift)] transition-transform active:scale-95 ${
                      active ? "bg-copper-clay" : "bg-heat-orange"
                    }`}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="mt-1 text-[11px] font-black uppercase tracking-wide text-sandstone-cream">
                    {item.label}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${
                  active ? "text-sunburst-yellow" : "text-sandstone-cream/70"
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${
              moreOpen || MORE_NAV.some((i) => isActive(i.href))
                ? "text-sunburst-yellow"
                : "text-sandstone-cream/70"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
            <span className="text-[11px] font-black uppercase tracking-wide">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-desert-night/80 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-desert-night border-t-2 border-copper-clay/40 rounded-t-3xl p-6 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-sunburst-yellow">More</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="text-sandstone-cream/60 text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MORE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`p-4 text-center rounded-2xl border transition-colors ${
                    isActive(item.href)
                      ? "bg-copper-clay/30 border-copper-clay"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="font-display text-lg text-sandstone-cream">{item.label}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              className="mt-5 w-full py-3 rounded-2xl bg-heat-orange/15 border border-heat-orange/40 text-heat-orange font-extrabold uppercase tracking-wide text-sm active:scale-[0.98] transition-transform"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
