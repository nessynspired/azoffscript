/**
 * AZ Off Script Recording Style Library — "How should I film this?"
 *
 * This is NOT the transition. The transition is how clips connect.
 * The recording style is the feeling and method of filming the
 * actual content.
 *
 * This prevents every video from looking the same.
 *
 * Written for someone who says: "Just tell me how to film it."
 */

export type RecordingDifficulty = "Easy" | "Medium" | "Advanced";

export interface RecordingStyle {
  id: string;
  name: string;
  simpleDescription: string;
  /** What the creator should feel like while filming */
  feelLike: string;
  /** Content types this style works best for */
  bestFor: string[];
  /** Example content formats that pair well with this style */
  exampleFormats: string[];
  /** Step-by-step instructions for how to record */
  howToRecord: string[];
  /** What the reaction/energy can be (for reaction-style etc.) */
  yourReactionCanBe?: string[];
  /** Everyday activities that work (for natural moment etc.) */
  everydayActivities?: string[];
  /** What to avoid */
  avoid: string[];
  /** How hard is this to pull off? */
  difficulty: RecordingDifficulty;
  /** Transitions that pair well with this style */
  worksWellWithTransitions: string[];
  /** Example of how it looks in practice */
  example?: string;
}

export const RECORDING_DIFFICULTIES: RecordingDifficulty[] = ["Easy", "Medium", "Advanced"];

export const DIFFICULTY_COLORS: Record<RecordingDifficulty, string> = {
  Easy: "🟢",
  Medium: "🟡",
  Advanced: "🔴",
};

export const RECORDING_STYLES: RecordingStyle[] = [
  {
    id: "direct_to_camera",
    name: "Direct To Camera",
    simpleDescription: "You talk directly to the audience like you are talking to a friend. The camera is the person you are talking to.",
    feelLike: "I am sending this to a friend. Not giving a speech.",
    bestFor: ["Opinions", "Stories", "Hot takes", "Advice", "Real conversations"],
    exampleFormats: ["Real Quick", "Two-Second Opinion", "One-Line Verdict", "Search Explainers"],
    howToRecord: [
      "Put your phone vertically.",
      "Place camera around eye level.",
      "Look into the camera lens.",
      "Start recording.",
      "Say your thought naturally.",
      "Stop when finished.",
    ],
    avoid: [
      "Reading like a script",
      "Looking away constantly",
      "Overexplaining",
    ],
    difficulty: "Easy",
    worksWellWithTransitions: ["Walk Into Frame", "Walk-Off Answer", "Chair Spin", "Zoom Out Reveal"],
  },
  {
    id: "natural_life_moment",
    name: "Natural Life Moment",
    simpleDescription: "You record yourself while doing something you would already be doing. The audience feels like they are seeing a real moment.",
    feelLike: "The audience is joining my day.",
    bestFor: ["Mom-life", "Arizona life", "Adulting", "Behind the scenes", "Personal stories"],
    exampleFormats: ["Before I Leave The House", "Arizona Micro-Moment", "BTS / Real Process", "Kitchen Counter Confessions"],
    howToRecord: [
      "Choose an everyday activity (see suggestions below).",
      "Set your camera.",
      "Start recording.",
      "Continue your normal activity.",
      "Add your thought or comment.",
      "Finish naturally.",
    ],
    everydayActivities: [
      "Making coffee",
      "Driving (parked, not while driving)",
      "Cooking",
      "Cleaning",
      "Getting ready",
      "Working",
      "Walking",
    ],
    avoid: [
      "Making a fake routine",
      "Setting up something you never do",
      "Acting too perfect",
    ],
    difficulty: "Easy",
    worksWellWithTransitions: ["Room Change", "Door", "Walk Into Frame", "Car"],
  },
  {
    id: "reaction_style",
    name: "Reaction Style",
    simpleDescription: "Your reaction is the content. You do not need a long explanation.",
    feelLike: "My face says it all. No performance needed.",
    bestFor: ["Funny content", "Debates", "Group reactions", "Relatable moments"],
    exampleFormats: ["Face-Only Reaction", "Group Chat Court", "Room Temperature Check", "No Words Needed"],
    howToRecord: [
      "Read or hear the prompt.",
      "Start recording.",
      "React naturally.",
      "Hold your final reaction.",
      "Stop recording.",
    ],
    yourReactionCanBe: [
      "Facial expression",
      "Laugh",
      "Silence",
      "Shock",
      "Confusion",
      "Side eye",
    ],
    avoid: [
      "Fake overreaction",
      "Explaining before reacting",
    ],
    difficulty: "Easy",
    worksWellWithTransitions: ["Object Hit", "Get Hit", "Surprise Reaction", "Camera Grab"],
  },
  {
    id: "pov",
    name: "POV (Point Of View)",
    simpleDescription: "The viewer feels like they are inside the situation. The video starts with 'POV: ____'",
    feelLike: "The viewer is living this moment with me.",
    bestFor: ["Scenarios", "Dating", "Friendship", "Everyday situations"],
    exampleFormats: ["Soft POV", "Fake Scenario Court", "What She Really Means"],
    howToRecord: [
      "Decide who the viewer is.",
      "Set up the situation.",
      "Act naturally.",
      "Keep it short.",
      "End with the relatable moment.",
    ],
    example: "POV: 'Your friend says they are leaving in 5 minutes.' Video: You standing at the door waiting.",
    avoid: [
      "Overacting the scenario",
      "Making it too long",
      "Breaking character",
    ],
    difficulty: "Medium",
    worksWellWithTransitions: ["Door", "Mirror", "Room Change", "Hand Cover"],
  },
  {
    id: "interview_style",
    name: "Interview Style",
    simpleDescription: "Someone asks the question off camera, and the creator answers.",
    feelLike: "Someone just asked me a real question and I'm answering honestly.",
    bestFor: ["Group Day", "Multiple opinions", "Community content"],
    exampleFormats: ["Different Women Different Answer", "Group Chat Court", "Crew vs Future Wave"],
    howToRecord: [
      "Person asking: Stand off camera.",
      "Person asking: Ask the question.",
      "Creator: Listen to the question.",
      "Creator: Answer naturally.",
      "Creator: Look toward the person asking or the camera.",
    ],
    avoid: [
      "Looking at the camera the whole time (it's a conversation)",
      "Rehearsing the answer",
      "Rushing to answer before the question is finished",
    ],
    difficulty: "Easy",
    worksWellWithTransitions: ["Object Pass", "Point to Next Person", "Walk Past Camera", "Tumbler Pass"],
  },
  {
    id: "voiceover_style",
    name: "Voiceover Style",
    simpleDescription: "The creator records video first, then talks over it.",
    feelLike: "I'm narrating my own life. Like a director's commentary.",
    bestFor: ["Storytelling", "Behind the scenes", "Emotional moments"],
    exampleFormats: ["BTS / Real Process", "Real Quick", "Arizona Micro-Moment"],
    howToRecord: [
      "Part 1: Record clips of what is happening (hands working, environment, walking, objects).",
      "Part 2: Record your voice explaining the story or thought.",
      "Admin combines the video and voice together.",
    ],
    avoid: [
      "Talking while filming if the environment is too loud",
      "Making the video clips too long",
      "Forgetting to explain what's happening",
    ],
    difficulty: "Medium",
    worksWellWithTransitions: ["Room Change", "Door", "Zoom In", "Walk Into Frame"],
  },
  {
    id: "silent_visual",
    name: "Silent Visual",
    simpleDescription: "No talking. The video communicates through expressions, actions, and text.",
    feelLike: "My face and body tell the whole story. No words needed.",
    bestFor: ["Quiet creators", "Reactions", "Trends"],
    exampleFormats: ["No Words Needed", "Face-Only Reaction", "Off Script Looks"],
    howToRecord: [
      "Record the action.",
      "Let your expression tell the story.",
      "Hold the ending.",
    ],
    avoid: [
      "Talking (this is the no-talking style)",
      "Rushing the expression",
      "Adding unnecessary movement",
    ],
    difficulty: "Easy",
    worksWellWithTransitions: ["Object Cover", "Hand Cover", "Zoom Out Reveal", "Merch Reveal"],
  },
  {
    id: "group_conversation",
    name: "Group Conversation",
    simpleDescription: "A real conversation between people. Not everyone taking turns like an interview.",
    feelLike: "We're just talking and the camera happens to be there.",
    bestFor: ["Group Day", "Friendship content", "Debate content"],
    exampleFormats: ["Group Chat Court", "Friendship Energy", "Different Women Different Answer"],
    howToRecord: [
      "Put the camera where everyone can be seen.",
      "Let the conversation happen naturally.",
      "Keep all reactions (even the messy ones).",
      "Do not restart every mistake.",
      "Admin finds the best moments during editing.",
    ],
    avoid: [
      "Waiting for your turn like it's a press conference",
      "Restarting every time someone stumbles",
      "Performing instead of conversing",
    ],
    difficulty: "Medium",
    worksWellWithTransitions: ["Object Pass", "Tumbler Pass", "Point to Next Person", "Walk Past Camera"],
  },
];

// ===== Helper functions =====

export function getRecordingStyle(id: string): RecordingStyle | undefined {
  return RECORDING_STYLES.find((s) => s.id === id);
}

export function getEasyRecordingStyles(): RecordingStyle[] {
  return RECORDING_STYLES.filter((s) => s.difficulty === "Easy");
}
