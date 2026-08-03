// Check what clips exist and their types/status/file_path
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  // Check if drop_purpose column exists
  const { data: testClip, error: colErr } = await sb
    .from("clips")
    .select("id, title, type, status, file_path, drop_purpose")
    .limit(1);
  
  if (colErr) {
    console.log("drop_purpose column error:", colErr.message);
  } else {
    console.log("drop_purpose column exists. Sample:", testClip?.[0]);
  }

  // Get all recent dropped clips
  const { data: clips, error } = await sb
    .from("clips")
    .select("id, title, type, status, file_path, link, submitted_by_name, created_at, drop_purpose")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching clips:", error.message);
    return;
  }

  console.log("\n=== Recent clips ===");
  for (const c of clips ?? []) {
    console.log(`\n${c.title}`);
    console.log(`  type: ${c.type}, status: ${c.status}`);
    console.log(`  file_path: ${c.file_path ?? "null"}`);
    console.log(`  link: ${c.link ?? "null"}`);
    console.log(`  dropped by: ${c.submitted_by_name}`);
    console.log(`  drop_purpose: ${c.drop_purpose ?? "null"}`);
    console.log(`  created: ${c.created_at}`);
  }

  // Check clips_with_meta view
  const { data: metaClips, error: metaErr } = await sb
    .from("clips_with_meta")
    .select("id, title, type, status, file_path, drop_purpose")
    .order("created_at", { ascending: false })
    .limit(5);

  if (metaErr) {
    console.log("\nclips_with_meta error:", metaErr.message);
  } else {
    console.log("\n=== clips_with_meta view ===");
    console.log("Has drop_purpose?", metaClips?.[0] && "drop_purpose" in metaClips[0]);
    for (const c of metaClips ?? []) {
      console.log(`  ${c.title} | type=${c.type} | status=${c.status} | file_path=${c.file_path ?? "null"} | drop_purpose=${c.drop_purpose ?? "N/A"}`);
    }
  }
}

main();
