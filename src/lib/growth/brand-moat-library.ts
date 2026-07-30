/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 9: Brand Moat Library
 *
 * Purpose:
 *   Answers the question: why should someone choose AZ Off Script instead
 *   of the thousands of other pages? A brand moat is the thing competitors
 *   cannot easily copy. This library names each moat, explains why it is
 *   defensible, and documents how we protect it.
 *
 *   If we cannot articulate why we are different, the audience cannot
 *   either. This library keeps our advantage visible and intentional.
 */

export type MoatType =
  | "Format"
  | "Personality Structure"
  | "Community Feeling"
  | "Recurring Segments"
  | "Signature Language"
  | "Recognizable Patterns"
  | "Local Identity"
  | "Crew Dynamic";

export interface BrandMoat {
  id: string;
  moatType: MoatType;
  name: string;
  /** What the moat actually is */
  whatItIs: string;
  /** Why competitors cannot replicate it */
  whyNoOneCanCopyIt: string;
  /** How we actively defend and reinforce it */
  howWeProtectIt: string;
  /** Concrete examples of the moat in action */
  examples: string[];
}

export const MOAT_TYPES: MoatType[] = [
  "Format",
  "Personality Structure",
  "Community Feeling",
  "Recurring Segments",
  "Signature Language",
  "Recognizable Patterns",
  "Local Identity",
  "Crew Dynamic",
];

export const MOAT_TYPE_COLORS: Record<MoatType, string> = {
  Format: "🎬",
  "Personality Structure": "🧠",
  "Community Feeling": "🤝",
  "Recurring Segments": "🔁",
  "Signature Language": "💬",
  "Recognizable Patterns": "👁️",
  "Local Identity": "🌵",
  "Crew Dynamic": "👥",
};

export const BRAND_MOATS: BrandMoat[] = [
  {
    id: "bm_01",
    moatType: "Format",
    name: "Different Women Different Answer",
    whatItIs: "A signature format where multiple women answer the same question, revealing how different real perspectives can be",
    whyNoOneCanCopyIt: "It requires a real crew of distinct personalities, not actors. The diversity of thought is genuine and cannot be scripted",
    howWeProtectIt: "Never let the answers converge into a single narrative. Protect the disagreement. Keep the crew diverse in age, background, and viewpoint",
    examples: [
      "Same question, five women, five completely different answers",
      "The answer that surprises everyone becomes the hook",
      "Disagreement is the point, not the problem",
    ],
  },
  {
    id: "bm_02",
    moatType: "Format",
    name: "One-Line Verdict",
    whatItIs: "A format built around a single, sharp, honest verdict that cuts through overthinking",
    whyNoOneCanCopyIt: "It requires a specific voice and point of view. A copied one-liner feels hollow because it lacks the personality behind it",
    howWeProtectIt: "Keep every verdict earned. Never force a punchline. The line must come from a real opinion, not a desire to go viral",
    examples: [
      "Is it a red flag? One woman. One line. No hedging.",
      "The verdict lands because it is specific, not generic",
      "No explanation needed. The line is the content.",
    ],
  },
  {
    id: "bm_03",
    moatType: "Personality Structure",
    name: "Real Crew, Real Personalities",
    whatItIs: "A recurring crew of real women with distinct, consistent personalities the audience comes to know and care about",
    whyNoOneCanCopyIt: "You cannot manufacture the chemistry and trust of a real group. Casting actors produces a flat imitation",
    howWeProtectIt: "Let personalities evolve naturally. Never script who they are. Protect their individuality even when one personality gets more engagement",
    examples: [
      "The audience has a favorite and that is the point",
      "People come back to see what so-and-so will say",
      "Each crew member has a recognizable angle on every topic",
    ],
  },
  {
    id: "bm_04",
    moatType: "Community Feeling",
    name: "Conversations, Not Content",
    whatItIs: "The audience feels like they are part of a conversation, not consumers of content. We talk with them, not at them",
    whyNoOneCanCopyIt: "It is built through consistent two-way engagement and genuine care, not a tactic you can switch on",
    howWeProtectIt: "Respond to comments for real. Feature audience answers. Never let the community feel like a metric",
    examples: [
      "Comment responses that continue the conversation",
      "Audience answers featured in follow-up content",
      "The comment section feels like a group chat",
    ],
  },
  {
    id: "bm_05",
    moatType: "Recurring Segments",
    name: "Courtroom Formats",
    whatItIs: "Recurring segment formats like Group Chat Court and Be the Bigger Person Court that frame real dilemmas as a judgment call",
    whyNoOneCanCopyIt: "The format only works because of the crew dynamic and the specific voices inside it. The structure is simple but the execution is not",
    howWeProtectIt: "Keep the format rules consistent. Do not overuse any single court. Let the cases come from real life, not manufactured drama",
    examples: [
      "Group Chat Court: real text exchange, real verdict",
      "Be the Bigger Person Court: when is enough enough?",
      "The audience votes and the crew deliberates",
    ],
  },
  {
    id: "bm_06",
    moatType: "Signature Language",
    name: "Off Script Vocabulary",
    whatItIs: "A set of phrases and terms unique to AZ Off Script that the audience begins to recognize and use themselves",
    whyNoOneCanCopyIt: "Signature language emerges from a specific voice and community. When others copy it, it sounds borrowed",
    howWeProtectIt: "Use our language consistently. Do not borrow other pages' catchphrases. Let new phrases emerge naturally from real moments",
    examples: [
      "Off Script as a mindset, not just a name",
      "Real Quick as a recognizable segment call-out",
      "Phrases the audience starts using in the comments",
    ],
  },
  {
    id: "bm_07",
    moatType: "Recognizable Patterns",
    name: "Consistent Visual and Tonal Identity",
    whatItIs: "A recognizable look and feel across every piece of content so people know it is us before they read the name",
    whyNoOneCanCopyIt: "Consistency over time builds pattern recognition. A new page cannot shortcut months of visual repetition",
    howWeProtectIt: "Hold the line on visual and tonal standards. Do not chase a new aesthetic every month. Protect the recognizable feel",
    examples: [
      "You know it is AZ Off Script within the first second",
      "The tone is consistent even when the topic shifts",
      "The look is simple, intentional, and ours",
    ],
  },
  {
    id: "bm_08",
    moatType: "Local Identity",
    name: "Arizona as a Character",
    whatItIs: "Arizona is not a backdrop. It is a character in the content. The heat, the desert, the Valley, the lifestyle all shape the conversation",
    whyNoOneCanCopyIt: "Authentic local identity cannot be faked from outside. National pages cannot replicate what it feels like to live here",
    howWeProtectIt: "Keep Arizona specific. Do not generalize to appeal broadly. The local specificity is what makes us stand out nationally",
    examples: [
      "Arizona summer as a recurring character",
      "West Valley and Buckeye as real settings, not props",
      "The desert life perspective on universal topics",
    ],
  },
  {
    id: "bm_09",
    moatType: "Crew Dynamic",
    name: "The Crew Energy",
    whatItIs: "The way the crew interacts, disagrees, and supports each other is itself the content. The dynamic is the draw",
    whyNoOneCanCopyIt: "Real group chemistry is rare and unscriptable. It is built through time, trust, and shared experience",
    howWeProtectIt: "Protect the relationships behind the camera. Never force conflict between crew members. Let the dynamic breathe",
    examples: [
      "The way they react to each other is the hook",
      "Disagreement without disrespect is the signature",
      "The audience feels like they know the crew personally",
    ],
  },
  {
    id: "bm_10",
    moatType: "Recurring Segments",
    name: "He Said / She Heard",
    whatItIs: "A recurring segment that explores the gap between what was said and what was heard in relationships",
    whyNoOneCanCopyIt: "It requires honest vulnerability from real people, not performers. The gap is only compelling when it is genuine",
    howWeProtectIt: "Keep it honest. Never stage the misunderstandings. Protect the vulnerability of the people sharing",
    examples: [
      "He said one thing. She heard another. Both are real.",
      "The gap is where the conversation actually lives",
      "No villain, no winner. Just the misunderstanding.",
    ],
  },
];

/**
 * Returns all brand moats of a given type.
 */
export function getMoatsByType(moatType: MoatType): BrandMoat[] {
  return BRAND_MOATS.filter((m) => m.moatType === moatType);
}
