/**
 * Seed public profiles — prefills approved_public_profile for the First Wave.
 * Run with: node scripts/seed-public-profiles.mjs
 *
 * Creates one approved_public_profile row per First Wave member with the
 * brand-approved title, secondary role, and personality line. Status is set
 * to 'Approved' so the website/portal/email signatures can use them
 * immediately. Crew can still submit change requests later.
 *
 * Uses the service role key to bypass RLS.
 * SAFE to run multiple times — uses upsert pattern.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Brand-approved First Wave profiles
const PROFILES = [
  {
    name: "Vanessa",
    public_title: "The Room Builder",
    secondary_role: "Founder + Creative Lead",
    short_personality_line: "Vision, direction, and the one turning the chaos into a brand.",
    website_bio: "Founder energy. Vision, direction, ideas, and the one making sure the chaos turns into something real.",
  },
  {
    name: "Ronnie",
    public_title: "The Sweet Touch",
    secondary_role: "First Wave Creator + Calendar Planner",
    short_personality_line: "Warm, creative, and the one who brings personality into the room while helping shape what hits the calendar next.",
    website_bio: "Warm, creative, and the one who brings personality into the room while helping shape what hits the calendar next.",
  },
  {
    name: "Sholanda",
    public_title: "The Real One",
    secondary_role: "First Wave Creator",
    short_personality_line: "Says what everyone else was thinking.",
    website_bio: "Says what everyone else was thinking — and somehow makes it useful.",
  },
  {
    name: "Elaine",
    public_title: "The Quiet Surprise",
    secondary_role: "First Wave Creator",
    short_personality_line: "The reaction might say more than the answer.",
    website_bio: "May not be the loudest in the room, but the reaction can say everything.",
  },
  {
    name: "Latasha",
    public_title: "The Wild Card",
    secondary_role: "First Wave Creator",
    short_personality_line: "You do not know where her answer is going, and that is the point.",
    website_bio: "The one people need to watch because you don't know what direction her answer is about to go.",
  },
  {
    name: "Maria",
    public_title: "The Fresh Energy",
    secondary_role: "First Wave Creator",
    short_personality_line: "Makes a simple question turn into a whole moment.",
    website_bio: "Brings a different rhythm into the room and can make a simple question turn into a whole moment.",
  },
];

async function main() {
  console.log("Seeding approved_public_profile for First Wave...\n");

  // Load all members
  const { data: members, error: membersErr } = await supabase
    .from("members")
    .select("id, name, email")
    .order("name");
  if (membersErr || !members) {
    console.error("Failed to load members:", membersErr?.message);
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const profile of PROFILES) {
    // Match by first name (members may have full names like "Vanessa Williams")
    const member = members.find((m) =>
      m.name?.toLowerCase().startsWith(profile.name.toLowerCase())
    );
    if (!member) {
      console.warn(`  ⚠ No member found for "${profile.name}" — skipping`);
      continue;
    }

    // Check if a profile already exists
    const { data: existing } = await supabase
      .from("approved_public_profile")
      .select("id")
      .eq("member_id", member.id)
      .maybeSingle();

    const payload = {
      member_id: member.id,
      legal_name: member.name,
      display_name: profile.name,
      preferred_website_name: profile.name,
      preferred_email_signature_name: profile.name,
      public_title: profile.public_title,
      secondary_role: profile.secondary_role,
      short_personality_line: profile.short_personality_line,
      website_bio: profile.website_bio,
      social_handle: null,
      tag_preference: "ask_every_time",
      profile_visibility: "public",
      photo_permission_status: "Pending Upload",
      profile_approval_status: "Approved",
      approved_by: member.id, // self-approved for the seed (admin can reassign)
      approved_at: new Date().toISOString(),
    };

    if (existing) {
      // Update only the brand fields, preserve any crew-submitted photos/handles
      const { error: updErr } = await supabase
        .from("approved_public_profile")
        .update({
          legal_name: member.name,
          public_title: profile.public_title,
          secondary_role: profile.secondary_role,
          short_personality_line: profile.short_personality_line,
          website_bio: profile.website_bio,
          profile_approval_status: "Approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (updErr) {
        console.error(`  ✗ Failed to update ${profile.name}: ${updErr.message}`);
      } else {
        updated++;
        console.log(`  ↻ Updated: ${profile.name} (${profile.public_title})`);
      }
    } else {
      const { error: insErr } = await supabase
        .from("approved_public_profile")
        .insert(payload);
      if (insErr) {
        console.error(`  ✗ Failed to insert ${profile.name}: ${insErr.message}`);
      } else {
        created++;
        console.log(`  + Created: ${profile.name} (${profile.public_title})`);
      }
    }
  }

  console.log(`\nDone. ${created} created, ${updated} updated.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
