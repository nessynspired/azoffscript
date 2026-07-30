/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 4: Content Prompt Intelligence Library
 *
 * Purpose:
 *   The massive idea engine. Organized by category.
 *   This will eventually contain hundreds of prompts per category.
 *
 *   This is the living engine that keeps the content machine
 *   from running out of ideas.
 */

export type PromptCategory =
  | "Women"
  | "Men"
  | "Dating"
  | "Friendship"
  | "Arizona"
  | "Parenting"
  | "Adulting"
  | "Deep Conversations"
  | "Texting"
  | "Family"
  | "Beauty / Style"
  | "Public Behavior"
  | "Cultural"
  | "Work / Money";

export type PromptType = "Evergreen" | "Seasonal" | "Trending" | "Community";

export interface GrowthPrompt {
  id: string;
  text: string;
  category: PromptCategory;
  type: PromptType;
  /** Content formats this prompt works best with */
  worksBestWith: string[];
  /** Sub-topic within the category */
  subTopic: string;
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Women", "Men", "Dating", "Friendship", "Arizona", "Parenting",
  "Adulting", "Deep Conversations", "Texting", "Family",
  "Beauty / Style", "Public Behavior", "Cultural", "Work / Money",
];

export const PROMPT_TYPES: PromptType[] = ["Evergreen", "Seasonal", "Trending", "Community"];

export const TYPE_COLORS: Record<PromptType, string> = {
  Evergreen: "🌿",
  Seasonal: "📅",
  Trending: "🔥",
  Community: "💬",
};

export const PROMPTS: GrowthPrompt[] = [
  // ===== WOMEN =====
  // Expectations
  { id: "gp_w_01", text: "What is something women are expected to tolerate but shouldn't?", category: "Women", subTopic: "Expectations", type: "Evergreen", worksBestWith: ["Different Women Different Answer", "Real Quick"] },
  { id: "gp_w_02", text: "What's a 'women's issue' that men should care about more?", category: "Women", subTopic: "Expectations", type: "Evergreen", worksBestWith: ["Different Women Different Answer"] },
  { id: "gp_w_03", text: "What do older women and younger women disagree on?", category: "Women", subTopic: "Generational", type: "Evergreen", worksBestWith: ["Different Women Different Answer"] },
  { id: "gp_w_04", text: "What's something women pretend to like but don't?", category: "Women", subTopic: "Expectations", type: "Evergreen", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "gp_w_05", text: "What's an expectation women are tired of explaining?", category: "Women", subTopic: "Expectations", type: "Evergreen", worksBestWith: ["Real Quick"] },
  // Identity
  { id: "gp_w_06", text: "What does being a woman mean to you?", category: "Women", subTopic: "Identity", type: "Evergreen", worksBestWith: ["Real Quick", "Different Women Different Answer"] },
  { id: "gp_w_07", text: "What's a part of your identity people don't see?", category: "Women", subTopic: "Identity", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_w_08", text: "What's something you used to apologize for that you don't anymore?", category: "Women", subTopic: "Identity", type: "Evergreen", worksBestWith: ["Real Quick", "One-Line Verdict"] },
  // Confidence
  { id: "gp_w_09", text: "What gave you confidence that nobody else would understand?", category: "Women", subTopic: "Confidence", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_w_10", text: "What's something you stopped doing to please others?", category: "Women", subTopic: "Confidence", type: "Evergreen", worksBestWith: ["Real Quick", "One-Line Verdict"] },
  // Aging
  { id: "gp_w_11", text: "What did you learn at 30 that you wish you knew at 20?", category: "Women", subTopic: "Aging", type: "Evergreen", worksBestWith: ["Real Quick", "Different Women Different Answer"] },
  { id: "gp_w_12", text: "What's something about aging nobody talks about?", category: "Women", subTopic: "Aging", type: "Evergreen", worksBestWith: ["Real Quick"] },
  // Motherhood
  { id: "gp_w_13", text: "What did motherhood change about you that nobody warned you about?", category: "Women", subTopic: "Motherhood", type: "Evergreen", worksBestWith: ["Real Quick", "Different Women Different Answer"] },
  { id: "gp_w_14", text: "What's something about being a woman and a mom that people don't get?", category: "Women", subTopic: "Motherhood", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== MEN =====
  { id: "gp_m_01", text: "What's something men say that they think means nothing?", category: "Men", subTopic: "Communication", type: "Evergreen", worksBestWith: ["He Said / She Heard", "Men Think This Means Nothing"] },
  { id: "gp_m_02", text: "What's a male expectation that's unfair?", category: "Men", subTopic: "Expectations", type: "Evergreen", worksBestWith: ["Different Women Different Answer"] },
  { id: "gp_m_03", text: "What do women misunderstand about men?", category: "Men", subTopic: "Communication", type: "Evergreen", worksBestWith: ["Different Women Different Answer"] },
  { id: "gp_m_04", text: "What's something men should hear more often?", category: "Men", subTopic: "Emotional", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_m_05", text: "What's a stereotype about men that's not fair?", category: "Men", subTopic: "Stereotypes", type: "Evergreen", worksBestWith: ["One-Line Verdict"] },

  // ===== DATING =====
  { id: "gp_d_01", text: "What's a red flag you ignored and regretted?", category: "Dating", subTopic: "Red Flags", type: "Evergreen", worksBestWith: ["Different Women Different Answer", "Red Flag, Real Life, or Just Tired?"] },
  { id: "gp_d_02", text: "What's a red flag everyone talks about that isn't actually a red flag?", category: "Dating", subTopic: "Red Flags", type: "Evergreen", worksBestWith: ["One-Line Verdict"] },
  { id: "gp_d_03", text: "What's a green flag people ignore?", category: "Dating", subTopic: "Green Flags", type: "Evergreen", worksBestWith: ["One-Line Verdict", "Real Quick"] },
  { id: "gp_d_04", text: "What's a dating rule you disagree with?", category: "Dating", subTopic: "Modern Dating", type: "Evergreen", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "gp_d_05", text: "What's the biggest dating ick?", category: "Dating", subTopic: "Attraction", type: "Evergreen", worksBestWith: ["One-Line Verdict", "Face-Only Reaction"] },
  { id: "gp_d_06", text: "He said 'I'm bad at texting.' What did you hear?", category: "Dating", subTopic: "Communication", type: "Evergreen", worksBestWith: ["He Said / She Heard"] },
  { id: "gp_d_07", text: "He said 'I don't like labels.' What did you hear?", category: "Dating", subTopic: "Communication", type: "Evergreen", worksBestWith: ["He Said / She Heard"] },
  { id: "gp_d_08", text: "'I'm sorry you felt that way.' Apology or excuse?", category: "Dating", subTopic: "Boundaries", type: "Evergreen", worksBestWith: ["Apology or Excuse?"] },
  { id: "gp_d_09", text: "What's a first date dealbreaker?", category: "Dating", subTopic: "First Dates", type: "Evergreen", worksBestWith: ["One-Line Verdict"] },
  { id: "gp_d_10", text: "What's something you learned about dating the hard way?", category: "Dating", subTopic: "Lessons", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== FRIENDSHIP =====
  { id: "gp_f_01", text: "What makes someone a real friend vs a follower?", category: "Friendship", subTopic: "Loyalty", type: "Evergreen", worksBestWith: ["Friend or Follower?"] },
  { id: "gp_f_02", text: "What's a friendship red flag?", category: "Friendship", subTopic: "Red Flags", type: "Evergreen", worksBestWith: ["One-Line Verdict", "Group Chat Court"] },
  { id: "gp_f_03", text: "What's a friendship green flag?", category: "Friendship", subTopic: "Green Flags", type: "Evergreen", worksBestWith: ["One-Line Verdict"] },
  { id: "gp_f_04", text: "When do you know a friendship has changed?", category: "Friendship", subTopic: "Growing Apart", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_f_05", text: "She watches every story but never checks on you. Friend or follower?", category: "Friendship", subTopic: "Loyalty", type: "Evergreen", worksBestWith: ["Friend or Follower?"] },
  { id: "gp_f_06", text: "Dating someone your friend talked to once. Girl code or just drama?", category: "Friendship", subTopic: "Girl Code", type: "Evergreen", worksBestWith: ["Girl Code or Just Drama?"] },
  { id: "gp_f_07", text: "They only call when they need something. Be the bigger person or finally stop?", category: "Friendship", subTopic: "Boundaries", type: "Evergreen", worksBestWith: ["Be the Bigger Person Court"] },
  { id: "gp_f_08", text: "What's a friendship rule nobody talks about?", category: "Friendship", subTopic: "Rules", type: "Evergreen", worksBestWith: ["Real Quick", "One-Line Verdict"] },
  { id: "gp_f_09", text: "What's the biggest friendship betrayal?", category: "Friendship", subTopic: "Betrayal", type: "Evergreen", worksBestWith: ["Group Chat Court"] },
  { id: "gp_f_10", text: "What's something about adult friendships nobody warns you about?", category: "Friendship", subTopic: "Adult Friendships", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== ARIZONA =====
  { id: "gp_a_01", text: "Arizona made me...", category: "Arizona", subTopic: "Habits", type: "Evergreen", worksBestWith: ["Arizona Made Me This Way"] },
  { id: "gp_a_02", text: "You know you live in Arizona when...", category: "Arizona", subTopic: "Local Life", type: "Evergreen", worksBestWith: ["Only Arizona People Understand"] },
  { id: "gp_a_03", text: "What's the most Arizona thing about you?", category: "Arizona", subTopic: "Identity", type: "Evergreen", worksBestWith: ["One-Line Verdict"] },
  { id: "gp_a_04", text: "Only Arizona people understand why...", category: "Arizona", subTopic: "Inside Jokes", type: "Evergreen", worksBestWith: ["Only Arizona People Understand"] },
  { id: "gp_a_05", text: "Arizona woman math: ...", category: "Arizona", subTopic: "Local Logic", type: "Evergreen", worksBestWith: ["Arizona Woman Math"] },
  { id: "gp_a_06", text: "What's an Arizona habit you can't shake?", category: "Arizona", subTopic: "Habits", type: "Evergreen", worksBestWith: ["Arizona Made Me This Way"] },
  { id: "gp_a_07", text: "Things only Arizona people understand in July.", category: "Arizona", subTopic: "Summer", type: "Seasonal", worksBestWith: ["Only Arizona People Understand"], },
  { id: "gp_a_08", text: "Signs you survived an Arizona summer.", category: "Arizona", subTopic: "Summer", type: "Seasonal", worksBestWith: ["Arizona Micro-Moment"] },

  // ===== PARENTING =====
  { id: "gp_p_01", text: "If I sit down for five minutes, that counts as rest.", category: "Parenting", subTopic: "Mom Math", type: "Evergreen", worksBestWith: ["Mom Math"] },
  { id: "gp_p_02", text: "If the kids ate fruit snacks, that was fruit.", category: "Parenting", subTopic: "Mom Math", type: "Evergreen", worksBestWith: ["Mom Math"] },
  { id: "gp_p_03", text: "Who makes the appointments?", category: "Parenting", subTopic: "Invisible Labor", type: "Evergreen", worksBestWith: ["Who Was Supposed to Do That?"] },
  { id: "gp_p_04", text: "Who knows the kids' shoe sizes?", category: "Parenting", subTopic: "Invisible Labor", type: "Evergreen", worksBestWith: ["Who Was Supposed to Do That?"] },
  { id: "gp_p_05", text: "What did nobody warn you about motherhood?", category: "Parenting", subTopic: "Struggles", type: "Evergreen", worksBestWith: ["Different Women Different Answer"] },
  { id: "gp_p_06", text: "What's a parenting choice people judge you for?", category: "Parenting", subTopic: "Judgment", type: "Evergreen", worksBestWith: ["Group Chat Court"] },
  { id: "gp_p_07", text: "What did your mom do that you swore you'd never do — but did?", category: "Parenting", subTopic: "Generational", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== ADULTING =====
  { id: "gp_ad_01", text: "A 45-minute meeting for one question. Can this be an email?", category: "Adulting", subTopic: "Work", type: "Evergreen", worksBestWith: ["Can This Be an Email?"] },
  { id: "gp_ad_02", text: "Rank these errands from worst to least worst.", category: "Adulting", subTopic: "Responsibilities", type: "Evergreen", worksBestWith: ["Errand Olympics"] },
  { id: "gp_ad_03", text: "A surprise phone call. Nervous system said no?", category: "Adulting", subTopic: "Overwhelm", type: "Evergreen", worksBestWith: ["My Nervous System Said No"] },
  { id: "gp_ad_04", text: "What's an adulting thing nobody teaches you?", category: "Adulting", subTopic: "Lessons", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_ad_05", text: "What's a money thing nobody talks about honestly?", category: "Adulting", subTopic: "Money", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== DEEP CONVERSATIONS =====
  { id: "gp_dc_01", text: "Real quick, I'm tired of explaining normal things.", category: "Deep Conversations", subTopic: "Growth", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_dc_02", text: "Real quick, being quiet does not mean I agree.", category: "Deep Conversations", subTopic: "Identity", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_dc_03", text: "What's a boundary you had to learn the hard way?", category: "Deep Conversations", subTopic: "Healing", type: "Evergreen", worksBestWith: ["Real Quick", "One-Line Verdict"] },
  { id: "gp_dc_04", text: "What's something you're tired of tolerating?", category: "Deep Conversations", subTopic: "Growth", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_dc_05", text: "What did you learn that nobody taught you?", category: "Deep Conversations", subTopic: "Life Lessons", type: "Evergreen", worksBestWith: ["Real Quick"] },
  { id: "gp_dc_06", text: "What's a part of yourself you're still making peace with?", category: "Deep Conversations", subTopic: "Healing", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== TEXTING =====
  { id: "gp_t_01", text: "'K.' What does it really mean?", category: "Texting", subTopic: "Translation", type: "Evergreen", worksBestWith: ["Text Translation"] },
  { id: "gp_t_02", text: "'Do what you want.' What does it really mean?", category: "Texting", subTopic: "Translation", type: "Evergreen", worksBestWith: ["Text Translation"] },
  { id: "gp_t_03", text: "'I'm not mad.' What does it really mean?", category: "Texting", subTopic: "Translation", type: "Evergreen", worksBestWith: ["Text Translation"] },
  { id: "gp_t_04", text: "Replying in 30 seconds. Too fast, too slow, or normal?", category: "Texting", subTopic: "Timing", type: "Evergreen", worksBestWith: ["Too Fast, Too Slow, or Normal?"] },
  { id: "gp_t_05", text: "Watching stories but not replying. Too fast, too slow, or normal?", category: "Texting", subTopic: "Timing", type: "Evergreen", worksBestWith: ["Too Fast, Too Slow, or Normal?"] },

  // ===== FAMILY =====
  { id: "gp_fa_01", text: "'You got big.' React.", category: "Family", subTopic: "Family Comments", type: "Evergreen", worksBestWith: ["The Family Said What?"] },
  { id: "gp_fa_02", text: "'When are you having another baby?' React.", category: "Family", subTopic: "Family Comments", type: "Evergreen", worksBestWith: ["The Family Said What?"] },
  { id: "gp_fa_03", text: "They never apologize. Be the bigger person or finally stop?", category: "Family", subTopic: "Boundaries", type: "Evergreen", worksBestWith: ["Be the Bigger Person Court"] },
  { id: "gp_fa_04", text: "They only call when they need something. Be the bigger person or finally stop?", category: "Family", subTopic: "Boundaries", type: "Evergreen", worksBestWith: ["Be the Bigger Person Court"] },

  // ===== BEAUTY / STYLE =====
  { id: "gp_bs_01", text: "Comfortable but still cute. Show the fit.", category: "Beauty / Style", subTopic: "Outfits", type: "Evergreen", worksBestWith: ["The Outfit Has Entered the Chat"] },
  { id: "gp_bs_02", text: "Cute but can I chase a kid in it?", category: "Beauty / Style", subTopic: "Mom Style", type: "Evergreen", worksBestWith: ["The Outfit Has Entered the Chat"] },
  { id: "gp_bs_03", text: "Would you approve this angle? Post it, crop it, or delete it?", category: "Beauty / Style", subTopic: "Photos", type: "Evergreen", worksBestWith: ["The Bad Angle Veto"] },

  // ===== PUBLIC BEHAVIOR =====
  { id: "gp_pb_01", text: "Someone says something wild in public. Act normal.", category: "Public Behavior", subTopic: "Social Anxiety", type: "Evergreen", worksBestWith: ["Act Normal Challenge"] },
  { id: "gp_pb_02", text: "They have food in their teeth. Say the truth or keep the peace?", category: "Public Behavior", subTopic: "Awkward Moments", type: "Evergreen", worksBestWith: ["Don't Make It Awkward"] },
  { id: "gp_pb_03", text: "'I'm good.' What did your face say?", category: "Public Behavior", subTopic: "Polite Lines", type: "Evergreen", worksBestWith: ["The Polite Line"] },

  // ===== CULTURAL =====
  { id: "gp_c_01", text: "What would your auntie/tía say?", category: "Cultural", subTopic: "Family Voice", type: "Evergreen", worksBestWith: ["Black + Latina Lens"] },
  { id: "gp_c_02", text: "Translate your family group chat.", category: "Cultural", subTopic: "Family Communication", type: "Evergreen", worksBestWith: ["Black + Latina Lens", "Text Translation"] },
  { id: "gp_c_03", text: "What's something your culture normalizes that shouldn't be?", category: "Cultural", subTopic: "Cultural Norms", type: "Evergreen", worksBestWith: ["Real Quick"] },

  // ===== WORK / MONEY =====
  { id: "gp_wm_01", text: "What's a work rule you disagree with?", category: "Work / Money", subTopic: "Work", type: "Evergreen", worksBestWith: ["One-Line Verdict"] },
  { id: "gp_wm_02", text: "What's a responsibility you have that people don't appreciate?", category: "Work / Money", subTopic: "Invisible Labor", type: "Evergreen", worksBestWith: ["Real Quick"] },
];

export function getPromptsByCategory(category: PromptCategory): GrowthPrompt[] {
  return PROMPTS.filter((p) => p.category === category);
}

export function getPromptsBySubTopic(category: PromptCategory, subTopic: string): GrowthPrompt[] {
  return PROMPTS.filter((p) => p.category === category && p.subTopic === subTopic);
}
