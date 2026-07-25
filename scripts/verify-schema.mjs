// Verify the schema landed in Supabase by querying table existence + counts.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8").split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = ["members","clips","clip_people","approvals","ideas","comments","notifications","activity"];

async function main() {
  console.log("Verifying schema in:", env.NEXT_PUBLIC_SUPABASE_URL);
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`  ✗ ${t}: ${error.message}`);
    } else {
      console.log(`  ✓ ${t}: ${count} rows`);
    }
  }

  // check the view
  const { count: vCount, error: vErr } = await supabase.from("clips_with_meta").select("*", { count: "exact", head: true });
  if (vErr) console.log(`  ✗ view clips_with_meta: ${vErr.message}`);
  else console.log(`  ✓ view clips_with_meta: ${vCount} rows`);

  // check the helper functions exist
  const { error: fnErr } = await supabase.rpc("is_admin");
  if (fnErr) console.log(`  ✗ function is_admin: ${fnErr.message}`);
  else console.log(`  ✓ function is_admin: callable`);

  // check storage bucket
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) console.log(`  ✗ storage: ${bErr.message}`);
  else {
    const hasClips = buckets.some((b) => b.name === "clips");
    console.log(`  ${hasClips ? "✓" : "✗"} storage bucket 'clips': ${hasClips ? "exists" : "missing"}`);
  }
}

main();
