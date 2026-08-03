import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
  })
);

// Service role client (bypasses RLS)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// List ALL files in the clips bucket
const { data: buckets, error: bucketErr } = await sb.storage.listBuckets();
if (bucketErr) { console.log("Bucket list error:", bucketErr.message); }
else console.log("Buckets:", buckets.map(b => b.id));

// List root of clips bucket
const { data: root, error: rootErr } = await sb.storage.from("clips").list();
if (rootErr) console.log("Root list error:", rootErr.message);
else console.log("\nClips bucket root:", root?.map(f => `${f.name} (${f.metadata?.size ?? "?"} bytes)`));

// List each user folder
for (const folder of root ?? []) {
  if (folder.id) {
    const { data: files, error } = await sb.storage.from("clips").list(folder.name);
    if (error) console.log(`  ${folder.name} error:`, error.message);
    else console.log(`  ${folder.name}/:`, files?.map(f => `${f.name} (${f.metadata?.size ?? "?"} bytes)`));
  }
}
