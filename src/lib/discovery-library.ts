/**
 * AZ Off Script Discovery Library — "How people find us."
 *
 * This is a LIVING library (like the Prompt Library). It changes
 * frequently based on TikTok changes, trends, search behavior,
 * audience behavior, and what is currently performing.
 *
 * NOT a permanent production library. Do not lock it in like
 * transitions or editing recipes.
 *
 * 4 sections:
 *   1. Caption Templates — living, phrases get stale
 *   2. Search Keyword Bank — living, search behavior changes
 *   3. Comment Prompt Bank — what we ask viewers at the end
 *   4. Trend Monitoring — trending phrases, hooks, sounds, formats
 */

// ===== 1. CAPTION TEMPLATES =====

export type CaptionType =
  | "Debate"
  | "Relatable"
  | "Story"
  | "Community"
  | "Funny"
  | "Brand"
  | "Soft Truth";

export type CaptionStatus = "Active" | "Stale" | "Archived";

export interface CaptionTemplate {
  id: string;
  type: CaptionType;
  text: string;
  /** Content formats this caption works best with */
  worksBestWith: string[];
  status: CaptionStatus;
  /** When this was last used (ISO date, or null) */
  lastUsed?: string | null;
  /** How many times used */
  timesUsed?: number;
}

export const CAPTION_TYPES: CaptionType[] = [
  "Debate",
  "Relatable",
  "Story",
  "Community",
  "Funny",
  "Brand",
  "Soft Truth",
];

export const CAPTION_STATUS_COLORS: Record<CaptionStatus, string> = {
  Active: "✅",
  Stale: "⚠️",
  Archived: "📦",
};

export const CAPTION_TEMPLATES: CaptionTemplate[] = [
  // Debate
  { id: "c_de_01", type: "Debate", text: "Okay Arizona… settle this 👀", worksBestWith: ["Group Chat Court", "Fake Scenario Court", "Rank It"], status: "Active" },
  { id: "c_de_02", type: "Debate", text: "Okay friends… we need answers 😂", worksBestWith: ["Group Chat Court", "Friend or Follower?"], status: "Active" },
  { id: "c_de_03", type: "Debate", text: "Guilty or not guilty? The room decides ⚖️", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], status: "Active" },
  { id: "c_de_04", type: "Debate", text: "Red flag, real life, or just tired? 😮‍💨", worksBestWith: ["Red Flag, Real Life, or Just Tired?"], status: "Active" },
  { id: "c_de_05", type: "Debate", text: "Girl code or just drama? Be honest 😬", worksBestWith: ["Girl Code or Just Drama?"], status: "Active" },
  { id: "c_de_06", type: "Debate", text: "Caring or controlling? Where is the line? 📍", worksBestWith: ["Caring or Controlling?"], status: "Active" },
  { id: "c_de_07", type: "Debate", text: "Apology or excuse? We're not fooled 😒", worksBestWith: ["Apology or Excuse?"], status: "Active" },
  { id: "c_de_08", type: "Debate", text: "Friend or follower? The difference matters 👀", worksBestWith: ["Friend or Follower?"], status: "Active" },

  // Relatable
  { id: "c_re_01", type: "Relatable", text: "Tell me I'm not the only one… 😅", worksBestWith: ["Real Quick", "Arizona Micro-Moment", "Mom Math"], status: "Active" },
  { id: "c_re_02", type: "Relatable", text: "Arizona women will understand this 😂", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"], status: "Active" },
  { id: "c_re_03", type: "Relatable", text: "If you know, you know 🌵", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"], status: "Active" },
  { id: "c_re_04", type: "Relatable", text: "Mom math. What's your equation? 😂", worksBestWith: ["Mom Math"], status: "Active" },
  { id: "c_re_05", type: "Relatable", text: "Which one are you? Tag yourself. Don't lie. 😂", worksBestWith: ["The Friend Every Group Has", "Different Women Different Answer"], status: "Active" },
  { id: "c_re_06", type: "Relatable", text: "My nervous system said no 😮‍💨", worksBestWith: ["My Nervous System Said No"], status: "Active" },
  { id: "c_re_07", type: "Relatable", text: "Act normal. Act normal. Act normal. 😬", worksBestWith: ["Act Normal Challenge"], status: "Active" },

  // Story
  { id: "c_st_01", type: "Story", text: "I didn't realize this until…", worksBestWith: ["Real Quick", "Arizona Made Me This Way", "BTS / Real Process"], status: "Active" },
  { id: "c_st_02", type: "Story", text: "Real quick… what did you learn?", worksBestWith: ["Real Quick"], status: "Active" },
  { id: "c_st_03", type: "Story", text: "Arizona made me this way. What did it do to you? 🌵", worksBestWith: ["Arizona Made Me This Way"], status: "Active" },
  { id: "c_st_04", type: "Story", text: "Behind the scenes of building something real 🤍", worksBestWith: ["BTS / Real Process"], status: "Active" },

  // Community
  { id: "c_co_01", type: "Community", text: "Women, what's your answer?", worksBestWith: ["Different Women Different Answer", "One-Line Verdict"], status: "Active" },
  { id: "c_co_02", type: "Community", text: "Arizona, we need to talk about this 👀", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"], status: "Active" },
  { id: "c_co_03", type: "Community", text: "Moms, does this hit for you?", worksBestWith: ["Mom Math", "Real Quick"], status: "Active" },
  { id: "c_co_04", type: "Community", text: "Quiet girls, is this you? 🤍", worksBestWith: ["No Words Needed", "Soft POV"], status: "Active" },

  // Funny
  { id: "c_fu_01", type: "Funny", text: "The family said WHAT?! 😭", worksBestWith: ["The Family Said What?"], status: "Active" },
  { id: "c_fu_02", type: "Funny", text: "Can this be an email? PLEASE? 😩", worksBestWith: ["Can This Be an Email?"], status: "Active" },
  { id: "c_fu_03", type: "Funny", text: "Errand Olympics. Rank them worst to least worst 🥇", worksBestWith: ["Errand Olympics"], status: "Active" },
  { id: "c_fu_04", type: "Funny", text: "Don't make it awkward 😬", worksBestWith: ["Don't Make It Awkward"], status: "Active" },

  // Brand
  { id: "c_br_01", type: "Brand", text: "Meet the AZ Off Script crew. Who's your favorite?", worksBestWith: ["Crew Intro Pass", "Crew vs Future Wave"], status: "Active" },
  { id: "c_br_02", type: "Brand", text: "Arizona is the setting. Social scripts are the engine. 🌵", worksBestWith: ["Search Explainers", "Crew Intro Pass"], status: "Active" },
  { id: "c_br_03", type: "Brand", text: "We're building the room. Want in? 👀", worksBestWith: ["Crew vs Future Wave", "Search Explainers"], status: "Active" },
  { id: "c_br_04", type: "Brand", text: "Off Script Looks. The fit has entered the chat 💅", worksBestWith: ["Off Script Looks", "The Outfit Has Entered the Chat"], status: "Active" },

  // Soft Truth
  { id: "c_so_01", type: "Soft Truth", text: "Real quick… what are you tired of explaining? 🤍", worksBestWith: ["Real Quick"], status: "Active" },
  { id: "c_so_02", type: "Soft Truth", text: "Being the person everyone depends on but nobody checks on.", worksBestWith: ["Real Quick", "Different Women Different Answer"], status: "Active" },
  { id: "c_so_03", type: "Soft Truth", text: "I can be kind and still be done. 🤍", worksBestWith: ["Real Quick"], status: "Active" },
  { id: "c_so_04", type: "Soft Truth", text: "What did your face say? 😏", worksBestWith: ["The Polite Line"], status: "Active" },
];

// ===== 2. SEARCH KEYWORD BANK =====

export type SearchCategory =
  | "Arizona"
  | "Relationships"
  | "Parenting"
  | "Friendship"
  | "Adulting"
  | "Beauty / Style"
  | "Cultural"
  | "Brand";

export interface SearchKeyword {
  id: string;
  keyword: string;
  category: SearchCategory;
  status: CaptionStatus;
  /** How well this keyword is performing (high/medium/low) */
  performance?: "High" | "Medium" | "Low" | "New";
  /** Related keywords that pair well */
  relatedTo?: string[];
}

export const SEARCH_CATEGORIES: SearchCategory[] = [
  "Arizona",
  "Relationships",
  "Parenting",
  "Friendship",
  "Adulting",
  "Beauty / Style",
  "Cultural",
  "Brand",
];

export const PERFORMANCE_COLORS: Record<string, string> = {
  High: "🔥",
  Medium: "📈",
  Low: "📉",
  New: "✨",
};

export const SEARCH_KEYWORDS: SearchKeyword[] = [
  // Arizona
  { id: "s_az_01", keyword: "Arizona women", category: "Arizona", status: "Active", performance: "High" },
  { id: "s_az_02", keyword: "Phoenix life", category: "Arizona", status: "Active", performance: "Medium" },
  { id: "s_az_03", keyword: "Arizona moms", category: "Arizona", status: "Active", performance: "High" },
  { id: "s_az_04", keyword: "Buckeye Arizona", category: "Arizona", status: "Active", performance: "Medium" },
  { id: "s_az_05", keyword: "Arizona heat", category: "Arizona", status: "Active", performance: "High", relatedTo: ["Arizona summer survival"] },
  { id: "s_az_06", keyword: "Arizona summer survival", category: "Arizona", status: "Active", performance: "New", relatedTo: ["Arizona heat"] },
  { id: "s_az_07", keyword: "Arizona creators", category: "Arizona", status: "Active", performance: "Medium" },
  { id: "s_az_08", keyword: "Arizona life", category: "Arizona", status: "Active", performance: "High" },
  { id: "s_az_09", keyword: "Arizona TikTok", category: "Arizona", status: "Active", performance: "Medium" },
  { id: "s_az_10", keyword: "living in Arizona", category: "Arizona", status: "Active", performance: "Medium" },

  // Relationships
  { id: "s_rl_01", keyword: "friendship advice", category: "Relationships", status: "Active", performance: "High" },
  { id: "s_rl_02", keyword: "dating opinions", category: "Relationships", status: "Active", performance: "Medium" },
  { id: "s_rl_03", keyword: "relationship conversations", category: "Relationships", status: "Active", performance: "Medium" },
  { id: "s_rl_04", keyword: "dating red flags", category: "Relationships", status: "Active", performance: "High" },
  { id: "s_rl_05", keyword: "girl code", category: "Relationships", status: "Active", performance: "High" },
  { id: "s_rl_06", keyword: "friendship boundaries", category: "Relationships", status: "Active", performance: "Medium" },
  { id: "s_rl_07", keyword: "friendship red flags", category: "Relationships", status: "Active", performance: "High" },
  { id: "s_rl_08", keyword: "apology or excuse", category: "Relationships", status: "Active", performance: "New" },

  // Parenting
  { id: "s_pa_01", keyword: "mom life", category: "Parenting", status: "Active", performance: "High" },
  { id: "s_pa_02", keyword: "motherhood reality", category: "Parenting", status: "Active", performance: "Medium" },
  { id: "s_pa_03", keyword: "parenting struggles", category: "Parenting", status: "Active", performance: "Medium" },
  { id: "s_pa_04", keyword: "mom math", category: "Parenting", status: "Active", performance: "New" },
  { id: "s_pa_05", keyword: "mom tok", category: "Parenting", status: "Active", performance: "High" },
  { id: "s_pa_06", keyword: "Arizona moms", category: "Parenting", status: "Active", performance: "High" },

  // Friendship
  { id: "s_fr_01", keyword: "friendship court", category: "Friendship", status: "Active", performance: "New" },
  { id: "s_fr_02", keyword: "fake friends", category: "Friendship", status: "Active", performance: "High" },
  { id: "s_fr_03", keyword: "friend or follower", category: "Friendship", status: "Active", performance: "New" },
  { id: "s_fr_04", keyword: "friendship problems", category: "Friendship", status: "Active", performance: "Medium" },

  // Adulting
  { id: "s_ad_01", keyword: "adulting struggles", category: "Adulting", status: "Active", performance: "Medium" },
  { id: "s_ad_02", keyword: "errand Olympics", category: "Adulting", status: "Active", performance: "New" },
  { id: "s_ad_03", keyword: "can this be an email", category: "Adulting", status: "Active", performance: "New" },
  { id: "s_ad_04", keyword: "nervous system said no", category: "Adulting", status: "Active", performance: "New" },

  // Beauty / Style
  { id: "s_bs_01", keyword: "outfit check", category: "Beauty / Style", status: "Active", performance: "Medium" },
  { id: "s_bs_02", keyword: "off script looks", category: "Beauty / Style", status: "Active", performance: "New" },
  { id: "s_bs_03", keyword: "Arizona style", category: "Beauty / Style", status: "Active", performance: "Medium" },

  // Cultural
  { id: "s_cu_01", keyword: "Black women creators", category: "Cultural", status: "Active", performance: "Medium" },
  { id: "s_cu_02", keyword: "Latina creators", category: "Cultural", status: "Active", performance: "Medium" },
  { id: "s_cu_03", keyword: "women of color TikTok", category: "Cultural", status: "Active", performance: "Medium" },

  // Brand
  { id: "s_br_01", keyword: "AZ Off Script", category: "Brand", status: "Active", performance: "New" },
  { id: "s_br_02", keyword: "Arizona creator crew", category: "Brand", status: "Active", performance: "New" },
  { id: "s_br_03", keyword: "women creator collective", category: "Brand", status: "Active", performance: "New" },
];

// ===== 3. COMMENT PROMPT BANK =====

export type CommentPromptType =
  | "Binary"
  | "Open"
  | "Tag"
  | "Vote"
  | "Experience";

export interface CommentPrompt {
  id: string;
  text: string;
  type: CommentPromptType;
  /** Content formats this comment prompt works best with */
  worksBestWith: string[];
  status: CaptionStatus;
}

export const COMMENT_PROMPT_TYPES: CommentPromptType[] = [
  "Binary",
  "Open",
  "Tag",
  "Vote",
  "Experience",
];

export const COMMENT_PROMPTS: CommentPrompt[] = [
  // Binary (yes/no, guilty/not guilty — gets most comments)
  { id: "cp_01", text: "Agree or disagree?", type: "Binary", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"], status: "Active" },
  { id: "cp_02", text: "Who is right?", type: "Binary", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], status: "Active" },
  { id: "cp_03", text: "Guilty or not guilty?", type: "Binary", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], status: "Active" },
  { id: "cp_04", text: "Am I wrong?", type: "Binary", worksBestWith: ["Be the Bigger Person Court", "Don't Make It Awkward"], status: "Active" },
  { id: "cp_05", text: "Red flag or not?", type: "Binary", worksBestWith: ["Red Flag, Real Life, or Just Tired?"], status: "Active" },
  { id: "cp_06", text: "Friend or follower?", type: "Binary", worksBestWith: ["Friend or Follower?"], status: "Active" },
  { id: "cp_07", text: "Girl code or just drama?", type: "Binary", worksBestWith: ["Girl Code or Just Drama?"], status: "Active" },
  { id: "cp_08", text: "Apology or excuse?", type: "Binary", worksBestWith: ["Apology or Excuse?"], status: "Active" },
  { id: "cp_09", text: "Caring or controlling?", type: "Binary", worksBestWith: ["Caring or Controlling?"], status: "Active" },
  { id: "cp_10", text: "Helping or making it worse?", type: "Binary", worksBestWith: ["Helping or Making It Worse?"], status: "Active" },

  // Open
  { id: "cp_11", text: "What's your answer?", type: "Open", worksBestWith: ["Different Women Different Answer", "One-Line Verdict"], status: "Active" },
  { id: "cp_12", text: "What would you do?", type: "Open", worksBestWith: ["Fake Scenario Court", "Be the Bigger Person Court"], status: "Active" },
  { id: "cp_13", text: "What's your version of this?", type: "Open", worksBestWith: ["Real Quick", "Arizona Made Me This Way"], status: "Active" },
  { id: "cp_14", text: "What did you hear?", type: "Open", worksBestWith: ["He Said / She Heard"], status: "Active" },
  { id: "cp_15", text: "What's your mom math?", type: "Open", worksBestWith: ["Mom Math"], status: "Active" },
  { id: "cp_16", text: "What did Arizona do to you?", type: "Open", worksBestWith: ["Arizona Made Me This Way"], status: "Active" },
  { id: "cp_17", text: "What's your real quick?", type: "Open", worksBestWith: ["Real Quick"], status: "Active" },

  // Tag
  { id: "cp_18", text: "Tag yourself. Don't lie.", type: "Tag", worksBestWith: ["The Friend Every Group Has", "Different Women Different Answer"], status: "Active" },
  { id: "cp_19", text: "Tag someone who does this.", type: "Tag", worksBestWith: ["Soft POV", "Arizona Micro-Moment"], status: "Active" },
  { id: "cp_20", text: "Send this to the friend who…", type: "Tag", worksBestWith: ["Friend or Follower?", "Girl Code or Just Drama?"], status: "Active" },

  // Vote
  { id: "cp_21", text: "You're the jury. What's the verdict?", type: "Vote", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], status: "Active" },
  { id: "cp_22", text: "Rank them worst to least worst.", type: "Vote", worksBestWith: ["Errand Olympics", "Rank It"], status: "Active" },
  { id: "cp_23", text: "Which one are you?", type: "Vote", worksBestWith: ["The Friend Every Group Has"], status: "Active" },

  // Experience
  { id: "cp_24", text: "Tell us your experience.", type: "Experience", worksBestWith: ["Real Quick", "Soft Truths"], status: "Active" },
  { id: "cp_25", text: "Has this happened to you?", type: "Experience", worksBestWith: ["Soft POV", "Don't Make It Awkward"], status: "Active" },
  { id: "cp_26", text: "Does this hit for anyone else?", type: "Experience", worksBestWith: ["Real Quick", "Soft Truths"], status: "Active" },
  { id: "cp_27", text: "Arizona people, explain this.", type: "Experience", worksBestWith: ["Only Arizona People Understand", "Arizona Micro-Moment"], status: "Active" },
];

// ===== 4. TREND MONITORING =====

export type TrendType = "Phrase" | "Hook" | "Sound" | "Format" | "Topic";

export interface Trend {
  id: string;
  name: string;
  type: TrendType;
  /** Whether this trend is rising, peaking, or fading */
  stage: "Rising" | "Peaking" | "Fading" | "Watch";
  /** How it could be used by AZ Off Script */
  howToUse: string;
  /** When this was spotted (ISO date) */
  spotted?: string;
  status: CaptionStatus;
}

export const TREND_TYPES: TrendType[] = ["Phrase", "Hook", "Sound", "Format", "Topic"];

export const STAGE_COLORS: Record<string, string> = {
  Rising: "📈",
  Peaking: "🔥",
  Fading: "📉",
  Watch: "👀",
};

export const TRENDS: Trend[] = [
  // These are placeholders — trends get updated weekly/monthly
  { id: "t_01", name: "POV format", type: "Format", stage: "Peaking", howToUse: "Use POV recording style for relatable scenarios. Pair with Soft POV content format.", status: "Active" },
  { id: "t_02", name: "Court/debate format", type: "Format", stage: "Peaking", howToUse: "Group Chat Court and Fake Scenario Court are already built for this. Lean in.", status: "Active" },
  { id: "t_03", name: "Stitched answers", type: "Format", stage: "Rising", howToUse: "Different Women Different Answer format. Multiple people answer the same prompt.", status: "Active" },
  { id: "t_04", name: "Mom math", type: "Topic", stage: "Rising", howToUse: "Tired mom logic that only makes sense if you're a mom. Mom Math format is built for this.", status: "Active" },
  { id: "t_05", name: "Friendship court", type: "Topic", stage: "Rising", howToUse: "Debating friendship behavior. Group Chat Court and Friend or Follower formats.", status: "Active" },
  { id: "t_06", name: "Arizona summer content", type: "Topic", stage: "Watch", howToUse: "Seasonal. Ramp up in May/June. Only Arizona People Understand format.", status: "Active" },
  { id: "t_07", name: "Act normal challenge", type: "Format", stage: "Rising", howToUse: "Try not to react to something wild. Act Normal Challenge format is built for this.", status: "Active" },
  { id: "t_08", name: "Quiet creator content", type: "Topic", stage: "Watch", howToUse: "No-talking reactions and silent visual content. No Words Needed and Face-Only Reaction formats.", status: "Active" },
];

// ===== Helper functions =====

export function getCaptionsByType(type: CaptionType): CaptionTemplate[] {
  return CAPTION_TEMPLATES.filter((c) => c.type === type);
}

export function getActiveCaptions(): CaptionTemplate[] {
  return CAPTION_TEMPLATES.filter((c) => c.status === "Active");
}

export function getKeywordsByCategory(category: SearchCategory): SearchKeyword[] {
  return SEARCH_KEYWORDS.filter((k) => k.category === category);
}

export function getHighPerformingKeywords(): SearchKeyword[] {
  return SEARCH_KEYWORDS.filter((k) => k.performance === "High");
}

export function getCommentPromptsByType(type: CommentPromptType): CommentPrompt[] {
  return COMMENT_PROMPTS.filter((c) => c.type === type);
}

export function getTrendsByStage(stage: Trend["stage"]): Trend[] {
  return TRENDS.filter((t) => t.stage === stage);
}

export function getRisingTrends(): Trend[] {
  return TRENDS.filter((t) => t.stage === "Rising");
}
