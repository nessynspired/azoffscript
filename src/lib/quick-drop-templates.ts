/**
 * Quick Drop Templates — reusable content formats.
 *
 * Each template defines:
 *  - A name and description
 *  - Effort level + time estimate
 *  - Whether it's home-friendly
 *  - Simple crew instructions (what to record)
 *  - Optional sample lines the crew can say
 *  - Best platforms
 *  - Whether admin needs to stitch clips
 *
 * When a template is used to create a content item, the crew sees a simple
 * card with just: title, drop-by date, time needed, instructions, sample line,
 * and a "Drop Mine" button. They do NOT see the full planning machine.
 */

export interface QuickDropTemplate {
  id: string;
  name: string;
  description: string;
  effort: string;          // "10-Min Drop", "Standard", "Produced"
  timeEstimate: string;    // "5-10 min", "2-5 min", etc.
  homeFriendly: boolean;
  multipleTakes: boolean;
  adminStitches: boolean;  // does Vanessa need to stitch clips together?
  maxSeconds?: number;     // max length per person
  instructions: string;    // what the crew should do
  sampleLines?: string[];  // optional lines they can say
  platforms: string[];     // best platforms
  category: string;        // content lane
}

export const QUICK_DROP_TEMPLATES: QuickDropTemplate[] = [
  {
    id: "first_wave_intro",
    name: "First Wave Intro Pass",
    description: "Each person records a short intro using a simple transition. Stitched together into one intro video.",
    effort: "10-Min Drop",
    timeEstimate: "5-10 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: true,
    maxSeconds: 10,
    instructions:
      "Record one quick intro clip. Start with your foot stepping toward the camera or your hand covering the camera. Then show your face and say your intro line. End by covering the camera again, stepping away, or zooming out to transition to the next person. Keep it under 10 seconds.",
    sampleLines: [
      "I'm Vanessa, and I'm building the room.",
      "I'm Ronnie, and I bring the sweet touch.",
      "I'm Sholanda, and somebody had to say it.",
      "I'm Elaine, and my face says enough.",
      "I'm Latasha, and I'm the wild card.",
      "I'm Maria, and I bring the fresh energy.",
    ],
    platforms: ["TikTok", "Reels", "Facebook", "Shorts"],
    category: "Meet the First Wave",
  },
  {
    id: "red_flag_real_life",
    name: "Red Flag or Real Life?",
    description: "We read a red flag and guess if it's real or made up.",
    effort: "10-Min Drop",
    timeEstimate: "2-5 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: false,
    maxSeconds: 30,
    instructions:
      "Record your reaction to the red flag prompt. Say whether you think it's a red flag or real life, and why. One take is fine.",
    sampleLines: [
      "That's a red flag — run.",
      "That's real life, that happens every day.",
      "Red flag? That's a whole red billboard.",
    ],
    platforms: ["TikTok", "Reels", "Shorts"],
    category: "Hot Takes",
  },
  {
    id: "this_or_that",
    name: "This or That",
    description: "Pick between two things — quick, easy, fun.",
    effort: "10-Min Drop",
    timeEstimate: "2-3 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: false,
    maxSeconds: 15,
    instructions:
      "We'll give you two options. Just say which one you pick and why. Keep it short and fun.",
    sampleLines: [
      "That one, easy.",
      "Neither — I'm picking my own.",
      "Okay but why would anyone pick that one?",
    ],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
    category: "Quick Games",
  },
  {
    id: "reaction_face_only",
    name: "Reaction Face Only",
    description: "No talking — just your face reacting to something.",
    effort: "10-Min Drop",
    timeEstimate: "1-2 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: false,
    maxSeconds: 10,
    instructions:
      "We'll show you something. Just react with your face — no talking. The camera stays on you. Your face does all the work.",
    platforms: ["TikTok", "Reels", "Shorts"],
    category: "Reactions",
  },
  {
    id: "dry_heat_hot_takes",
    name: "Dry Heat Hot Takes",
    description: "One strong opinion about Arizona life.",
    effort: "10-Min Drop",
    timeEstimate: "2-5 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: false,
    maxSeconds: 20,
    instructions:
      "Give us your hottest take about living in Arizona. One sentence, strong opinion, no hedging. The hotter the better.",
    sampleLines: [
      "Phoenix summers aren't that bad — it's a dry heat.",
      "Nobody actually knows how to use the roundabouts.",
      "Monsoon season is the only good thing about Arizona.",
    ],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
    category: "Hot Takes",
  },
  {
    id: "whos_most_likely",
    name: "Who's Most Likely To",
    description: "Answer who in the crew is most likely to do something.",
    effort: "10-Min Drop",
    timeEstimate: "3-5 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: true,
    maxSeconds: 20,
    instructions:
      "We'll give you a 'who's most likely to' prompt. Say who in the crew fits it and why. Don't hold back — we're all friends here.",
    sampleLines: [
      "Oh that's Sholanda, easy.",
      "All of us but mostly Latasha.",
      "I'm not naming names but... Ronnie.",
    ],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
    category: "Quick Games",
  },
];

/**
 * Get a template by ID.
 */
export function getTemplate(id: string): QuickDropTemplate | undefined {
  return QUICK_DROP_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get a personalized sample line for a crew member.
 * Falls back to the first sample line if no name match.
 */
export function getSampleLine(template: QuickDropTemplate, memberName?: string): string | null {
  if (!template.sampleLines || template.sampleLines.length === 0) return null;
  if (!memberName) return template.sampleLines[0];

  // Try to find a line that mentions this person's first name
  const firstName = memberName.split(" ")[0];
  const match = template.sampleLines.find((line) =>
    line.toLowerCase().includes(firstName.toLowerCase())
  );
  return match ?? template.sampleLines[0];
}
