// Check all 96 Full Ready Recipes for transition data completeness
import { FULL_READY_RECIPES } from "../src/lib/full-ready-recipes.ts";

let missingA = [];
let missingB = [];
let emptySteps = [];

for (const r of FULL_READY_RECIPES) {
  const isB = r.version.startsWith("B");
  const list = isB ? missingB : missingA;

  // Check part1 transition-in
  if (!r.part1TransitionIn?.description || r.part1TransitionIn.description.trim() === "") {
    list.push(`${r.id} — missing part1TransitionIn.description`);
  }
  if (!r.part1TransitionIn?.steps || r.part1TransitionIn.steps.length === 0) {
    emptySteps.push(`${r.id} — part1TransitionIn.steps empty`);
  }

  // Check part3 transition-out
  if (!r.part3TransitionOut?.description || r.part3TransitionOut.description.trim() === "") {
    list.push(`${r.id} — missing part3TransitionOut.description`);
  }
  if (!r.part3TransitionOut?.steps || r.part3TransitionOut.steps.length === 0) {
    emptySteps.push(`${r.id} — part3TransitionOut.steps empty`);
  }

  // Check transitionFamily
  if (!r.transitionFamily || r.transitionFamily.trim() === "") {
    list.push(`${r.id} — missing transitionFamily`);
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total recipes: ${FULL_READY_RECIPES.length}`);
console.log(`A (Current) recipes with issues: ${missingA.length}`);
console.log(`B (Off Script) recipes with issues: ${missingB.length}`);
console.log(`Recipes with empty steps: ${emptySteps.length}`);

if (missingA.length > 0) {
  console.log(`\n=== A (Current) ISSUES ===`);
  missingA.forEach(m => console.log(`  ${m}`));
}
if (missingB.length > 0) {
  console.log(`\n=== B (Off Script) ISSUES ===`);
  missingB.forEach(m => console.log(`  ${m}`));
}
if (emptySteps.length > 0) {
  console.log(`\n=== EMPTY STEPS ===`);
  emptySteps.forEach(m => console.log(`  ${m}`));
}

// Count by transition family
const families = {};
for (const r of FULL_READY_RECIPES) {
  const f = r.transitionFamily ?? "(none)";
  families[f] = (families[f] ?? 0) + 1;
}
console.log(`\n=== TRANSITION FAMILIES ===`);
for (const [f, count] of Object.entries(families)) {
  console.log(`  ${f}: ${count}`);
}
