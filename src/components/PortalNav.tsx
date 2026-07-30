"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { UserRole } from "@/lib/types/db";

/**
 * Portal navigation — role-based.
 *
 * Crew sees: Lobby, Drop, Run Sheet, My Kit, More (simple extras)
 * Planner/Admin sees: Lobby, Drop, Run Sheet, Ready Bank, Crew, More (planning tools)
 *
 * Desktop: top "studio bar" with primary items + "More" dropdown.
 * Mobile: bottom nav with oversized center Drop button + "More" sheet.
 */

type NavItem = { href: string; label: string; center?: boolean; info?: string };

// ---- Crew menu (simple participation) ----
const CREW_PRIMARY: NavItem[] = [
  { href: "/portal/lobby", label: "Lobby", info: "Your home base — activity feed, what's due, quick stats, and jump-in buttons." },
  { href: "/portal/drop", label: "Drop", info: "Quick drop a video, TikTok/Instagram link, or text idea into the room." },
  { href: "/portal/run-sheet", label: "Run Sheet", info: "The central hub for all content — from raw drops to posted clips. Switch tabs for different views." },
  { href: "/portal/my-kit", label: "My Kit", info: "Your personal profile, comfort settings, gear status, and your drops/approvals." },
];

const CREW_MORE: NavItem[] = [
  { href: "/portal/crew", label: "Crew", info: "The crew directory — see everyone in the room, their roles, and tags." },
  { href: "/portal/sparks", label: "Spark Board", info: "Drop raw content ideas and vote on ideas you like. Best ones become Ready Bank templates." },
  { href: "/portal/transitions", label: "Transitions", info: "How to connect your clip to the next person's clip. Simple step-by-step instructions for every transition." },
  { href: "/portal/recording-styles", label: "Recording Styles", info: "How to film your video — direct to camera, natural moment, reaction, POV, and more. Not the transition, the actual filming style." },
  { href: "/portal/shot-recipes", label: "Shot Recipes", info: "Ready-to-film assignments. Each recipe combines content + version + prompt + recording style + transition + editing + caption into one card. Just hit record." },
  { href: "/portal/editing-recipes", label: "Editing Recipes", info: "For admin. Once everyone sends their clips, this is how the final video gets put together. Repeatable blueprints for every content type." },
  { href: "/portal/prompts", label: "Prompts", info: "The endless idea engine. Evergreen, seasonal, trending, and community-generated prompts organized by category. This is a living library that keeps getting fed." },
  { href: "/portal/discovery", label: "Discovery", info: "How people find us. Captions, search keywords, comment prompts, and trend monitoring. Living library — updates continuously based on what's performing." },
  { href: "/portal/growth", label: "Growth System", info: "9 master documents that make up the AZ Off Script growth strategy. Market gaps, hooks, caption frameworks, prompts, search keywords, trend capture, seasonal opportunities, do-not-chase rules, and brand moats. This protects the brand identity while driving discovery." },
  { href: "/portal/brand-locker", label: "Brand Locker", info: "Official brand assets — logos, colors, captions, hashtags. Copy anything you need for content." },
  { href: "/portal/ground-rules", label: "Ground Rules", info: "How the room works — core rules, comfort guidelines, and the content flow." },
  { href: "/portal/quick-terms", label: "Quick Terms", info: "The quick room rules you agreed to when you joined. Required before dropping clips." },
  { href: "/portal/notifications", label: "Notifications", info: "Every drop, tag, and status change — plus push notification settings." },
];

// ---- Planner/Admin menu (the planning machine) ----
const PLANNER_PRIMARY: NavItem[] = [
  { href: "/portal/lobby", label: "Lobby", info: "Your home base — activity feed, what's due, quick stats, and jump-in buttons." },
  { href: "/portal/drop", label: "Drop", info: "Quick drop a video, TikTok/Instagram link, or text idea into the room." },
  { href: "/portal/run-sheet", label: "Run Sheet", info: "The central hub for all content — from raw drops to posted clips. Switch tabs for different views." },
  { href: "/portal/ready-bank", label: "Ready Bank", info: "Library of vetted content templates ready to schedule. Create clips from templates here." },
  { href: "/portal/crew", label: "Crew", info: "The crew directory — see everyone, their roles, terms status, and manage member profiles." },
];

const PLANNER_MORE: NavItem[] = [
  { href: "/portal/sparks", label: "Spark Board", info: "Drop raw content ideas and vote on ideas you like. Best ones become Ready Bank templates." },
  { href: "/portal/transitions", label: "Transitions", info: "How to connect your clip to the next person's clip. Simple step-by-step instructions for every transition." },
  { href: "/portal/recording-styles", label: "Recording Styles", info: "How to film your video — direct to camera, natural moment, reaction, POV, and more. Not the transition, the actual filming style." },
  { href: "/portal/shot-recipes", label: "Shot Recipes", info: "Ready-to-film assignments. Each recipe combines content + version + prompt + recording style + transition + editing + caption into one card. Just hit record." },
  { href: "/portal/editing-recipes", label: "Editing Recipes", info: "For admin. Once everyone sends their clips, this is how the final video gets put together. Repeatable blueprints for every content type." },
  { href: "/portal/prompts", label: "Prompts", info: "The endless idea engine. Evergreen, seasonal, trending, and community-generated prompts organized by category. This is a living library that keeps getting fed." },
  { href: "/portal/discovery", label: "Discovery", info: "How people find us. Captions, search keywords, comment prompts, and trend monitoring. Living library — updates continuously based on what's performing." },
  { href: "/portal/growth", label: "Growth System", info: "9 master documents that make up the AZ Off Script growth strategy. Market gaps, hooks, caption frameworks, prompts, search keywords, trend capture, seasonal opportunities, do-not-chase rules, and brand moats. This protects the brand identity while driving discovery." },
  { href: "/portal/gear-board", label: "Gear Board", info: "Admin only. Track personalized merch for each crew member — tumblers, shirts, badges, cards." },
  { href: "/portal/recycle-bin", label: "Recycle Bin", info: "Admin only. Restore deleted clips, assignments, and trends before they're gone forever." },
  { href: "/portal/crew-profiles", label: "Crew Profiles", info: "Admin only. Control who appears on the public website and how they're shown." },
  { href: "/portal/invites", label: "Invites", info: "Admin only. Generate one-time invite codes for new crew members signing up." },
  { href: "/portal/join-submissions", label: "Join Submissions", info: "Admin only. Review public /join form submissions and convert approved ones to invite codes." },
  { href: "/portal/agreements", label: "Agreements", info: "Legal documents — Creator Release, Revenue Addendum. Read and sign here." },
  { href: "/portal/public-cards", label: "Public Cards", info: "Admin only. Review and approve crew public profile card requests for the website." },
  { href: "/portal/brand-locker", label: "Brand Locker", info: "Official brand assets — logos, colors, captions, hashtags. Copy anything you need." },
  { href: "/portal/ground-rules", label: "Ground Rules", info: "How the room works — core rules, comfort guidelines, and the content flow." },
  { href: "/portal/quick-terms", label: "Quick Terms", info: "The quick room rules everyone agreed to. Admins can see who has accepted." },
  { href: "/portal/money-side", label: "Money Side", info: "Revenue tracking, splits, and payouts. Mostly setup right now — money isn't active yet." },
  { href: "/portal/notifications", label: "Notifications", info: "Every drop, tag, and status change — plus push notification settings." },
];

// ---- Mobile bottom nav ----
// Layout: 2 left + FAB(popout) center + 2 right = 5 slots (never 6)
// FAB opens a popout with Drop + all "More" items
const CREW_MOBILE: NavItem[] = [
  { href: "/portal/lobby", label: "Lobby" },
  { href: "/portal/run-sheet", label: "Run Sheet" },
  { href: "/portal/crew", label: "Crew" },
  { href: "/portal/my-kit", label: "My Kit" },
];

const PLANNER_MOBILE: NavItem[] = [
  { href: "/portal/lobby", label: "Lobby" },
  { href: "/portal/run-sheet", label: "Run Sheet" },
  { href: "/portal/crew", label: "Crew" },
  { href: "/portal/my-kit", label: "My Kit" },
];

interface PortalNavProps {
  memberName: string;
  memberRole: UserRole;
  unreadNotifications?: number;
  avatarUrl?: string | null;
}

export function PortalTopBar({
  memberName,
  memberRole,
  unreadNotifications: propUnread = 0,
  avatarUrl = null,
}: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, member } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [unread, setUnread] = useState(propUnread);
  const moreRef = useRef<HTMLDivElement>(null);

  const isPlanner = memberRole === "admin" || member?.can_plan_content === true;
  const primaryNav = isPlanner ? PLANNER_PRIMARY : CREW_PRIMARY;
  const moreNav = isPlanner ? PLANNER_MORE : CREW_MORE;

  // Fetch unread notification count
  useEffect(() => {
    if (!member) return;
    const supabase = createClient();
    async function fetchUnread() {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", member!.id)
        .eq("read", false);
      setUnread(count ?? 0);
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [member, pathname]);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-desert-night text-sandstone-cream border-b-2 border-copper-clay/40 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center gap-6">
        <Link href="/portal/lobby" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logos/logo-official.png" alt="AZ Off Script" className="h-12 w-auto" />
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {primaryNav.map((item) => (
            <span key={item.href} className="relative inline-flex">
              <Link
                href={item.href}
                className={`px-3 py-2 rounded-full text-sm font-extrabold uppercase tracking-wide transition-colors ${
                  isActive(item.href)
                    ? "bg-copper-clay text-bone-white"
                    : "text-sandstone-cream/80 hover:text-sunburst-yellow hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
              {item.info && <InfoTooltip text={item.info} dark />}
            </span>
          ))}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-3 py-2 rounded-full text-sm font-extrabold uppercase tracking-wide transition-colors flex items-center gap-1 ${
                moreOpen || moreNav.some((i) => isActive(i.href))
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
              <div className="absolute top-full left-0 mt-2 bg-desert-night border border-copper-clay/40 rounded-2xl py-2 min-w-[260px] shadow-[var(--shadow-lift)] animate-pop max-h-[calc(100vh-100px)] overflow-y-auto">
                {moreNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col px-4 py-2.5 transition-colors ${
                      isActive(item.href)
                        ? "text-sunburst-yellow bg-white/5"
                        : "text-sandstone-cream/80 hover:text-sunburst-yellow hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
                      {item.href === "/portal/notifications" && unread > 0 && (
                        <span className="bg-sunburst-yellow text-desert-night text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                    {item.info && (
                      <span className="text-[10px] text-sandstone-cream/40 mt-0.5 leading-snug">{item.info}</span>
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
            className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
            title="My Kit"
          >
            {/* Avatar circle — shows uploaded portal avatar, or initials fallback */}
            <span className="w-9 h-9 rounded-full bg-copper-clay/30 flex items-center justify-center shrink-0 overflow-hidden border-2 border-copper-clay/40">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={memberName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-sm text-sandstone-cream">
                  {memberName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <span className="hidden sm:inline font-extrabold text-sm">{memberName}</span>
            <span
              className={`chip ${
                memberRole === "admin"
                  ? "chip-yellow"
                  : isPlanner
                    ? "chip-copper"
                    : "chip-teal"
              } !py-0.5 !px-2 !text-[10px] hidden sm:inline-flex`}
            >
              {memberRole === "admin" ? "Admin" : isPlanner ? "Planner" : "Crew"}
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
  const { signOut, member } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const isPlanner = member?.role === "admin" || member?.can_plan_content === true;
  const mobileNav = isPlanner ? PLANNER_MOBILE : CREW_MOBILE;
  const moreNav = isPlanner ? PLANNER_MORE : CREW_MORE;
  const avatarUrl = member?.photo_url ?? null;
  const memberName = member?.name ?? "Crew";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-desert-night border-t-2 border-copper-clay/40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-end justify-around h-[72px] px-2">
          {/* Left 2 items */}
          {mobileNav.slice(0, 2).map((item) => {
            const active = isActive(item.href);
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

          {/* Center FAB — popout button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="relative -mt-6 flex flex-col items-center"
            aria-label="Open menu"
          >
            <span
              className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-desert-night shadow-[var(--shadow-lift)] transition-transform active:scale-95 ${
                moreOpen || moreNav.some((i) => isActive(i.href))
                  ? "bg-copper-clay"
                  : "bg-heat-orange"
              }`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="mt-1 text-[11px] font-black uppercase tracking-wide text-sandstone-cream">
              Menu
            </span>
          </button>

          {/* Right 2 items */}
          {mobileNav.slice(2, 4).map((item) => {
            const active = isActive(item.href);
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
        </div>
      </nav>

      {/* Mobile More sheet (opened by FAB popout) */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-desert-night/80 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-desert-night border-t-2 border-copper-clay/40 rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-sunburst-yellow">Menu</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="text-sandstone-cream/60 text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Profile header with avatar */}
            <Link
              href="/portal/my-kit"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="w-12 h-12 rounded-full bg-copper-clay/30 flex items-center justify-center shrink-0 overflow-hidden border-2 border-copper-clay/40">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={memberName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-base text-sandstone-cream">
                    {memberName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sandstone-cream truncate">{memberName}</p>
                <p className="text-xs text-sandstone-cream/50">View My Kit →</p>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              {moreNav.map((item) => (
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
