import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/send-invite-email
 *
 * Sends the invite code to an approved join-submission applicant via Resend.
 * Called from the admin Join Submissions page after "Convert to invite".
 *
 * Admin-only. Uses the service role to read the submission + invite row.
 *
 * Body: {
 *   submissionId: string,   // join_submissions.id
 * }
 *
 * Requires env vars:
 *   RESEND_API_KEY  — Resend API key
 *   RESEND_FROM     — (optional) From header, defaults to AZ Off Script <noreply@azoffscript.com>
 *   PUBLIC_SITE_URL — (optional) base URL, defaults to https://azoffscript.com
 *
 * Returns:
 *   200 { ok: true, sentTo: string }   — email sent successfully
 *   400 { error: string }              — missing email or invalid request
 *   401/403 { error: string }          — not admin
 *   500 { error: string }              — DB or email send failure
 */
export async function POST(request: Request) {
  try {
    // 1. Verify caller is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: caller } = await supabase
      .from("members")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (caller?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    // 3. Look up the submission + its converted invite code
    const service = createServiceClient();
    const { data: sub, error: subErr } = await service
      .from("join_submissions")
      .select("id, name, email, converted_invite_id")
      .eq("id", submissionId)
      .single();
    if (subErr || !sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (!sub.email) {
      return NextResponse.json(
        { error: "No email on file for this submission. Copy the code and DM them manually." },
        { status: 400 }
      );
    }

    if (!sub.converted_invite_id) {
      return NextResponse.json(
        { error: "This submission has not been converted to an invite yet." },
        { status: 400 }
      );
    }

    const { data: invite, error: inviteErr } = await service
      .from("invite_codes")
      .select("code")
      .eq("id", sub.converted_invite_id)
      .single();
    if (inviteErr || !invite) {
      return NextResponse.json({ error: "Invite code not found" }, { status: 404 });
    }

    // 4. Send the email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: "Email not configured (RESEND_API_KEY missing). Copy the code and DM them manually." },
        { status: 500 }
      );
    }

    const from = process.env.RESEND_FROM ?? "AZ Off Script <noreply@azoffscript.com>";
    const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://azoffscript.com";
    const loginUrl = `${siteUrl}/login`;

    const subject = "You're in. Here's your invite code.";
    const html = buildInviteEmailHtml({
      name: sub.name,
      code: invite.code,
      loginUrl,
    });
    const text = buildInviteEmailText({
      name: sub.name,
      code: invite.code,
      loginUrl,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [sub.email], subject, html, text }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[send-invite-email] Resend failed:", res.status, errText);
      return NextResponse.json(
        { error: `Email send failed (${res.status}). Copy the code and DM them manually.` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, sentTo: sub.email });
  } catch (err) {
    console.error("[send-invite-email] unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong sending the invite email." },
      { status: 500 }
    );
  }
}

function buildInviteEmailText(i: { name: string; code: string; loginUrl: string }): string {
  const lines = [
    `Hi ${i.name},`,
    ``,
    `You're in. Round 2 is opening and your vibe fit the room.`,
    ``,
    `Here's your invite code:`,
    ``,
    `    ${i.code}`,
    ``,
    `How to use it:`,
    `  1. Go to ${i.loginUrl}`,
    `  2. Tap "Need access?"`,
    `  3. Enter the code above + your email + a password`,
    `  4. You're in the portal`,
    ``,
    `The code only works once. If you have any trouble, reply to this email.`,
    ``,
    `— AZ Off Script`,
  ];
  return lines.join("\n");
}

function buildInviteEmailHtml(i: { name: string; code: string; loginUrl: string }): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<title>You're in — AZ Off Script</title>
<style>
  body { font-family: Georgia, serif; color: #1f2937; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; color: #7c2d12; border-bottom: 3px solid #c2410c; padding-bottom: 8px; margin: 0 0 16px; }
  .hero { background: #fef3c7; padding: 18px 20px; border-radius: 12px; border-left: 4px solid #c2410c; margin-bottom: 22px; }
  .code-box { background: #1f2937; color: #fef3c7; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; text-align: center; padding: 18px; border-radius: 10px; letter-spacing: 2px; margin: 18px 0; }
  .steps { background: #f8f5ef; padding: 16px 20px; border-radius: 10px; margin: 18px 0; }
  .steps ol { margin: 0; padding-left: 22px; }
  .steps li { margin-bottom: 8px; }
  .cta { display: inline-block; margin-top: 18px; background: #c2410c; color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: bold; }
  .footer { margin-top: 28px; font-size: 12px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 12px; }
</style></head><body>
  <div class="hero">
    <h1>🌵 You're in.</h1>
    <p style="margin:0;color:#374151;">Round 2 is opening and your vibe fit the room, ${escape(i.name)}.</p>
  </div>
  <p>Here's your invite code. It only works once, so use it soon.</p>
  <div class="code-box">${escape(i.code)}</div>
  <div class="steps">
    <p style="font-weight:bold;color:#7c2d12;margin:0 0 10px;">How to get in:</p>
    <ol>
      <li>Go to <a href="${escape(i.loginUrl)}" style="color:#c2410c;">the login page</a></li>
      <li>Tap <strong>"Need access?"</strong></li>
      <li>Enter the code above + your email + a password</li>
      <li>You're inside the portal</li>
    </ol>
  </div>
  <a class="cta" href="${escape(i.loginUrl)}">Go to the login page →</a>
  <div class="footer">If you have any trouble, just reply to this email. — AZ Off Script</div>
</body></html>`;
}
