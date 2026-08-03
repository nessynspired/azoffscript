/**
 * One-time script: publishes AGREEMENT_V2 as the Active agreement in the database.
 *
 * Usage:
 *   node scripts/publish-agreement.mjs
 *
 * Requires env vars from .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

// Parse .env.local manually (since we're in a standalone script)
const envFile = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Import the agreement text directly from the TS source by reading the file
// and extracting the bodyMarkdown. Since we can't easily compile TS in a standalone
// script, we'll use a dynamic approach — require tsx/esbuild or just inline.
// Simpler: use tsx to run this script. But to keep it dependency-free, let's
// just read the compiled output or use a regex.

// Actually, let's just use tsx via npx to run a TS version of this script.
// For now, we'll inline the agreement by importing through a temporary approach.

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Retire any currently Active agreement
  const { data: retired, error: retireErr } = await supabase
    .from("agreements")
    .update({ status: "Retired", retired_at: new Date().toISOString() })
    .eq("status", "Active")
    .select("version, title");

  if (retireErr) {
    console.error("Error retiring existing Active agreement:", retireErr.message);
    process.exit(1);
  }

  if (retired && retired.length > 0) {
    console.log(`Retired ${retired.length} existing Active agreement(s):`);
    retired.forEach((r) => console.log(`  - ${r.version}: ${r.title}`));
  } else {
    console.log("No existing Active agreements to retire.");
  }

  // 2. Check if v2 already exists in the DB
  const { data: existing } = await supabase
    .from("agreements")
    .select("id, version, status")
    .eq("version", "v2")
    .maybeSingle();

  if (existing) {
    // Update existing v2 to Active
    const { error: updateErr } = await supabase
      .from("agreements")
      .update({
        status: "Active",
        activated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateErr) {
      console.error("Error activating existing v2:", updateErr.message);
      process.exit(1);
    }
    console.log(`\nActivated existing v2 agreement (id: ${existing.id})`);
  } else {
    // We need the agreement content — load it from the TS file
    // Since we can't import TS directly, we'll use a workaround
    console.log("\nNo existing v2 found. Inserting new record...");

    // Read the agreement-v2.ts file and extract the content
    const agreementFile = readFileSync(resolve(__dirname, "..", "src", "lib", "agreement-v2.ts"), "utf-8");

    // Extract title
    const titleMatch = agreementFile.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "First Wave Participation Rules + Media Release";

    // Extract summary
    const summaryMatch = agreementFile.match(/summary:\s*"([^"]+)"/s);
    const summary = summaryMatch ? summaryMatch[1] : "";

    // Extract bodyMarkdown — it's a template literal between backticks
    // Find bodyMarkdown: `...` (the content between the first backtick after bodyMarkdown: and the closing backtick)
    const bodyStart = agreementFile.indexOf("bodyMarkdown: `") + "bodyMarkdown: `".length;
    const bodyEnd = agreementFile.indexOf("`\n};", bodyStart);
    const bodyMarkdown = agreementFile.slice(bodyStart, bodyEnd);

    if (!bodyMarkdown) {
      console.error("Could not extract bodyMarkdown from agreement-v2.ts");
      process.exit(1);
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("agreements")
      .insert({
        version: "v2",
        title,
        summary,
        body_markdown: bodyMarkdown,
        status: "Active",
        activated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("Error inserting v2:", insertErr.message);
      process.exit(1);
    }

    console.log(`Inserted and activated v2 agreement (id: ${inserted.id})`);
  }

  // 3. Verify
  const { data: active } = await supabase
    .from("agreements")
    .select("id, version, title, status, activated_at")
    .eq("status", "Active")
    .single();

  if (active) {
    console.log(`\n✓ Active agreement is now: ${active.version} — "${active.title}"`);
    console.log(`  Activated at: ${active.activated_at}`);
    console.log(`  ID: ${active.id}`);
  }

  console.log("\nDone! Crew members can now see and sign the agreement at /portal/agreements");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
