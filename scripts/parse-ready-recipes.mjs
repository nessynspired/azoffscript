/**
 * Parse the AZ Off Script Full Ready Shot Recipes markdown files
 * into a structured TypeScript data file.
 *
 * Usage: node scripts/parse-ready-recipes.mjs
 *
 * Reads from: ~/Downloads/AZ_Off_Script_Recipes_Extracted/AZ_Off_Script_Full_Ready_Shot_Recipes/
 * Writes to:  src/lib/full-ready-recipes.ts
 */

import fs from "fs";
import path from "path";

const SRC_DIR = "C:\\Users\\renaw\\Downloads\\AZ_Off_Script_Recipes_Extracted\\AZ_Off_Script_Full_Ready_Shot_Recipes";
const OUT_FILE = "C:\\Users\\renaw\\AZOffScript\\src\\lib\\full-ready-recipes.ts";

// ---------------------------------------------------------------------------
// Recipe type (mirrors the markdown structure)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseMetadata(line) {
  // e.g. "**Category:** Transitions"
  const m = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
  if (!m) return null;
  return { key: m[1].trim(), value: m[2].trim() };
}

function parseList(lines) {
  return lines
    .filter(l => l.trim().startsWith("- ") || l.trim().startsWith("* "))
    .map(l => l.replace(/^[-*]\s+/, "").trim());
}

function parseNumberedList(lines) {
  return lines
    .filter(l => /^\d+\.\s/.test(l.trim()))
    .map(l => l.replace(/^\d+\.\s+/, "").trim());
}

function parseRecipe(text, versionLabel) {
  // Split into sections by ## headers
  const lines = text.split("\n");
  const recipe = {
    id: "",
    name: "",
    version: versionLabel, // "A — Current" or "B — Off Script"
    category: "",
    topicWorld: "",
    effort: "",
    difficulty: "",
    assemblyMode: "",
    transitionFamily: "",
    // Card Preview
    creatorTask: "",
    introductionDirection: "",
    contentAction: "",
    // Goal
    goal: "",
    whatYouAreMaking: "",
    yourContentAction: "",
    assignedMovementOrLine: "",
    makeItYourOwn: [],
    contentShape: [],
    exampleDirections: [],
    // Group Assembly
    defaultParticipantCount: 6,
    supportedParticipantCounts: [4, 5, 6],
    sixPersonOrder: [],
    fivePersonFallback: [],
    fourPersonFallback: [],
    repairRule: "",
    // Formula
    oneVideoFormula: "",
    // Parts
    part1TransitionIn: { description: "", steps: [] },
    part2ContentAction: { steps: [] },
    part3TransitionOut: { description: "", steps: [] },
    // Creator Position Card
    creatorPositionCard: [],
    // Recording
    recordingSetup: [],
    recordSteps: [],
    whatToSend: [],
    // Admin
    adminEditStyle: "",
    adminEditSteps: [],
    transitionRepairRule: "",
    creatorFreedomRule: "",
    // Caption
    caption: "",
    commentPrompt: "",
    searchTerms: [],
    hashtags: [],
  };

  // Find the recipe name (first # line)
  let i = 0;
  while (i < lines.length && !lines[i].startsWith("# ")) i++;
  if (i >= lines.length) return null;
  recipe.name = lines[i].replace(/^#\s+/, "").trim();
  // Generate ID from name
  recipe.id = recipe.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    + (versionLabel.startsWith("B") ? "_b" : "_a");

  i++;

  // Skip the "## Version X" line and blank lines
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") { i++; continue; }
    if (line.startsWith("## ")) { i++; continue; } // Skip version header
    break;
  }

  // Parse metadata lines (**Key:** value)
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") { i++; continue; }
    if (line.startsWith("## ")) break; // Start of sections
    const meta = parseMetadata(line);
    if (!meta) { i++; continue; }
    switch (meta.key) {
      case "Category": recipe.category = meta.value; break;
      case "Topic World": recipe.topicWorld = meta.value; break;
      case "Effort": recipe.effort = meta.value; break;
      case "Difficulty": recipe.difficulty = meta.value; break;
      case "Assembly Mode": recipe.assemblyMode = meta.value; break;
      case "Transition Family": recipe.transitionFamily = meta.value; break;
    }
    i++;
  }

  // Parse sections by ## header
  // sections is a map: sectionName -> { _main: string[], [subName]: string[] }
  const sections = {};
  let currentSection = null;
  let currentSubsection = null;

  for (; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ### Subsection
    if (trimmed.startsWith("### ")) {
      currentSubsection = trimmed.replace(/^###\s+/, "").trim();
      if (currentSection) {
        sections[currentSection] = sections[currentSection] || { _main: [] };
        sections[currentSection][currentSubsection] = [];
      }
      continue;
    }

    // ## Section
    if (trimmed.startsWith("## ")) {
      currentSection = trimmed.replace(/^##\s+/, "").trim();
      currentSubsection = null;
      sections[currentSection] = { _main: [] };
      continue;
    }

    // Add line to current section/subsection
    if (currentSection) {
      if (currentSubsection) {
        sections[currentSection][currentSubsection] = sections[currentSection][currentSubsection] || [];
        sections[currentSection][currentSubsection].push(line);
      } else {
        sections[currentSection]._main.push(line);
      }
    }
  }

  // Helper to get section content
  function getSection(name) {
    const s = sections[name];
    if (!s) return [];
    return s._main || [];
  }

  function getSubsection(sectionName, subName) {
    const s = sections[sectionName];
    if (!s) return [];
    return s[subName] || [];
  }

  function getText(lines) {
    return lines.map(l => l.trim()).filter(l => l && l !== "---").join(" ");
  }

  function getBlockquote(lines) {
    return lines
      .filter(l => l.trim().startsWith(">"))
      .map(l => l.replace(/^>\s?/, "").trim())
      .join(" ");
  }

  // Parse Card Preview
  const cardLines = getSection("Card Preview");
  for (const line of cardLines) {
    const meta = parseMetadata(line.trim());
    if (!meta) continue;
    if (meta.key === "Creator task") recipe.creatorTask = meta.value;
    else if (meta.key === "Introduction Direction") recipe.introductionDirection = meta.value;
    else if (meta.key === "Assigned Movement or Line") recipe.assignedMovementOrLine = meta.value;
    else if (meta.key === "Content Action") recipe.contentAction = meta.value;
  }

  // Goal
  recipe.goal = getText(getSection("Goal"));

  // What You Are Making
  recipe.whatYouAreMaking = getText(getSection("What You Are Making"));

  // Your Content Action
  recipe.yourContentAction = getText(getSection("Your Content Action"));

  // Introduction Direction / Assigned Movement or Line
  const introLines = getSection("Introduction Direction");
  if (introLines.length > 0) recipe.introductionDirection = getBlockquote(introLines) || getText(introLines);
  const moveLines = getSection("Assigned Movement or Line");
  if (moveLines.length > 0) recipe.assignedMovementOrLine = getBlockquote(moveLines) || getText(moveLines);

  // Make It Your Own
  recipe.makeItYourOwn = parseList(getSection("Make It Your Own"));

  // Content Shape
  recipe.contentShape = parseNumberedList(getSection("Content Shape"));

  // Example Directions
  recipe.exampleDirections = parseList(getSection("Example Directions"));

  // Group Assembly Plan
  const groupLines = getSection("Group Assembly Plan");
  for (const line of groupLines) {
    const meta = parseMetadata(line.trim());
    if (!meta) continue;
    if (meta.key === "Default participant count") recipe.defaultParticipantCount = parseInt(meta.value) || 6;
    if (meta.key === "Supported participant counts") {
      recipe.supportedParticipantCounts = meta.value.replace(/or/g, ",").split(/[,.]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
  }
  recipe.sixPersonOrder = parseNumberedList(getSubsection("Group Assembly Plan", "Six-person order"));
  recipe.fivePersonFallback = parseNumberedList(getSubsection("Group Assembly Plan", "Five-person fallback"));
  recipe.fourPersonFallback = parseNumberedList(getSubsection("Group Assembly Plan", "Four-person fallback"));

  // Check for the repair rule in the _main and all subsections of Group Assembly Plan
  const groupSection = sections["Group Assembly Plan"];
  if (groupSection) {
    for (const [key, lines] of Object.entries(groupSection)) {
      for (const line of lines) {
        if (line.includes("If a planned middle")) {
          recipe.repairRule = line.replace(/^[-*]\s*/, "").trim();
        }
      }
    }
  }

  // One-Video Formula
  recipe.oneVideoFormula = getText(getSection("Your One-Video Formula"));

  // Part 1 — Transition-In
  recipe.part1TransitionIn.description = getText(getSection("Part 1 — Transition-In"));
  recipe.part1TransitionIn.steps = parseNumberedList(getSubsection("Part 1 — Transition-In", "Exact steps"));

  // Part 2 — Assigned Content Action
  recipe.part2ContentAction.steps = parseNumberedList(getSection("Part 2 — Assigned Content Action"));

  // Part 3 — Transition-Out
  recipe.part3TransitionOut.description = getText(getSection("Part 3 — Transition-Out"));
  recipe.part3TransitionOut.steps = parseNumberedList(getSubsection("Part 3 — Transition-Out", "Exact steps"));

  // Creator Position Card
  const posLines = getSection("Creator Position Card");
  recipe.creatorPositionCard = posLines
    .filter(l => l.trim().startsWith("- **"))
    .map(l => {
      const m = l.match(/^\s*-\s*\*\*(.+?):\*\*\s*(.*)$/);
      return m ? { label: m[1].trim(), value: m[2].trim() } : null;
    })
    .filter(Boolean);

  // Recording Setup
  recipe.recordingSetup = parseList(getSection("Recording Setup"));

  // Record From Start to Finish
  recipe.recordSteps = parseNumberedList(getSection("Record From Start to Finish"));

  // What to Send
  recipe.whatToSend = parseList(getSection("What to Send"));

  // Admin Editing Recipe
  const adminLines = getSection("Admin Editing Recipe");
  for (const line of adminLines) {
    const meta = parseMetadata(line.trim());
    if (meta && meta.key === "Edit style") recipe.adminEditStyle = meta.value;
  }
  recipe.adminEditSteps = parseNumberedList(adminLines);
  recipe.transitionRepairRule = getText(getSubsection("Admin Editing Recipe", "Transition repair rule"));
  recipe.creatorFreedomRule = getText(getSubsection("Admin Editing Recipe", "Creator-freedom rule"));

  // Caption Package
  const captionLines = getSection("Caption Package");
  for (const line of captionLines) {
    const meta = parseMetadata(line.trim());
    if (!meta) continue;
    if (meta.key === "Caption") recipe.caption = meta.value;
    else if (meta.key === "Comment prompt") recipe.commentPrompt = meta.value;
  }
  // Better approach: find the search terms and hashtags sections
  let inSearchTerms = false;
  let inHashtags = false;
  for (const line of captionLines) {
    if (line.includes("**Search terms:**")) { inSearchTerms = true; inHashtags = false; continue; }
    if (line.includes("**Hashtags:**")) { inHashtags = true; inSearchTerms = false; continue; }
    if (inSearchTerms && line.trim().startsWith("-")) recipe.searchTerms.push(line.replace(/^\s*-\s+/, "").trim());
    if (inHashtags && line.trim().startsWith("-")) recipe.hashtags.push(line.replace(/^\s*-\s+/, "").trim());
  }

  return recipe;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith(".md") && !f.startsWith("00_"));
  const allRecipes = [];

  for (const file of files) {
    const filePath = path.join(SRC_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Split into recipes by "# " at the start of a line (but not "## " or "### ")
    // The first "# AZ Off Script Full Ready Shot Recipes" is the file header, skip it
    const recipeTexts = content.split(/\n(?=# [A-Z])/).filter(t => t.trim());

    for (const recipeText of recipeTexts) {
      // Determine version from the file name
      const isVersionB = file.startsWith("B_");
      const versionLabel = isVersionB ? "B — Off Script" : "A — Current";

      // Skip the file header
      if (recipeText.startsWith("# AZ Off Script")) continue;

      const recipe = parseRecipe(recipeText, versionLabel);
      if (recipe && recipe.name) {
        allRecipes.push(recipe);
      }
    }
  }

  console.log(`Parsed ${allRecipes.length} recipes`);

  // Count by version
  const versionA = allRecipes.filter(r => r.version.startsWith("A")).length;
  const versionB = allRecipes.filter(r => r.version.startsWith("B")).length;
  console.log(`Version A (Current): ${versionA}`);
  console.log(`Version B (Off Script): ${versionB}`);

  // Print first few recipe names to verify
  console.log("\nFirst 5 recipes:");
  allRecipes.slice(0, 5).forEach(r => {
    console.log(`  - ${r.id}: ${r.name} (${r.version})`);
    console.log(`    Category: ${r.category}, Effort: ${r.effort}, Difficulty: ${r.difficulty}`);
    console.log(`    Assembly: ${r.assemblyMode}, Transition: ${r.transitionFamily}`);
  });

  // Generate TypeScript file
  const ts = generateTypeScript(allRecipes);
  fs.writeFileSync(OUT_FILE, ts, "utf-8");
  console.log(`\nWrote ${OUT_FILE} (${ts.length} bytes)`);
}

function generateTypeScript(recipes) {
  const header = `/**
 * AZ Off Script Full Ready Shot Recipes
 *
 * Auto-generated from the Full Ready Shot Recipe markdown package.
 * 60 Version A (Current) + 36 Version B (Off Script) = 96 total recipes.
 *
 * Each recipe contains the full creator-facing breakdown:
 *   - Card Preview (creator task, content action)
 *   - Goal, What You Are Making, Your Content Action
 *   - Make It Your Own, Content Shape, Example Directions
 *   - Group Assembly Plan (4/5/6-person orders)
 *   - One-Video Formula
 *   - Part 1 (Transition-In), Part 2 (Content Action), Part 3 (Transition-Out)
 *   - Creator Position Card
 *   - Recording Setup, Record Steps, What to Send
 *   - Admin Editing Recipe
 *   - Caption Package (caption, comment prompt, search terms, hashtags)
 *
 * Generated by: scripts/parse-ready-recipes.mjs
 */

export type RecipeVersion = "A — Current" | "B — Off Script";

export interface FullReadyRecipe {
  id: string;
  name: string;
  version: RecipeVersion;
  category: string;
  topicWorld: string;
  effort: string;
  difficulty: string;
  assemblyMode: string;
  transitionFamily: string;
  // Card Preview
  creatorTask: string;
  introductionDirection: string;
  contentAction: string;
  // Goal
  goal: string;
  whatYouAreMaking: string;
  yourContentAction: string;
  assignedMovementOrLine: string;
  makeItYourOwn: string[];
  contentShape: string[];
  exampleDirections: string[];
  // Group Assembly
  defaultParticipantCount: number;
  supportedParticipantCounts: number[];
  sixPersonOrder: string[];
  fivePersonFallback: string[];
  fourPersonFallback: string[];
  repairRule: string;
  // Formula
  oneVideoFormula: string;
  // Parts
  part1TransitionIn: { description: string; steps: string[] };
  part2ContentAction: { steps: string[] };
  part3TransitionOut: { description: string; steps: string[] };
  // Creator Position Card
  creatorPositionCard: { label: string; value: string }[];
  // Recording
  recordingSetup: string[];
  recordSteps: string[];
  whatToSend: string[];
  // Admin
  adminEditStyle: string;
  adminEditSteps: string[];
  transitionRepairRule: string;
  creatorFreedomRule: string;
  // Caption
  caption: string;
  commentPrompt: string;
  searchTerms: string[];
  hashtags: string[];
}

`;

  const body = `export const FULL_READY_RECIPES: FullReadyRecipe[] = ${JSON.stringify(recipes, null, 2)};\n`;

  // Add helper functions
  const helpers = `
export function getFullReadyRecipe(id: string): FullReadyRecipe | undefined {
  return FULL_READY_RECIPES.find(r => r.id === id);
}

export function getFullReadyRecipesByVersion(version: RecipeVersion): FullReadyRecipe[] {
  return FULL_READY_RECIPES.filter(r => r.version === version);
}

export function getFullReadyRecipesByCategory(category: string): FullReadyRecipe[] {
  return FULL_READY_RECIPES.filter(r => r.category === category);
}

export function getFullReadyRecipesByEffort(effort: string): FullReadyRecipe[] {
  return FULL_READY_RECIPES.filter(r => r.effort === effort);
}

export function getFullReadyRecipesByDifficulty(difficulty: string): FullReadyRecipe[] {
  return FULL_READY_RECIPES.filter(r => r.difficulty === difficulty);
}

export function getFullReadyRecipesByTopicWorld(topicWorld: string): FullReadyRecipe[] {
  return FULL_READY_RECIPES.filter(r => r.topicWorld === topicWorld);
}

export function searchFullReadyRecipes(query: string): FullReadyRecipe[] {
  const q = query.toLowerCase();
  return FULL_READY_RECIPES.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q) ||
    r.topicWorld.toLowerCase().includes(q) ||
    r.creatorTask.toLowerCase().includes(q) ||
    r.contentAction.toLowerCase().includes(q) ||
    r.transitionFamily.toLowerCase().includes(q)
  );
}
`;

  return header + body + helpers;
}

main();
