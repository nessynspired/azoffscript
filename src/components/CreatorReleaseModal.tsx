"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import { SignaturePad } from "@/components/SignaturePad";
import { getLatestAgreement, type AgreementDoc } from "@/lib/agreements";
import type { Database } from "@/lib/types/db";

type AgreementRow = Database["public"]["Tables"]["agreements"]["Row"];

/**
 * CreatorReleaseModal — shows the Creator Release popup (summary + signature pad)
 * directly inside the TermsGate flow. Women don't need to go to the agreements page;
 * they can read the summary, sign, and unlock video uploads right here.
 *
 * After signing, the "Read full agreement" link takes them to /portal/agreements
 * if they want to read every section in detail.
 */
export function CreatorReleaseModal({
  member,
  onSigned,
  onSkip,
}: {
  member: { id: string; name: string; email?: string | null; phone?: string | null };
  onSigned: () => void;
  onSkip: () => void;
}) {
  // phone is optional — members table doesn't have it, but the sign API accepts it
  const memberPhone: string | null = null;
  const supabase = createClient();
  const [agreement, setAgreement] = useState<AgreementRow | null>(null);
  const [doc, setDoc] = useState<AgreementDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Signing state
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [printedName, setPrintedName] = useState(member.name ?? "");
  const [signedDate, setSignedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch the active agreement from Supabase
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("agreements")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false })
        .limit(1);
      const active = (data ?? [])[0];
      setAgreement(active ?? null);
      if (active) {
        const doc = getLatestAgreement();
        setDoc(doc);
      }
      setLoading(false);
    })();
  }, [supabase]);

  // Fetch whoami when ready to sign
  useEffect(() => {
    if (!agreement || !member || signed || whoami || whoamiLoading) return;
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
  }, [agreement, member, signed, whoami, whoamiLoading]);

  const emailBlocked = whoami && !whoami.emailVerified;
  const canSign = signatureData && printedName.trim() && signedDate && !signing && !signed && agreement && member && whoami && whoami.emailVerified && acknowledgedDevice;

  async function handleSign() {
    if (!canSign || !agreement || !member) return;
    setError(null);
    setSigning(true);
    const res = await fetch("/api/agreements/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agreementId: agreement.id,
        printedName: printedName.trim(),
        signatureData,
        signedDate,
        memberPhone: memberPhone,
      }),
    });
    const data = await res.json();
    setSigning(false);
    if (!res.ok) {
      setError(data.error ? (data.detail ? `${data.error}: ${data.detail}` : data.error) : "Failed to sign");
      return;
    }
    setSigned(true);
    onSigned();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-desert-night/80 backdrop-blur-sm">
        <div className="card max-w-lg w-full p-8 text-center">
          <div className="animate-pulse-slow inline-block">
            <MascotImage pose="main" size={80} />
          </div>
          <p className="font-display text-lg text-desert-night mt-4">Loading the agreement…</p>
        </div>
      </div>
    );
  }

  if (!agreement || !doc) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-desert-night/80 backdrop-blur-sm overflow-y-auto">
        <div className="card max-w-lg w-full p-6 md:p-8 my-auto max-h-[90vh] overflow-y-auto relative">
          <div className="flex justify-center mb-4">
            <MascotImage pose="main" size={100} />
          </div>
          <h2 className="font-display text-2xl text-desert-night text-center leading-tight">
            Agreement not available yet
          </h2>
          <p className="text-sm text-smoked-charcoal/70 mt-4 leading-relaxed text-center">
            The Creator Release hasn&apos;t been activated yet. You can enter the room now
            and sign it later from the Agreements page once it&apos;s ready.
          </p>
          <button onClick={onSkip} className="btn btn-primary w-full mt-6">
            Enter the room →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-desert-night/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-sandstone-cream rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-2xl my-auto">
        {/* Header — branded */}
        <div className="card-dark rounded-t-3xl p-5 md:p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <MascotImage pose="shades" size={140} />
          </div>
          <div className="relative z-10">
            <span className="chip chip-yellow mb-2">AZ Off Script</span>
            <h2 className="font-display text-2xl text-sandstone-cream leading-tight">
              Let&apos;s get on the same page
            </h2>
            <p className="text-sandstone-cream/60 text-sm mt-1">
              Participation Rules + Media Release
            </p>
          </div>
        </div>

        {/* Body — friendly summary */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Friendly intro */}
          <div className="bg-cactus-teal/10 rounded-2xl p-4">
            <p className="text-sm text-desert-night leading-relaxed">
              Hey! Before we start recording, here&apos;s the friendly version of how AZ Off Script works.
              It&apos;s not to make it weird — it&apos;s to protect the brand and protect everybody in the room.
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
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Don&apos;t use the logo/mascot for your own thing</li>
              <li className="flex gap-2"><span className="text-copper-deep font-black">·</span> Money isn&apos;t active yet — future splits need written terms</li>
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
                Video uploads are now unlocked. You can drop clips!
              </p>
              <button onClick={onSigned} className="btn btn-primary w-full mt-2">
                Continue to the room →
              </button>
            </div>
          ) : (
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
                    <p className="break-words"><span className="text-smoked-charcoal/50">Signed in as:</span> <strong>{whoami.name}</strong> ({whoami.email})</p>
                    <p className="break-all"><span className="text-smoked-charcoal/50">IP address:</span> {whoami.ip ?? "recorded server-side"}</p>
                    <p className="break-words"><span className="text-smoked-charcoal/50">Device:</span> {whoami.deviceSummary}</p>
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
                  className="field w-full"
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
                  className="field w-full sm:w-auto"
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
          )}

          {/* Link to read the full agreement */}
          <div className="pt-2 border-t border-copper-clay/20">
            <a
              href="/portal/agreements"
              className="w-full text-left flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg hover:bg-copper-clay/10 transition group"
            >
              <span className="font-display text-sm font-bold text-desert-night group-hover:text-copper-deep transition">
                Read the full agreement
              </span>
              <span className="text-copper-deep/0 group-hover:text-copper-deep transition text-sm">→</span>
            </a>
            <p className="text-[10px] text-smoked-charcoal/40 px-2 -mx-2">
              Want to read every section in detail? Open the full agreement with all exhibits.
            </p>
          </div>

          {/* Skip — video uploads stay locked */}
          {!signed && (
            <button onClick={onSkip} className="btn btn-ghost w-full text-sm">
              I&apos;ll sign later (video uploads stay locked)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
