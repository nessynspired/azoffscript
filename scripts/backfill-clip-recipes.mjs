/**
 * One-time script: backfills `clips.recipe` for existing clips that were
 * created from a Quick Drop Template with a linked shot recipe, but never
 * got the recipe attached (because the auto-attach wiring didn't exist yet).
 *
 * What it does:
 *   1. Loads all clips that have a template_id matching one of the 11
 *      templates wired to a prebuilt shot recipe.
 *   2. For each clip whose `recipe` is empty/null/{} , attaches the
 *      matching shot recipe (same shape RecipeBuilder produces).
 *   3. Skips clips that already have a recipe (won't overwrite manual work).
 *   4. Dry-run by default — prints what it WOULD do. Pass --apply to commit.
 *
 * Usage:
 *   node scripts/backfill-clip-recipes.mjs            # dry run
 *   node scripts/backfill-clip-recipes.mjs --apply     # actually update
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

// Parse .env.local manually
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

const supabase = createClient(supabaseUrl, serviceKey);

// ---------------------------------------------------------------------------
// Template → Shot Recipe mapping (mirrors the shotRecipeId fields wired in
// src/lib/quick-drop-templates.ts). Keep this in sync with that file.
// ---------------------------------------------------------------------------
const TEMPLATE_TO_RECIPE = {
  first_wave_intro: "recipe_crew_intro_b",
  arizona_made_me: "recipe_arizona_made_me_b",
  real_quick: "recipe_real_quick_b",
  he_said_she_heard: "recipe_he_said_she_heard_b",
  caring_or_controlling: "recipe_caring_controlling_b",
  red_flag_real_life_just_tired: "recipe_red_flag_tired_b",
  apology_or_excuse: "recipe_apology_or_excuse_b",
  friend_or_follower: "recipe_friend_or_follower_b",
  girl_code_or_just_drama: "recipe_girl_code_or_just_drama_b",
  friend_every_group_has: "recipe_friend_every_group_b",
  mom_math: "recipe_mom_math_b",
};

// ---------------------------------------------------------------------------
// Inline shot recipe → clip recipe conversion.
// Mirrors `shotRecipeToClipRecipe` in src/lib/shot-recipe-library.ts.
// Inlined here because this is a standalone .mjs script that can't import TS.
// ---------------------------------------------------------------------------
function shotRecipeToClipRecipe(sr) {
  return {
    shotRecipeId: sr.id,
    recordingStyleId: sr.recordingStyleId,
    transitionId: sr.transitionId,
    goal: sr.goal,
    creatorTask: sr.creatorTask,
    prompt: sr.prompt,
    exampleResponse: sr.exampleResponse ?? "",
    finalVideoFlow: [...sr.finalVideoFlow],
    part1Start: { label: sr.part1Start.label, instructions: [...sr.part1Start.instructions] },
    part2Content: { label: sr.part2Content.label, instructions: [...sr.part2Content.instructions] },
    part3End: { label: sr.part3End.label, instructions: [...sr.part3End.instructions] },
    beforeRecording: [...sr.beforeRecording],
    recordSteps: [...sr.recordSteps],
    submissionRules: [...sr.submissionRules],
    editStyle: sr.editStyle,
    adminOrder: [...sr.adminOrder],
    adminNotes: sr.adminNotes ?? "",
    difficulty: sr.difficulty,
  };
}

// ---------------------------------------------------------------------------
// Load shot recipes from the TS source. We can't import TS directly in a .mjs
// script, so we read the file and eval the array. The SHOT_RECIPES array is
// plain data (no function calls), so this is safe.
// ---------------------------------------------------------------------------
function loadShotRecipes() {
  const src = readFileSync(resolve(__dirname, "..", "src", "lib", "shot-recipe-library.ts"), "utf-8");
  // Extract everything between `export const SHOT_RECIPES: ShotRecipe[] = [` and the closing `];`
  const startMarker = "export const SHOT_RECIPES: ShotRecipe[] = [";
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error("Could not find SHOT_RECIPES in shot-recipe-library.ts");
  const afterStart = src.slice(startIdx + startMarker.length);
  // Find the matching closing `];` — track bracket depth
  let depth = 1;
  let endIdx = -1;
  for (let i = 0; i < afterStart.length; i++) {
    if (afterStart[i] === "[") depth++;
    else if (afterStart[i] === "]") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error("Could not find end of SHOT_RECIPES array");
  const arrayBody = afterStart.slice(0, endIdx);
  // The objects use trailing commas and TypeScript-style `as const` is not used,
  // so plain JSON5-ish JS object syntax. Wrap and eval.
  // eslint-disable-next-line no-eval
  const arr = eval("[" + arrayBody + "]");
  return arr;
}

function isEmptyRecipe(r) {
  if (!r) return true;
  if (typeof r !== "object") return true;
  const keys = Object.keys(r);
  if (keys.length === 0) return true;
  // Treat as empty if no goal/creatorTask/prompt/finalVideoFlow
  return !r.goal && !r.creatorTask && !r.prompt && !(Array.isArray(r.finalVideoFlow) && r.finalVideoFlow.length > 0);
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "=== APPLY MODE (will update database) ===" : "=== DRY RUN (no changes) ===");
  console.log("");

  const shotRecipes = loadShotRecipes();
  const recipeById = new Map(shotRecipes.map((r) => [r.id, r]));
  console.log(`Loaded ${shotRecipes.length} shot recipes from library.`);

  const templateIds = Object.keys(TEMPLATE_TO_RECIPE);
  console.log(`Looking for clips with template_id in: ${templateIds.join(", ")}`);
  console.log("");

  // Fetch all clips with a matching template_id
  const { data: clips, error } = await supabase
    .from("clips")
    .select("id, title, template_id, recipe, status")
    .in("template_id", templateIds);

  if (error) {
    console.error("Error fetching clips:", error.message);
    process.exit(1);
  }

  if (!clips || clips.length === 0) {
    console.log("No clips found matching those templates. Nothing to backfill.");
    return;
  }

  console.log(`Found ${clips.length} clip(s) with matching template_id:`);
  console.log("");

  let toUpdate = [];
  let skippedHasRecipe = 0;

  for (const clip of clips) {
    const recipeId = TEMPLATE_TO_RECIPE[clip.template_id];
    const sr = recipeById.get(recipeId);
    if (!sr) {
      console.log(`  ⚠ ${clip.title} (template: ${clip.template_id}) — no shot recipe found for ${recipeId}, skipping`);
      continue;
    }
    if (!isEmptyRecipe(clip.recipe)) {
      skippedHasRecipe++;
      console.log(`  ⊘ ${clip.title} — already has a recipe, skipping`);
      continue;
    }
    const newRecipe = shotRecipeToClipRecipe(sr);
    toUpdate.push({ id: clip.id, title: clip.title, template_id: clip.template_id, recipe: newRecipe });
    console.log(`  → ${clip.title} (template: ${clip.template_id}) — will attach ${recipeId}`);
  }

  console.log("");
  console.log(`Summary: ${toUpdate.length} to update, ${skippedHasRecipe} already had a recipe, ${clips.length} total matching clips.`);

  if (toUpdate.length === 0) {
    console.log("Nothing to backfill.");
    return;
  }

  if (!apply) {
    console.log("");
    console.log("Dry run — no changes made. Run with --apply to update the database.");
    return;
  }

  console.log("");
  console.log("Applying updates...");
  let ok = 0;
  let fail = 0;
  for (const item of toUpdate) {
    const { error: updErr } = await supabase
      .from("clips")
      .update({ recipe: item.recipe })
      .eq("id", item.id);
    if (updErr) {
      console.log(`  ✗ ${item.title} — ${updErr.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${item.title}`);
      ok++;
    }
  }
  console.log("");
  console.log(`Done. ${ok} updated, ${fail} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
