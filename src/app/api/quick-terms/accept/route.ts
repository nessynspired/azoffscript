import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/quick-terms/accept
 *
 * Records the user's acceptance of the Quick Room Rules.
 * Captures IP + user agent server-side for audit purposes.
 *
 * Body: {
 *   agreementVersion: string,
 *   checkboxSnapshot: string[],
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the member row
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await request.json();
    const { agreementVersion, checkboxSnapshot } = body;

    if (!agreementVersion || !Array.isArray(checkboxSnapshot) || checkboxSnapshot.length === 0) {
      return NextResponse.json({ error: "Missing version or checkbox snapshot" }, { status: 400 });
    }

    // Capture IP + user agent from the request
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;
    const userAgent = request.headers.get("user-agent") || null;

    // Upsert the acceptance (unique on member_id + agreement_type + version)
    const { error } = await supabase
      .from("quick_terms_acceptances")
      .upsert(
        {
          user_id: user.id,
          member_id: member.id,
          agreement_type: "quick_terms",
          agreement_version: agreementVersion,
          accepted_ip: ip,
          user_agent: userAgent,
          accepted_checkbox_snapshot: checkboxSnapshot,
        },
        { onConflict: "member_id,agreement_type,agreement_version" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/quick-terms/accept
 * Returns the current user's latest quick terms acceptance (if any).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!member) {
      return NextResponse.json({ accepted: false });
    }

    const { data: acceptances } = await supabase
      .from("quick_terms_acceptances")
      .select("*")
      .eq("member_id", member.id)
      .eq("agreement_type", "quick_terms")
      .order("accepted_at", { ascending: false });

    return NextResponse.json({ accepted: (acceptances ?? []).length > 0, acceptances: acceptances ?? [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
