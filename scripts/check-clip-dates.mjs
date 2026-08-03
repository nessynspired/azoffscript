// Check existing clips and their scheduled dates + recipe fields
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: clips, error } = await supabase
  .from("clips")
  .select("id, title, status, scheduled_date, clip_due_date, final_cut_due, approval_due")
  .order("created_at", { ascending: false });

if (error) { console.error(error); process.exit(1); }

console.log(`Total clips: ${clips.length}\n`);
for (const c of clips) {
  const recipe = await supabase.from("clips").select("recipe").eq("id", c.id).single();
  const r = recipe.data?.recipe ?? {};
  console.log(`📋 ${c.title}`);
  console.log(`   status: ${c.status}`);
  console.log(`   scheduled_date: ${c.scheduled_date ?? "(none)"}`);
  console.log(`   clip_due_date: ${c.clip_due_date ?? "(none)"}`);
  console.log(`   final_cut_due: ${c.final_cut_due ?? "(none)"}`);
  console.log(`   approval_due: ${c.approval_due ?? "(none)"}`);
  console.log(`   recipe.toneMix: ${JSON.stringify(r.toneMix ?? "(missing)")}`);
  console.log(`   recipe.whatYouAreMaking: ${r.whatYouAreMaking ?? "(missing)"}`);
  console.log(`   recipe.exampleDirections: ${r.exampleDirections ? r.exampleDirections.length + " items" : "(missing)"}`);
  console.log(`   recipe.fullReadyRecipe: ${r.fullReadyRecipe ? "present" : "(missing)"}`);
  console.log(`   recipe.fullReadyRecipeId: ${r.fullReadyRecipeId ?? "(missing)"}`);
  console.log("");
}
