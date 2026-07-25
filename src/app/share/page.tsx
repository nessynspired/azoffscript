import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DropType } from "@/lib/types/db";

/**
 * Web Share Target handler — AUTO-DROPS the clip.
 *
 * When someone shares a TikTok/Reel link to the Off Script PWA,
 * the OS sends them here with ?title=...&text=...&url=...
 *
 * We immediately create the clip in the database and redirect to
 * a success screen. No form, no button, no second tap.
 *
 * If not logged in, middleware redirects to login (preserving the shared content).
 */
export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;

  // Figure out what was shared
  const sharedUrl = params.url || "";
  const sharedText = params.text || "";
  const sharedTitle = params.title || "";

  // Combine into the content we'll store
  const content = sharedUrl || sharedText || sharedTitle;

  if (!content) {
    redirect("/portal/drop");
  }

  // Get the user's session via server client (RLS applies)
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in — middleware should have caught this, but just in case
    redirect(`/login?redirect=/share&text=${encodeURIComponent(content)}`);
  }

  // Get the member row for this user
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (!member) {
    redirect("/portal/drop");
  }

  // Detect if it's a link or just text
  const isLink = (() => {
    try {
      new URL(content.trim());
      return true;
    } catch {
      return false;
    }
  })();

  const type: DropType = isLink ? "tiktok_link" : "idea";
  const title = content.trim().split("\n")[0].slice(0, 80) || "Shared drop";

  // Auto-create the clip — ONE TAP, DONE
  const { data: clip } = await supabase
    .from("clips")
    .insert({
      title,
      type,
      status: "Dropped",
      link: isLink ? content.trim() : null,
      idea_text: !isLink ? content.trim() : null,
      submitted_by: member.id,
      submitted_by_name: member.name,
      needs_review: false,
    })
    .select()
    .single();

  // Log activity
  if (clip) {
    await supabase.from("activity").insert({
      actor_id: member.id,
      actor_name: member.name,
      kind: "dropped",
      body: isLink
        ? `${member.name} shared a link to the room`
        : `${member.name} shared a thought: "${title}"`,
    });
  }

  // Redirect to success screen — they're done
  redirect("/portal/drop?shared=1");
}
