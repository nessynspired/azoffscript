/**
 * One-time script: updates the body_markdown of the Active v2 agreement
 * to reflect the current code (with LLC status notice).
 *
 * Usage:
 *   node scripts/update-agreement-text.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

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

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Extract the current bodyMarkdown from agreement-v2.ts
  const agreementFile = readFileSync(resolve(__dirname, "..", "src", "lib", "agreement-v2.ts"), "utf-8");

  const titleMatch = agreementFile.match(/title:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : "First Wave Participation Rules + Media Release";

  const summaryMatch = agreementFile.match(/summary:\s*"([^"]+)"/s);
  const summary = summaryMatch ? summaryMatch[1] : "";

  const bodyStart = agreementFile.indexOf("bodyMarkdown: `") + "bodyMarkdown: `".length;
  const bodyEnd = agreementFile.indexOf("`\n};", bodyStart);
  const bodyMarkdown = agreementFile.slice(bodyStart, bodyEnd);

  if (!bodyMarkdown) {
    console.error("Could not extract bodyMarkdown from agreement-v2.ts");
    process.exit(1);
  }

  // Update the Active v2 row with the new text
  const { data, error } = await supabase
    .from("agreements")
    .update({
      title,
      summary,
      body_markdown: bodyMarkdown,
    })
    .eq("version", "v2")
    .eq("status", "Active")
    .select("id, version, title")
    .single();

  if (error) {
    console.error("Error updating v2:", error.message);
    process.exit(1);
  }

  console.log(`✓ Updated agreement text in database:`);
  console.log(`  Version: ${data.version}`);
  console.log(`  Title: ${data.title}`);
  console.log(`  ID: ${data.id}`);
  console.log(`\nThe stored body_markdown now matches the code (with LLC status notice).`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
