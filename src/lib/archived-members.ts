import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

/**
 * Fetches the IDs of all archived crew members.
 *
 * Archived members are hidden from active portal views, but their data
 * (agreements, clips, assignments, etc.) stays in the database.
 * Use these IDs to filter their data out of query results.
 */
export async function getArchivedMemberIds(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data } = await supabase
    .from("members")
    .select("id")
    .eq("archived", true);
  return (data ?? []).map((m) => m.id);
}

/**
 * Returns a Supabase filter string for `.not(column, "in", filter)`,
 * or null if there are no archived members (so you can skip the filter
 * call entirely and avoid an invalid empty `()` clause).
 *
 * Usage:
 *   const filter = archivedInFilter(archivedIds);
 *   let q = supabase.from("clips").select("*");
 *   if (filter) q = q.not("submitted_by", "in", filter);
 */
export function archivedInFilter(archivedIds: string[]): string | null {
  if (archivedIds.length === 0) return null;
  return `(${archivedIds.join(",")})`;
}
