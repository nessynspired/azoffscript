"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import { SignaturePad } from "@/components/SignaturePad";
import {
  ALL_AGREEMENTS,
  getAgreementByVersion,
  type AgreementDoc,
  type ExhibitGroup,
} from "@/lib/agreements";
import type { Database } from "@/lib/types/db";

type AgreementRow = Database["public"]["Tables"]["agreements"]["Row"];
type SignatureRow = Database["public"]["Tables"]["agreement_signatures"]["Row"];
type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name" | "role" | "email">;

const STATUS_CHIP: Record<string, string> = {
  Draft: "chip-cream",
  Active: "chip-approved",
  Retired: "chip-hold",
};

// ===========================================================================
// Parsed section type — extracted from markdown headings like "# 5. Title"
// or "# A.1. Title" for letter-prefixed exhibit sections
// ===========================================================================
interface ParsedSection {
  number: number;
  prefix: string;       // e.g. "" for main, "A." for Exhibit A
  title: string;
  anchor: string;
  html: string;
}

interface ParsedExhibit {
  group: { id: string; label: string; title: string; sectionPrefix?: string; sections: number[] };
  sections: ParsedSection[];
}

function parseAgreementSections(markdown: string): ParsedSection[] {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let buffer: string[] = [];

  function flush() {
    if (currentSection) {
      currentSection.html = markdownToHtml(buffer.join("\n"));
      sections.push(currentSection);
    }
  }

  for (const line of lines) {
    // Match "# N. Title" (plain number) OR "# A.1. Title" (letter-prefixed)
    // Pattern 1: # 5. Title
    const plainMatch = line.match(/^#+\s+(\d+)\.\s+(.+)$/);
    // Pattern 2: # A.1. Title (or B.2. etc.)
    const prefixedMatch = line.match(/^#+\s+([A-Z])\.(\d+)\.\s+(.+)$/);
    // Pattern 3: # Exhibit X — Title (exhibit heading — acts as a boundary,
    // stops the current section so exhibit intro text doesn't leak into main sections)
    const exhibitMatch = line.match(/^#+\s+Exhibit\s+([A-Z])/i);

    if (exhibitMatch) {
      // Flush current section and drop content until the first sub-section (A.1, etc.)
      flush();
      currentSection = null;
      buffer = [];
    } else if (prefixedMatch) {
      flush();
      const prefix = prefixedMatch[1] + ".";
      const num = parseInt(prefixedMatch[2], 10);
      const title = prefixedMatch[3].trim();
      currentSection = {
        number: num,
        prefix,
        title,
        anchor: `section-${prefix}${num}`,
        html: "",
      };
      buffer = [];
    } else if (plainMatch) {
      flush();
      const num = parseInt(plainMatch[1], 10);
      const title = plainMatch[2].trim();
      currentSection = {
        number: num,
        prefix: "",
        title,
        anchor: `section-${num}`,
        html: "",
      };
      buffer = [];
    } else if (currentSection) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function groupByExhibit(
  sections: ParsedSection[],
  exhibits: { id: string; label: string; title: string; sectionPrefix?: string; sections: number[] }[]
): ParsedExhibit[] {
  return exhibits.map((group) => ({
    group,
    sections: sections.filter(
      (s) => (group.sectionPrefix ?? "") === s.prefix && group.sections.includes(s.number)
    ),
  }));
}

// ---------------------------------------------------------------------------
// linkifyExhibits — turns "Exhibit A", "Exhibit B", etc. in the HTML into
// clickable links that scroll to that exhibit's first section.
// ---------------------------------------------------------------------------
function linkifyExhibits(
  html: string,
  exhibits: { id: string; label: string; sectionPrefix?: string; sections: number[] }[]
): string {
  // Build a map of "Exhibit A" → anchor of its first section
  // e.g. Exhibit A → section-A.1
  const linkMap: Record<string, string> = {};
  for (const ex of exhibits) {
    if (ex.id === "main" || ex.sections.length === 0) continue;
    const letter = ex.label.replace("Exhibit ", "").trim();
    const prefix = ex.sectionPrefix ?? `${letter}.`;
    const firstSection = ex.sections[0];
    linkMap[`Exhibit ${letter}`] = `section-${prefix}${firstSection}`;
  }

  let result = html;
  for (const [exhibitName, anchor] of Object.entries(linkMap)) {
    // Replace both plain "Exhibit A" and bold "**Exhibit A" variants
    // Use a regex that matches the exhibit name but not inside an existing href
    const escaped = exhibitName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match "Exhibit A" possibly wrapped in <strong> or bold markdown remnants
    const regex = new RegExp(`(${escaped})`, "g");
    result = result.replace(regex, `<a href="#${anchor}" class="exhibit-link" data-anchor="${anchor}">$1</a>`);
  }
  return result;
}

// ===========================================================================
// SCROLLABLE AGREEMENT VIEWER with Table of Contents
// ===========================================================================
function AgreementScrollViewer({
  title,
  version,
  bodyMarkdown,
  exhibits,
  onBack,
  onDownload,
  initialExhibitId,
}: {
  title: string;
  version: string;
  bodyMarkdown: string;
  exhibits: { id: string; label: string; title: string; sectionPrefix?: string; sections: number[] }[];
  onBack: () => void;
  onDownload: () => void;
  initialExhibitId?: string | null;
}) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allSections = parseAgreementSections(bodyMarkdown);
  const grouped = groupByExhibit(allSections, exhibits.length > 0 ? exhibits : [{ id: "main", label: "Main", title, sections: allSections.map((s) => s.number) }]);

  // Auto-scroll to a specific exhibit on mount (when opened from a link)
  useEffect(() => {
    if (!initialExhibitId) return;
    const targetGroup = grouped.find((g) => g.group.id === initialExhibitId);
    if (!targetGroup || targetGroup.sections.length === 0) return;
    // Small delay to let the layout settle
    const t = setTimeout(() => {
      scrollToAnchor(targetGroup.sections[0].anchor);
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExhibitId]);

  // Track which section is active based on scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const el = scrollRef.current;
      if (!el) return;
      const scrollTop = el.scrollTop;
      // Find the section closest to the top
      let closest: string | null = null;
      let closestDist = Infinity;
      for (const sec of allSections) {
        const target = el.querySelector(`[data-anchor="${sec.anchor}"]`);
        if (target) {
          const dist = Math.abs((target as HTMLElement).offsetTop - scrollTop - 80);
          if (dist < closestDist) {
            closestDist = dist;
            closest = sec.anchor;
          }
        }
      }
      if (closest) setActiveAnchor(closest);
    }
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [allSections]);

  function scrollToAnchor(anchor: string) {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-anchor="${anchor}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileTocOpen(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onBack} className="btn btn-ghost btn-sm">← Back to agreements</button>
        <div className="flex gap-2">
          <button onClick={() => setMobileTocOpen(!mobileTocOpen)} className="btn btn-secondary btn-sm lg:hidden">
            {mobileTocOpen ? "Hide Contents" : "Contents"}
          </button>
          <button onClick={onDownload} className="btn btn-secondary btn-sm">⬇ .md</button>
        </div>
      </div>

      {/* Title banner */}
      <div className="card-dark p-5 relative overflow-hidden">
        <div className="absolute -right-2 -bottom-2 opacity-10">
          <MascotImage pose="shades" size={120} />
        </div>
        <div className="relative z-10">
          <span className="chip chip-yellow mb-2">{version}</span>
          <h1 className="font-display text-2xl md:text-3xl text-sandstone-cream leading-tight">{title}</h1>
          <p className="text-sandstone-cream/60 text-sm mt-1">
            {allSections.length} sections · {grouped.length} {grouped.length === 1 ? "part" : "parts"} · scroll to read
          </p>
        </div>
      </div>

      {/* Main layout: TOC sidebar + scrollable content */}
      <div className="flex gap-4 items-start">
        {/* TOC sidebar — sticky on desktop */}
        <div className={`lg:sticky lg:top-4 lg:w-64 shrink-0 ${mobileTocOpen ? "block" : "hidden lg:block"}`}>
          <div className="card p-3 space-y-3 max-h-[70vh] overflow-y-auto">
            <p className="font-display text-sm text-desert-night uppercase tracking-wide">Table of Contents</p>
            {grouped.map((ex) => (
              <div key={ex.group.id}>
                <p className="text-xs font-black text-copper-deep uppercase tracking-wide mb-1">
                  {ex.group.label}
                </p>
                <p className="text-[10px] text-smoked-charcoal/50 mb-1.5">{ex.group.title}</p>
                <div className="space-y-0.5">
                  {ex.sections.map((sec) => (
                    <button
                      key={sec.anchor}
                      onClick={() => scrollToAnchor(sec.anchor)}
                      className={`block w-full text-left text-xs leading-tight py-1 px-2 rounded transition-colors ${
                        activeAnchor === sec.anchor
                          ? "bg-copper-clay/20 text-copper-deep font-bold"
                          : "text-smoked-charcoal/70 hover:bg-sandstone-cream/50"
                      }`}
                    >
                      <span className="text-smoked-charcoal/40 mr-1">{sec.prefix}{sec.number}.</span>
                      {sec.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onClick={(e) => {
            // Intercept clicks on exhibit links — scroll to that exhibit instead of navigating
            const target = e.target as HTMLElement;
            const link = target.closest(".exhibit-link") as HTMLElement | null;
            if (link?.dataset.anchor) {
              e.preventDefault();
              scrollToAnchor(link.dataset.anchor);
            }
          }}
          className="flex-1 card p-6 md:p-8 max-h-[70vh] overflow-y-auto scroll-smooth agreement-prose"
        >
          {grouped.map((ex, exIdx) => (
            <div key={ex.group.id} className={exIdx > 0 ? "mt-10 pt-8 border-t-2 border-copper-clay/20" : ""}>
              {/* Exhibit header */}
              <div className="mb-4">
                <p className="text-xs font-black text-copper-deep uppercase tracking-wider">{ex.group.label}</p>
                <h2 className="font-display text-xl text-desert-night">{ex.group.title}</h2>
              </div>

              {/* Sections */}
              {ex.sections.map((sec) => (
                <div key={sec.anchor} data-anchor={sec.anchor} className="mb-6 scroll-mt-4">
                  <h3 className="font-display text-base text-desert-night border-b border-desert-night/10 pb-1 mb-2">
                    <span className="text-copper-deep">{sec.prefix}{sec.number}.</span> {sec.title}
                  </h3>
                  <div dangerouslySetInnerHTML={{ __html: linkifyExhibits(sec.html, exhibits) }} />
                </div>
              ))}
            </div>
          ))}

          {/* Signature notice */}
          <div className="mt-10 pt-8 border-t-2 border-copper-clay/20">
            <div className="bg-cactus-teal/10 rounded-xl p-4">
              <p className="text-sm text-smoked-charcoal/70">
                Signing the Main Agreement means you agree to all exhibits A–E together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// ===========================================================================
// CUTE BRANDED POPUP — friendly summary + signature pad
// Crew sign here with finger/stylus/mouse on phone, laptop, or iPad.
// One signature signs the Main Agreement + all Exhibits A-E together.
// ===========================================================================

// ---------------------------------------------------------------------------
// IntroMessagePopup — Vanessa's personal message to the crew.
// This is the VERY FIRST popup they see before the agreement summary.
// ---------------------------------------------------------------------------
function IntroMessagePopup({
  memberName,
  onContinue,
  onClose,
}: {
  memberName?: string;
  onContinue: () => void;
  onClose: () => void;
}) {
  const firstName = memberName?.split(" ")[0] ?? "hey";
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-sandstone-cream rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — branded */}
        <div className="card-dark rounded-t-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <MascotImage pose="shades" size={140} />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-sandstone-cream/50 hover:text-sandstone-cream text-2xl z-10"
            aria-label="Close"
          >×</button>
          <div className="relative z-10">
            <span className="chip chip-yellow mb-2">Message from Vanessa</span>
            <h2 className="font-display text-2xl text-sandstone-cream leading-tight">
              Hey {firstName},
            </h2>
          </div>
        </div>

        {/* Body — the message */}
        <div className="p-6 space-y-4 text-sm text-desert-night leading-relaxed">
          <p>Before we start recording or dropping real clips, I am putting the AZ Off Script participation rules in writing so everything is clear from the beginning.</p>

          <p>This is not to make it weird. It is to protect the brand and protect everybody in the room.</p>

          <p>The same idea still stands: we are building one shared AZ Off Script page first — fun, local, personality-driven, and not forced. But once people are filming, being tagged, sharing clips, wearing gear, or maybe later dealing with sponsors/money, we need clear rules around approvals, posting, raw footage, comfort, kids, and what happens if someone leaves.</p>

          <p>One thing I also want to make clear: AZ Off Script is the main brand, and this First Wave is the first women-led room under it. That does not change what we are doing right now. It just gives the brand room to grow later into other waves, other Arizona areas, couples content, mixed groups, or other versions if it makes sense.</p>

          <p>Nothing is paid or promised right now. Nobody is being asked to pay anything. If AZ Off Script ever becomes monetized, sponsored, or paid later, money conversations will happen privately and in writing before anything is owed or split.</p>

          <div className="bg-copper-clay/10 rounded-2xl p-4">
            <p className="font-display text-base text-copper-deep mb-2">The main things are simple:</p>
            <ul className="space-y-1.5 text-sm text-smoked-charcoal">
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> official AZ Off Script content posts on the official page first</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> do not post raw footage or drafts without approval</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> do not use the AZ Off Script name/logo/mascot for your own separate thing</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> clips need approval before posting</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Do Not Post wins before something goes live</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> if someone leaves later, previously approved/posted content may stay with the brand</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> no kids by default</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> tagging is separate from posting</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> AZ Off Script may grow into future waves later</li>
            </ul>
          </div>

          <p>I want this to stay fun, but I also want it organized and respectful before we start.</p>

          <p>Please read it, ask me anything that feels confusing, and only sign when you feel clear.</p>

          <p className="font-display text-base text-desert-night">— Vanessa</p>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="btn btn-primary btn-lg w-full"
          >
            Continue to agreement →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MainAgreementPopup — shows the Main Agreement text in a branded popup.
// Exhibit mentions inside the text are clickable → open the full scroll viewer.
// Includes a signing area at the bottom (signature pad + name + date).
// Section 5 (Core Participation Rules / posting rules) is hidden from this
// popup because it's covered in detail in Exhibit A.
// ---------------------------------------------------------------------------
function MainAgreementPopup({
  doc,
  onClose,
  onOpenExhibit,
  activeAgreementId,
  member,
  alreadySigned,
  onSigned,
  previewMode,
}: {
  doc: AgreementDoc;
  onClose: () => void;
  onOpenExhibit: (exhibitId: string) => void;
  activeAgreementId?: string | null;
  member?: { id: string; name: string; email?: string | null; phone?: string | null } | null;
  alreadySigned?: boolean;
  onSigned?: () => void;
  previewMode?: boolean;
}) {
  const supabase = createClient();
  const exhibits = doc.exhibits ?? [];
  const mainExhibit = exhibits.find((e) => e.id === "main");
  const allSections = parseAgreementSections(doc.bodyMarkdown);
  // Filter out Section 5 (Core Participation Rules / posting rules) — covered in Exhibit A
  const POSTING_RULES_SECTION = 5;
  const mainSections = (mainExhibit
    ? allSections.filter((s) => s.prefix === "" && mainExhibit.sections.includes(s.number))
    : allSections.filter((s) => s.prefix === "")
  ).filter((s) => s.number !== POSTING_RULES_SECTION);

  // Signing state (same as summary popup)
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [printedName, setPrintedName] = useState(member?.name ?? "");
  const [signedDate, setSignedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(alreadySigned ?? false);
  const [error, setError] = useState<string | null>(null);
  const [whoami, setWhoami] = useState<{
    name: string; email: string; emailVerified: boolean;
    ip: string | null; deviceSummary: string;
  } | null>(null);
  const [whoamiLoading, setWhoamiLoading] = useState(false);
  const [acknowledgedDevice, setAcknowledgedDevice] = useState(false);

  useEffect(() => {
    if (previewMode || !activeAgreementId || !member || signed || whoami || whoamiLoading) return;
    setWhoamiLoading(true);
    fetch("/api/agreements/whoami")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setWhoami({
            name: data.name, email: data.email,
            emailVerified: !!data.emailVerified, ip: data.ip, deviceSummary: data.deviceSummary,
          });
        }
      })
      .catch(() => {})
      .finally(() => setWhoamiLoading(false));
  }, [previewMode, activeAgreementId, member, signed, whoami, whoamiLoading]);

  const emailBlocked = whoami && !whoami.emailVerified;
  const canSign = signatureData && printedName.trim() && signedDate && !signing && !signed && !previewMode && activeAgreementId && member && whoami && whoami.emailVerified && acknowledgedDevice;

  async function handleSign() {
    if (!canSign || !activeAgreementId || !member) return;
    setError(null);
    setSigning(true);
    const res = await fetch("/api/agreements/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agreementId: activeAgreementId,
        printedName: printedName.trim(),
        signatureData, signedDate,
        memberPhone: member.phone ?? null,
      }),
    });
    const data = await res.json();
    setSigning(false);
    if (!res.ok) { setError(data.error ?? "Failed to sign"); return; }
    setSigned(true);
    onSigned?.();
  }

  // Build a map of "Exhibit A" → exhibit id for linkify
  const exhibitLinkMap: Record<string, string> = {};
  for (const ex of exhibits) {
    if (ex.id === "main") continue;
    const letter = ex.label.replace("Exhibit ", "").trim();
    exhibitLinkMap[`Exhibit ${letter}`] = ex.id;
  }

  function linkifyMainHtml(html: string): string {
    let result = html;
    for (const [exhibitName, exId] of Object.entries(exhibitLinkMap)) {
      const escaped = exhibitName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "g");
      result = result.replace(regex, `<a href="#" class="exhibit-link" data-exhibit-id="${exId}">$1</a>`);
    }
    return result;
  }

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const link = target.closest(".exhibit-link") as HTMLElement | null;
    if (link?.dataset.exhibitId) {
      e.preventDefault();
      onOpenExhibit(link.dataset.exhibitId);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-sandstone-cream rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — same branded design */}
        <div className="card-dark p-5 relative overflow-hidden shrink-0">
          <div className="absolute -right-4 -top-4 opacity-20">
            <MascotImage pose="shades" size={120} />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-sandstone-cream/50 hover:text-sandstone-cream text-2xl z-10"
            aria-label="Close"
          >×</button>
          <div className="relative z-10">
            <span className="chip chip-yellow mb-2">AZ Off Script</span>
            <h2 className="font-display text-xl text-sandstone-cream leading-tight">Main Agreement</h2>
            <p className="text-sandstone-cream/60 text-xs mt-1">
              {mainSections.length} sections · scroll to read · exhibits are linked inside
            </p>
            {previewMode && (
              <p className="text-sandstone-cream/40 text-[10px] mt-1 uppercase tracking-wide">
                Admin preview — signing is disabled
              </p>
            )}
          </div>
        </div>

        {/* Scrollable main agreement text */}
        <div
          onClick={handleContentClick}
          className="flex-1 overflow-y-auto p-5 agreement-prose bg-white/40"
        >
          {mainSections.length === 0 ? (
            <p className="text-sm text-smoked-charcoal/50 text-center py-8">No main agreement sections found.</p>
          ) : (
            mainSections.map((sec) => (
              <div key={sec.anchor} className="mb-5">
                <h3 className="font-display text-sm text-desert-night border-b border-desert-night/10 pb-1 mb-2">
                  <span className="text-copper-deep">{sec.prefix}{sec.number}.</span> {sec.title}
                </h3>
                <div dangerouslySetInnerHTML={{ __html: linkifyMainHtml(sec.html) }} />
              </div>
            ))
          )}
        </div>

        {/* Signing area — at the bottom of the popup */}
        <div className="bg-sandstone-cream border-t-2 border-copper-clay/20 px-5 py-4 shrink-0 max-h-[40vh] overflow-y-auto">
          {signed ? (
            <div className="bg-cactus-teal/20 rounded-xl p-4 text-center">
              <p className="font-display text-base text-desert-night">✓ Signed!</p>
              <p className="text-xs text-smoked-charcoal/70 mt-1">
                You signed the Main Agreement and all Exhibits A–E on {signedDate}.
              </p>
            </div>
          ) : !previewMode && activeAgreementId && member ? (
            <div className="space-y-3">
              <p className="font-display text-sm text-desert-night">Sign here:</p>

              {/* Email verification warning */}
              {emailBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm font-bold text-red-800">Email not verified</p>
                  <p className="text-xs text-red-700 mt-1">Confirm your email before signing.</p>
                </div>
              )}

              {/* Pre-sign disclosure */}
              {whoami && (
                <div className="bg-desert-night/5 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-black text-desert-night/60 uppercase tracking-wide">For your legal protection</p>
                  <div className="text-xs text-smoked-charcoal space-y-0.5">
                    <p><span className="text-smoked-charcoal/50">Signed in as:</span> <strong>{whoami.name}</strong> ({whoami.email})</p>
                    <p><span className="text-smoked-charcoal/50">IP address:</span> {whoami.ip ?? "recorded server-side"}</p>
                    <p><span className="text-smoked-charcoal/50">Device:</span> {whoami.deviceSummary}</p>
                  </div>
                  <label className="flex items-start gap-2 pt-1.5 cursor-pointer">
                    <input type="checkbox" checked={acknowledgedDevice} onChange={(e) => setAcknowledgedDevice(e.target.checked)} disabled={!!emailBlocked} className="mt-0.5" />
                    <span className="text-xs text-smoked-charcoal">I confirm this is my account and my device.</span>
                  </label>
                </div>
              )}

              {/* Printed name + date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="label">Printed name</p>
                  <input type="text" value={printedName} onChange={(e) => setPrintedName(e.target.value)} placeholder="Legal name" className="field" disabled={!!emailBlocked} />
                </div>
                <div>
                  <p className="label">Date</p>
                  <input type="date" value={signedDate} onChange={(e) => setSignedDate(e.target.value)} className="field !w-auto" disabled={!!emailBlocked} />
                </div>
              </div>

              {/* Signature pad */}
              <SignaturePad onChange={setSignatureData} label="Draw your signature" />

              {error && <p className="text-xs text-red-700 bg-red-50 rounded p-2">{error}</p>}

              <button onClick={handleSign} disabled={!canSign} className="btn btn-primary btn-lg w-full">
                {signing ? "Signing…" : "Sign the full agreement"}
              </button>
              <p className="text-[10px] text-smoked-charcoal/40 text-center">
                Signing the Main Agreement means you agree to all exhibits A–E together.
              </p>
            </div>
          ) : previewMode ? (
            <div className="bg-sandstone-cream/60 rounded-xl p-3 text-center">
              <p className="text-xs text-smoked-charcoal/50">Signature pad appears here for crew once activated.</p>
            </div>
          ) : null}

          {/* Back button */}
          <div className="text-center mt-3">
            <button onClick={onClose} className="btn btn-ghost btn-sm !text-xs">
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgreementPopup({
  doc,
  onClose,
  activeAgreementId,
  member,
  alreadySigned,
  onSigned,
  previewMode,
  onOpenExhibit,
}: {
  doc: AgreementDoc;
  onClose: () => void;
  activeAgreementId?: string | null;
  member?: { id: string; name: string; email?: string | null; phone?: string | null } | null;
  alreadySigned?: boolean;
  onSigned?: () => void;
  previewMode?: boolean;
  onOpenExhibit?: (exhibitId: string | null) => void;
}) {
  const supabase = createClient();
  const exhibits = doc.exhibits ?? [];

  // Signing state
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [printedName, setPrintedName] = useState(member?.name ?? "");
  const [signedDate, setSignedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(alreadySigned ?? false);
  const [error, setError] = useState<string | null>(null);
  const [showMainAgreement, setShowMainAgreement] = useState(false);

  // Pre-sign disclosure (fetched from server so IP is real)
  const [whoami, setWhoami] = useState<{
    name: string;
    email: string;
    emailVerified: boolean;
    ip: string | null;
    deviceSummary: string;
  } | null>(null);
  const [whoamiLoading, setWhoamiLoading] = useState(false);
  const [acknowledgedDevice, setAcknowledgedDevice] = useState(false);

  // Fetch whoami when the signature section becomes available (not in preview)
  useEffect(() => {
    if (previewMode || !activeAgreementId || !member || signed || whoami || whoamiLoading) return;
    setWhoamiLoading(true);
    fetch("/api/agreements/whoami")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setWhoami({
            name: data.name,
            email: data.email,
            emailVerified: !!data.emailVerified,
            ip: data.ip,
            deviceSummary: data.deviceSummary,
          });
        }
      })
      .catch(() => {})
      .finally(() => setWhoamiLoading(false));
  }, [previewMode, activeAgreementId, member, signed, whoami, whoamiLoading]);

  const emailBlocked = whoami && !whoami.emailVerified;
  const canSign = signatureData && printedName.trim() && signedDate && !signing && !signed && !previewMode && activeAgreementId && member && whoami && whoami.emailVerified && acknowledgedDevice;

  async function handleSign() {
    if (!canSign || !activeAgreementId || !member) return;
    setError(null);
    setSigning(true);
    // Call the server-side API (captures real IP, writes audit log)
    const res = await fetch("/api/agreements/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agreementId: activeAgreementId,
        printedName: printedName.trim(),
        signatureData,
        signedDate,
        memberPhone: member.phone ?? null,
      }),
    });
    const data = await res.json();
    setSigning(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to sign");
      return;
    }
    setSigned(true);
    onSigned?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-sandstone-cream rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — cute and branded */}
        <div className="card-dark rounded-t-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <MascotImage pose="shades" size={140} />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-sandstone-cream/50 hover:text-sandstone-cream text-2xl z-10"
            aria-label="Close"
          >×</button>
          <div className="relative z-10">
            <span className="chip chip-yellow mb-2">AZ Off Script</span>
            <h2 className="font-display text-2xl text-sandstone-cream leading-tight">
              Let's get on the same page
            </h2>
            <p className="text-sandstone-cream/60 text-sm mt-1">
              First Wave Participation Rules + Media Release
            </p>
            {previewMode && (
              <p className="text-sandstone-cream/40 text-[10px] mt-1 uppercase tracking-wide">
                Admin preview — signing is disabled
              </p>
            )}
          </div>
        </div>

        {/* Body — friendly summary */}
        <div className="p-6 space-y-4">
          {/* Friendly intro */}
          <div className="bg-cactus-teal/10 rounded-2xl p-4">
            <p className="text-sm text-desert-night leading-relaxed">
              Hey! Before we start recording, here's the friendly version of how AZ Off Script works.
              It's not to make it weird — it's to protect the brand and protect everybody in the room.
            </p>
          </div>

          {/* The main things — bullet points */}
          <div>
            <p className="font-display text-base text-desert-night mb-2">The main things:</p>
            <ul className="space-y-1.5 text-sm text-smoked-charcoal">
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Official content posts on the official page first</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> No raw footage or drafts without approval</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Clips need approval before posting</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Do Not Post wins before something goes live</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> No kids by default</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Don't use the logo/mascot for your own thing</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Money isn't active yet — future splits need written terms</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Tagging is separate from posting approval</li>
            </ul>
          </div>

          {/* One signature signs all */}
          <p className="text-xs text-smoked-charcoal/60 text-center px-4">
            Signing the Main Agreement means you agree to all exhibits A–E together.
          </p>

          {/* Signature section */}
          {signed ? (
            <div className="bg-cactus-teal/20 rounded-2xl p-5 text-center space-y-2">
              <p className="font-display text-lg text-desert-night">✓ Signed!</p>
              <p className="text-sm text-smoked-charcoal/70">
                You signed the Main Agreement and all Exhibits A–E on {signedDate}.
              </p>
              <p className="text-xs text-smoked-charcoal/50">
                A copy can be emailed to you from the agreements page.
              </p>
            </div>
          ) : !previewMode && activeAgreementId && member ? (
            <div className="space-y-3 pt-2 border-t border-copper-clay/20">
              <p className="font-display text-base text-desert-night">Sign here:</p>

              {/* Email verification warning */}
              {emailBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm font-bold text-red-800">Email not verified</p>
                  <p className="text-xs text-red-700 mt-1">
                    You must confirm your email address before you can sign. Check your inbox
                    (including spam) for a verification link from AZ Off Script, then come back.
                  </p>
                </div>
              )}

              {/* Pre-sign disclosure — legal protection */}
              {whoami && (
                <div className="bg-desert-night/5 rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] font-black text-desert-night/60 uppercase tracking-wide">
                    For your legal protection
                  </p>
                  <div className="text-xs text-smoked-charcoal space-y-0.5">
                    <p><span className="text-smoked-charcoal/50">Signed in as:</span> <strong>{whoami.name}</strong> ({whoami.email})</p>
                    <p><span className="text-smoked-charcoal/50">IP address:</span> {whoami.ip ?? "recorded server-side"}</p>
                    <p><span className="text-smoked-charcoal/50">Device:</span> {whoami.deviceSummary}</p>
                  </div>
                  <p className="text-[10px] text-smoked-charcoal/50 pt-1">
                    This info is recorded in a tamper-evident audit log when you sign. It proves
                    <em> you</em> signed — not an admin logging in for you.
                  </p>
                  <label className="flex items-start gap-2 pt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acknowledgedDevice}
                      onChange={(e) => setAcknowledgedDevice(e.target.checked)}
                      disabled={!!emailBlocked}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-smoked-charcoal">
                      I confirm this is my account and my device. I understand this information
                      is recorded permanently.
                    </span>
                  </label>
                </div>
              )}
              {whoamiLoading && (
                <p className="text-xs text-smoked-charcoal/40 text-center">Loading your session info…</p>
              )}

              {/* Printed name */}
              <div>
                <p className="label">Printed name</p>
                <input
                  type="text"
                  value={printedName}
                  onChange={(e) => setPrintedName(e.target.value)}
                  placeholder="Your full legal name"
                  className="field"
                  disabled={!!emailBlocked}
                />
              </div>

              {/* Date */}
              <div>
                <p className="label">Date</p>
                <input
                  type="date"
                  value={signedDate}
                  onChange={(e) => setSignedDate(e.target.value)}
                  className="field !w-auto"
                  disabled={!!emailBlocked}
                />
              </div>

              {/* Signature pad */}
              <SignaturePad onChange={setSignatureData} label="Draw your signature" />

              {/* Error */}
              {error && (
                <p className="text-xs text-red-700 bg-red-50 rounded p-2">{error}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSign}
                disabled={!canSign}
                className="btn btn-primary btn-lg w-full"
              >
                {signing ? "Signing…" : "Sign the full agreement"}
              </button>
              {!signatureData && (
                <p className="text-[10px] text-smoked-charcoal/40 text-center">
                  Draw your signature above to continue
                </p>
              )}
              {!acknowledgedDevice && whoami && signatureData && (
                <p className="text-[10px] text-smoked-charcoal/40 text-center">
                  Check the box above to confirm this is your device
                </p>
              )}
            </div>
          ) : previewMode ? (
            <div className="space-y-3 pt-2 border-t border-copper-clay/20">
              <div className="bg-desert-night/5 rounded-xl p-3 space-y-1.5">
                <p className="text-[10px] font-black text-desert-night/60 uppercase tracking-wide">
                  Pre-sign disclosure (crew see this)
                </p>
                <div className="text-xs text-smoked-charcoal space-y-0.5">
                  <p><span className="text-smoked-charcoal/50">Signed in as:</span> <strong>[member name]</strong> ([email])</p>
                  <p><span className="text-smoked-charcoal/50">IP address:</span> [their real IP]</p>
                  <p><span className="text-smoked-charcoal/50">Device:</span> [browser on device]</p>
                </div>
                <p className="text-[10px] text-smoked-charcoal/50 pt-1">
                  Recorded in a tamper-evident audit log. Proves the crew member signed — not an admin.
                </p>
                <label className="flex items-start gap-2 pt-1.5">
                  <input type="checkbox" disabled className="mt-0.5" />
                  <span className="text-xs text-smoked-charcoal/50">
                    I confirm this is my account and my device. (disabled in preview)
                  </span>
                </label>
              </div>
              <div className="bg-sandstone-cream/60 rounded-xl p-3 text-center">
                <p className="text-xs text-smoked-charcoal/50">
                  Signature pad + sign button appear here once this version is activated.
                </p>
              </div>
            </div>
          ) : !activeAgreementId ? (
            <div className="bg-sandstone-cream/60 rounded-2xl p-4 text-center">
              <p className="text-xs text-smoked-charcoal/50">
                This version isn't active yet. Signing will be available once an admin activates it.
              </p>
            </div>
          ) : null}

          {/* Link to read the Main Agreement — opens the main agreement popup */}
          {onOpenExhibit && (
            <div className="pt-2 border-t border-copper-clay/20">
              <button
                onClick={() => setShowMainAgreement(true)}
                className="w-full text-left flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg hover:bg-copper-clay/10 transition group"
              >
                <span className="font-display text-sm font-bold text-desert-night group-hover:text-copper-deep transition">
                  Main Agreement
                </span>
                <span className="text-copper-deep/0 group-hover:text-copper-deep transition text-sm">→</span>
              </button>
              <p className="text-[10px] text-smoked-charcoal/40 px-2 -mx-2">
                The exhibits are linked inside the Main Agreement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Agreement popup — opens on top of the summary popup */}
      {showMainAgreement && (
        <MainAgreementPopup
          doc={doc}
          onClose={() => setShowMainAgreement(false)}
          onOpenExhibit={(exhibitId) => {
            setShowMainAgreement(false);
            onOpenExhibit?.(exhibitId);
          }}
          activeAgreementId={activeAgreementId}
          member={member}
          alreadySigned={alreadySigned}
          onSigned={onSigned}
          previewMode={previewMode}
        />
      )}
    </div>
  );
}

export default function AgreementsPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [agreements, setAgreements] = useState<AgreementRow[]>([]);
  const [signatures, setSignatures] = useState<SignatureRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewVersion, setViewVersion] = useState<string | null>(null);
  const [viewExhibitId, setViewExhibitId] = useState<string | null>(null);
  const [viewSignaturesFor, setViewSignaturesFor] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [popupPreview, setPopupPreview] = useState<AgreementDoc | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  const load = useCallback(async () => {
    const [agRes, sigRes, memRes] = await Promise.all([
      supabase.from("agreements").select("*").order("created_at", { ascending: false }),
      supabase.from("agreement_signatures").select("*").order("created_at", { ascending: false }),
      supabase.from("members").select("id, name, role, email").order("name"),
    ]);
    setAgreements(agRes.data ?? []);
    setSignatures(sigRes.data ?? []);
    setMembers(memRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // ADMIN-ONLY — crew never sees this page
  if (member?.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-smoked-charcoal/70 mt-2">Only Vanessa can manage agreements.</p>
      </div>
    );
  }

  // Which code versions are NOT yet published to the DB?
  const publishedVersions = new Set(agreements.map((a) => a.version));
  const unpublished = ALL_AGREEMENTS.filter((a) => !publishedVersions.has(a.version));
  const activeAgreement = agreements.find((a) => a.status === "Active");

  async function publishVersion(doc: AgreementDoc) {
    if (!member) return;
    if (!confirm(`Publish ${doc.version} — "${doc.title}"?\n\nThis will retire any currently Active version and make ${doc.version} the new Active agreement. Existing signatures stay tied to the version they signed.`)) return;
    setPublishing(doc.version);
    // Retire any currently-active agreement
    await supabase
      .from("agreements")
      .update({ status: "Retired", retired_at: new Date().toISOString() })
      .eq("status", "Active");
    // Insert the new version as Active
    const { error } = await supabase.from("agreements").insert({
      version: doc.version,
      title: doc.title,
      summary: doc.summary,
      body_markdown: doc.bodyMarkdown,
      status: "Active",
      activated_at: new Date().toISOString(),
      created_by: member.id,
    });
    if (error) {
      alert(error.message);
      setPublishing(null);
      return;
    }
    await load();
    setPublishing(null);
  }

  async function retireVersion(id: string) {
    if (!confirm("Retire this version? It will no longer be Active. Signatures stay on record.")) return;
    await supabase.from("agreements").update({ status: "Retired", retired_at: new Date().toISOString() }).eq("id", id);
    await load();
  }

  function downloadSignedCopy(sig: SignatureRow, agreement: AgreementRow | undefined) {
    const doc = agreement ? getAgreementByVersion(agreement.version) : undefined;
    const body = doc?.bodyMarkdown ?? agreement?.body_markdown ?? "";
    const signedAt = new Date(sig.created_at).toLocaleString();
    const html = buildSignedHtml({
      title: agreement?.title ?? "Agreement",
      version: agreement?.version ?? "?",
      bodyMarkdown: body,
      printedName: sig.printed_name,
      memberName: sig.member_name,
      email: sig.member_email ?? "",
      phone: sig.member_phone ?? "",
      socialHandles: sig.social_handles ?? "",
      signedAt,
      signatureId: sig.id,
      signatureData: sig.signature_data,
      signedDate: sig.signed_date,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AZOffScript-${agreement?.version ?? "agreement"}-${sig.printed_name.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAgreementDoc(agreement: AgreementRow) {
    const doc = getAgreementByVersion(agreement.version);
    const body = doc?.bodyMarkdown ?? agreement.body_markdown;
    const blob = new Blob([body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AZOffScript-${agreement.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Viewing a specific version's full text
  if (viewVersion) {
    const agreement = agreements.find((a) => a.version === viewVersion);
    const doc = getAgreementByVersion(viewVersion);
    const body = doc?.bodyMarkdown ?? agreement?.body_markdown ?? "";
    const exhibits = doc?.exhibits ?? [];
    return (
      <AgreementScrollViewer
        title={agreement?.title ?? doc?.title ?? "Agreement"}
        version={viewVersion}
        bodyMarkdown={body}
        exhibits={exhibits}
        onBack={() => { setViewVersion(null); setViewExhibitId(null); }}
        onDownload={() => agreement && downloadAgreementDoc(agreement)}
        initialExhibitId={viewExhibitId}
      />
    );
  }

  // Viewing signatures for a specific agreement
  if (viewSignaturesFor) {
    const agreement = agreements.find((a) => a.id === viewSignaturesFor);
    const sigs = signatures.filter((s) => s.agreement_id === viewSignaturesFor);
    return (
      <div className="space-y-4">
        <button onClick={() => setViewSignaturesFor(null)} className="btn btn-ghost btn-sm">← Back to agreements</button>
        <div>
          <h1 className="font-display text-3xl text-desert-night">Signatures — {agreement?.version}</h1>
          <p className="text-sm text-smoked-charcoal/60 mt-1">{agreement?.title}</p>
        </div>
        {sigs.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-xl text-desert-night">No signatures yet.</p>
            <p className="text-smoked-charcoal/60 mt-1">Once this version is activated and crew sign in-app, signatures will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sigs.map((sig) => (
              <div key={sig.id} className="card p-4 flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-display text-lg text-desert-night">{sig.printed_name}</p>
                  <p className="text-xs text-smoked-charcoal/60 mt-0.5">
                    Signed {new Date(sig.created_at).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sig.member_email && <span className="chip chip-cream !text-[10px]">{sig.member_email}</span>}
                    {sig.member_phone && <span className="chip chip-cream !text-[10px]">{sig.member_phone}</span>}
                    {sig.social_handles && <span className="chip chip-cream !text-[10px]">{sig.social_handles}</span>}
                    {sig.acknowledged_checklist && <span className="chip chip-approved !text-[10px]">✓ Checklist</span>}
                  </div>
                  <p className="text-[10px] text-smoked-charcoal/40 mt-2">Signature ID: {sig.id}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => downloadSignedCopy(sig, agreement)} className="btn btn-primary btn-sm !text-xs">
                    ⬇ Download signed
                  </button>
                  <button
                    onClick={() => emailSignedCopy(sig, agreement)}
                    className="btn btn-secondary btn-sm !text-xs"
                  >
                    ✉ Email signed copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main admin view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">Agreements</h1>
        <p className="text-smoked-charcoal/70 mt-2">
          Versioned participation agreements. Admin-only. Crew does not see this page yet.
        </p>
      </div>

      {/* Status banner */}
      <div className={`card p-4 ${activeAgreement ? "bg-cactus-teal/10 border-l-4 border-cactus-teal" : "bg-heat-orange/10 border-l-4 border-heat-orange"}`}>
        {activeAgreement ? (
          <p className="text-sm text-desert-night">
            <strong>Active version:</strong> {activeAgreement.version} — {activeAgreement.title}
            <br />
            <span className="text-xs text-smoked-charcoal/60">
              Activated {activeAgreement.activated_at ? new Date(activeAgreement.activated_at).toLocaleString() : "—"}
              {" · "}
              {signatures.filter((s) => s.agreement_id === activeAgreement.id).length} signatures
            </span>
          </p>
        ) : (
          <p className="text-sm text-desert-night">
            <strong>No active agreement yet.</strong> Publish a version below to start collecting signatures.
            <br />
            <span className="text-xs text-smoked-charcoal/60">Crew will not see the agreement until you activate a version.</span>
          </p>
        )}
      </div>

      {/* Unpublished versions available to publish */}
      {unpublished.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Ready to publish</h2>
          <div className="space-y-3">
            {unpublished.map((doc) => (
              <div key={doc.version} className="card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-display text-lg text-desert-night">{doc.version} — {doc.title}</p>
                    <p className="text-xs text-smoked-charcoal/60 mt-1">{doc.summary}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button onClick={() => { setPopupPreview(doc); setShowIntro(true); }} className="btn btn-ghost btn-sm !text-xs">Preview Popup</button>
                    <button onClick={() => setViewVersion(doc.version)} className="btn btn-ghost btn-sm !text-xs">Preview Full</button>
                    <button
                      onClick={() => publishVersion(doc)}
                      disabled={publishing === doc.version}
                      className="btn btn-positive btn-sm !text-xs"
                    >
                      {publishing === doc.version ? "Publishing…" : "Activate & Publish"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Published versions history */}
      <section>
        <h2 className="font-display text-2xl text-desert-night mb-3">Version history</h2>
        {loading ? (
          <div className="card p-10 text-center"><p className="font-display text-xl text-desert-night">Loading…</p></div>
        ) : agreements.length === 0 ? (
          <div className="card-dark p-10 text-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20"><MascotImage pose="shades" size={180} /></div>
            <div className="relative z-10">
              <MascotImage pose="shades" size={100} />
              <h3 className="font-display text-2xl text-sandstone-cream mt-3">No versions published yet.</h3>
              <p className="text-sandstone-cream/70 mt-2 text-sm">
                v1 is ready above. Preview it, then activate it when you're ready.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {agreements.map((a) => {
              const sigs = signatures.filter((s) => s.agreement_id === a.id);
              const signedMemberIds = new Set(sigs.map((s) => s.member_id));
              const unsignedMembers = members.filter((m) => !signedMemberIds.has(m.id) && m.role !== "admin");
              return (
                <div key={a.id} className="card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-lg text-desert-night">{a.version}</p>
                        <span className={`chip !text-[9px] ${STATUS_CHIP[a.status] ?? "chip-cream"}`}>{a.status}</span>
                      </div>
                      <p className="text-sm text-desert-night mt-0.5">{a.title}</p>
                      <p className="text-xs text-smoked-charcoal/50 mt-1">
                        Created {new Date(a.created_at).toLocaleDateString()}
                        {a.activated_at && ` · Activated ${new Date(a.activated_at).toLocaleDateString()}`}
                        {a.retired_at && ` · Retired ${new Date(a.retired_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <button onClick={() => setViewVersion(a.version)} className="btn btn-ghost btn-sm !text-xs">View</button>
                      <button onClick={() => setViewSignaturesFor(a.id)} className="btn btn-secondary btn-sm !text-xs">
                        Signatures ({sigs.length})
                      </button>
                      {a.status === "Active" && (
                        <button onClick={() => retireVersion(a.id)} className="btn btn-ghost btn-sm !text-xs">Retire</button>
                      )}
                    </div>
                  </div>

                  {/* Signature progress */}
                  <div className="bg-sandstone-cream/50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-desert-night">
                        {sigs.length} of {sigs.length + unsignedMembers.length} crew signed
                      </span>
                      {unsignedMembers.length > 0 && (
                        <span className="text-smoked-charcoal/60">
                          Waiting on: {unsignedMembers.map((m) => m.name).join(", ")}
                        </span>
                      )}
                    </div>
                    {sigs.length + unsignedMembers.length > 0 && (
                      <div className="h-2 bg-white/50 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-cactus-teal transition-all"
                          style={{ width: `${(sigs.length / (sigs.length + unsignedMembers.length)) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Intro message popup — Vanessa's personal message (shows first) */}
      {popupPreview && showIntro && (
        <IntroMessagePopup
          memberName={member?.name}
          onContinue={() => setShowIntro(false)}
          onClose={() => { setPopupPreview(null); setShowIntro(false); }}
        />
      )}

      {/* Popup preview — admin can see what crew will see */}
      {popupPreview && !showIntro && (
        <AgreementPopup
          doc={popupPreview}
          onClose={() => setPopupPreview(null)}
          previewMode
          onOpenExhibit={(exhibitId) => {
            setViewExhibitId(exhibitId);
            setViewVersion(popupPreview.version);
            setPopupPreview(null);
          }}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Email signed copy — calls the API route
// ===========================================================================
async function emailSignedCopy(sig: SignatureRow, agreement: AgreementRow | undefined) {
  if (!agreement) return;
  if (!sig.member_email) {
    alert("This signature has no email on file. Download the signed copy instead.");
    return;
  }
  if (!confirm(`Email a signed copy of ${agreement.version} to ${sig.member_email}?`)) return;
  try {
    const res = await fetch("/api/agreements/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureId: sig.id }),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      alert(`Signed copy emailed to ${sig.member_email}`);
    }
  } catch (e) {
    alert("Could not send email. Check that email is configured.");
  }
}

// ===========================================================================
// Build a printable signed HTML document
// ===========================================================================
function buildSignedHtml(opts: {
  title: string;
  version: string;
  bodyMarkdown: string;
  printedName: string;
  memberName: string;
  email: string;
  phone: string;
  socialHandles: string;
  signedAt: string;
  signatureId: string;
  signatureData?: string | null;  // base64 PNG data URL of drawn signature
  signedDate?: string | null;     // date the participant entered
}): string {
  // Very small markdown -> HTML converter (headings, bold, lists, hr, paragraphs)
  const html = markdownToHtml(opts.bodyMarkdown);
  const sigImg = opts.signatureData
    ? `<div style="margin: 12px 0;"><img src="${opts.signatureData}" alt="Signature" style="max-height: 120px; max-width: 320px; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px; background: #fff;" /></div>`
    : "";
  const dateRow = opts.signedDate
    ? `<div class="sig-row"><span class="sig-label">Date Signed</span><span class="sig-value">${escapeHtml(opts.signedDate)}</span></div>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>AZ Off Script — ${escapeHtml(opts.title)} (${escapeHtml(opts.version)}) — Signed</title>
<style>
  @page { margin: 1in; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1f2937; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; color: #7c2d12; border-bottom: 3px solid #c2410c; padding-bottom: 8px; }
  h2 { font-size: 18px; color: #7c2d12; margin-top: 24px; }
  h3 { font-size: 15px; color: #9a3412; }
  hr { border: none; border-top: 1px solid #d1d5db; margin: 24px 0; }
  ul, ol { padding-left: 24px; }
  li { margin: 4px 0; }
  .header { background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #c2410c; }
  .header h1 { border: none; margin: 0; }
  .signature-block { margin-top: 48px; padding: 24px; border: 2px solid #c2410c; border-radius: 8px; background: #fffbeb; }
  .signature-block h2 { margin-top: 0; }
  .sig-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #d1d5db; }
  .sig-label { font-weight: bold; color: #7c2d12; }
  .sig-value { color: #1f2937; }
  .footer { margin-top: 32px; font-size: 11px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 12px; }
  @media print { body { padding: 0; } .signature-block { break-inside: avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>AZ OFF SCRIPT LLC</h1>
    <p><strong>${escapeHtml(opts.title)}</strong> — ${escapeHtml(opts.version)}</p>
    <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">Electronically signed copy — official record</p>
  </div>
  ${html}
  <div class="signature-block">
    <h2>Electronic Signature</h2>
    ${sigImg}
    <div class="sig-row"><span class="sig-label">Printed Name</span><span class="sig-value">${escapeHtml(opts.printedName)}</span></div>
    <div class="sig-row"><span class="sig-label">Member</span><span class="sig-value">${escapeHtml(opts.memberName)}</span></div>
    <div class="sig-row"><span class="sig-label">Email</span><span class="sig-value">${escapeHtml(opts.email)}</span></div>
    <div class="sig-row"><span class="sig-label">Phone</span><span class="sig-value">${escapeHtml(opts.phone)}</span></div>
    <div class="sig-row"><span class="sig-label">Social Handles</span><span class="sig-value">${escapeHtml(opts.socialHandles)}</span></div>
    ${dateRow}
    <div class="sig-row"><span class="sig-label">Signed At</span><span class="sig-value">${escapeHtml(opts.signedAt)}</span></div>
    <div class="sig-row"><span class="sig-label">Signature ID</span><span class="sig-value">${escapeHtml(opts.signatureId)}</span></div>
    <div class="sig-row"><span class="sig-label">Electronic Signature Accepted</span><span class="sig-value">Yes</span></div>
  </div>
  <div class="footer">
    This document was electronically signed through the AZ Off Script creator portal.
    Arizona law governs this agreement. Venue: Maricopa County, Arizona.
    This signed copy is an official record retained by AZ Off Script LLC.
  </div>
</body>
</html>`;
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  function closeLists() {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  }
  for (const raw of lines) {
    const line = raw;
    if (/^#\s+/.test(line)) { closeLists(); out.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`); continue; }
    if (/^##\s+/.test(line)) { closeLists(); out.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`); continue; }
    if (/^###\s+/.test(line)) { closeLists(); out.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`); continue; }
    if (/^---\s*$/.test(line)) { closeLists(); out.push("<hr/>"); continue; }
    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) { if (inUl) { out.push("</ul>"); inUl = false; } out.push("<ol>"); inOl = true; }
      out.push(`<li>${inlineMd(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }
    if (/^-\s+/.test(line)) {
      if (!inUl) { if (inOl) { out.push("</ol>"); inOl = false; } out.push("<ul>"); inUl = true; }
      out.push(`<li>${inlineMd(line.replace(/^-\s+/, ""))}</li>`);
      continue;
    }
    if (line.trim() === "") { closeLists(); out.push(""); continue; }
    closeLists();
    out.push(`<p>${inlineMd(line)}</p>`);
  }
  closeLists();
  return out.join("\n");
}

function inlineMd(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===========================================================================
// Minimal markdown renderer for on-screen preview
// ===========================================================================
function AgreementMarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div
      className="agreement-prose"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
    />
  );
}
