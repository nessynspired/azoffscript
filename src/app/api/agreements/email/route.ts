import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAgreementByVersion } from "@/lib/agreements";

/**
 * POST /api/agreements/email
 * Emails a signed copy of an agreement to the signer's email on file.
 *
 * Body: { signatureId: string }
 *
 * Uses Supabase's built-in email transport (Resend) if configured, otherwise
 * falls back to inserting a record into a notifications table the admin can
 * pick up. Admin-only — caller must be authenticated as admin.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify caller is admin
    const { data: callerMember } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();
    if (callerMember?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { signatureId } = body as { signatureId?: string };
    if (!signatureId) {
      return NextResponse.json({ error: "Missing signatureId" }, { status: 400 });
    }

    // Load the signature
    const { data: sig, error: sigErr } = await supabase
      .from("agreement_signatures")
      .select("*")
      .eq("id", signatureId)
      .single();
    if (sigErr || !sig) {
      return NextResponse.json({ error: "Signature not found" }, { status: 404 });
    }
    if (!sig.member_email) {
      return NextResponse.json({ error: "No email on file for this signature" }, { status: 400 });
    }

    // Load the agreement
    const { data: agreement } = await supabase
      .from("agreements")
      .select("*")
      .eq("id", sig.agreement_id)
      .single();
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const doc = getAgreementByVersion(agreement.version);
    const bodyMarkdown = doc?.bodyMarkdown ?? agreement.body_markdown;
    const signedAt = new Date(sig.created_at).toLocaleString();

    // Build a plain-text + HTML version of the signed document
    const subject = `AZ Off Script — ${agreement.title} (${agreement.version}) — Signed Copy`;
    const htmlBody = buildSignedEmailHtml({
      title: agreement.title,
      version: agreement.version,
      bodyMarkdown,
      printedName: sig.printed_name,
      memberName: sig.member_name,
      email: sig.member_email,
      phone: sig.member_phone ?? "",
      socialHandles: sig.social_handles ?? "",
      signedAt,
      signatureId: sig.id,
    });
    const textBody = `AZ Off Script — ${agreement.title} (${agreement.version})

This is your electronically signed copy of the AZ Off Script participation agreement.

Signed by: ${sig.printed_name}
Email: ${sig.member_email}
Signed at: ${signedAt}
Signature ID: ${sig.id}

The full agreement text is attached as HTML. Arizona law governs this agreement. Venue: Maricopa County, Arizona.

— AZ Off Script LLC`;

    // Send via Supabase auth admin invite-style email? No — use a notifications
    // queue row. If RESEND_API_KEY is set, we could integrate Resend here.
    // For now, we record the email request so the admin can send it manually
    // OR wire up Resend later by setting RESEND_API_KEY.
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      // Send via Resend
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "AZ Off Script <noreply@azoffscript.com>",
          to: [sig.member_email],
          subject,
          html: htmlBody,
          text: textBody,
        }),
      });
      if (!resendRes.ok) {
        const errText = await resendRes.text();
        return NextResponse.json({ error: `Email send failed: ${errText}` }, { status: 502 });
      }
      return NextResponse.json({ ok: true, sentTo: sig.member_email, transport: "resend" });
    }

    // No Resend configured — record a notification so admin knows to send manually
    await supabase.from("notifications").insert({
      user_id: sig.member_id,
      kind: "agreement_signed_copy",
      body: `Your signed copy of ${agreement.title} (${agreement.version}) is ready. Vanessa will email it to you at ${sig.member_email}.`,
      link: "/portal/agreements",
    });

    return NextResponse.json({
      ok: true,
      sentTo: sig.member_email,
      transport: "queued",
      note: "RESEND_API_KEY not set — queued a notification. Set RESEND_API_KEY to send automatically.",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function buildSignedEmailHtml(opts: {
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
  const body = markdownToHtml(opts.bodyMarkdown);
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<title>AZ Off Script — ${escapeHtml(opts.title)} — Signed</title>
<style>
  body { font-family: Georgia, serif; color: #1f2937; line-height: 1.6; max-width: 760px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; color: #7c2d12; border-bottom: 3px solid #c2410c; padding-bottom: 8px; }
  h2 { font-size: 17px; color: #7c2d12; margin-top: 22px; }
  h3 { font-size: 14px; color: #9a3412; }
  hr { border: none; border-top: 1px solid #d1d5db; margin: 22px 0; }
  ul, ol { padding-left: 22px; }
  li { margin: 3px 0; }
  .header { background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 22px; border-left: 4px solid #c2410c; }
  .signature-block { margin-top: 40px; padding: 22px; border: 2px solid #c2410c; border-radius: 8px; background: #fffbeb; }
  .sig-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #d1d5db; }
  .sig-label { font-weight: bold; color: #7c2d12; }
  .footer { margin-top: 28px; font-size: 11px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 10px; }
</style></head><body>
  <div class="header">
    <h1>AZ OFF SCRIPT LLC</h1>
    <p><strong>${escapeHtml(opts.title)}</strong> — ${escapeHtml(opts.version)}</p>
    <p style="font-size:12px;color:#6b7280;margin:4px 0 0;">Electronically signed copy — official record</p>
  </div>
  ${body}
  <div class="signature-block">
    <h2>Electronic Signature</h2>
    <div class="sig-row"><span class="sig-label">Printed Name</span><span>${escapeHtml(opts.printedName)}</span></div>
    <div class="sig-row"><span class="sig-label">Member</span><span>${escapeHtml(opts.memberName)}</span></div>
    <div class="sig-row"><span class="sig-label">Email</span><span>${escapeHtml(opts.email)}</span></div>
    <div class="sig-row"><span class="sig-label">Phone</span><span>${escapeHtml(opts.phone)}</span></div>
    <div class="sig-row"><span class="sig-label">Social Handles</span><span>${escapeHtml(opts.socialHandles)}</span></div>
    <div class="sig-row"><span class="sig-label">Signed At</span><span>${escapeHtml(opts.signedAt)}</span></div>
    <div class="sig-row"><span class="sig-label">Signature ID</span><span>${escapeHtml(opts.signatureId)}</span></div>
    <div class="sig-row"><span class="sig-label">Electronic Signature Accepted</span><span>Yes</span></div>
  </div>
  <div class="footer">
    This document was electronically signed through the AZ Off Script creator portal.
    Arizona law governs this agreement. Venue: Maricopa County, Arizona.
    This signed copy is an official record retained by AZ Off Script LLC.
  </div>
</body></html>`;
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
  for (const line of lines) {
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
