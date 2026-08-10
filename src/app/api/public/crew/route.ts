import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/public/crew
 *
 * Returns all crew members who are marked public_visible=true, sorted
 * according to the site_settings crew_sort_mode value.
 *
 * No auth required — this is used by the public homepage and /crew page.
 *
 * Response: {
 *   crew: [{
 *     id, name, nickname, public_bio, slug, display_order,
 *     first_wave, photo_url, card_image, gear_image,
 *     favorite_content (used as tags)
 *   }],
 *   sortMode: 'manual' | 'alpha',
 *   crewNames: string  // comma-separated names for the "Vanessa, Ronnie, ..." line
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch public crew members + sort mode in parallel
    const [crewRes, settingsRes] = await Promise.all([
      supabase
        .from("members")
        .select("id, name, nickname, public_bio, slug, display_order, first_wave, photo_url, card_image, gear_image, favorite_content")
        .eq("public_visible", true)
        .eq("archived", false),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "crew_sort_mode")
        .single(),
    ]);

    const sortMode = settingsRes.data?.value ?? "manual";
    let crew = crewRes.data ?? [];

    // Sort based on the mode
    if (sortMode === "manual") {
      crew = [...crew].sort((a, b) => a.display_order - b.display_order);
    } else if (sortMode === "alpha") {
      crew = [...crew].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: sort by display_order for all members
      crew = [...crew].sort((a, b) => a.display_order - b.display_order);
    }

    // Build the "Vanessa, Ronnie, Sholanda..." names line
    const names = crew.map((m) => m.name);
    const crewNames = names.length > 0
      ? names.length === 1
        ? `${names[0]} is the first AZ Off Script room — a mix of real reactions, hot takes, calm energy, funny timing, and Arizona personality.`
        : `${names.slice(0, -1).join(", ")}${names.length > 1 ? ", and " : ""}${names[names.length - 1]} ${names.length > 1 ? "are" : "is"} the AZ Off Script room — a mix of real reactions, hot takes, calm energy, funny timing, and Arizona personality.`
      : "";

    return NextResponse.json({ crew, sortMode, crewNames });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
