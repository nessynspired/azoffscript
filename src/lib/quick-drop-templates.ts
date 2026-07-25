/**
 * Quick Drop Templates — reusable content formats.
 *
 * PHILOSOPHY: Prompt them. Don't script them.
 *
 * Each template gives the crew enough direction to not feel lost,
 * but enough freedom to bring their own personality.
 *
 * Structure:
 *  - Idea: what the content is
 *  - Vibe: the energy
 *  - WhatToDrop: what they need to send
 *  - EasyWay: optional recording help
 *  - Examples: sample lines (NOT required — "use if stuck")
 *  - MakeItYours: permission to add personality
 *  - Transitions: optional transition ideas (pick one or do your own)
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
  idea: string;            // what the content is
  vibe: string;            // the energy
  whatToDrop: string;      // what they need to send
  easyWay?: string;        // optional recording help
  examples?: string[];     // sample lines — NOT required
  makeItYours: string;     // permission to add personality
  transitions?: string[];  // optional transition ideas
  platforms: string[];     // best platforms
  category: string;        // content lane
}

export const QUICK_DROP_TEMPLATES: QuickDropTemplate[] = [
  {
    id: "first_wave_intro",
    name: "First Wave Intro Pass",
    description: "Each person records a short intro using a simple camera transition. Stitched together into one intro video.",
    effort: "10-Min Drop",
    timeEstimate: "5-10 min",
    homeFriendly: true,
    multipleTakes: false,
    adminStitches: true,
    maxSeconds: 10,
    idea: "Introduce yourself as part of AZ Off Script using a simple camera transition.",
    vibe: "Confident, funny, chill, real. Don't overthink it.",
    whatToDrop: "A short intro clip, 5-10 seconds.",
    easyWay: "Step toward the camera, cover the camera, zoom in/out, or do your own transition.",
    examples: [
      "I'm Vanessa, and I'm building the room.",
      "I'm Ronnie, and I bring the sweet touch.",
      "I'm Sholanda, and somebody had to say it.",
      "I'm Elaine, and my face says enough.",
      "I'm Latasha, and I'm the wild card.",
      "I'm Maria, and I bring the fresh energy.",
    ],
    makeItYours: "Say your name, your vibe, or why people need to watch you. Add your own attitude, humor, face, pose, line, or little moment. This is not a script — bring your own timing, face, attitude, or twist.",
    transitions: [
      "Step toward the camera",
      "Cover the camera with your hand",
      "Cover the camera with a tumbler or phone",
      "Zoom into your face",
      "Start close-up, then step back",
      "Walk into frame",
      "Point at the camera",
      "Do your own transition",
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
    idea: "React to a red flag prompt — is it a red flag or real life?",
    vibe: "Quick, honest, funny. Your gut reaction is the point.",
    whatToDrop: "Your reaction — say if it's a red flag or real life, and why.",
    easyWay: "Just hit record and react. Don't think too hard about it.",
    examples: [
      "That's a red flag — run.",
      "That's real life, that happens every day.",
      "Red flag? That's a whole red billboard.",
      "Okay that's real but it's still a red flag.",
    ],
    makeItYours: "Use your own words, your own face, your own reaction. The examples are just a starting point if you're stuck.",
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
    idea: "We give you two options. Pick one and tell us why.",
    vibe: "Fast, fun, no overthinking. Pick and go.",
    whatToDrop: "Your pick + a quick reason. 10-15 seconds.",
    easyWay: "Just say which one and why. That's it.",
    examples: [
      "That one, easy.",
      "Neither — I'm picking my own.",
      "Okay but why would anyone pick that one?",
      "Both. I'm chaotic like that.",
    ],
    makeItYours: "Your personality is the point. Don't try to match everybody — sound like you.",
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
    idea: "We show you something. You react with your face only — no talking.",
    vibe: "Raw, real, unfiltered. Your face does all the work.",
    whatToDrop: "Your reaction face. That's it. No words needed.",
    easyWay: "Just look at the camera and react. Don't perform — just feel it.",
    makeItYours: "There's no script here. Your face is the content. Whatever you feel, show it.",
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
    idea: "Give us your hottest take about living in Arizona.",
    vibe: "Bold, unfiltered, a little chaotic. No hedging.",
    whatToDrop: "One sentence, strong opinion. 10-20 seconds.",
    easyWay: "Just hit record and say the first thing that comes to mind.",
    examples: [
      "Phoenix summers aren't that bad — it's a dry heat.",
      "Nobody actually knows how to use the roundabouts.",
      "Monsoon season is the only good thing about Arizona.",
      "The 17 should be illegal on a Friday.",
    ],
    makeItYours: "Your take, your words. The hotter the better. Don't hold back — we're looking for real, not safe.",
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
    idea: "We give you a 'who's most likely to' prompt. Say who in the crew fits it.",
    vibe: "Funny, honest, a little messy. Don't hold back — we're all friends here.",
    whatToDrop: "Your pick + a quick reason. 15-20 seconds.",
    easyWay: "Just say the first name that comes to mind and why.",
    examples: [
      "Oh that's Sholanda, easy.",
      "All of us but mostly Latasha.",
      "I'm not naming names but... Ronnie.",
      "Me. It's me. I'm the one.",
    ],
    makeItYours: "Call people out with love. Your honest answer is the funny one. Use the examples only if you're stuck.",
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
 * Get a personalized example for a crew member.
 * Tries to find an example that mentions this person's first name.
 */
export function getExampleFor(template: QuickDropTemplate, memberName?: string): string | null {
  if (!template.examples || template.examples.length === 0) return null;
  if (!memberName) return template.examples[0];

  const firstName = memberName.split(" ")[0];
  const match = template.examples.find((line) =>
    line.toLowerCase().includes(firstName.toLowerCase())
  );
  return match ?? template.examples[0];
}
