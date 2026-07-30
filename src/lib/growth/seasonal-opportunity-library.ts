/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 7: Seasonal Opportunity Library
 *
 * Purpose:
 *   Maps the recurring seasonal moments that matter to our audience so we
 *   can plan content ahead of time instead of scrambling when a holiday
 *   arrives. Each season has its own emotional weight and conversation
 *   surface, especially in Arizona where the calendar hits differently.
 *
 *   Plan early. Post intentionally. Never let a season sneak up on us.
 */

export type Season =
  | "Arizona Summer"
  | "Back to School"
  | "Holidays"
  | "New Year"
  | "Valentine's Day"
  | "Mother's Day"
  | "Spring";

export interface SeasonalOpportunity {
  id: string;
  season: Season;
  opportunity: string;
  /** Concrete prompt ideas to build content around */
  promptIdeas: string[];
  /** Content formats that pair best with this opportunity */
  bestFormats: string[];
  /** When to start posting and what to watch for */
  timingNotes: string;
}

export const SEASONS: Season[] = [
  "Arizona Summer",
  "Back to School",
  "Holidays",
  "New Year",
  "Valentine's Day",
  "Mother's Day",
  "Spring",
];

export const SEASONAL_OPPORTUNITIES: SeasonalOpportunity[] = [
  // ===== ARIZONA SUMMER =====
  {
    id: "so_as_01",
    season: "Arizona Summer",
    opportunity: "Surviving the heat as a mom",
    promptIdeas: [
      "What does an Arizona summer look like with kids?",
      "What's your 115 degree survival hack?",
      "Indoor activities that actually keep kids sane",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Start posting late May. Peak engagement June through August",
  },
  {
    id: "so_as_02",
    season: "Arizona Summer",
    opportunity: "Beauty and hair in extreme heat",
    promptIdeas: [
      "What happens to your hair in an Arizona summer?",
      "Desert skincare routine that actually works",
      "Makeup that survives a Phoenix parking lot",
    ],
    bestFormats: ["Real Quick", "One-Line Verdict"],
    timingNotes: "Evergreen through summer. Spike during first heatwave",
  },
  {
    id: "so_as_03",
    season: "Arizona Summer",
    opportunity: "The emotional weight of being stuck inside",
    promptIdeas: [
      "What does cabin fever look like in Arizona summer?",
      "How do you protect your peace when you can't go outside?",
      "What does isolation do to your friendships?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Mid-summer when the heat fatigue is real. July is peak",
  },

  // ===== BACK TO SCHOOL =====
  {
    id: "so_bs_01",
    season: "Back to School",
    opportunity: "Mom emotions when school starts",
    promptIdeas: [
      "What no one tells you about the first day of school",
      "What does back to school really feel like as a mom?",
      "The mom cry you didn't expect on the first day",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Start late July. Peak the first two weeks of August in Arizona",
  },
  {
    id: "so_bs_02",
    season: "Back to School",
    opportunity: "Friendship shifts when kids change schools",
    promptIdeas: [
      "What happens to mom friendships when your kids change schools?",
      "How do you help your kid navigate a new friend group?",
      "When did you realize your mom friend circle changed?",
    ],
    bestFormats: ["Real Quick", "Friend or Follower?"],
    timingNotes: "August through September. Strong through first month of school",
  },

  // ===== HOLIDAYS =====
  {
    id: "so_h_01",
    season: "Holidays",
    opportunity: "Family expectations and boundaries",
    promptIdeas: [
      "What's a holiday boundary you had to set with family?",
      "How do you handle the in-law pressure during the holidays?",
      "What holiday tradition did you stop pretending to enjoy?",
    ],
    bestFormats: ["One-Line Verdict", "Different Women Different Answer", "Be the Bigger Person Court"],
    timingNotes: "Start mid-November. Peak engagement through December",
  },
  {
    id: "so_h_02",
    season: "Holidays",
    opportunity: "The mental load of holiday magic",
    promptIdeas: [
      "Who actually carries the holiday mental load in your family?",
      "What does holiday burnout look like for moms?",
      "What did you stop doing to protect your peace during the holidays?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Early December. Hits hardest the second week when pressure peaks",
  },
  {
    id: "so_h_03",
    season: "Holidays",
    opportunity: "Grief and loneliness during the holidays",
    promptIdeas: [
      "How do you handle the holidays when you're grieving?",
      "What do you wish people understood about holiday loneliness?",
      "What helped you get through a holiday without someone?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Handle with care. Late November through December. Keep tone gentle",
  },

  // ===== NEW YEAR =====
  {
    id: "so_ny_01",
    season: "New Year",
    opportunity: "Realistic reset instead of resolutions",
    promptIdeas: [
      "What's a resolution you stopped making and why?",
      "What does a realistic January reset look like for you?",
      "What did you let go of last year that changed everything?",
    ],
    bestFormats: ["Real Quick", "One-Line Verdict", "Different Women Different Answer"],
    timingNotes: "Post December 26 through mid-January. First week of January is peak",
  },
  {
    id: "so_ny_02",
    season: "New Year",
    opportunity: "Friendship and relationship audits",
    promptIdeas: [
      "Who did you realize wasn't your friend this year?",
      "What relationship did you reevaluate entering the new year?",
      "What boundary are you carrying into January?",
    ],
    bestFormats: ["Friend or Follower?", "One-Line Verdict"],
    timingNotes: "First two weeks of January. People are reflective and ready to cut",
  },

  // ===== VALENTINE'S DAY =====
  {
    id: "so_v_01",
    season: "Valentine's Day",
    opportunity: "Love beyond romance",
    promptIdeas: [
      "What does Valentine's Day look like when you're single and happy?",
      "How do you celebrate friendship on Valentine's Day?",
      "What's the best love you've ever received that wasn't romantic?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Start early February. Peak February 10-14",
  },
  {
    id: "so_v_02",
    season: "Valentine's Day",
    opportunity: "Dating expectations vs reality",
    promptIdeas: [
      "What's a Valentine's Day expectation that ruins the day?",
      "What's the worst Valentine's Day date you've had?",
      "What does a good Valentine's Day actually look like?",
    ],
    bestFormats: ["One-Line Verdict", "Different Women Different Answer"],
    timingNotes: "Week before Valentine's Day. Strong engagement on February 13-14",
  },

  // ===== MOTHER'S DAY =====
  {
    id: "so_md_01",
    season: "Mother's Day",
    opportunity: "What moms actually want",
    promptIdeas: [
      "What do moms actually want on Mother's Day?",
      "What's the Mother's Day gift that meant the most to you?",
      "What does Mother's Day feel like when you've lost your mom?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Start first week of May. Peak May 8-12",
  },
  {
    id: "so_md_02",
    season: "Mother's Day",
    opportunity: "The complexity of motherhood",
    promptIdeas: [
      "What did motherhood give you that no one talks about?",
      "What did you lose when you became a mom?",
      "What does Mother's Day feel like when motherhood is hard?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "Week before Mother's Day. Keep tone honest and tender",
  },

  // ===== SPRING =====
  {
    id: "so_sp_01",
    season: "Spring",
    opportunity: "Spring energy and fresh starts",
    promptIdeas: [
      "What does spring mean to you in Arizona?",
      "What's something you're starting fresh this spring?",
      "How does the weather change shift your mood and friendships?",
    ],
    bestFormats: ["Real Quick", "Different Women Different Answer"],
    timingNotes: "March through April. Arizona spring is short so post early",
  },
  {
    id: "so_sp_02",
    season: "Spring",
    opportunity: "Spring break reality for moms",
    promptIdeas: [
      "What does spring break actually look like with kids?",
      "What's your spring break survival strategy?",
      "Spring break with kids vs without kids. What changed?",
    ],
    bestFormats: ["Real Quick", "One-Line Verdict"],
    timingNotes: "Mid-March. Align with Arizona school spring break schedules",
  },
];

/**
 * Returns all opportunities for a given season.
 */
export function getOpportunitiesBySeason(season: Season): SeasonalOpportunity[] {
  return SEASONAL_OPPORTUNITIES.filter((o) => o.season === season);
}
