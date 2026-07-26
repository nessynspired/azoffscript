import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/create-member
 *
 * Creates a member row for an existing auth user who signed up but never got
 * a member row (usually because their invite code was missing/invalid/used).
 *
 * Admin-only. Uses the service role to insert the member row (the anon key
 * can't insert into members without the trigger path).
 *
 * Body: {
 *   user_id: string,        // auth.users.id
 *   email: string,          // from auth.users
 *   name: string,           // display name
 *   nickname?: string,
 *   role?: "admin" | "member",  // default "member"
 *   plot_twist?: string,
 *   favorite_content?: string[],
 *   first_wave?: boolean,       // default true
 * }
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

    // 2. Parse + validate body
    const body = await request.json();
    const userId = String(body.user_id ?? "").trim();
    const email = String(body.email ?? "").trim();
    const name = String(body.name ?? "").trim();

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: "user_id, email, and name are required" },
        { status: 400 }
      );
    }

    const role = body.role === "admin" ? "admin" : "member";
    const nickname = body.nickname ? String(body.nickname).trim().slice(0, 100) : null;
    const plotTwist = body.plot_twist ? String(body.plot_twist).trim().slice(0, 500) : null;
    const favoriteContent = Array.isArray(body.favorite_content)
      ? body.favorite_content.map(String).slice(0, 10)
      : null;
    const firstWave = body.first_wave !== false; // default true

    // 3. Check if a member row already exists for this user_id
    const service = createServiceClient();
    const { data: existing } = await service
      .from("members")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This user already has a member row." },
        { status: 409 }
      );
    }

    // 4. Insert the member row
    const { data: inserted, error } = await service
      .from("members")
      .insert({
        user_id: userId,
        email,
        name,
        role,
        nickname,
        plot_twist: plotTwist,
        favorite_content: favoriteContent,
        first_wave: firstWave,
        kit_acknowledged: false,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member_id: inserted.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
