/**
 * Backfill: re-attach Full Ready Recipes to existing clips that are missing
 * the new fields (toneMix, whatYouAreMaking, exampleDirections, makeItYourOwn,
 * fullReadyRecipe, etc.)
 *
 * Matches clips to Full Ready Recipes by title (case-insensitive).
 * Only updates clips whose recipe is missing toneMix or fullReadyRecipe.
 * Dry-run by default — pass --apply to commit.
 *
 * Usage:
 *   node scripts/backfill-tone-mix.mjs            # dry run
 *   node scripts/backfill-tone-mix.mjs --apply     # actually update
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { FULL_READY_RECIPES, fullReadyRecipeToClipRecipe } from "../src/lib/full-ready-recipes.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envFile = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const apply = process.argv.includes("--apply");

// Build a name → recipe map (try both A and B versions)
const recipeByName = {};
for (const r of FULL_READY_RECIPES) {
  recipeByName[r.name.toLowerCase()] = r;
}

const { data: clips, error } = await supabase
  .from("clips")
  .select("id, title, recipe")
  .order("created_at", { ascending: false });

if (error) { console.error(error); process.exit(1); }

console.log(`Checking ${clips.length} clips...\n`);

let updated = 0;
let skipped = 0;
let noMatch = 0;

for (const clip of clips) {
  const recipe = clip.recipe ?? {};
  const hasToneMix = Array.isArray(recipe.toneMix) && recipe.toneMix.length > 0;
  const hasFullRecipe = !!recipe.fullReadyRecipe;

  if (hasToneMix && hasFullRecipe) {
    console.log(`✓ SKIP: "${clip.title}" — already has toneMix + fullReadyRecipe`);
    skipped++;
    continue;
  }

  // Try to find a matching Full Ready Recipe by title
  const match = recipeByName[clip.title.toLowerCase()];
  if (!match) {
    console.log(`✗ NO MATCH: "${clip.title}" — no Full Ready Recipe found with that name`);
    noMatch++;
    continue;
  }

  // Build the new recipe by merging the old recipe with the full recipe data
  const newRecipeData = fullReadyRecipeToClipRecipe(match);

  // Preserve any existing fields that were manually set (chain positions, etc.)
  const merged = {
    ...newRecipeData,
    ...recipe, // old fields override new ones (preserves manual edits)
    // But ensure the new fields are present
    toneMix: recipe.toneMix?.length ? recipe.toneMix : newRecipeData.toneMix,
    whatYouAreMaking: recipe.whatYouAreMaking ?? newRecipeData.whatYouAreMaking,
    introductionDirection: recipe.introductionDirection ?? newRecipeData.introductionDirection,
    assignedMovementOrLine: recipe.assignedMovementOrLine ?? newRecipeData.assignedMovementOrLine,
    makeItYourOwn: recipe.makeItYourOwn?.length ? recipe.makeItYourOwn : newRecipeData.makeItYourOwn,
    exampleDirections: recipe.exampleDirections?.length ? recipe.exampleDirections : newRecipeData.exampleDirections,
    fullReadyRecipe: newRecipeData.fullReadyRecipe,
    fullReadyRecipeId: newRecipeData.fullReadyRecipeId,
    fullReadyRecipeVersion: newRecipeData.fullReadyRecipeVersion,
  };

  console.log(`🔄 UPDATE: "${clip.title}" → matched "${match.name}" (${match.version})`);
  console.log(`   toneMix: ${JSON.stringify(merged.toneMix)}`);
  console.log(`   whatYouAreMaking: ${merged.whatYouAreMaking?.slice(0, 60)}...`);
  console.log(`   exampleDirections: ${merged.exampleDirections?.length} items`);
  console.log(`   fullReadyRecipe: present`);

  if (apply) {
    const { error: updateError } = await supabase
      .from("clips")
      .update({ recipe: merged })
      .eq("id", clip.id);
    if (updateError) {
      console.log(`   ❌ FAILED: ${updateError.message}`);
    } else {
      console.log(`   ✅ UPDATED`);
    }
  }
  updated++;
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total: ${clips.length}`);
console.log(`Updated: ${updated} ${apply ? "(applied)" : "(dry run — pass --apply to commit)"}`);
console.log(`Skipped (already had data): ${skipped}`);
console.log(`No match found: ${noMatch}`);
