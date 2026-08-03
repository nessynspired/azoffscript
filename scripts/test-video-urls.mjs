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

// Use the anon key (client-side) to test what the browser sees
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const ronniePath = "00504d37-095f-45c9-ada3-e45851f9f806/14efa431-e3b2-4d63-b1ea-b612488c8140.mp4";
const latashaPath = "cb333cf0-ff36-4024-a2d3-3c809974e322/59b6d6a3-acf1-427e-9fc5-5df819a4b8d8.jpeg";

console.log("Testing Ronnie's video...");
const { data: ronnie, error: ronnieErr } = await sb.storage.from("clips").createSignedUrl(ronniePath, 3600);
if (ronnieErr) console.log("  ERROR:", ronnieErr.message);
else console.log("  Signed URL created:", ronnie.signedUrl?.slice(0, 80) + "...");

console.log("\nTesting Latasha's image...");
const { data: latasha, error: latashaErr } = await sb.storage.from("clips").createSignedUrl(latashaPath, 3600);
if (latashaErr) console.log("  ERROR:", latashaErr.message);
else console.log("  Signed URL created:", latasha.signedUrl?.slice(0, 80) + "...");

// Also check if the files actually exist in storage
console.log("\nChecking if files exist in storage...");
const { data: ronnieList, error: ronnieListErr } = await sb.storage.from("clips").list("00504d37-095f-45c9-ada3-e45851f9f806");
if (ronnieListErr) console.log("  Ronnie list ERROR:", ronnieListErr.message);
else console.log("  Ronnie's files:", ronnieList?.map(f => f.name));

const { data: latashaList, error: latashaListErr } = await sb.storage.from("clips").list("cb333cf0-ff36-4024-a2d3-3c809974e322");
if (latashaListErr) console.log("  Latasha list ERROR:", latashaListErr.message);
else console.log("  Latasha's files:", latashaList?.map(f => f.name));
