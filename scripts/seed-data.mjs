/**
 * Seed script — populates the database with fake data for testing.
 * Run with: node scripts/seed-data.mjs
 *
 * Creates:
 * - 5 crew members (Ronnie, Sholanda, Elaine, Latasha, Maria) with titles
 * - Gear items for each member (tumbler, shirt, badge, etc.)
 * - Clips in various statuses (production pipeline + ideas/links)
 * - Clip people (tagging crew in clips)
 * - Approvals (some waiting, some approved)
 * - Activity feed entries
 * - Ideas/sparks
 *
 * Uses the service role key to bypass RLS.
 * SAFE to run multiple times — uses upsert/insert-or-ignore patterns.
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

const CREW = [
  { name: "Ronnie", nickname: "The Sweet Touch", plot_twist: "Brings the energy before the camera's even on", favorite_content: ["Skits", "Trends", "Group Games"] },
  { name: "Sholanda", nickname: "The Real One", plot_twist: "Says what everyone else was thinking", favorite_content: ["Hot Takes", "Real Reactions", "Group Games"] },
  { name: "Elaine", nickname: "The Quiet Surprise", plot_twist: "The side-eye that launches a thousand comments", favorite_content: ["Reactions", "BTS Chaos"] },
  { name: "Latasha", nickname: "The Wild Card", plot_twist: "You never know what's coming next", favorite_content: ["Group Games", "Hot Takes", "AZ Moments"] },
  { name: "Maria", nickname: "The Fresh Energy", plot_twist: "New to the room, already running it", favorite_content: ["Funny Questions", "Trends", "Group Games"] },
];

const LANES = [
  "Group Chat Court", "Dry Heat Hot Takes", "Red Flag or Real Life?",
  "Who's Most Likely To", "AZ Moments", "Off Script Afterthoughts",
];

const DESTINATIONS = ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook", "All Platforms"];

async function seed() {
  console.log("🌱 Seeding AZ Off Script with fake data...\n");

  // Get existing members (we won't create auth users, just member rows if they don't exist)
  const { data: existingMembers } = await supabase.from("members").select("*");
  const existingByName = new Map((existingMembers ?? []).map((m) => [m.name, m]));
  const existingByEmail = new Map((existingMembers ?? []).map((m) => [m.email, m]));

  // Get Vanessa (admin) — she should already exist
  const vanessa = (existingMembers ?? []).find((m) => m.role === "admin");
  if (!vanessa) {
    console.log("⚠️  No admin found. Make sure Vanessa's account exists first.");
  } else {
    console.log(`✅ Found admin: ${vanessa.name}`);
  }

  // Create member rows for crew (with fake user_ids — they won't be able to log in,
  // but the data will show up in the UI for testing)
  const memberMap = new Map();
  for (const crew of CREW) {
    const email = `${crew.name.toLowerCase()}@azoffscript.test`;
    let member = existingByEmail.get(email) ?? existingByName.get(crew.name);
    if (!member) {
      const { data, error } = await supabase.from("members").insert({
        user_id: crypto.randomUUID(), // fake — won't be able to log in
        email,
        name: crew.name,
        nickname: crew.nickname,
        plot_twist: crew.plot_twist,
        favorite_content: crew.favorite_content,
        first_wave: true,
        role: "member",
        comfort_tags: ["No kids content"],
        design_edition: "Yes",
        availability: "Weekdays after 5, weekends free",
        socials: { tiktok: `@${crew.name.toLowerCase()}.az` },
        kit_acknowledged: true,
      }).select().single();
      if (error) {
        console.log(`⚠️  Could not create ${crew.name}: ${error.message}`);
        continue;
      }
      member = data;
      console.log(`✅ Created member: ${crew.name} — "${crew.nickname}"`);
    } else {
      // Update existing with the good stuff
      await supabase.from("members").update({
        nickname: crew.nickname,
        plot_twist: crew.plot_twist,
        favorite_content: crew.favorite_content,
        design_edition: "Yes",
        availability: "Weekdays after 5, weekends free",
        socials: { tiktok: `@${crew.name.toLowerCase()}.az` },
        kit_acknowledged: true,
      }).eq("id", member.id);
      console.log(`✅ Updated member: ${crew.name} — "${crew.nickname}"`);
    }
    memberMap.set(crew.name, member);
  }

  // ===== GEAR =====
  console.log("\n📦 Seeding gear...");
  let gearTableExists = true;
  const { data: existingGear, error: gearCheckErr } = await supabase.from("gear").select("*").limit(1);
  if (gearCheckErr && gearCheckErr.message.includes("Could not find")) {
    console.log("   ⚠️  Gear table doesn't exist yet — run the SQL first (see below)");
    gearTableExists = false;
  } else if (existingGear && existingGear.length > 0) {
    console.log(`   Already have ${existingGear.length} gear items, skipping`);
    gearTableExists = false;
  }
  if (gearTableExists) {
    const gearItems = [];
    const gearStatuses = ["mockup_ready", "approved", "ordered", "delivered", "needs_name_check", "not_started"];
    for (const crew of CREW) {
      const member = memberMap.get(crew.name);
      if (!member) continue;
      // Each member gets: tumbler, shirt, badge, sticker, member_card
      const items = [
        { item_type: "tumbler", personalized_name: crew.name, title_edition: crew.nickname, status: gearStatuses[Math.floor(Math.random() * 3)] },
        { item_type: "shirt", personalized_name: null, title_edition: "First Wave", status: gearStatuses[Math.floor(Math.random() * 4)] },
        { item_type: "badge", personalized_name: crew.name, title_edition: crew.nickname, status: "approved" },
        { item_type: "sticker", personalized_name: null, title_edition: crew.nickname, status: "not_started" },
        { item_type: "member_card", personalized_name: crew.name, title_edition: crew.nickname, status: "delivered" },
      ];
      for (const item of items) {
        gearItems.push({
          member_id: member.id,
          member_name: crew.name,
          item_type: item.item_type,
          personalized_name: item.personalized_name,
          title_edition: item.title_edition,
          status: item.status,
        });
      }
    }
    // Also add gear for Vanessa
    if (vanessa) {
      gearItems.push(
        { member_id: vanessa.id, member_name: "Vanessa", item_type: "tumbler", personalized_name: "Vanessa", title_edition: "The Room Builder", status: "delivered" },
        { member_id: vanessa.id, member_name: "Vanessa", item_type: "shirt", personalized_name: null, title_edition: "First Wave", status: "delivered" },
        { member_id: vanessa.id, member_name: "Vanessa", item_type: "member_card", personalized_name: "Vanessa", title_edition: "The Room Builder", status: "delivered" },
      );
    }
    const { error } = await supabase.from("gear").insert(gearItems);
    if (error) console.log(`⚠️  Gear insert error: ${error.message}`);
    else console.log(`   ✅ Created ${gearItems.length} gear items`);
  }

  // ===== CLIPS =====
  console.log("\n🎬 Seeding clips...");
  const { data: existingClips } = await supabase.from("clips").select("*");
  if (existingClips && existingClips.length > 5) {
    console.log(`   Already have ${existingClips.length} clips, skipping`);
  } else {
    const allMembers = [vanessa, ...CREW.map((c) => memberMap.get(c.name))].filter(Boolean);
    const clipsToCreate = [
      // Production videos
      { title: "Red Flag or Real Life — First Wave Edition", type: "video", status: "Planned", category: "Red Flag or Real Life?", destination: "TikTok", lane: "Red Flag or Real Life?" },
      { title: "Dry Heat Hot Takes — Is Fry's better than Safeway?", type: "video", status: "Shot", category: "Dry Heat Hot Takes", destination: "TikTok" },
      { title: "Group Chat Court — Who pays on the first date?", type: "video", status: "Cutting", category: "Group Chat Court", destination: "Instagram Reels" },
      { title: "Who's Most Likely To — First Wave edition", type: "video", status: "Review", category: "Who's Most Likely To", destination: "All Platforms" },
      { title: "AZ Moments — Monsoon season check-in", type: "video", status: "Ready", category: "AZ Moments", destination: "TikTok" },
      { title: "Off Script Afterthoughts — The blooper reel", type: "final_cut", status: "Scheduled", category: "Off Script Afterthoughts", destination: "YouTube Shorts" },
      { title: "Red Flag or Real Life — Holiday edition", type: "video", status: "Live", category: "Red Flag or Real Life?", destination: "TikTok" },
      // Ideas and links
      { title: "POV: you're at a Phoenix drive-thru at 2am", type: "idea", status: "Dropped", category: "AZ Moments", idea_text: "POV: you're at a Phoenix drive-thru at 2am and the car behind you is also from the crew" },
      { title: "TikTok link — viral Arizona hot dog stand", type: "tiktok_link", status: "Dropped", link: "https://www.tiktok.com/@arizonafoodie/video/123", category: "AZ Moments" },
      { title: "Hot take: putting ranch on everything is valid", type: "idea", status: "Dropped", category: "Dry Heat Hot Takes", idea_text: "Hot take: putting ranch on everything is valid and Arizona agrees" },
      { title: "Group game idea — Two truths and an Arizona lie", type: "idea", status: "Dropped", category: "Group Chat Court", idea_text: "Two truths and an Arizona lie — everyone tells 2 real AZ things and 1 fake one" },
    ];

    const now = new Date();
    const daysFromNow = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      return d.toISOString();
    };

    const createdClips = [];
    for (const clip of clipsToCreate) {
      const submitter = allMembers[Math.floor(Math.random() * allMembers.length)];
      const { data, error } = await supabase.from("clips").insert({
        title: clip.title,
        type: clip.type,
        status: clip.status,
        link: clip.link ?? null,
        idea_text: clip.idea_text ?? null,
        category: clip.category ?? null,
        submitted_by: submitter.id,
        submitted_by_name: submitter.name,
        scheduled_date: clip.status === "Scheduled" ? daysFromNow(7) : clip.status === "Live" ? daysFromNow(-2) : null,
      }).select().single();
      if (error) {
        console.log(`⚠️  Clip insert error: ${error.message}`);
      } else {
        createdClips.push(data);
      }
    }
    console.log(`   ✅ Created ${createdClips.length} clips`);

    // ===== CLIP PEOPLE (tag crew in clips) =====
    console.log("\n🏷️  Seeding clip people...");
    const peopleToCreate = [];
    for (const clip of createdClips) {
      // Tag 2-3 random crew members in each clip
      const numTags = 2 + Math.floor(Math.random() * 2);
      const tagged = allMembers.sort(() => Math.random() - 0.5).slice(0, numTags);
      for (const person of tagged) {
        if (person.id !== clip.submitted_by) {
          peopleToCreate.push({
            clip_id: clip.id,
            member_id: person.id,
            member_name: person.name,
          });
        }
      }
    }
    if (peopleToCreate.length > 0) {
      const { error } = await supabase.from("clip_people").insert(peopleToCreate);
      if (error) console.log(`⚠️  Clip people error: ${error.message}`);
      else console.log(`   ✅ Created ${peopleToCreate.length} clip tags`);
    }

    // ===== APPROVALS =====
    console.log("\n✅ Seeding approvals...");
    const approvalsToCreate = [];
    for (const clip of createdClips) {
      // Get the people tagged in this clip
      const { data: clipPeople } = await supabase.from("clip_people").select("*").eq("clip_id", clip.id);
      for (const person of clipPeople ?? []) {
        const statuses = ["Waiting", "Approved", "Approved With Edits", "Needs Review"];
        const status = clip.status === "Live" || clip.status === "Scheduled" || clip.status === "Ready"
          ? "Approved"
          : statuses[Math.floor(Math.random() * statuses.length)];
        approvalsToCreate.push({
          clip_id: clip.id,
          member_id: person.member_id,
          member_name: person.member_name,
          status,
        });
      }
    }
    if (approvalsToCreate.length > 0) {
      const { error } = await supabase.from("approvals").insert(approvalsToCreate);
      if (error) console.log(`⚠️  Approvals error: ${error.message}`);
      else console.log(`   ✅ Created ${approvalsToCreate.length} approvals`);
    }
  }

  // ===== ACTIVITY =====
  console.log("\n🔔 Seeding activity feed...");
  const { data: existingActivity } = await supabase.from("activity").select("*");
  if (existingActivity && existingActivity.length > 5) {
    console.log(`   Already have ${existingActivity.length} activity entries, skipping`);
  } else {
    const activityEntries = [
      { kind: "dropped", body: "Sholanda shared a link to the room" },
      { kind: "dropped", body: "Ronnie dropped a video: \"Red Flag or Real Life — First Wave Edition\"" },
      { kind: "status", body: "Vanessa moved \"Dry Heat Hot Takes\" to Shot" },
      { kind: "approved", body: "Sholanda greenlit \"Group Chat Court — Who pays on the first date?\"" },
      { kind: "status", body: "Vanessa moved \"Who's Most Likely To\" to Review" },
      { kind: "dropped", body: "Maria shared a thought: \"Two truths and an Arizona lie\"" },
      { kind: "approved", body: "Elaine said do not post on a clip — needs review" },
      { kind: "status", body: "Vanessa moved \"AZ Moments\" to Ready" },
      { kind: "dropped", body: "Latasha dropped a video: \"Off Script Afterthoughts — The blooper reel\"" },
      { kind: "status", body: "Vanessa scheduled \"Red Flag or Real Life — Holiday edition\" to go live" },
    ];
    const { error } = await supabase.from("activity").insert(activityEntries.map((a, i) => ({
      ...a,
      actor_id: vanessa?.id ?? null,
      actor_name: a.body.startsWith("Vanessa") ? "Vanessa" : a.body.split(" ")[0],
      created_at: new Date(Date.now() - i * 3600000).toISOString(), // spread over hours
    })));
    if (error) console.log(`⚠️  Activity error: ${error.message}`);
    else console.log(`   ✅ Created ${activityEntries.length} activity entries`);
  }

  // ===== IDEAS / SPARKS =====
  console.log("\n💡 Seeding ideas...");
  const { data: existingIdeas } = await supabase.from("ideas").select("*");
  if (existingIdeas && existingIdeas.length > 3) {
    console.log(`   Already have ${existingIdeas.length} ideas, skipping`);
  } else {
    const allMembers = [vanessa, ...CREW.map((c) => memberMap.get(c.name))].filter(Boolean);
    const ideasToCreate = [
      { title: "Rate my Arizona driveway — it's just gravel", category: "Hot Takes", energy: "Funny" },
      { title: "We try every drive-thru on Camelback Rd", category: "AZ Moments", energy: "High" },
      { title: "First Wave reads their old texts out loud", category: "BTS Chaos", energy: "Chaotic" },
      { title: "Arizona summer car steering wheel challenge", category: "Trends", energy: "High" },
      { title: "Group Chat Court: Is it a date or are we just getting food?", category: "Group Games", energy: "Spicy" },
      { title: "We rank every Arizona gas station", category: "AZ Moments", energy: "Low-key" },
    ];
    const ideaRows = ideasToCreate.map((idea) => ({
      title: idea.title,
      category: idea.category,
      energy: idea.energy,
      submitted_by: allMembers[Math.floor(Math.random() * allMembers.length)].id,
      submitted_by_name: allMembers[Math.floor(Math.random() * allMembers.length)].name,
      status: ["New", "New", "Crew Favorite", "Planned"][Math.floor(Math.random() * 4)],
    }));
    const { error } = await supabase.from("ideas").insert(ideaRows);
    if (error) console.log(`⚠️  Ideas error: ${error.message}`);
    else console.log(`   ✅ Created ${ideaRows.length} ideas`);
  }

  console.log("\n🎉 Seed complete!\n");
  console.log("What was created:");
  console.log("  - 5 crew members with titles, tags, addresses, socials");
  console.log("  - Gear items for each member (tumbler, shirt, badge, sticker, member card)");
  console.log("  - 12 clips across all pipeline stages (Dropped → Live)");
  console.log("  - Clip tags (crew tagged in clips)");
  console.log("  - Approvals (some waiting, some approved)");
  console.log("  - 10 activity feed entries");
  console.log("  - 6 ideas/sparks");
  console.log("\nNow go check:");
  console.log("  /portal/lobby       — activity feed + heat counts");
  console.log("  /portal/run-sheet   — production pipeline + ideas tab");
  console.log("  /portal/crew        — all 6 members");
  console.log("  /portal/my-kit      — your personal kit");
  console.log("  /portal/gear-board  — gear for all members (admin)");
  console.log("  /portal/notifications — activity feed");
  console.log("  /portal/sparks      — ideas board");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
