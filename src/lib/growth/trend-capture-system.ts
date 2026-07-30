/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 6: Trend Capture System
 *
 * Purpose:
 *   A living log of trends we encounter, why they work, and how AZ Off Script
 *   can adapt them without losing our identity. Every trend gets a decision:
 *   Keep, Modify, or Ignore. This keeps us intentional instead of reactive.
 *
 *   We don't chase trends. We study them, decide, and adapt on our terms.
 */

export type TrendType = "Format" | "Topic" | "Sound" | "Phrase" | "Hook";

export type TrendStage = "Rising" | "Peaking" | "Fading" | "Watch";

export type TrendDecision = "Keep" | "Modify" | "Ignore";

export interface TrendCaptureEntry {
  id: string;
  name: string;
  type: TrendType;
  stage: TrendStage;
  decision: TrendDecision;
  /** ISO date string for when the trend was found */
  dateFound: string;
  /** Why the trend is psychologically effective */
  whyItWorks: string;
  /** What makes people stop and watch */
  whyPeopleWatch: string;
  /** How AZ Off Script can adapt this without losing identity */
  azOffScriptAdaptation: string;
  /** Content formats that pair well with this trend */
  bestFormats: string[];
}

export const STAGE_COLORS: Record<TrendStage, string> = {
  Rising: "📈",
  Peaking: "🔥",
  Fading: "📉",
  Watch: "👀",
};

export const DECISION_COLORS: Record<TrendDecision, string> = {
  Keep: "✅",
  Modify: "🔧",
  Ignore: "🚫",
};

export const TREND_CAPTURES: TrendCaptureEntry[] = [
  {
    id: "tc_01",
    name: "POV: you're the friend everyone vents to",
    type: "Hook",
    stage: "Peaking",
    decision: "Keep",
    dateFound: "2025-01-15",
    whyItWorks: "Relatable identity framing makes the viewer feel seen immediately",
    whyPeopleWatch: "They want to know if they are that friend or if someone sees them that way",
    azOffScriptAdaptation: "Use as a cold open for Real Quick or Different Women Different Answer",
    bestFormats: ["Real Quick", "Different Women Different Answer"],
  },
  {
    id: "tc_02",
    name: "Storytime: the group chat went too far",
    type: "Format",
    stage: "Rising",
    decision: "Modify",
    dateFound: "2025-02-03",
    whyItWorks: "Curiosity gap plus social drama creates a compelling narrative",
    whyPeopleWatch: "They want the details and to judge whether it actually went too far",
    azOffScriptAdaptation: "Replace gossip angle with a real conversation about boundaries",
    bestFormats: ["Group Chat Court", "Be the Bigger Person Court"],
  },
  {
    id: "tc_03",
    name: "Tell me without telling me",
    type: "Phrase",
    stage: "Fading",
    decision: "Ignore",
    dateFound: "2024-09-10",
    whyItWorks: "Interactive prompt that invites participation",
    whyPeopleWatch: "They want to play along in the comments",
    azOffScriptAdaptation: "Too saturated. We have our own signature prompts that do this better",
    bestFormats: [],
  },
  {
    id: "tc_04",
    name: "She said / he heard split screen",
    type: "Format",
    stage: "Rising",
    decision: "Keep",
    dateFound: "2025-02-20",
    whyItWorks: "Two perspectives in one frame creates instant tension and empathy",
    whyPeopleWatch: "They want to see the gap between intention and impact",
    azOffScriptAdaptation: "Already aligns with our He Said / She Heard format. Lean in harder",
    bestFormats: ["He Said / She Heard"],
  },
  {
    id: "tc_05",
    name: "Arizona summer survival check-in",
    type: "Topic",
    stage: "Watch",
    decision: "Modify",
    dateFound: "2025-03-01",
    whyItWorks: "Seasonal relevance plus local identity creates community bonding",
    whyPeopleWatch: "They want to feel less alone in the misery of 115 degree days",
    azOffScriptAdaptation: "Tie into women's routines, beauty struggles, and mom survival mode",
    bestFormats: ["Real Quick", "One-Line Verdict"],
  },
  {
    id: "tc_06",
    name: "Romanticize your boring life",
    type: "Topic",
    stage: "Peaking",
    decision: "Modify",
    dateFound: "2025-01-28",
    whyItWorks: "Reframes mundane reality as something worth appreciating",
    whyPeopleWatch: "They want permission to love their ordinary life",
    azOffScriptAdaptation: "Shift to romanticize your real life, not aesthetic perfection",
    bestFormats: ["Real Quick", "Different Women Different Answer"],
  },
  {
    id: "tc_07",
    name: "Low voice trending audio",
    type: "Sound",
    stage: "Peaking",
    decision: "Modify",
    dateFound: "2025-02-12",
    whyItWorks: "Intimate audio tone creates a confessional feeling",
    whyPeopleWatch: "It feels like someone is telling them a secret",
    azOffScriptAdaptation: "Use sparingly for Real Quick. Never let the sound replace the substance",
    bestFormats: ["Real Quick"],
  },
  {
    id: "tc_08",
    name: "Rate this red flag 1-10",
    type: "Hook",
    stage: "Rising",
    decision: "Keep",
    dateFound: "2025-02-25",
    whyItWorks: "Gamifies relationship advice and invites instant participation",
    whyPeopleWatch: "They want to vote and see if others agree with their rating",
    azOffScriptAdaptation: "Use with Red Flag, Real Life, or Just Tired format",
    bestFormats: ["Red Flag, Real Life, or Just Tired?", "One-Line Verdict"],
  },
  {
    id: "tc_09",
    name: "Girl dinner / girl math spinoffs",
    type: "Phrase",
    stage: "Fading",
    decision: "Ignore",
    dateFound: "2024-08-15",
    whyItWorks: "Humor through relatable categorization of everyday behavior",
    whyPeopleWatch: "They want to recognize themselves in the joke",
    azOffScriptAdaptation: "Saturated and brand-diluting. We build our own signature language instead",
    bestFormats: [],
  },
  {
    id: "tc_10",
    name: "Day in my life but honest",
    type: "Format",
    stage: "Rising",
    decision: "Keep",
    dateFound: "2025-03-05",
    whyItWorks: "Anti-aesthetic authenticity cuts through polished content",
    whyPeopleWatch: "They are tired of fake perfect and want the real version",
    azOffScriptAdaptation: "Perfect fit for our brand. Show the messy, the tired, the unfiltered",
    bestFormats: ["Real Quick", "Different Women Different Answer"],
  },
  {
    id: "tc_11",
    name: "Who would win in a breakup",
    type: "Topic",
    stage: "Watch",
    decision: "Modify",
    dateFound: "2025-03-10",
    whyItWorks: "Competitive framing turns relationship reflection into entertainment",
    whyPeopleWatch: "They want to take a side and defend it",
    azOffScriptAdaptation: "Reframe as who handled the breakup better, not who won. Keep it real",
    bestFormats: ["One-Line Verdict", "Different Women Different Answer"],
  },
  {
    id: "tc_12",
    name: "Stitch this with your honest take",
    type: "Hook",
    stage: "Rising",
    decision: "Keep",
    dateFound: "2025-03-12",
    whyItWorks: "Direct invitation to respond turns viewers into participants",
    whyPeopleWatch: "They want to share their own perspective and be part of the conversation",
    azOffScriptAdaptation: "Use at the end of opinion prompts to drive community engagement",
    bestFormats: ["Different Women Different Answer", "Real Quick"],
  },
  {
    id: "tc_13",
    name: "Soft launch vs hard launch",
    type: "Topic",
    stage: "Peaking",
    decision: "Modify",
    dateFound: "2025-02-18",
    whyItWorks: "Categorizes dating behavior in a way everyone has an opinion on",
    whyPeopleWatch: "They want to judge and compare their own approach",
    azOffScriptAdaptation: "Ask women what they actually prefer and why. Avoid the influencer gloss",
    bestFormats: ["One-Line Verdict", "Different Women Different Answer"],
  },
];

/**
 * Returns all trends currently at a given stage.
 */
export function getTrendsByStage(stage: TrendStage): TrendCaptureEntry[] {
  return TREND_CAPTURES.filter((t) => t.stage === stage);
}

/**
 * Returns all trends matching a given decision.
 */
export function getTrendsByDecision(decision: TrendDecision): TrendCaptureEntry[] {
  return TREND_CAPTURES.filter((t) => t.decision === decision);
}
