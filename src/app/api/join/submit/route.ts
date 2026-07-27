import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/join/submit
 *
 * Public submission endpoint for the /join interest form.
 * No auth required — this is the front door for prospective crew members.
 *
 * The route uses the service-role client because:
 *  1. The submitter is not authenticated (RLS would block anon inserts).
 *  2. We want to insert the submission AND notify all admins in one trusted
 *     transaction without exposing admin write access to the browser.
 *
 * Light validation + length caps are enforced here to keep junk out of the DB.
 * The service role bypasses RLS, so this route is the only public entry point.
 *
 * Side effects after a successful insert (all best-effort, never fail the submit):
 *   - In-app notification to every admin (portal bell badge)
 *   - Email to hello@azoffscript.com via Resend (only if RESEND_API_KEY is set)
 *
 * Body: {
 *   name, city, socials?, comfortableOnCamera?, contentType?,
 *   roles?: string[], availability?, boundaries?, why?, lane?
 * }
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ===== ANTI-SPAM CHECKS (server-side, invisible to real users) =====

  // 1. Honeypot — if the hidden field is filled, it's a bot.
  //    Return success so the bot thinks it worked and doesn't retry.
  const honeypot = str(body._hp).trim();
  if (honeypot) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 2. Time trap — if submitted in under 3 seconds, it's a bot auto-submitting.
  //    Real humans take at least a few seconds to read + fill the form.
  const formLoadTime = Number(body._t);
  if (formLoadTime && Date.now() - formLoadTime < 3000) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 3. IP rate limiting — max 3 submissions per hour per IP.
  //    Checks recent submissions from the same IP in the last hour.
  const clientIp = getClientIp(request);
  try {
    const service = createServiceClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await service
      .from("join_submissions")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIp ?? "")
      .gte("created_at", oneHourAgo);
    if (count && count >= 3) {
      return NextResponse.json(
        { error: "Too many submissions from your location. Please try again later." },
        { status: 429 }
      );
    }
  } catch {
    // If rate limit check fails (e.g., DB issue), don't block the submission.
    // Better to let a real person through than block them.
  }

  // ===== VALIDATION =====

  const name = str(body.name).trim();
  const city = str(body.city).trim();

  if (!name || !city) {
    return NextResponse.json(
      { error: "Name and city are required." },
      { status: 400 }
    );
  }
  if (name.length > 120 || city.length > 120) {
    return NextResponse.json(
      { error: "Name and city must each be under 120 characters." },
      { status: 400 }
    );
  }
  // Basic name sanity — must contain at least one letter
  if (!/[a-zA-Z]/.test(name)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const roles = Array.isArray(body.roles)
    ? body.roles.filter((r): r is string => typeof r === "string").slice(0, 12)
    : [];

  // Round 2 form fields (multi-select arrays)
  const contentInterests = Array.isArray(body.contentInterests)
    ? body.contentInterests.filter((r): r is string => typeof r === "string").slice(0, 20)
    : [];
  const availabilitySlots = Array.isArray(body.availability)
    ? body.availability.filter((r): r is string => typeof r === "string").slice(0, 20)
    : [];

  const submission = {
    name,
    city,
    socials: cap(str(body.socials), 200),
    comfortable_on_camera: cap(str(body.comfortableOnCamera), 60),
    content_type: cap(str(body.contentType), 2000),
    roles,
    availability: cap(str(body.availability), 200),
    boundaries: cap(str(body.boundaries), 500),
    why: cap(str(body.why), 2000),
    lane: cap(str(body.lane), 120),
    guest_or_recurring: cap(str(body.guestOrRecurring), 20),
    clips_not_guaranteed: cap(str(body.clipsNotGuaranteed), 20),
    // Round 2 fields
    content_interests: contentInterests,
    availability_slots: availabilitySlots,
    willingness: cap(str(body.willingness), 20),
    anything_else: cap(str(body.anythingElse), 2000),
    ip_address: getClientIp(request),
    user_agent: cap(request.headers.get("user-agent") ?? "", 500),
  };

  try {
    const service = createServiceClient();

    const { data: inserted, error: insertErr } = await service
      .from("join_submissions")
      .insert(submission)
      .select("id, name, lane")
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json(
        { error: "Failed to save submission", detail: insertErr?.message },
        { status: 500 }
      );
    }

    // Notify all admins so they see the badge in the portal.
    // Best-effort — push/email is handled separately; failures here don't fail the submit.
    try {
      const { data: admins } = await service
        .from("members")
        .select("id")
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        const noteBody = `New Round 2 join submission from ${inserted.name}`;
        await service.from("notifications").insert(
          admins.map((a) => ({
            user_id: a.id,
            kind: "join_submission",
            body: noteBody,
            link: "/portal/join-submissions",
          }))
        );
      }
    } catch (notifyErr) {
      console.warn("[join/submit] admin notification failed:", notifyErr);
    }

    // Email hello@azoffscript.com so the submission doesn't sit unseen.
    // Best-effort — uses Resend if RESEND_API_KEY is set (same pattern as
    // /api/agreements/email). Silently skipped if not configured; the in-app
    // notification above still fires regardless.
    try {
      await emailAdminJoinAlert({
        id: inserted.id,
        name: submission.name,
        city: submission.city,
        socials: submission.socials,
        lane: submission.lane,
        roles: submission.roles,
        comfortableOnCamera: submission.comfortable_on_camera,
        contentType: submission.content_type,
        availability: submission.availability,
        boundaries: submission.boundaries,
        why: submission.why,
        guestOrRecurring: submission.guest_or_recurring,
        clipsNotGuaranteed: submission.clips_not_guaranteed,
        submittedAt: new Date().toISOString(),
      });
    } catch (emailErr) {
      console.warn("[join/submit] admin email failed:", emailErr);
    }

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Send an email alert to hello@azoffscript.com when a new join submission
 * arrives. Uses Resend (same transport as /api/agreements/email).
 *
 * Requires env vars:
 *   RESEND_API_KEY  — Resend API key
 *   RESEND_FROM     — (optional) From header, defaults to AZ Off Script <noreply@azoffscript.com>
 *
 * No-op when RESEND_API_KEY is not set.
 */
async function emailAdminJoinAlert(info: {
  id: string;
  name: string;
  city: string;
  socials: string | null;
  lane: string | null;
  roles: string[];
  comfortableOnCamera: string | null;
  contentType: string | null;
  availability: string | null;
  boundaries: string | null;
  why: string | null;
  guestOrRecurring: string | null;
  clipsNotGuaranteed: string | null;
  submittedAt: string;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return; // not configured — silent no-op

  const to = process.env.JOIN_ALERT_TO ?? "hello@azoffscript.com";
  const from = process.env.RESEND_FROM ?? "AZ Off Script <noreply@azoffscript.com>";

  const subject = `New join submission — ${info.name} (${info.city})`;
  const html = buildJoinAlertHtml(info);
  const text = buildJoinAlertText(info);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend email failed (${res.status}): ${errText}`);
  }
}

function cameraLabel(v: string | null): string {
  if (!v) return "—";
  if (v === "yes") return "Yes, bring it on";
  if (v === "somewhat") return "Somewhat — warming up to it";
  if (v === "no") return "Not yet — prefer behind the scenes";
  return v;
}

function yesMaybeNoLabel(v: string | null): string {
  if (!v) return "—";
  if (v === "yes") return "Yes";
  if (v === "maybe") return "Maybe";
  if (v === "no") return "No";
  return v;
}

function buildJoinAlertText(i: {
  name: string; city: string; socials: string | null; lane: string | null;
  roles: string[]; comfortableOnCamera: string | null; contentType: string | null;
  availability: string | null; boundaries: string | null; why: string | null;
  guestOrRecurring: string | null; clipsNotGuaranteed: string | null;
  submittedAt: string; id: string;
}): string {
  const lines = [
    `New join submission came in from the /join form.`,
    ``,
    `Name: ${i.name}`,
    `City: ${i.city}`,
    `Socials: ${i.socials ?? "—"}`,
    `Lane: ${i.lane ?? "—"}`,
    `Comfortable on camera: ${cameraLabel(i.comfortableOnCamera)}`,
    `Roles: ${i.roles.length ? i.roles.join(", ") : "—"}`,
    `Availability: ${i.availability ?? "—"}`,
    `Content they'd enjoy: ${i.contentType ?? "—"}`,
    `Boundaries: ${i.boundaries ?? "—"}`,
    `Why this interests them: ${i.why ?? "—"}`,
    `Okay starting as guest/featured: ${yesMaybeNoLabel(i.guestOrRecurring)}`,
    `Okay with clips not all posted: ${yesMaybeNoLabel(i.clipsNotGuaranteed)}`,
    ``,
    `Submitted: ${new Date(i.submittedAt).toLocaleString()}`,
    ``,
    `Review it in the portal: https://azoffscript.com/portal/join-submissions`,
  ];
  return lines.join("\n");
}

function buildJoinAlertHtml(i: {
  name: string; city: string; socials: string | null; lane: string | null;
  roles: string[]; comfortableOnCamera: string | null; contentType: string | null;
  availability: string | null; boundaries: string | null; why: string | null;
  guestOrRecurring: string | null; clipsNotGuaranteed: string | null;
  submittedAt: string; id: string;
}): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;color:#7c2d12;font-weight:bold;width:200px;vertical-align:top;border-bottom:1px solid #f1e7d8;">${escapeHtml(label)}</td><td style="padding:6px 12px;vertical-align:top;border-bottom:1px solid #f1e7d8;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<title>New join submission — ${escapeHtml(i.name)}</title>
<style>
  body { font-family: Georgia, serif; color: #1f2937; line-height: 1.55; max-width: 640px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 20px; color: #7c2d12; border-bottom: 3px solid #c2410c; padding-bottom: 8px; margin: 0 0 16px; }
  .header { background: #fef3c7; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #c2410c; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; }
  .cta { display: inline-block; margin-top: 18px; background: #c2410c; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 999px; font-weight: bold; }
  .footer { margin-top: 24px; font-size: 11px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 10px; }
</style></head><body>
  <div class="header">
    <h1>🌵 New Join Submission</h1>
    <p style="margin:0;color:#374151;">Someone just filled out the /join form on azoffscript.com.</p>
  </div>
  <table>
    ${row("Name", i.name)}
    ${row("City", i.city)}
    ${row("Socials", i.socials ?? "—")}
    ${row("Lane", i.lane ?? "—")}
    ${row("On camera", cameraLabel(i.comfortableOnCamera))}
    ${row("What feels most like them", i.roles.length ? i.roles.join(", ") : "—")}
    ${row("Availability", i.availability ?? "—")}
    ${row("Content they'd enjoy", i.contentType ?? "—")}
    ${row("Boundaries", i.boundaries ?? "—")}
    ${row("Why this interests them", i.why ?? "—")}
    ${row("Okay as guest/featured first", yesMaybeNoLabel(i.guestOrRecurring))}
    ${row("Okay if not every clip posts", yesMaybeNoLabel(i.clipsNotGuaranteed))}
    ${row("Submitted", new Date(i.submittedAt).toLocaleString())}
  </table>
  <a class="cta" href="https://azoffscript.com/portal/join-submissions">Review in the portal →</a>
  <div class="footer">This alert was sent because a public submission was received at /join. Reply to the submitter directly — do not reply to this email.</div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Coerce an unknown value to a string (empty string if missing). */
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Trim + cap a string to a max length, returning null when empty. */
function cap(s: string, max: number): string | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Extract the client IP, accounting for proxy headers. */
function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}
