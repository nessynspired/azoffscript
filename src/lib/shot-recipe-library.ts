/**
 * AZ Off Script Shot Recipe Library — the finished production pack.
 *
 * This is the library that turns all the pieces into a ready-to-film
 * assignment. The other libraries are ingredients. The Shot Recipe
 * is the finished meal.
 *
 * A creator never has to understand content strategy, editing,
 * transitions, or production. They just get:
 *
 *   "Here is your assignment. Record this one video."
 *
 * Each recipe combines:
 *   - Content Format (what video are we making?)
 *   - Version (what angle are we using?)
 *   - Prompt (what are we talking about?)
 *   - Recording Style (how are we filming?)
 *   - Transition (how do clips connect?)
 *   - Editing Recipe (how does admin put it together?)
 *   - Caption Package (caption, comment prompt, search terms)
 */

import type { TransitionDifficulty } from "./transition-library";
import type { RecordingDifficulty } from "./recording-style-library";

export type ShotRecipeDifficulty = "Easy" | "Medium" | "Advanced";

export type ShotRecipeCategory =
  | "Friendship"
  | "Dating"
  | "Men, Women & the Script"
  | "Mom-Life"
  | "Family"
  | "Adulting"
  | "Arizona Life"
  | "Soft Truths"
  | "Public Behavior"
  | "Beauty / Style"
  | "Crew / Brand";

export interface ShotRecipePart {
  label: string;
  instructions: string[];
}

export interface ShotRecipe {
  id: string;
  name: string;
  category: ShotRecipeCategory;

  // ===== 1. ASSIGNMENT OVERVIEW =====
  version: "A — Current" | "B — Off Script";
  goal: string;
  creatorTask: string;

  // ===== References to other libraries =====
  contentFormatId: string;
  contentFormatName: string;
  recordingStyleId: string;
  recordingStyleName: string;
  transitionId: string;
  transitionName: string;

  // ===== 2. WHAT THE FINAL VIDEO LOOKS LIKE =====
  finalVideoFlow: string[];

  // ===== 3. YOUR VIDEO HAS 3 PARTS =====
  part1Start: ShotRecipePart;
  part2Content: ShotRecipePart;
  part3End: ShotRecipePart;

  // ===== 4. RECORDING INSTRUCTIONS =====
  beforeRecording: string[];
  recordSteps: string[];

  // ===== 5. CREATOR SUBMISSION =====
  submissionRules: string[];

  // ===== 6. ADMIN EDITING RECIPE =====
  editStyle: string;
  adminOrder: string[];
  adminNotes?: string;

  // ===== 7. CAPTION PACKAGE =====
  caption: string;
  commentPrompt: string;
  searchTerms: string[];
  hashtags: string[];

  // ===== 8. DIFFICULTY =====
  difficulty: ShotRecipeDifficulty;

  // ===== The prompt the creator is responding to =====
  prompt: string;
  // ===== Example response the creator can use as inspiration =====
  exampleResponse?: string;
}

export const SHOT_RECIPE_DIFFICULTIES: ShotRecipeDifficulty[] = ["Easy", "Medium", "Advanced"];

export const DIFFICULTY_COLORS: Record<ShotRecipeDifficulty, string> = {
  Easy: "🟢",
  Medium: "🟡",
  Advanced: "🔴",
};

export const SHOT_RECIPE_CATEGORIES: ShotRecipeCategory[] = [
  "Friendship",
  "Dating",
  "Men, Women & the Script",
  "Mom-Life",
  "Family",
  "Adulting",
  "Arizona Life",
  "Soft Truths",
  "Public Behavior",
  "Beauty / Style",
  "Crew / Brand",
];

export const SHOT_RECIPES: ShotRecipe[] = [
  // ===== FRIENDSHIP =====
  {
    id: "recipe_friend_or_follower_b",
    name: "Friend or Follower — Off Script Edition",
    category: "Friendship",
    version: "B — Off Script",
    goal: "Viewers should debate whether this friendship behavior is acceptable and tag their own friends.",
    creatorTask: "Record your honest reaction to whether this friendship behavior crosses a line.",
    contentFormatId: "friend_or_follower",
    contentFormatName: "Friend or Follower?",
    recordingStyleId: "reaction_style",
    recordingStyleName: "Reaction Style",
    transitionId: "object_hit",
    transitionName: "Object Hit",
    prompt: "She watches every story but never checks on you.",
    exampleResponse: "Guilty. That's not a friend, that's a follower with a front-row seat.",
    finalVideoFlow: [
      "Opening hook: 'Is this a friend or a follower?'",
      "Scenario appears on screen",
      "Person 1 reacts (transition in)",
      "Person 2 reacts (transition in)",
      "Person 3 reacts (transition in)",
      "Comment question: 'Who is right?'",
    ],
    part1Start: {
      label: "Start Transition — Object Hit",
      instructions: [
        "Start holding your object (makeup brush, tumbler, phone).",
        "Move the object toward the camera.",
        "Stop when it covers the lens.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Start recording with your face close to the camera.",
        "Act like the object hit you.",
        "Recover from the hit.",
        "React to the prompt: 'She watches every story but never checks on you.'",
        "Give your verdict: Friend or Follower?",
        "Give a one-line reason.",
      ],
    },
    part3End: {
      label: "End Transition — Object Hit",
      instructions: [
        "Hold your final reaction for 2 seconds.",
        "Move the object toward the camera.",
        "Cover the lens.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio (no background noise)",
      "Good lighting (face the window or light)",
      "Phone stable (prop it up or hold steady)",
      "One continuous video (no cuts)",
    ],
    recordSteps: [
      "Start your opening transition (object hit).",
      "Pause briefly.",
      "Deliver your verdict and reason.",
      "Hold your reaction.",
      "Complete your ending transition (object hit).",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip (no editing)",
      "No captions (admin adds them)",
      "No music (admin adds it)",
      "No filters",
    ],
    editStyle: "Fast-cut reactions",
    adminOrder: [
      "Question screen: 'Is this a friend or a follower?'",
      "Transition into Person 1",
      "Person 1 reaction",
      "Transition into Person 2",
      "Person 2 reaction",
      "Transition into Person 3",
      "Person 3 reaction",
      "Final screen: 'Who is right?'",
    ],
    adminNotes: "Keep each reaction under 8 seconds. Cut any dead air. Add the scenario as on-screen text before the first reaction.",
    caption: "Okay, we need answers 😂 Friend or follower?",
    commentPrompt: "Who is right?",
    searchTerms: ["friendship boundaries", "friendship problems", "Arizona women", "fake friends"],
    hashtags: ["#AZOffScript", "#FriendOrFollower", "#FriendshipCourt", "#ArizonaCreators"],
    difficulty: "Easy",
  },
  {
    id: "recipe_girl_code_b",
    name: "Girl Code or Just Drama — Off Script Edition",
    category: "Friendship",
    version: "B — Off Script",
    goal: "Viewers should argue in the comments about where the girl code line actually is.",
    creatorTask: "Record your verdict on whether this situation broke girl code or people are doing too much.",
    contentFormatId: "girl_code_or_just_drama",
    contentFormatName: "Girl Code or Just Drama?",
    recordingStyleId: "direct_to_camera",
    recordingStyleName: "Direct To Camera",
    transitionId: "hand_cover",
    transitionName: "Hand Cover",
    prompt: "Dating someone your friend talked to once.",
    exampleResponse: "Not girl code. If she didn't date him, she don't own him. But I'm telling her first.",
    finalVideoFlow: [
      "Opening hook: 'Girl code or just drama?'",
      "Scenario appears on screen",
      "Person 1 gives verdict (transition in)",
      "Person 2 gives verdict (transition in)",
      "Person 3 gives verdict (transition in)",
      "Comment question: 'Did she break girl code?'",
    ],
    part1Start: {
      label: "Start Transition — Hand Cover",
      instructions: [
        "Move your hand toward the camera.",
        "Cover the entire lens.",
        "Hold for 1 second.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Start recording with your hand covering the lens.",
        "Pull your hand away.",
        "Look into the camera.",
        "Give your verdict: Girl code or just drama?",
        "Give a one-line reason.",
      ],
    },
    part3End: {
      label: "End Transition — Hand Cover",
      instructions: [
        "Move your hand toward the camera.",
        "Cover the lens.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Phone stable",
      "One continuous video",
    ],
    recordSteps: [
      "Start your opening transition (hand cover).",
      "Pull hand away.",
      "Deliver your verdict and reason.",
      "Hold your final expression.",
      "Complete your ending transition (hand cover).",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Fast-cut verdicts",
    adminOrder: [
      "Question screen: 'Girl code or just drama?'",
      "Transition into Person 1",
      "Person 1 verdict",
      "Transition into Person 2",
      "Person 2 verdict",
      "Transition into Person 3",
      "Person 3 verdict",
      "Final screen: 'Did she break girl code?'",
    ],
    adminNotes: "Keep each verdict under 10 seconds. The debate is the content — don't cut the reasoning.",
    caption: "Girl code or just drama? We need answers 😭",
    commentPrompt: "Did she break girl code?",
    searchTerms: ["girl code", "friendship rules", "dating friends ex", "Arizona women"],
    hashtags: ["#AZOffScript", "#GirlCodeOrDrama", "#FriendshipCourt", "#ArizonaCreators"],
    difficulty: "Easy",
  },
  {
    id: "recipe_friend_every_group_b",
    name: "The Friend Every Group Has — Off Script Edition",
    category: "Friendship",
    version: "B — Off Script",
    goal: "Viewers should tag themselves and their friends. High shareability.",
    creatorTask: "Claim which friend type you are and tell us why.",
    contentFormatId: "friend_every_group_has",
    contentFormatName: "The Friend Every Group Has",
    recordingStyleId: "natural_life_moment",
    recordingStyleName: "Natural Life Moment",
    transitionId: "tumbler_pass",
    transitionName: "Tumbler Pass",
    prompt: "The one who says 'I'm outside' but is still home.",
    exampleResponse: "That's me. I'm outside in my mind. In real life I'm still picking my shoes.",
    finalVideoFlow: [
      "Opening hook: 'Which friend are you?'",
      "Friend types appear on screen",
      "Person 1 claims their type (tumbler in)",
      "Person 2 claims their type (tumbler in)",
      "Person 3 claims their type (tumbler in)",
      "Comment question: 'Tag yourself. Don't lie.'",
    ],
    part1Start: {
      label: "Start Transition — Tumbler Pass",
      instructions: [
        "Start recording.",
        "Receive the AZ Off Script tumbler from off-screen.",
        "Hold it up so viewers see it.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Hold the tumbler.",
        "Say which friend type you are.",
        "Give a one-line reason or example.",
        "Be honest — the funny is in the truth.",
      ],
    },
    part3End: {
      label: "End Transition — Tumbler Pass",
      instructions: [
        "Pass the tumbler toward the edge of the screen.",
        "Let it leave the frame.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Have the AZ Off Script tumbler ready",
      "One continuous video",
    ],
    recordSteps: [
      "Receive the tumbler (opening transition).",
      "Say which friend type you are.",
      "Give your reason.",
      "Pass the tumbler off-screen (ending transition).",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Tumbler chain",
    adminOrder: [
      "Question screen: 'Which friend are you?'",
      "Person 1 receives tumbler, claims type",
      "Person 2 receives tumbler, claims type",
      "Person 3 receives tumbler, claims type",
      "Final screen: 'Tag yourself. Don't lie.'",
    ],
    adminNotes: "The tumbler should flow in the same direction through everyone. Add friend type as on-screen text for each person.",
    caption: "Which friend are you? Tag yourself. Don't lie. 😂",
    commentPrompt: "Tag yourself. Don't lie.",
    searchTerms: ["friend types", "which friend are you", "group chat friends", "Arizona women"],
    hashtags: ["#AZOffScript", "#FriendEveryGroup", "#FriendshipCourt", "#ArizonaCreators"],
    difficulty: "Easy",
  },

  // ===== DATING =====
  {
    id: "recipe_apology_or_excuse_b",
    name: "Apology or Excuse — Off Script Edition",
    category: "Dating",
    version: "B — Off Script",
    goal: "Viewers should debate whether the apology counts and share their own fake apology stories.",
    creatorTask: "Record your verdict on whether this apology is real or just an excuse.",
    contentFormatId: "apology_or_excuse",
    contentFormatName: "Apology or Excuse?",
    recordingStyleId: "reaction_style",
    recordingStyleName: "Reaction Style",
    transitionId: "camera_grab",
    transitionName: "Camera Grab",
    prompt: "I'm sorry you felt that way.",
    exampleResponse: "That's not an apology. That's a redirect. You apologized for my feelings, not your actions.",
    finalVideoFlow: [
      "Opening hook: 'Does this apology count?'",
      "The fake apology appears on screen",
      "Person 1 reacts (transition in)",
      "Person 2 reacts (transition in)",
      "Person 3 reacts (transition in)",
      "Comment question: 'Apology or excuse?'",
    ],
    part1Start: {
      label: "Start Transition — Camera Grab",
      instructions: [
        "Reach toward the camera.",
        "Cover the lens with your hand.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Start recording with your hand covering the lens.",
        "Remove your hand.",
        "React to the apology: 'I'm sorry you felt that way.'",
        "Give your verdict: Apology or Excuse?",
        "Give a one-line reason.",
      ],
    },
    part3End: {
      label: "End Transition — Camera Grab",
      instructions: [
        "Reach toward the camera.",
        "Cover the lens.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Phone stable",
      "One continuous video",
    ],
    recordSteps: [
      "Start your opening transition (camera grab).",
      "Remove hand.",
      "Deliver your verdict and reason.",
      "Hold your final expression.",
      "Complete your ending transition (camera grab).",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Fast-cut reactions",
    adminOrder: [
      "Question screen: 'Does this apology count?'",
      "The fake apology on screen",
      "Transition into Person 1",
      "Person 1 verdict",
      "Transition into Person 2",
      "Person 2 verdict",
      "Transition into Person 3",
      "Person 3 verdict",
      "Final screen: 'Apology or excuse?'",
    ],
    adminNotes: "Show the fake apology text before each reaction so viewers see it fresh each time.",
    caption: "Does this apology count? Be honest 😬",
    commentPrompt: "Apology or excuse?",
    searchTerms: ["fake apology", "relationship red flags", "apology or excuse", "Arizona women"],
    hashtags: ["#AZOffScript", "#ApologyOrExcuse", "#DatingScripts", "#ArizonaCreators"],
    difficulty: "Easy",
  },
  {
    id: "recipe_red_flag_tired_b",
    name: "Red Flag, Real Life, or Just Tired — Off Script Edition",
    category: "Dating",
    version: "B — Off Script",
    goal: "Viewers should debate whether this behavior is toxic or just normal adult life.",
    creatorTask: "Record your verdict on whether this is a red flag, real life, or just tired.",
    contentFormatId: "red_flag_real_life_just_tired",
    contentFormatName: "Red Flag, Real Life, or Just Tired?",
    recordingStyleId: "direct_to_camera",
    recordingStyleName: "Direct To Camera",
    transitionId: "walk_into_frame",
    transitionName: "Walk Into Frame",
    prompt: "She needs three business days to respond.",
    exampleResponse: "That's not a red flag. That's a woman with a job and boundaries. Give her the three days.",
    finalVideoFlow: [
      "Opening hook: 'Red flag, real life, or just tired?'",
      "Scenario appears on screen",
      "Person 1 walks in, gives verdict",
      "Person 2 walks in, gives verdict",
      "Person 3 walks in, gives verdict",
      "Comment question: 'Which one is it?'",
    ],
    part1Start: {
      label: "Start Transition — Walk Into Frame",
      instructions: [
        "Start recording on an empty frame.",
        "Walk into the camera view from the left.",
        "Stop where you want.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Look into the camera.",
        "Give your verdict: Red flag, real life, or just tired?",
        "Give a one-line reason.",
        "Keep it funny and mature — not everything is toxic.",
      ],
    },
    part3End: {
      label: "End Transition — Walk Into Frame",
      instructions: [
        "Walk out of frame to the right.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Space to walk in and out",
      "One continuous video",
    ],
    recordSteps: [
      "Start recording on empty frame.",
      "Walk in from the left.",
      "Give your verdict and reason.",
      "Walk out to the right.",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Walk-in chain",
    adminOrder: [
      "Question screen: 'Red flag, real life, or just tired?'",
      "Person 1 walks in, verdict",
      "Person 2 walks in, verdict",
      "Person 3 walks in, verdict",
      "Final screen: 'Which one is it?'",
    ],
    adminNotes: "Everyone should walk in from the same direction and walk out the same direction for continuity.",
    caption: "Red flag, real life, or just tired? Not everything is toxic 😮‍💨",
    commentPrompt: "Which one is it?",
    searchTerms: ["red flags dating", "relationship advice", "dating tired", "Arizona women"],
    hashtags: ["#AZOffScript", "#RedFlagOrRealLife", "#DatingScripts", "#ArizonaCreators"],
    difficulty: "Easy",
  },

  // ===== MEN, WOMEN & THE SCRIPT =====
  {
    id: "recipe_he_said_she_heard_b",
    name: "He Said / She Heard — Off Script Edition",
    category: "Men, Women & the Script",
    version: "B — Off Script",
    goal: "Viewers should argue in the comments because everyone has heard these lines differently.",
    creatorTask: "Record your reaction to what he said and tell us what women actually heard.",
    contentFormatId: "he_said_she_heard",
    contentFormatName: "He Said / She Heard",
    recordingStyleId: "reaction_style",
    recordingStyleName: "Reaction Style",
    transitionId: "object_cover",
    transitionName: "Object Cover",
    prompt: "He said he's just bad at texting.",
    exampleResponse: "She heard: 'You are not a priority to me and I am not going to change that.'",
    finalVideoFlow: [
      "Opening hook: 'He said one thing. We heard another.'",
      "The phrase appears on screen",
      "Person 1 reacts (transition in)",
      "Person 2 reacts (transition in)",
      "Person 3 reacts (transition in)",
      "Comment question: 'What did you hear?'",
    ],
    part1Start: {
      label: "Start Transition — Object Cover",
      instructions: [
        "Hold your object (sunglasses, phone, tumbler).",
        "Move it toward the camera.",
        "Cover the entire lens.",
        "Hold for 1 second.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Start recording with the object covering the lens.",
        "Remove the object.",
        "React to the phrase: 'He said he's just bad at texting.'",
        "Tell us what women actually heard.",
        "Keep it sharp and honest.",
      ],
    },
    part3End: {
      label: "End Transition — Object Cover",
      instructions: [
        "Move the object toward the camera.",
        "Cover the lens.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Have your object ready",
      "One continuous video",
    ],
    recordSteps: [
      "Start your opening transition (object cover).",
      "Remove the object.",
      "React and translate the phrase.",
      "Hold your final expression.",
      "Complete your ending transition (object cover).",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Reaction chain",
    adminOrder: [
      "Question screen: 'He said one thing. We heard another.'",
      "The phrase on screen",
      "Transition into Person 1",
      "Person 1 translation",
      "Transition into Person 2",
      "Person 2 translation",
      "Transition into Person 3",
      "Person 3 translation",
      "Final screen: 'What did you hear?'",
    ],
    adminNotes: "Show the phrase before each reaction. The translation is the content — don't cut it short.",
    caption: "He said one thing. We heard another. What did you hear? 😳",
    commentPrompt: "What did you hear?",
    searchTerms: ["he said she heard", "dating translation", "relationship communication", "Arizona women"],
    hashtags: ["#AZOffScript", "#HeSaidSheHeard", "#DatingScripts", "#ArizonaCreators"],
    difficulty: "Easy",
  },
  {
    id: "recipe_caring_controlling_b",
    name: "Caring or Controlling — Off Script Edition",
    category: "Men, Women & the Script",
    version: "B — Off Script",
    goal: "Viewers should debate hard in the comments about where caring becomes controlling.",
    creatorTask: "Record your verdict on whether this behavior is caring, protective, controlling, or suspicious.",
    contentFormatId: "caring_or_controlling",
    contentFormatName: "Caring or Controlling?",
    recordingStyleId: "direct_to_camera",
    recordingStyleName: "Direct To Camera",
    transitionId: "zoom_out",
    transitionName: "Zoom Out Reveal",
    prompt: "He wants your location on.",
    exampleResponse: "Caring if he asks once. Controlling if he demands it. The difference is the tone.",
    finalVideoFlow: [
      "Opening hook: 'Caring or controlling?'",
      "The behavior appears on screen",
      "Person 1 zooms out, gives verdict",
      "Person 2 zooms out, gives verdict",
      "Person 3 zooms out, gives verdict",
      "Comment question: 'Where is the line?'",
    ],
    part1Start: {
      label: "Start Transition — Zoom Out Reveal",
      instructions: [
        "Start recording close-up on something (your face, an object).",
        "Zoom out slowly.",
        "Reveal yourself.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Look into the camera.",
        "Give your verdict: Caring, protective, controlling, or suspicious?",
        "Give a one-line reason.",
        "The line between caring and controlling is the debate.",
      ],
    },
    part3End: {
      label: "End Transition — Zoom Out Reveal",
      instructions: [
        "Zoom back in until blurry.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Phone stable",
      "One continuous video",
    ],
    recordSteps: [
      "Start recording close-up.",
      "Zoom out to reveal yourself.",
      "Give your verdict and reason.",
      "Zoom back in.",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Zoom chain",
    adminOrder: [
      "Question screen: 'Caring or controlling?'",
      "The behavior on screen",
      "Person 1 zooms out, verdict",
      "Person 2 zooms out, verdict",
      "Person 3 zooms out, verdict",
      "Final screen: 'Where is the line?'",
    ],
    adminNotes: "Each person zooms out from a different close-up for variety. The verdict is the content.",
    caption: "Caring or controlling? Where is the line? 📍",
    commentPrompt: "Where is the line?",
    searchTerms: ["caring or controlling", "relationship red flags", "controlling behavior", "Arizona women"],
    hashtags: ["#AZOffScript", "#CaringOrControlling", "#DatingScripts", "#ArizonaCreators"],
    difficulty: "Medium",
  },

  // ===== MOM-LIFE =====
  {
    id: "recipe_mom_math_b",
    name: "Mom Math — Off Script Edition",
    category: "Mom-Life",
    version: "B — Off Script",
    goal: "Moms should tag each other. Exhausted logic is universally relatable.",
    creatorTask: "Record your mom math — the tired logic that only makes sense if you're a mom.",
    contentFormatId: "mom_math",
    contentFormatName: "Mom Math",
    recordingStyleId: "natural_life_moment",
    recordingStyleName: "Natural Life Moment",
    transitionId: "room_change",
    transitionName: "Room Change",
    prompt: "If I sit down for five minutes, that counts as rest.",
    exampleResponse: "If I sat down for five minutes without someone asking me for something, that's a vacation.",
    finalVideoFlow: [
      "Opening hook: 'Mom math. What's your equation?'",
      "Person 1 in their room, mom math",
      "Person 2 in a different room, mom math",
      "Person 3 in a different room, mom math",
      "Comment question: 'What's your mom math?'",
    ],
    part1Start: {
      label: "Start Transition — Room Change",
      instructions: [
        "Start recording in your room.",
        "Be in the middle of an everyday activity.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Continue your activity (making coffee, folding laundry, etc.).",
        "Say your mom math line.",
        "The more absurd the better.",
        "Keep it short and honest.",
      ],
    },
    part3End: {
      label: "End Transition — Room Change",
      instructions: [
        "Continue your activity.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Be in a real room doing a real activity",
      "One continuous video",
    ],
    recordSteps: [
      "Start recording in your room.",
      "Continue your activity.",
      "Say your mom math line.",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Room-to-room cut",
    adminOrder: [
      "Question screen: 'Mom math. What's your equation?'",
      "Person 1 in their room",
      "Person 2 in a different room",
      "Person 3 in a different room",
      "Final screen: 'What's your mom math?'",
    ],
    adminNotes: "Each person should be in a different room doing a different activity. The variety is the visual interest.",
    caption: "Mom math. What's your equation? 😂",
    commentPrompt: "What's your mom math?",
    searchTerms: ["mom math", "mom logic", "tired mom", "Arizona moms"],
    hashtags: ["#AZOffScript", "#MomMath", "#MomLifeOffScript", "#ArizonaCreators", "#MomTok"],
    difficulty: "Easy",
  },

  // ===== ARIZONA LIFE =====
  {
    id: "recipe_arizona_made_me_b",
    name: "Arizona Made Me — Off Script Edition",
    category: "Arizona Life",
    version: "B — Off Script",
    goal: "Arizona locals should relate and argue about which habits are real AZ.",
    creatorTask: "Finish the sentence: 'Arizona made me...' with a habit or instinct AZ gave you.",
    contentFormatId: "arizona_made_me",
    contentFormatName: "Arizona Made Me This Way",
    recordingStyleId: "direct_to_camera",
    recordingStyleName: "Direct To Camera",
    transitionId: "walk_off_answer",
    transitionName: "Walk-Off Answer",
    prompt: "Arizona made me...",
    exampleResponse: "Arizona made me check the steering wheel before I sit down. Six months out of the year it will burn you.",
    finalVideoFlow: [
      "Opening hook: 'Arizona made us this way.'",
      "Person 1 walks in, answers, walks off",
      "Person 2 walks in, answers, walks off",
      "Person 3 walks in, answers, walks off",
      "Comment question: 'What did Arizona do to you?'",
    ],
    part1Start: {
      label: "Start Transition — Walk-Off Answer",
      instructions: [
        "Start recording on an empty frame.",
        "Walk into frame.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Look into the camera.",
        "Finish the sentence: 'Arizona made me...'",
        "Say your habit or instinct.",
        "The more specific the funnier.",
      ],
    },
    part3End: {
      label: "End Transition — Walk-Off Answer",
      instructions: [
        "Walk out of frame.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Space to walk in and out",
      "One continuous video",
    ],
    recordSteps: [
      "Start recording on empty frame.",
      "Walk in.",
      "Finish the sentence.",
      "Walk off.",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Walk-in walk-off chain",
    adminOrder: [
      "Question screen: 'Arizona made us this way.'",
      "Person 1 walks in, answers, walks off",
      "Person 2 walks in, answers, walks off",
      "Person 3 walks in, answers, walks off",
      "Final screen: 'What did Arizona do to you?'",
    ],
    adminNotes: "Everyone walks in from the same side and walks off the same side. The walk-off is the mic drop.",
    caption: "Arizona made us this way. What did it do to you? 🌵",
    commentPrompt: "What did Arizona do to you?",
    searchTerms: ["Arizona made me", "Arizona habits", "Arizona life", "Arizona locals"],
    hashtags: ["#AZOffScript", "#ArizonaMadeMe", "#ArizonaLife", "#ArizonaCreators"],
    difficulty: "Easy",
  },

  // ===== SOFT TRUTHS =====
  {
    id: "recipe_real_quick_b",
    name: "Real Quick — Off Script Edition",
    category: "Soft Truths",
    version: "B — Off Script",
    goal: "Viewers should feel the honesty and share their own real quick thought.",
    creatorTask: "Record one real thought — quick, honest, not a whole speech.",
    contentFormatId: "real_quick",
    contentFormatName: "Real Quick",
    recordingStyleId: "direct_to_camera",
    recordingStyleName: "Direct To Camera",
    transitionId: "zoom_in",
    transitionName: "Zoom In",
    prompt: "Real quick, I'm tired of explaining normal things.",
    exampleResponse: "Real quick, I'm tired of explaining normal things. Like basic respect. Like basic effort. It shouldn't need a PowerPoint.",
    finalVideoFlow: [
      "Opening hook: 'Real quick...'",
      "Person 1 zooms in, shares thought",
      "Person 2 zooms in, shares thought",
      "Person 3 zooms in, shares thought",
      "Comment question: 'What's your real quick?'",
    ],
    part1Start: {
      label: "Start Transition — Zoom In",
      instructions: [
        "Start recording.",
        "Zoom the camera in.",
        "Keep zooming until the screen is blurry.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Start recording zoomed in (blurry).",
        "Zoom out slowly.",
        "Say 'Real quick...' and share one honest thought.",
        "Keep it short. The real is the point.",
        "Don't make it a speech.",
      ],
    },
    part3End: {
      label: "End Transition — Zoom In",
      instructions: [
        "Zoom back in until blurry.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Quiet space (this is intimate)",
      "One continuous video",
    ],
    recordSteps: [
      "Start recording zoomed in.",
      "Zoom out.",
      "Say 'Real quick...' and your thought.",
      "Zoom back in.",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Soft zoom chain",
    adminOrder: [
      "Question screen: 'Real quick...'",
      "Person 1 zooms out, shares thought",
      "Person 2 zooms out, shares thought",
      "Person 3 zooms out, shares thought",
      "Final screen: 'What's your real quick?'",
    ],
    adminNotes: "Keep the music soft. This is the heart content — don't rush it. Let each thought breathe.",
    caption: "Real quick... what's one thing you're tired of explaining? 🤍",
    commentPrompt: "What's your real quick?",
    searchTerms: ["real quick honest thought", "soft truths", "tired of explaining", "Arizona women"],
    hashtags: ["#AZOffScript", "#RealQuick", "#SoftTruths", "#ArizonaCreators"],
    difficulty: "Easy",
  },

  // ===== CREW / BRAND =====
  {
    id: "recipe_crew_intro_b",
    name: "Crew Intro Pass — Off Script Edition",
    category: "Crew / Brand",
    version: "B — Off Script",
    goal: "New viewers should understand what AZ Off Script is and want to meet the crew.",
    creatorTask: "Introduce yourself as part of AZ Off Script using a transition. Say your name and your vibe.",
    contentFormatId: "first_wave_intro",
    contentFormatName: "Crew Intro Pass",
    recordingStyleId: "direct_to_camera",
    recordingStyleName: "Direct To Camera",
    transitionId: "logo_cover",
    transitionName: "Logo Cover",
    prompt: "Introduce yourself — name, vibe, why people should watch you.",
    exampleResponse: "I'm Vanessa, and I'm building the room. What expectation are you breaking?",
    finalVideoFlow: [
      "Opening: AZ Off Script logo",
      "Person 1 removes logo, introduces themselves",
      "Person 2 removes logo, introduces themselves",
      "Person 3 removes logo, introduces themselves",
      "End: 'Meet the AZ Off Script crew.'",
    ],
    part1Start: {
      label: "Start Transition — Logo Cover",
      instructions: [
        "Hold up the AZ Off Script logo (sticker, merch, tumbler).",
        "Cover the camera with it.",
      ],
    },
    part2Content: {
      label: "Your Content",
      instructions: [
        "Start recording with the logo covering the lens.",
        "Remove the logo.",
        "Say your name.",
        "Say your vibe or why people should watch you.",
        "Add your own attitude, humor, face, pose, or moment.",
        "This is not a script — bring your own energy.",
      ],
    },
    part3End: {
      label: "End Transition — Logo Cover",
      instructions: [
        "Hold up the logo.",
        "Cover the camera.",
        "Stop recording.",
      ],
    },
    beforeRecording: [
      "Vertical video",
      "Clear audio",
      "Good lighting",
      "Have AZ Off Script merch/sticker/tumbler ready",
      "One continuous video",
    ],
    recordSteps: [
      "Start with the logo covering the lens.",
      "Remove the logo.",
      "Say your name and vibe.",
      "Hold your expression.",
      "Cover the lens with the logo again.",
      "Stop recording.",
    ],
    submissionRules: [
      "Send one video only",
      "Raw clip",
      "No captions",
      "No music",
      "No filters",
    ],
    editStyle: "Logo chain intro",
    adminOrder: [
      "Opening: AZ Off Script logo animation",
      "Person 1 removes logo, intro",
      "Person 2 removes logo, intro",
      "Person 3 removes logo, intro",
      "End: 'Meet the AZ Off Script crew.'",
    ],
    adminNotes: "This is the signature intro video. The logo should be consistent. Add each person's name as on-screen text.",
    caption: "Meet the AZ Off Script crew. Who's your favorite?",
    commentPrompt: "Who's your favorite?",
    searchTerms: ["Arizona creator crew", "AZ Off Script", "women creators Arizona", "creator collective"],
    hashtags: ["#AZOffScript", "#ArizonaCreators", "#ArizonaTikTok", "#CreatorCrew", "#MeetTheCrew"],
    difficulty: "Easy",
  },
];

// ===== Helper functions =====

export function getShotRecipe(id: string): ShotRecipe | undefined {
  return SHOT_RECIPES.find((r) => r.id === id);
}

export function getRecipesByCategory(category: ShotRecipeCategory): ShotRecipe[] {
  return SHOT_RECIPES.filter((r) => r.category === category);
}

export function getRecipesByDifficulty(difficulty: ShotRecipeDifficulty): ShotRecipe[] {
  return SHOT_RECIPES.filter((r) => r.difficulty === difficulty);
}

export function getEasyRecipes(): ShotRecipe[] {
  return getRecipesByDifficulty("Easy");
}
