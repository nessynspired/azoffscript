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
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data, error } = await sb
  .from("clips_with_meta")
  .select("id, title, type, status, file_path, link, submitted_by_name, drop_purpose, created_at")
  .eq("status", "Dropped")
  .order("created_at", { ascending: false })
  .limit(10);

if (error) { console.log("ERROR:", error.message); process.exit(1); }

for (const c of data ?? []) {
  console.log(`\n${c.title}`);
  console.log(`  type=${c.type} status=${c.status} drop_purpose=${c.drop_purpose ?? "null"}`);
  console.log(`  file_path=${c.file_path ?? "null"}`);
  console.log(`  link=${c.link?.slice(0, 60) ?? "null"}`);
  console.log(`  by=${c.submitted_by_name} at=${c.created_at}`);
}
