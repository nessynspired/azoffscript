/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 8: Do Not Chase Rules
 *
 * Purpose:
 *   The guardrails that protect the brand from chasing growth that would
 *   cost us our identity. Every rule here is something the algorithm
 *   rewards but that would dilute, distract, or kill what makes AZ Off
 *   Script different.
 *
 *   Growth is only worth it if we grow as ourselves. These rules keep us
 *   honest when the temptation to chase shows up.
 */

export type DoNotChaseSeverity = "Brand Killer" | "Brand Diluter" | "Brand Distractor";

export interface DoNotChaseRule {
  id: string;
  category: string;
  /** What we refuse to do */
  refuse: string;
  /** Why it would damage the brand */
  why: string;
  /** What we do instead */
  doInstead: string;
  /** Specific behaviors to watch for and avoid */
  behaviors: string[];
  severity: DoNotChaseSeverity;
}

export const SEVERITY_COLORS: Record<DoNotChaseSeverity, string> = {
  "Brand Killer": "🔴",
  "Brand Diluter": "🟠",
  "Brand Distractor": "🟡",
};

export const DO_NOT_CHASE_RULES: DoNotChaseRule[] = [
  {
    id: "dnc_01",
    category: "Generic Motivation",
    refuse: "Generic motivational content with no point of view",
    why: "It is interchangeable with thousands of pages and gives people no reason to remember us",
    doInstead: "Share specific, honest takeaways from real conversations and real women",
    behaviors: [
      "Posting quotes on aesthetic backgrounds",
      "Saying 'you got this' without context",
      "Vague affirmations with no story behind them",
    ],
    severity: "Brand Killer",
  },
  {
    id: "dnc_02",
    category: "Fake Conflict",
    refuse: "Manufactured drama or fake conflict for engagement",
    why: "Audiences can smell staged conflict and it destroys trust permanently",
    doInstead: "Surface real disagreements from real conversations and let the tension be honest",
    behaviors: [
      "Staging arguments between crew members",
      "Writing scripted confrontations",
      "Baiting controversial opinions we don't actually hold",
    ],
    severity: "Brand Killer",
  },
  {
    id: "dnc_03",
    category: "Every Viral Sound",
    refuse: "Jumping on every viral sound without a reason",
    why: "Sound-first content without substance makes us a trend page, not a brand",
    doInstead: "Only use a sound when it serves the conversation we are actually having",
    behaviors: [
      "Using trending audio just because it is trending",
      "Forcing our content to fit a sound instead of the reverse",
      "Posting sound-based content with no message",
    ],
    severity: "Brand Diluter",
  },
  {
    id: "dnc_04",
    category: "Overproduced Influencer Style",
    refuse: "Overproduced, glossy influencer-style content",
    why: "Polish kills the feeling of authenticity that makes people trust us",
    doInstead: "Keep production simple and let the conversation be the star",
    behaviors: [
      "Heavy filters and color grading",
      "Overly scripted monologues",
      "Studio lighting that looks like a commercial",
    ],
    severity: "Brand Diluter",
  },
  {
    id: "dnc_05",
    category: "Random Dance Page",
    refuse: "Becoming a dance or lip-sync page",
    why: "It has nothing to do with our mission and attracts the wrong audience entirely",
    doInstead: "If we move, it is because the moment calls for it, not because the trend does",
    behaviors: [
      "Learning choreography for views",
      "Lip-syncing without adding a point of view",
      "Posting dance content with no connection to our topics",
    ],
    severity: "Brand Distractor",
  },
  {
    id: "dnc_06",
    category: "Copy Influencer Page",
    refuse: "Copying the format and style of established influencers",
    why: "We become a worse version of someone else instead of the best version of ourselves",
    doInstead: "Study what works, extract the principle, and build it in our own voice",
    behaviors: [
      "Copying someone's exact video structure",
      "Mimicking another creator's delivery style",
      "Using their catchphrases or signature language",
    ],
    severity: "Brand Killer",
  },
  {
    id: "dnc_07",
    category: "Follow-for-Follow",
    refuse: "Follow-for-follow and engagement pod tactics",
    why: "It inflates numbers with people who do not care and kills our reach to real fans",
    doInstead: "Grow organically by making content worth following for the right people",
    behaviors: [
      "Following people just to get a follow back",
      "Joining engagement pods for fake comments",
      "Trading likes and saves in groups",
    ],
    severity: "Brand Diluter",
  },
  {
    id: "dnc_08",
    category: "Scripted Personalities",
    refuse: "Scripting the crew's personalities and reactions",
    why: "People connect with real humans, not characters playing a role",
    doInstead: "Let the crew be themselves. Capture real reactions, do not manufacture them",
    behaviors: [
      "Telling crew members what to say before filming",
      "Rehearsing spontaneous-looking moments",
      "Editing out personality to fit a formula",
    ],
    severity: "Brand Killer",
  },
  {
    id: "dnc_09",
    category: "Unrealistic Perfection",
    refuse: "Portraying unrealistic perfection in any area of life",
    why: "It breaks the core promise of AZ Off Script, which is real life without the script",
    doInstead: "Show the mess, the doubt, the imperfect. That is what makes us trustworthy",
    behaviors: [
      "Only showing the good parts of motherhood",
      "Pretending relationships are always easy",
      "Hiding the struggle behind a curated aesthetic",
    ],
    severity: "Brand Killer",
  },
  {
    id: "dnc_10",
    category: "Trend Chasing Without Purpose",
    refuse: "Chasing trends without connecting them to our mission",
    why: "Purposeless trends train the audience to expect noise instead of meaning",
    doInstead: "Only adapt a trend if it serves a real conversation we are already having",
    behaviors: [
      "Posting a trend because everyone else is",
      "No connection between the trend and our content pillars",
      "Trend content that could be from any page",
    ],
    severity: "Brand Distractor",
  },
  {
    id: "dnc_11",
    category: "Engagement Bait",
    refuse: "Engagement bait questions with no real conversation",
    why: "It trains people to comment for the algorithm, not because they actually care",
    doInstead: "Ask questions we genuinely want answered and engage with the responses for real",
    behaviors: [
      "Comment 'first' or drop an emoji to bait engagement",
      "Asking provocative questions we don't actually care about",
      "Controversial hot takes designed only to start arguments",
    ],
    severity: "Brand Diluter",
  },
  {
    id: "dnc_12",
    category: "Negativity as a Brand",
    refuse: "Building the brand on negativity and complaining",
    why: "Venting without insight becomes exhausting and repels the community we want to build",
    doInstead: "Surface real frustrations but always pair them with perspective or a real takeaway",
    behaviors: [
      "Complaining with no point",
      "Tearing people down for views",
      "Rant content that leaves people feeling worse",
    ],
    severity: "Brand Distractor",
  },
];

/**
 * Returns all rules matching a given severity level.
 */
export function getRulesBySeverity(severity: DoNotChaseSeverity): DoNotChaseRule[] {
  return DO_NOT_CHASE_RULES.filter((r) => r.severity === severity);
}
