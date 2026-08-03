// Add toneMix to all 96 Full Ready Recipes based on category and name heuristics.
// This is a one-time script — run it to patch the full-ready-recipes.ts file.
import { readFileSync, writeFileSync } from "fs";

const file = readFileSync("src/lib/full-ready-recipes.ts", "utf8");

// Tone assignment heuristics based on recipe name keywords
function pickTones(name, category) {
  const n = name.toLowerCase();
  const tones = [];

  // Court / debate / verdict → Funny + Frustrated but relatable
  if (n.includes("court") || n.includes("verdict") || n.includes("debate") || n.includes("judge") || n.includes("case")) {
    tones.push("Funny", "Frustrated but relatable");
  }
  // Math / logic → Funny + Honest
  else if (n.includes("math") || n.includes("logic") || n.includes("rank") || n.includes("which one")) {
    tones.push("Funny", "Honest");
  }
  // Confessions / real life / pov → Honest + Emotional but not heavy
  else if (n.includes("confession") || n.includes("real life") || n.includes("pov") || n.includes("counter truths") || n.includes("what she really") || n.includes("what she said")) {
    tones.push("Honest", "Emotional but not heavy");
  }
  // Friendship / girl code / friend → Warm or reflective + Honest
  else if (n.includes("friend") || n.includes("girl code") || n.includes("friendship") || n.includes("caring") || n.includes("bigger person")) {
    tones.push("Warm or reflective", "Honest");
  }
  // Red flag / apology / excuse → Frustrated but relatable + Funny
  else if (n.includes("red flag") || n.includes("apology") || n.includes("excuse") || n.includes("nervous system") || n.includes("awkward") || n.includes("worse")) {
    tones.push("Frustrated but relatable", "Funny");
  }
  // Intro / step into / welcome → Warm or reflective + Honest
  else if (n.includes("intro") || n.includes("step into") || n.includes("welcome") || n.includes("crew")) {
    tones.push("Warm or reflective", "Honest");
  }
  // Outfit / look / style → Funny + Honest
  else if (n.includes("outfit") || n.includes("look") || n.includes("style") || n.includes("angle") || n.includes("veto") || n.includes("polite line")) {
    tones.push("Funny", "Honest");
  }
  // Arizona / local → Funny + Honest
  else if (n.includes("arizona") || n.includes("local") || n.includes("az ")) {
    tones.push("Funny", "Honest");
  }
  // Script break / off script → Funny + Honest
  else if (n.includes("script") || n.includes("off script")) {
    tones.push("Funny", "Honest");
  }
  // Mom / family → Emotional but not heavy + Warm or reflective
  else if (n.includes("mom") || n.includes("family") || n.includes("errand")) {
    tones.push("Emotional but not heavy", "Warm or reflective");
  }
  // Email / work / can this be → Frustrated but relatable + Funny
  else if (n.includes("email") || n.includes("errand olympics") || n.includes("supposed to")) {
    tones.push("Frustrated but relatable", "Funny");
  }
  // Men / he said → Frustrated but relatable + Funny
  else if (n.includes("men") || n.includes("he said") || n.includes("he heard")) {
    tones.push("Frustrated but relatable", "Funny");
  }
  // Comment / search / explainer → Honest + Funny
  else if (n.includes("comment") || n.includes("search") || n.includes("explainer") || n.includes("what is")) {
    tones.push("Honest", "Funny");
  }
  // BTS / process / real → Honest + Warm or reflective
  else if (n.includes("bts") || n.includes("process") || n.includes("real quick") || n.includes("no words")) {
    tones.push("Honest", "Warm or reflective");
  }
  // Default → Funny + Honest
  else {
    tones.push("Funny", "Honest");
  }

  return tones;
}

// Find each recipe object and add toneMix after transitionFamily
// The pattern: "transitionFamily": "Some Value",
let count = 0;
const patched = file.replace(
  /"transitionFamily":\s*("[^"]+"),\n(\s*)"creatorTask":/g,
  (match, familyQuote, indent) => {
    // Extract the recipe name from the surrounding context (look backwards for "name":)
    // We'll find the name by searching the text before this match
    const beforeMatch = file.slice(0, file.indexOf(match));
    const nameMatch = beforeMatch.match(/"name":\s*("[^"]+")(?![\s\S]*"name":)/g);
    const name = nameMatch ? JSON.parse(nameMatch[nameMatch.length - 1].replace(/"name":\s*/, "")) : "";

    const categoryMatch = beforeMatch.match(/"category":\s*("[^"]+")(?![\s\S]*"category":)/g);
    const category = categoryMatch ? JSON.parse(categoryMatch[categoryMatch.length - 1].replace(/"category":\s*/, "")) : "";

    const tones = pickTones(name, category);
    count++;

    return `"transitionFamily": ${familyQuote},\n${indent}"toneMix": ${JSON.stringify(tones)},\n${indent}"creatorTask":`;
  }
);

writeFileSync("src/lib/full-ready-recipes.ts", patched);
console.log(`Patched ${count} recipes with toneMix`);
