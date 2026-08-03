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

const folders = ["00504d37-095f-45c9-ada3-e45851f9f806", "cb333cf0-ff36-4024-a2d3-3c809974e322"];
for (const f of folders) {
  const { data, error } = await sb.storage.from("clips").list(f, { limit: 100 });
  if (error) console.log(f, "error:", error.message);
  else console.log(f + ":", data?.map(x => `${x.name} (${x.metadata?.size ?? "?"} bytes)`));
}
