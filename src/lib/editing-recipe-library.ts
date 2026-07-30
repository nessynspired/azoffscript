/**
 * AZ Off Script Editing Recipe Library — "How does the final video get put together?"
 *
 * This is for Vanessa/admin/editor, NOT the creators.
 *
 * The goal is that every type of content has a repeatable editing
 * blueprint. Instead of "I have 20 videos. Now what?" you have
 * "This is a Group Reaction edit. Follow this recipe."
 */

export type EditingDifficulty = "Easy" | "Medium" | "Advanced";

export interface EditingStep {
  step: string;
  detail?: string;
}

export interface EditingRecipe {
  id: string;
  name: string;
  simpleDescription: string;
  /** Content formats this edit style works best for */
  bestUsedFor: string[];
  /** The structure of the final video, step by step */
  finalVideoStructure: string[];
  /** Editing steps with optional detail */
  editingSteps: EditingStep[];
  /** Overall editing style note */
  editingStyle: string;
  /** What to remove during editing */
  removeDuringEdit?: string[];
  /** Caption style guidance */
  captionStyle: string;
  /** Ending examples for comment bait */
  endingExamples?: string[];
  /** How hard is this edit to pull off? */
  difficulty: EditingDifficulty;
  /** Whether this can be added to almost any format */
  addToAny?: boolean;
}

export const EDITING_DIFFICULTIES: EditingDifficulty[] = ["Easy", "Medium", "Advanced"];

export const DIFFICULTY_COLORS: Record<EditingDifficulty, string> = {
  Easy: "🟢",
  Medium: "🟡",
  Advanced: "🔴",
};

export const EDITING_RECIPES: EditingRecipe[] = [
  {
    id: "stitched_answers",
    name: "Stitched Answers",
    simpleDescription: "Multiple people answer the same question separately. The audience sees different opinions back-to-back.",
    bestUsedFor: ["Different Women, Different Answer", "One-Line Verdict", "Two-Second Opinion", "Arizona Moments", "Real Quick"],
    finalVideoStructure: [
      "Hook",
      "Question / Prompt",
      "Person 1 Answer",
      "Person 2 Answer",
      "Person 3 Answer",
      "Comment Question",
    ],
    editingSteps: [
      { step: "Start with the strongest answer first.", detail: "Do not always start with the first person recorded. Find the punch." },
      { step: "Add the prompt on screen.", detail: "Example: 'What's something everyone pretends to like?'" },
      { step: "Cut between answers quickly.", detail: "Remove long pauses, repeated words, and unnecessary explanations." },
      { step: "End with engagement.", detail: "Examples: 'Agree or disagree?' / 'Who is right?' / 'What's your answer?'" },
    ],
    editingStyle: "Fast. Keep energy moving.",
    removeDuringEdit: ["Long pauses", "Repeated words", "Unnecessary explanations", "Dead air between answers"],
    captionStyle: "Keep it short and punchy. The answers are the content — the caption just opens the door.",
    endingExamples: ["Agree or disagree?", "Who is right?", "What's your answer?"],
    difficulty: "Easy",
  },
  {
    id: "transition_chain",
    name: "Transition Chain",
    simpleDescription: "Each creator's clip connects visually into the next person's clip using transitions.",
    bestUsedFor: ["Crew Intro Pass", "Step Into The Room", "Object Pass", "Off Script Looks"],
    finalVideoStructure: [
      "Person 1 Transition In",
      "Person 1 Content",
      "Person 1 Transition Out",
      "Person 2 Transition In",
      "Person 2 Content",
      "Person 2 Transition Out",
    ],
    editingSteps: [
      { step: "Find the matching transition points.", detail: "Example: Person 1 throws tumbler toward camera. Person 2 catches tumbler." },
      { step: "Cut at the exact moment the object/action covers the camera.", detail: "The cut should be invisible — the viewer shouldn't see the edit." },
      { step: "Match movement speed.", detail: "If one person moves slowly and the next moves fast, adjust the cut point." },
      { step: "Add branding at beginning and end.", detail: "Logo, colors, consistent caption style." },
    ],
    editingStyle: "Smooth and connected. The transitions should feel seamless.",
    removeDuringEdit: ["Any frame where the transition doesn't match", "Hesitation before or after the transition"],
    captionStyle: "Brand-consistent. Use the AZ Off Script voice — confident, fun, real.",
    difficulty: "Medium",
  },
  {
    id: "fast_cut_reaction",
    name: "Fast Cut Reaction",
    simpleDescription: "Quick reactions create a funny or debate-style video.",
    bestUsedFor: ["Face-Only Reaction", "Group Chat Court", "Room Temperature Check", "Fake Scenario Court"],
    finalVideoStructure: [
      "Prompt",
      "Reaction 1",
      "Reaction 2",
      "Reaction 3",
      "Final Question",
    ],
    editingSteps: [
      { step: "Put the prompt first.", detail: "Show the scenario or question before any reactions." },
      { step: "Show the strongest reactions.", detail: "Not every reaction makes the cut. Pick the funniest, most honest, most surprising." },
      { step: "Keep clips short.", detail: "Each reaction should be 3-8 seconds. Don't let anyone overexplain." },
      { step: "Let funny expressions breathe.", detail: "Hold on a good face for an extra beat. The silence is the comedy." },
      { step: "Add captions.", detail: "On-screen text for the prompt and each person's verdict." },
    ],
    editingStyle: "Fast and punchy. Energy stays high. Let the faces do the work.",
    removeDuringEdit: ["Setup time before the reaction", "Any talking that explains the reaction", "Repeated expressions"],
    captionStyle: "Prompt-style. 'Okay, we need answers.' The caption sets up the debate.",
    endingExamples: ["Who is right?", "What would your face do?", "Settle this."],
    difficulty: "Easy",
  },
  {
    id: "story_moment",
    name: "Story Moment",
    simpleDescription: "One person tells a short relatable story.",
    bestUsedFor: ["Real Quick", "Arizona Made Me This Way", "Soft Truths", "BTS / Real Process"],
    finalVideoStructure: [
      "Hook",
      "The Situation",
      "The Realization",
      "The Ending Thought",
    ],
    editingSteps: [
      { step: "Hook: First 2 seconds must make people stay.", detail: "Example: 'I didn't realize this was an Arizona thing until...'" },
      { step: "Middle: Show the person talking, supporting clips, and environment.", detail: "Mix the talking head with B-roll of the activity or place." },
      { step: "End: Leave audience with a thought, question, or relatable moment.", detail: "Don't wrap it up too neatly. Let it sit." },
    ],
    editingStyle: "Slower pace. Let the story breathe. This is the heart content.",
    removeDuringEdit: ["Rambling", "Tangents that don't serve the story", "Long pauses that kill momentum"],
    captionStyle: "Honest and warm. Don't oversell it. The story sells itself.",
    endingExamples: ["What's your version of this?", "Does this hit for anyone else?", "Real quick... what did you learn?"],
    difficulty: "Medium",
  },
  {
    id: "court_debate",
    name: "Court / Debate",
    simpleDescription: "The audience feels like they are watching a friendly argument.",
    bestUsedFor: ["Group Chat Court", "Fake Scenario Court", "Rank It"],
    finalVideoStructure: [
      "The Case",
      "Person 1 Opinion",
      "Person 2 Opinion",
      "Person 3 Opinion",
      "The Verdict",
    ],
    editingSteps: [
      { step: "Present the case clearly.", detail: "Show the scenario as on-screen text before anyone speaks." },
      { step: "Label each verdict.", detail: "Add ⚖️ Guilty / ⚖️ Not Guilty or YES / NO on screen for each person." },
      { step: "Make each answer easy to follow.", detail: "Cut between opinions quickly. The reasoning is the content." },
      { step: "End with the audience as the jury.", detail: "Ask the viewers to vote in the comments." },
    ],
    editingStyle: "Debate energy. Quick cuts between opinions. The disagreement is the content.",
    removeDuringEdit: ["Hesitation before the verdict", "Long explanations that lose the punch", "Agreement (if everyone agrees, it's not a debate)"],
    captionStyle: "Court-style. 'The room decides: guilty or not guilty?' Set up the case.",
    endingExamples: ["Guilty or not guilty?", "You're the jury. What's the verdict?", "Did they do it?"],
    difficulty: "Easy",
  },
  {
    id: "pov_scene",
    name: "POV Scene",
    simpleDescription: "The viewer feels like they are inside a situation.",
    bestUsedFor: ["Soft POV", "What She Really Means", "Arizona Woman Math"],
    finalVideoStructure: [
      "POV Text",
      "Scene Begins",
      "Relatable Moment",
      "Ending Reaction",
    ],
    editingSteps: [
      { step: "Put POV text immediately.", detail: "The 'POV: ___' text should be the first thing the viewer sees." },
      { step: "Keep acting natural.", detail: "Don't over-edit. The realism is what makes it relatable." },
      { step: "Avoid over-editing.", detail: "Minimal cuts. Let the scene play out." },
      { step: "End at the funniest or strongest moment.", detail: "Don't drag it out. End on the punch." },
    ],
    editingStyle: "Minimal and natural. Less editing is better. The moment is the content.",
    removeDuringEdit: ["Anything that breaks the illusion", "Setup time", "Multiple takes (use the most natural one)"],
    captionStyle: "POV-style. 'POV: you've been here.' Let the scenario speak.",
    endingExamples: ["Has this happened to you?", "What would you do?", "Tag someone who does this."],
    difficulty: "Easy",
  },
  {
    id: "brand_introduction",
    name: "Brand Introduction",
    simpleDescription: "Used when AZ Off Script is introducing itself, members, or campaigns.",
    bestUsedFor: ["Crew Intro Pass", "Crew vs Future Wave", "Search Explainers"],
    finalVideoStructure: [
      "Brand Hook",
      "People",
      "Personality",
      "What AZ Off Script Is",
    ],
    editingSteps: [
      { step: "Include the logo at the start.", detail: "AZ Off Script logo should open the video." },
      { step: "Use recognizable colors.", detail: "Desert night, copper clay, cactus teal, sandstone cream." },
      { step: "Keep captions consistent.", detail: "Same font, same style, same placement throughout." },
      { step: "Use a consistent music style.", detail: "Pick a track that fits the brand energy — confident, warm, real." },
      { step: "End with what AZ Off Script is.", detail: "One-line explainer: 'Arizona is the setting. Social scripts are the engine.'" },
    ],
    editingStyle: "Polished but still real. This is the first impression — make it count.",
    removeDuringEdit: ["Any awkward pauses", "Stumbles in the intro", "Inconsistent lighting between clips"],
    captionStyle: "Brand voice. 'Meet the AZ Off Script crew. Who's your favorite?'",
    endingExamples: ["Who's your favorite?", "Want to join the room?", "What is AZ Off Script?"],
    difficulty: "Medium",
  },
  {
    id: "comment_bait_ending",
    name: "Comment Bait Ending",
    simpleDescription: "The video is designed to make people answer. Can be added to almost any format.",
    bestUsedFor: ["Almost any format"],
    finalVideoStructure: [
      "(Any content structure)",
      "Comment Bait Ending",
    ],
    editingSteps: [
      { step: "End with a direct question to the audience.", detail: "Make it impossible not to answer." },
      { step: "Keep it short.", detail: "One line. Don't explain the question." },
      { step: "Make it binary when possible.", detail: "Yes/no, guilty/not guilty, team A/team B. Binary questions get more comments." },
      { step: "Hold the last frame.", detail: "Don't cut immediately. Let the question sit for 1-2 seconds." },
    ],
    editingStyle: "Punchy ending. The question is the last thing the viewer hears/sees.",
    captionStyle: "Question-style. The caption should match the ending question.",
    endingExamples: [
      "Okay, settle this.",
      "Am I wrong?",
      "Which one are you?",
      "Arizona people, explain this.",
      "Who is right?",
      "Would you tell your friend?",
      "Guilty or not guilty?",
      "What would your face do?",
      "Tag yourself. Don't lie.",
    ],
    difficulty: "Easy",
    addToAny: true,
  },
];

// ===== Helper functions =====

export function getEditingRecipe(id: string): EditingRecipe | undefined {
  return EDITING_RECIPES.find((r) => r.id === id);
}

export function getEasyEditingRecipes(): EditingRecipe[] {
  return EDITING_RECIPES.filter((r) => r.difficulty === "Easy");
}
