/**
 * AZ Off Script Discovery Library — "How do we make sure people find us AND remember us?"
 *
 * NOT: "How do we copy what everyone else is doing?"
 *
 * This is a LIVING library. It changes frequently based on TikTok
 * changes, trends, search behavior, audience behavior, and what is
 * currently performing.
 *
 * But it is ALSO a brand protection library. It stops AZ Off Script
 * from becoming another flooded TikTok account.
 *
 * The question is not "What is trending?"
 * The question is "What is trending that we can make uniquely AZ Off Script?"
 *
 * 8 sections:
 *   1. Market Gaps — flooded topics + AZ Off Script differentiation
 *   2. Content Advantages — what protects us from being another page
 *   3. Hook Library — hooks that work repeatedly (not trends)
 *   4. Caption Frameworks — living, phrases get stale
 *   5. Comment Prompts — comments are part of the content engine
 *   6. Search Keywords — living, search behavior changes
 *   7. Trend Capture — what's trending + how we make it ours
 *   8. Do Not Chase List — what we avoid to protect brand identity
 */

// ===== 1. MARKET GAPS =====

export interface MarketGap {
  id: string;
  market: string;
  /** What everyone else is doing — the flooded version */
  flooded: string[];
  /** What AZ Off Script does instead — the difference */
  azOffScriptAngle: string[];
  /** Content formats that fit this gap */
  bestFormats: string[];
}

export const MARKET_GAPS: MarketGap[] = [
  {
    id: "mg_01",
    market: "Women's Content",
    flooded: [
      "Generic empowerment quotes",
      "'You are enough' graphics",
      "Self-care routine videos",
      "Aesthetic morning routines",
    ],
    azOffScriptAngle: [
      "Real conversations — what women actually disagree about",
      "Things women don't say out loud",
      "Different generations of women answering the same question",
      "Expectations women are tired of explaining",
    ],
    bestFormats: ["Different Women Different Answer", "Real Quick", "One-Line Verdict"],
  },
  {
    id: "mg_02",
    market: "Friendship Content",
    flooded: [
      "Friendship quotes",
      "'Send this to your bestie' graphics",
      "Friendship meme reposts",
    ],
    azOffScriptAngle: [
      "'When do you know a friendship changed?'",
      "Friendship rules nobody talks about",
      "What makes someone a real friend vs a follower",
      "Group debate on friendship behavior",
    ],
    bestFormats: ["Group Chat Court", "Friend or Follower?", "Be the Bigger Person Court"],
  },
  {
    id: "mg_03",
    market: "Dating Content",
    flooded: [
      "'5 dating red flags' list videos",
      "Dating advice from one person",
      "Relationship quote graphics",
    ],
    azOffScriptAngle: [
      "'10 women answer: what's a red flag you ignored?'",
      "Real people > advice account",
      "The difference between answers IS the content",
      "He said / she heard — translation not advice",
    ],
    bestFormats: ["Different Women Different Answer", "He Said / She Heard", "Red Flag, Real Life, or Just Tired?"],
  },
  {
    id: "mg_04",
    market: "Mom Content",
    flooded: [
      "Morning routines",
      "Cleaning videos",
      "Grocery hauls",
      "Aesthetic mom life",
    ],
    azOffScriptAngle: [
      "'Things moms pretend they have together'",
      "'Different moms answer: what nobody warned you about motherhood'",
      "Mom math — tired logic that only makes sense if you're a mom",
      "Who was supposed to do that? — the invisible labor debate",
    ],
    bestFormats: ["Mom Math", "Who Was Supposed to Do That?", "Different Women Different Answer"],
  },
  {
    id: "mg_05",
    market: "Arizona Content",
    flooded: [
      "Generic Arizona scenery",
      "Tourist Arizona content",
      "'Living in Arizona' vlogs",
    ],
    azOffScriptAngle: [
      "Arizona made me — habits and instincts AZ gave us",
      "Only Arizona people understand — inside jokes",
      "Arizona woman math — local logic",
      "Buckeye/Phoenix/Valley specific experiences",
    ],
    bestFormats: ["Arizona Made Me This Way", "Only Arizona People Understand", "Arizona Micro-Moment"],
  },
  {
    id: "mg_06",
    market: "Relationship Advice",
    flooded: [
      "One person giving advice",
      "'Therapist says...' videos",
      "Couples coaching content",
    ],
    azOffScriptAngle: [
      "Multiple women give their real verdict — not advice",
      "Court format — the room decides, not one expert",
      "Caring or controlling — debate, not rules",
      "Apology or excuse — translation, not therapy",
    ],
    bestFormats: ["Group Chat Court", "Caring or Controlling?", "Apology or Excuse?"],
  },
  {
    id: "mg_07",
    market: "Cultural Content",
    flooded: [
      "Cultural stereotype content",
      "'As a [culture] woman' solo takes",
      "Cultural meme pages",
    ],
    azOffScriptAngle: [
      "Black + Latina lens — multiple women, same question",
      "What would your auntie/tía say — real family voice",
      "Family group chat translation — real conversations",
      "The look your mom gives — shared cultural moments",
    ],
    bestFormats: ["Black + Latina Lens", "The Family Said What?", "Text Translation"],
  },
  {
    id: "mg_08",
    market: "Beauty / Style Content",
    flooded: [
      "Get ready with me videos",
      "Outfit of the day posts",
      "Haul videos",
    ],
    azOffScriptAngle: [
      "The outfit has entered the chat — verdict, not showcase",
      "Cute but can I chase a kid in it — real mom style",
      "The bad angle veto — would you post it, crop it, or delete it",
      "Off Script Looks — brand style with personality",
    ],
    bestFormats: ["The Outfit Has Entered the Chat", "The Bad Angle Veto", "Off Script Looks"],
  },
];

// ===== 2. CONTENT ADVANTAGES =====

export interface ContentAdvantage {
  id: string;
  advantage: string;
  /** What most creators do */
  mostCreators: string;
  /** What AZ Off Script does instead */
  azOffScript: string;
  /** Why this matters */
  whyItMatters: string;
  /** Examples of this advantage in action */
  examples: string[];
}

export const CONTENT_ADVANTAGES: ContentAdvantage[] = [
  {
    id: "ca_01",
    advantage: "Multiple Women, Multiple Perspectives",
    mostCreators: "One person gives one opinion.",
    azOffScript: "10 women answer the same question. The product is the difference between answers.",
    whyItMatters: "Viewers come for the debate, not the advice. Nobody can copy 10 real people arguing honestly.",
    examples: [
      "Different Women Different Answer — same prompt, different takes",
      "Group Chat Court — the room decides together",
      "One-Line Verdict — quick takes from multiple people",
    ],
  },
  {
    id: "ca_02",
    advantage: "Local Identity",
    mostCreators: "Try to appeal to everyone everywhere.",
    azOffScript: "Starts with Arizona. Arizona women, Buckeye life, Phoenix area, desert life, local businesses.",
    whyItMatters: "Local communities feel like they belong. TikTok's own trend guidance emphasizes community-first creator relationships and authentic storytelling.",
    examples: [
      "Arizona Made Me This Way — local habits",
      "Only Arizona People Understand — inside jokes",
      "Arizona Micro-Moment — real local life",
    ],
  },
  {
    id: "ca_03",
    advantage: "Real People, Not Perfect Influencers",
    mostCreators: "'Look at my perfect life.'",
    azOffScript: "'Come see what real people actually think.'",
    whyItMatters: "Short-form content is moving toward authenticity. Less polished, more real. AZ Off Script is built for this shift.",
    examples: [
      "Real Quick — honest thoughts, no performance",
      "BTS / Real Process — behind the scenes of building",
      "Mom Math — tired logic, not aesthetic mom life",
    ],
  },
  {
    id: "ca_04",
    advantage: "Conversation, Not Content",
    mostCreators: "Make videos to get views.",
    azOffScript: "Make videos that start conversations. The comments are the content engine.",
    whyItMatters: "TikTok increasingly positions comments and community response as a major part of discovery and trust. Debate drives comments. Comments drive reach.",
    examples: [
      "Every video ends with a question, not a follow prompt",
      "Comment prompts are built into the Shot Recipe",
      "Community prompts get fed back into the Prompt Library",
    ],
  },
  {
    id: "ca_05",
    advantage: "The Room, Not the Individual",
    mostCreators: "Build one personal brand.",
    azOffScript: "Build a room. The crew IS the brand. People come back for the dynamic, not one person.",
    whyItMatters: "If one person leaves, the room continues. If one person gets sick, content continues. The collective is the moat.",
    examples: [
      "Crew Intro Pass — meet everyone, not one person",
      "Group Chat Court — the dynamic IS the content",
      "The Friend Every Group Has — everyone has a role",
    ],
  },
];

// ===== 3. HOOK LIBRARY =====

export type HookType = "Curiosity" | "Debate" | "Relatable" | "Emotional" | "Local";

export interface Hook {
  id: string;
  text: string;
  type: HookType;
  /** Content formats this hook works best with */
  worksBestWith: string[];
}

export const HOOK_TYPES: HookType[] = ["Curiosity", "Debate", "Relatable", "Emotional", "Local"];

export const HOOK_TYPE_COLORS: Record<HookType, string> = {
  Curiosity: "🤔",
  Debate: "⚖️",
  Relatable: "😅",
  Emotional: "🤍",
  Local: "🌵",
};

export const HOOKS: Hook[] = [
  // Curiosity
  { id: "h_cu_01", text: "Everyone answered differently…", type: "Curiosity", worksBestWith: ["Different Women Different Answer", "One-Line Verdict"] },
  { id: "h_cu_02", text: "The last answer surprised us.", type: "Curiosity", worksBestWith: ["Different Women Different Answer"] },
  { id: "h_cu_03", text: "We asked Arizona women…", type: "Curiosity", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"] },
  { id: "h_cu_04", text: "Nobody talks about this part.", type: "Curiosity", worksBestWith: ["Real Quick", "Soft Truths"] },
  { id: "h_cu_05", text: "We asked women something they never get asked.", type: "Curiosity", worksBestWith: ["Different Women Different Answer", "Real Quick"] },
  { id: "h_cu_06", text: "The room was divided on this one.", type: "Curiosity", worksBestWith: ["Group Chat Court", "Different Women Different Answer"] },
  { id: "h_cu_07", text: "Wait until you hear what she said.", type: "Curiosity", worksBestWith: ["Different Women Different Answer", "Group Chat Court"] },

  // Debate
  { id: "h_de_01", text: "Okay, we need a ruling.", type: "Debate", worksBestWith: ["Group Chat Court", "Fake Scenario Court"] },
  { id: "h_de_02", text: "Arizona, settle this.", type: "Debate", worksBestWith: ["Group Chat Court", "Fake Scenario Court"] },
  { id: "h_de_03", text: "Who is wrong?", type: "Debate", worksBestWith: ["Group Chat Court", "Be the Bigger Person Court"] },
  { id: "h_de_04", text: "Guilty or not guilty? The room decides.", type: "Debate", worksBestWith: ["Group Chat Court", "Fake Scenario Court"] },
  { id: "h_de_05", text: "Red flag, real life, or just tired?", type: "Debate", worksBestWith: ["Red Flag, Real Life, or Just Tired?"] },
  { id: "h_de_06", text: "Friend code or just drama?", type: "Debate", worksBestWith: ["Girl Code or Just Drama?"] },
  { id: "h_de_07", text: "Caring or controlling? Where's the line?", type: "Debate", worksBestWith: ["Caring or Controlling?"] },

  // Relatable
  { id: "h_re_01", text: "Things nobody prepares you for…", type: "Relatable", worksBestWith: ["Real Quick", "Mom Math", "Arizona Micro-Moment"] },
  { id: "h_re_02", text: "Tell me you're from Arizona without telling me.", type: "Relatable", worksBestWith: ["Arizona Made Me This Way", "Only Arizona People Understand"] },
  { id: "h_re_03", text: "Tell me you're a mom without telling me.", type: "Relatable", worksBestWith: ["Mom Math", "Who Was Supposed to Do That?"] },
  { id: "h_re_04", text: "If you know, you know.", type: "Relatable", worksBestWith: ["Only Arizona People Understand", "Arizona Micro-Moment"] },
  { id: "h_re_05", text: "My nervous system said no.", type: "Relatable", worksBestWith: ["My Nervous System Said No"] },
  { id: "h_re_06", text: "Act normal. Act normal. Act normal.", type: "Relatable", worksBestWith: ["Act Normal Challenge"] },

  // Emotional
  { id: "h_em_01", text: "Nobody talks about this part.", type: "Emotional", worksBestWith: ["Real Quick", "Soft Truths"] },
  { id: "h_em_02", text: "We asked women something they never get asked.", type: "Emotional", worksBestWith: ["Different Women Different Answer", "Real Quick"] },
  { id: "h_em_03", text: "Real quick… I'm tired of this.", type: "Emotional", worksBestWith: ["Real Quick"] },
  { id: "h_em_04", text: "Being the person everyone depends on but nobody checks on.", type: "Emotional", worksBestWith: ["Real Quick", "Different Women Different Answer"] },
  { id: "h_em_05", text: "I can be kind and still be done.", type: "Emotional", worksBestWith: ["Real Quick"] },

  // Local
  { id: "h_lo_01", text: "Only Arizona people understand this.", type: "Local", worksBestWith: ["Only Arizona People Understand"] },
  { id: "h_lo_02", text: "Arizona made me this way.", type: "Local", worksBestWith: ["Arizona Made Me This Way"] },
  { id: "h_lo_03", text: "You know you live in Arizona when…", type: "Local", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"] },
  { id: "h_lo_04", text: "Phoenix, we need to talk about this.", type: "Local", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"] },
  { id: "h_lo_05", text: "Buckeye, you already know.", type: "Local", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"] },
];

// ===== 4. CAPTION FRAMEWORKS =====

export type CaptionType =
  | "Debate"
  | "Relatable"
  | "Story"
  | "Community"
  | "Funny"
  | "Brand"
  | "Soft Truth";

export type LivingStatus = "Active" | "Stale" | "Archived";

export interface CaptionFramework {
  id: string;
  type: CaptionType;
  text: string;
  worksBestWith: string[];
  status: LivingStatus;
  lastUsed?: string | null;
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

export const STATUS_COLORS: Record<LivingStatus, string> = {
  Active: "✅",
  Stale: "⚠️",
  Archived: "📦",
};

export const CAPTION_FRAMEWORKS: CaptionFramework[] = [
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
  { id: "c_co_05", type: "Community", text: "What question should we ask next?", worksBestWith: ["Any format"], status: "Active" },

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

// ===== 5. COMMENT PROMPTS =====

export type CommentPromptType =
  | "Binary"
  | "Open"
  | "Tag"
  | "Vote"
  | "Experience"
  | "Community";

export interface CommentPrompt {
  id: string;
  text: string;
  type: CommentPromptType;
  worksBestWith: string[];
  status: LivingStatus;
}

export const COMMENT_PROMPT_TYPES: CommentPromptType[] = [
  "Binary",
  "Open",
  "Tag",
  "Vote",
  "Experience",
  "Community",
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

  // Community — feeds back into the Prompt Library
  { id: "cp_28", text: "What question should we ask next?", type: "Community", worksBestWith: ["Any format"], status: "Active" },
  { id: "cp_29", text: "What should the room debate next?", type: "Community", worksBestWith: ["Group Chat Court", "Any format"], status: "Active" },
  { id: "cp_30", text: "Drop your question for the crew.", type: "Community", worksBestWith: ["Any format"], status: "Active" },
];

// ===== 6. SEARCH KEYWORDS =====

export type SearchCategory =
  | "Arizona"
  | "Relationships"
  | "Parenting"
  | "Friendship"
  | "Adulting"
  | "Beauty / Style"
  | "Cultural"
  | "Brand";

export type Performance = "High" | "Medium" | "Low" | "New";

export interface SearchKeyword {
  id: string;
  keyword: string;
  category: SearchCategory;
  status: LivingStatus;
  performance?: Performance;
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

export const PERFORMANCE_COLORS: Record<Performance, string> = {
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
  { id: "s_az_11", keyword: "desert life", category: "Arizona", status: "Active", performance: "Low" },
  { id: "s_az_12", keyword: "Valley life", category: "Arizona", status: "Active", performance: "New" },

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

// ===== 7. TREND CAPTURE =====

export type TrendType = "Phrase" | "Hook" | "Sound" | "Format" | "Topic";
export type TrendStage = "Rising" | "Peaking" | "Fading" | "Watch";

export interface TrendCapture {
  id: string;
  name: string;
  type: TrendType;
  stage: TrendStage;
  /** Why this trend works in general */
  whyItWorks: string;
  /** How AZ Off Script makes it ours — the differentiation */
  azOffScriptVersion: string;
  /** Best content formats to use with this trend */
  bestFormats: string[];
  spotted?: string;
  status: LivingStatus;
}

export const TREND_TYPES: TrendType[] = ["Phrase", "Hook", "Sound", "Format", "Topic"];

export const STAGE_COLORS: Record<TrendStage, string> = {
  Rising: "📈",
  Peaking: "🔥",
  Fading: "📉",
  Watch: "👀",
};

export const TREND_CAPTURES: TrendCapture[] = [
  {
    id: "t_01",
    name: "POV format",
    type: "Format",
    stage: "Peaking",
    whyItWorks: "Puts the viewer inside the situation. Relatable without needing explanation.",
    azOffScriptVersion: "Use POV recording style for relatable scenarios. Pair with Soft POV content format. Multiple women do the same POV from different angles.",
    bestFormats: ["Soft POV", "What She Really Means", "Arizona Woman Math"],
    status: "Active",
  },
  {
    id: "t_02",
    name: "Court/debate format",
    type: "Format",
    stage: "Peaking",
    whyItWorks: "Creates binary sides. People comment to vote. The debate IS the engagement.",
    azOffScriptVersion: "Group Chat Court and Fake Scenario Court are already built for this. Lean in. The room decides — not one person.",
    bestFormats: ["Group Chat Court", "Fake Scenario Court", "Be the Bigger Person Court"],
    status: "Active",
  },
  {
    id: "t_03",
    name: "Stitched answers",
    type: "Format",
    stage: "Rising",
    whyItWorks: "Multiple perspectives on one question. The variety keeps viewers watching.",
    azOffScriptVersion: "Different Women Different Answer format. This is our core advantage — 10 women, same question, different answers.",
    bestFormats: ["Different Women Different Answer", "One-Line Verdict", "Two-Second Opinion"],
    status: "Active",
  },
  {
    id: "t_04",
    name: "Mom math",
    type: "Topic",
    stage: "Rising",
    whyItWorks: "Tired mom logic that only makes sense if you're a mom. High relatability, high share.",
    azOffScriptVersion: "Mom Math format is built for this. Multiple moms give their own mom math. The absurdity is the content.",
    bestFormats: ["Mom Math", "Who Was Supposed to Do That?"],
    status: "Active",
  },
  {
    id: "t_05",
    name: "Friendship court",
    type: "Topic",
    stage: "Rising",
    whyItWorks: "Debating friendship behavior. Everyone has an opinion on what friends should do.",
    azOffScriptVersion: "Group Chat Court and Friend or Follower formats. The friendship debate is our lane — not dating advice, not quotes.",
    bestFormats: ["Group Chat Court", "Friend or Follower?", "Girl Code or Just Drama?"],
    status: "Active",
  },
  {
    id: "t_06",
    name: "Arizona summer content",
    type: "Topic",
    stage: "Watch",
    whyItWorks: "Seasonal. Local. Only Arizona people get it. High share within Arizona.",
    azOffScriptVersion: "Ramp up in May/June. Only Arizona People Understand format. Local identity is our moat.",
    bestFormats: ["Only Arizona People Understand", "Arizona Micro-Moment", "Arizona Made Me This Way"],
    status: "Active",
  },
  {
    id: "t_07",
    name: "Act normal challenge",
    type: "Format",
    stage: "Rising",
    whyItWorks: "Try not to react to something wild. The restraint is the comedy.",
    azOffScriptVersion: "Act Normal Challenge format is built for this. Multiple women try to stay normal. The one who breaks first is the content.",
    bestFormats: ["Act Normal Challenge", "Face-Only Reaction"],
    status: "Active",
  },
  {
    id: "t_08",
    name: "Quiet creator content",
    type: "Topic",
    stage: "Watch",
    whyItWorks: "No-talking reactions and silent visual content. Inclusive of quiet creators.",
    azOffScriptVersion: "No Words Needed and Face-Only Reaction formats. Not everyone wants to talk. The room includes quiet women too.",
    bestFormats: ["No Words Needed", "Face-Only Reaction", "Silent Visual"],
    status: "Active",
  },
];

// ===== 8. DO NOT CHASE LIST =====

export interface DoNotChase {
  id: string;
  category: string;
  /** What to avoid */
  avoid: string;
  /** Why we don't chase this */
  why: string;
  /** What to do instead */
  doInstead: string;
}

export const DO_NOT_CHASE: DoNotChase[] = [
  {
    id: "dnc_01",
    category: "Random dance page",
    avoid: "Dance challenges and choreography content.",
    why: "The market is flooded. We are not dancers. We are conversationalists.",
    doInstead: "Use trending sounds only when they fit a conversation format. The sound supports the content, not the other way around.",
  },
  {
    id: "dnc_02",
    category: "Generic quote page",
    avoid: "Aesthetic quote graphics and 'you are enough' posts.",
    why: "Everyone does this. It requires no personality. It is copy-paste content.",
    doInstead: "Real women saying real things. The quote becomes a conversation, not a graphic.",
  },
  {
    id: "dnc_03",
    category: "'5 things you need to know' page",
    avoid: "Listicle-style advice videos from one person.",
    why: "One person giving advice is the most flooded format on TikTok. We have 10+ women.",
    doInstead: "Multiple women give their real take. The difference between answers IS the content.",
  },
  {
    id: "dnc_04",
    category: "Fake drama page",
    avoid: "Manufactured conflict, staged arguments, fake outrage.",
    why: "It burns trust. AZ Off Script is built on real conversations, not performance drama.",
    doInstead: "Real debates on real topics. The disagreement is natural, not staged.",
  },
  {
    id: "dnc_05",
    category: "Copy influencer page",
    avoid: "Copying what big influencers do — the aesthetic, the pacing, the vibe.",
    why: "We are not influencers. We are a room. The collective is the brand, not one aesthetic.",
    doInstead: "Build the AZ Off Script identity — desert colors, real people, Arizona local, conversation-driven.",
  },
  {
    id: "dnc_06",
    category: "Follow-for-follow engagement bait",
    avoid: "'Follow for more' as the primary call to action.",
    why: "It's generic and it doesn't build community. Comments build community.",
    doInstead: "End every video with a question. 'Who is right?' not 'Follow for more.'",
  },
];

// ===== TREND FILTER =====
// Before using any trend, run it through this filter.

export interface TrendFilterQuestion {
  id: string;
  question: string;
  /** What a good answer looks like */
  goodAnswer: string;
  /** What a bad answer looks like */
  badAnswer: string;
}

export const TREND_FILTER: TrendFilterQuestion[] = [
  {
    id: "tf_01",
    question: "Can multiple women participate?",
    goodAnswer: "Yes — multiple women can each give their own take.",
    badAnswer: "No — it only works with one person.",
  },
  {
    id: "tf_02",
    question: "Does it create conversation?",
    goodAnswer: "Yes — people will debate or share their own experience.",
    badAnswer: "No — people will just watch and scroll.",
  },
  {
    id: "tf_03",
    question: "Does it show personality?",
    goodAnswer: "Yes — you can see real people being themselves.",
    badAnswer: "No — it could be anyone doing the same thing.",
  },
  {
    id: "tf_04",
    question: "Could another creator copy it exactly?",
    goodAnswer: "No — it relies on our specific crew and their dynamic.",
    badAnswer: "Yes — anyone could do the exact same thing. If yes, add an AZ Off Script twist.",
  },
];

// ===== Helper functions =====

export function getCaptionsByType(type: CaptionType): CaptionFramework[] {
  return CAPTION_FRAMEWORKS.filter((c) => c.type === type);
}

export function getActiveCaptions(): CaptionFramework[] {
  return CAPTION_FRAMEWORKS.filter((c) => c.status === "Active");
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

export function getTrendsByStage(stage: TrendStage): TrendCapture[] {
  return TREND_CAPTURES.filter((t) => t.stage === stage);
}

export function getRisingTrends(): TrendCapture[] {
  return TREND_CAPTURES.filter((t) => t.stage === "Rising");
}

export function getHooksByType(type: HookType): Hook[] {
  return HOOKS.filter((h) => h.type === type);
}
