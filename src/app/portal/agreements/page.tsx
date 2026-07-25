"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import {
  ALL_AGREEMENTS,
  getAgreementByVersion,
  type AgreementDoc,
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

export default function AgreementsPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [agreements, setAgreements] = useState<AgreementRow[]>([]);
  const [signatures, setSignatures] = useState<SignatureRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewVersion, setViewVersion] = useState<string | null>(null);
  const [viewSignaturesFor, setViewSignaturesFor] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

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
    return (
      <div className="space-y-4">
        <button onClick={() => setViewVersion(null)} className="btn btn-ghost btn-sm">← Back to agreements</button>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-3xl text-desert-night">{agreement?.title ?? doc?.title}</h1>
            <p className="text-sm text-smoked-charcoal/60 mt-1">Version {viewVersion}</p>
          </div>
          {agreement && (
            <button onClick={() => downloadAgreementDoc(agreement)} className="btn btn-secondary btn-sm">
              ⬇ Download .md
            </button>
          )}
        </div>
        <div className="card p-6 max-w-3xl prose prose-smoked-charcoal max-w-none">
          <AgreementMarkdownRenderer markdown={body} />
        </div>
      </div>
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
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setViewVersion(doc.version)} className="btn btn-ghost btn-sm !text-xs">Preview</button>
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
}): string {
  // Very small markdown -> HTML converter (headings, bold, lists, hr, paragraphs)
  const html = markdownToHtml(opts.bodyMarkdown);
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
    <div class="sig-row"><span class="sig-label">Printed Name</span><span class="sig-value">${escapeHtml(opts.printedName)}</span></div>
    <div class="sig-row"><span class="sig-label">Member</span><span class="sig-value">${escapeHtml(opts.memberName)}</span></div>
    <div class="sig-row"><span class="sig-label">Email</span><span class="sig-value">${escapeHtml(opts.email)}</span></div>
    <div class="sig-row"><span class="sig-label">Phone</span><span class="sig-value">${escapeHtml(opts.phone)}</span></div>
    <div class="sig-row"><span class="sig-label">Social Handles</span><span class="sig-value">${escapeHtml(opts.socialHandles)}</span></div>
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
