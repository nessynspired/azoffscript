import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/db";

/**
 * PUT /api/admin/crew-profile
 *
 * Updates a member's public profile fields (public_visible, public_bio,
 * nickname, slug, display_order, card_image, gear_image, favorite_content).
 *
 * Admin-only.
 *
 * Body: {
 *   id: string,              // member id
 *   public_visible?: boolean,
 *   public_bio?: string | null,
 *   nickname?: string | null,
 *   slug?: string | null,
 *   display_order?: number,
 *   card_image?: string | null,
 *   gear_image?: string | null,
 *   favorite_content?: string[] | null,
 * }
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify caller is admin
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
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Member id is required" }, { status: 400 });
    }

    // Build update object from provided fields only
    const update: Record<string, unknown> = {};
    if (typeof body.public_visible === "boolean") update.public_visible = body.public_visible;
    if (body.public_bio !== undefined) update.public_bio = body.public_bio ? String(body.public_bio).trim().slice(0, 1000) : null;
    if (body.nickname !== undefined) update.nickname = body.nickname ? String(body.nickname).trim().slice(0, 100) : null;
    if (body.slug !== undefined) update.slug = body.slug ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 50) : null;
    if (typeof body.display_order === "number") update.display_order = body.display_order;
    if (body.card_image !== undefined) update.card_image = body.card_image ? String(body.card_image).trim().slice(0, 200) : null;
    if (body.gear_image !== undefined) update.gear_image = body.gear_image ? String(body.gear_image).trim().slice(0, 200) : null;
    if (Array.isArray(body.favorite_content)) update.favorite_content = body.favorite_content.map(String).slice(0, 10);

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // 3. Update the member
    const { error } = await supabase.from("members").update(update as Database["public"]["Tables"]["members"]["Update"]).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
