// Check A/B pairing — each recipe name should have both an A and B version
import { FULL_READY_RECIPES } from "../src/lib/full-ready-recipes.ts";

const byName = {};
for (const r of FULL_READY_RECIPES) {
  if (!byName[r.name]) byName[r.name] = [];
  byName[r.name].push(r.version);
}

let onlyA = [];
let onlyB = [];
let both = [];
let neither = [];

for (const [name, versions] of Object.entries(byName)) {
  const hasA = versions.some(v => v.startsWith("A"));
  const hasB = versions.some(v => v.startsWith("B"));
  if (hasA && hasB) both.push(name);
  else if (hasA) onlyA.push(name);
  else if (hasB) onlyB.push(name);
  else neither.push(name);
}

console.log(`Total unique recipe names: ${Object.keys(byName).length}`);
console.log(`Names with BOTH A and B: ${both.length}`);
console.log(`Names with only A: ${onlyA.length}`);
console.log(`Names with only B: ${onlyB.length}`);

if (onlyA.length > 0) {
  console.log(`\n=== ONLY A (no B version) ===`);
  onlyA.forEach(n => console.log(`  ${n}`));
}
if (onlyB.length > 0) {
  console.log(`\n=== ONLY B (no A version) ===`);
  onlyB.forEach(n => console.log(`  ${n}`));
}

// Show a sample of the transition steps for one recipe
console.log(`\n=== SAMPLE: Arizona Micro-Moment (A) ===`);
const sample = FULL_READY_RECIPES.find(r => r.name === "Arizona Micro-Moment" && r.version.startsWith("A"));
if (sample) {
  console.log(`transitionFamily: ${sample.transitionFamily}`);
  console.log(`\nPart 1 Transition-In:`);
  console.log(`  description: ${sample.part1TransitionIn.description}`);
  console.log(`  steps:`);
  sample.part1TransitionIn.steps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
  console.log(`\nPart 3 Transition-Out:`);
  console.log(`  description: ${sample.part3TransitionOut.description}`);
  console.log(`  steps:`);
  sample.part3TransitionOut.steps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
}

console.log(`\n=== SAMPLE: Arizona Micro-Moment (B) ===`);
const sampleB = FULL_READY_RECIPES.find(r => r.name === "Arizona Micro-Moment" && r.version.startsWith("B"));
if (sampleB) {
  console.log(`transitionFamily: ${sampleB.transitionFamily}`);
  console.log(`\nPart 1 Transition-In:`);
  console.log(`  description: ${sampleB.part1TransitionIn.description}`);
  console.log(`  steps:`);
  sampleB.part1TransitionIn.steps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
  console.log(`\nPart 3 Transition-Out:`);
  console.log(`  description: ${sampleB.part3TransitionOut.description}`);
  console.log(`  steps:`);
  sampleB.part3TransitionOut.steps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
}
