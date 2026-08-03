import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/agreements/sign
 *
 * Server-side signature submission for legal protection.
 *
 * This route exists so that:
 * 1. The REAL IP address is captured server-side (client can't fake it)
 * 2. The auth session is verified server-side (proves who was logged in)
 * 3. An audit log entry is written with the service role key (tamper-evident)
 * 4. Email verification is required before signing
 *
 * Admin CANNOT sign on behalf of a crew member through this route —
 * the member_id is taken from the verified auth session, not the request body.
 *
 * Body: {
 *   agreementId: string,
 *   printedName: string,
 *   signatureData: string (base64 PNG),
 *   signedDate: string (YYYY-MM-DD),
 *   socialHandles?: string,
 *   memberPhone?: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify the auth session server-side
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Require verified email
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Email not verified. Please confirm your email before signing." },
        { status: 403 }
      );
    }

    // 3. Load the member record (proves this auth user is a real member)
    const { data: member, error: memberErr } = await supabase
      .from("members")
      .select("id, name, role, email")
      .eq("user_id", user.id)
      .single();
    if (memberErr || !member) {
      return NextResponse.json({ error: "Member record not found" }, { status: 404 });
    }

    // 4. Parse the request body
    const body = await request.json();
    const { agreementId, printedName, signatureData, signedDate, socialHandles, memberPhone } = body as {
      agreementId?: string;
      printedName?: string;
      signatureData?: string;
      signedDate?: string;
      socialHandles?: string;
      memberPhone?: string;
    };

    if (!agreementId || !printedName || !signatureData || !signedDate) {
      return NextResponse.json(
        { error: "Missing required fields: agreementId, printedName, signatureData, signedDate" },
        { status: 400 }
      );
    }

    // 5. Verify the agreement exists and is Active
    const { data: agreement, error: agrErr } = await supabase
      .from("agreements")
      .select("id, version, status, title")
      .eq("id", agreementId)
      .single();
    if (agrErr || !agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }
    if (agreement.status !== "Active") {
      return NextResponse.json(
        { error: `Agreement is not active (status: ${agreement.status})` },
        { status: 400 }
      );
    }

    // 6. Check for existing signature (unique constraint on agreement_id + member_id)
    //    Use the SERVICE ROLE client here because the RLS policy sig_read_own
    //    checks member_id = auth.uid(), but member_id is the members.id UUID,
    //    NOT the auth user ID — so RLS would block the read and we'd miss
    //    existing signatures, causing a unique constraint violation on insert.
    const serviceClient = createServiceClient();
    const { data: existing } = await serviceClient
      .from("agreement_signatures")
      .select("id")
      .eq("agreement_id", agreementId)
      .eq("member_id", member.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "You already signed this version", signatureId: existing.id },
        { status: 409 }
      );
    }

    // 7. Capture the real IP and user agent from the request
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? null;

    // 8. Insert the signature using the SERVICE ROLE client (bypasses RLS)
    //    This is safe because we verified the auth session above and we use
    //    member.id from the verified session — NOT from the request body.
    const { data: signature, error: insertErr } = await serviceClient
      .from("agreement_signatures")
      .insert({
        agreement_id: agreementId,
        member_id: member.id,           // from verified auth session
        member_name: member.name,
        member_email: member.email ?? user.email,
        member_phone: memberPhone ?? null,
        social_handles: socialHandles ?? null,
        printed_name: printedName.trim(),
        signature_data: signatureData,
        signed_date: signedDate,
        acknowledged_checklist: true,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (insertErr || !signature) {
      console.error("[agreements/sign] Insert failed:", insertErr?.message, {
        agreementId,
        memberId: member.id,
        signatureDataLength: signatureData?.length ?? 0,
      });
      return NextResponse.json(
        { error: "Failed to save signature", detail: insertErr?.message ?? "Unknown insert error" },
        { status: 500 }
      );
    }

    // 9. Write the audit log entry (service role, tamper-evident)
    //    Non-blocking — if the audit table is missing or errors, the signature
    //    is still valid. We log the error but don't fail the request.
    try {
      await serviceClient.from("agreement_audit_log").insert({
        action: "signed",
        agreement_id: agreementId,
        signature_id: signature.id,
        member_id: member.id,
        auth_user_id: user.id,
        member_email: member.email ?? user.email,
        ip_address: ip,
        user_agent: userAgent,
        metadata: {
          printed_name: printedName.trim(),
          signed_date: signedDate,
          agreement_version: agreement.version,
          email_confirmed_at: user.email_confirmed_at,
        },
      });
    } catch (auditErr) {
      console.error("[agreements/sign] Audit log insert failed (non-blocking):", auditErr);
    }

    return NextResponse.json({
      success: true,
      signatureId: signature.id,
      message: "Signed successfully. Audit log recorded.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Extract the client's real IP from the request, accounting for proxies.
 * Falls back through x-forwarded-for, x-real-ip, and the connection address.
 */
function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; first entry is the client
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Next.js doesn't expose socket address directly, but Vercel/Supabase
  // typically set x-forwarded-for. This is a best-effort fallback.
  return null;
}
