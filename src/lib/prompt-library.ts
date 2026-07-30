/**
 * AZ Off Script Prompt & Question Library — the endless idea engine.
 *
 * This library is NOT like the others. The system libraries (content
 * formats, transitions, recording styles, editing recipes) are built
 * once and improved over time. The Prompt Library is a LIVING content
 * bank that keeps getting fed.
 *
 * Prompt types:
 *   - Evergreen:  works anytime, stays forever
 *   - Seasonal:   updates yearly (summer, holidays, back to school)
 *   - Trending:   updates weekly/monthly (viral debates, pop culture)
 *   - Community:  grows from audience comments and suggestions
 *
 * Database fields:
 *   - Prompt text
 *   - Category (friendship, dating, Arizona, etc.)
 *   - Type (Evergreen/Seasonal/Trending/Community)
 *   - Status (Active/Archived/Draft)
 *   - Works best with (content formats)
 *   - Last used, times used, performance (tracked when integrated with clips)
 */

export type PromptType = "Evergreen" | "Seasonal" | "Trending" | "Community";

export type PromptStatus = "Active" | "Archived" | "Draft";

export type PromptCategory =
  | "Friendship"
  | "Dating"
  | "Men, Women & the Script"
  | "Arizona"
  | "Mom-Life"
  | "Family"
  | "Adulting"
  | "Texting"
  | "Funny Debates"
  | "Serious Conversations"
  | "Cultural Conversations"
  | "Beauty / Style"
  | "Public Behavior"
  | "Soft Truths"
  | "Work / Money";

export interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
  type: PromptType;
  status: PromptStatus;
  /** Content formats this prompt works best with */
  worksBestWith: string[];
  /** When this was last used (ISO date string, or null if never) */
  lastUsed?: string | null;
  /** How many times this prompt has been used */
  timesUsed?: number;
  /** Seasonal tag (for seasonal prompts) */
  season?: string;
}

export const PROMPT_TYPES: PromptType[] = ["Evergreen", "Seasonal", "Trending", "Community"];

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Friendship",
  "Dating",
  "Men, Women & the Script",
  "Arizona",
  "Mom-Life",
  "Family",
  "Adulting",
  "Texting",
  "Funny Debates",
  "Serious Conversations",
  "Cultural Conversations",
  "Beauty / Style",
  "Public Behavior",
  "Soft Truths",
  "Work / Money",
];

export const TYPE_COLORS: Record<PromptType, string> = {
  Evergreen: "🌿",
  Seasonal: "📅",
  Trending: "🔥",
  Community: "💬",
};

export const STATUS_COLORS: Record<PromptStatus, string> = {
  Active: "✅",
  Archived: "📦",
  Draft: "✏️",
};

// ===== INITIAL LAUNCH PACK =====
// Evergreen prompts that work anytime, seasonal prompts, and Arizona/local prompts.
// This will grow from what performs, what people comment, and what the crew naturally talks about.

export const PROMPTS: Prompt[] = [
  // ===== FRIENDSHIP — EVERGREEN =====
  { id: "p_fe_01", text: "What makes someone a real friend?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Real Quick", "Different Women Different Answer"] },
  { id: "p_fe_02", text: "What is a friendship red flag?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Group Chat Court", "One-Line Verdict", "Face-Only Reaction"] },
  { id: "p_fe_03", text: "What is a friendship green flag?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Real Quick"] },
  { id: "p_fe_04", text: "She watches every story but never checks on you. Friend or follower?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Friend or Follower?", "Group Chat Court"] },
  { id: "p_fe_05", text: "She only comments when things look good. Friend or follower?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Friend or Follower?"] },
  { id: "p_fe_06", text: "She disappears when you're struggling. Friend or follower?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Friend or Follower?"] },
  { id: "p_fe_07", text: "She says 'we should hang out' but never picks a day. Friend or follower?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Friend or Follower?"] },
  { id: "p_fe_08", text: "Dating someone your friend talked to once. Girl code or just drama?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Girl Code or Just Drama?"] },
  { id: "p_fe_09", text: "Not telling your friend what you heard. Girl code or just drama?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Girl Code or Just Drama?"] },
  { id: "p_fe_10", text: "Still being cool with someone who hurt your friend. Girl code or just drama?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Girl Code or Just Drama?"] },
  { id: "p_fe_11", text: "The late friend. Which one are you?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["The Friend Every Group Has"] },
  { id: "p_fe_12", text: "The planner. Which one are you?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["The Friend Every Group Has"] },
  { id: "p_fe_13", text: "The one who says 'I'm outside' but is still home. Which one are you?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["The Friend Every Group Has"] },
  { id: "p_fe_14", text: "The one who starts the debate then disappears. Which one are you?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["The Friend Every Group Has"] },
  { id: "p_fe_15", text: "The one who knows everybody's business. Which one are you?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["The Friend Every Group Has"] },
  { id: "p_fe_16", text: "Would you tell your friend if you saw her man liking every picture?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Would You Tell Your Friend?"] },
  { id: "p_fe_17", text: "Would you tell your friend if you heard he was out with someone else?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Would You Tell Your Friend?"] },
  { id: "p_fe_18", text: "Would you tell your friend if you know the gift was not his idea?", category: "Friendship", type: "Evergreen", status: "Active", worksBestWith: ["Would You Tell Your Friend?"] },

  // ===== DATING — EVERGREEN =====
  { id: "p_de_01", text: "What is a dating rule you disagree with?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "p_de_02", text: "He doesn't text much during work. Red flag, real life, or just tired?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Red Flag, Real Life, or Just Tired?"] },
  { id: "p_de_03", text: "She needs three business days to respond. Red flag, real life, or just tired?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Red Flag, Real Life, or Just Tired?"] },
  { id: "p_de_04", text: "He forgot the exact date but remembered the month. Red flag, real life, or just tired?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Red Flag, Real Life, or Just Tired?"] },
  { id: "p_de_05", text: "He says he's tired every weekend. Red flag, real life, or just tired?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Red Flag, Real Life, or Just Tired?"] },
  { id: "p_de_06", text: "'I'm sorry you felt that way.' Apology or excuse?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Apology or Excuse?"] },
  { id: "p_de_07", text: "'I didn't mean it like that.' Apology or excuse?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Apology or Excuse?"] },
  { id: "p_de_08", text: "'I was just joking.' Apology or excuse?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Apology or Excuse?"] },
  { id: "p_de_09", text: "'You know how I am.' Apology or excuse?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["Apology or Excuse?"] },
  { id: "p_de_10", text: "What is the biggest dating ick?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Face-Only Reaction"] },
  { id: "p_de_11", text: "What is a green flag that people ignore?", category: "Dating", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Real Quick"] },

  // ===== MEN, WOMEN & THE SCRIPT — EVERGREEN =====
  { id: "p_mw_01", text: "He said he's just bad at texting. What did she hear?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["He Said / She Heard"] },
  { id: "p_mw_02", text: "He said he doesn't like labels. What did she hear?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["He Said / She Heard"] },
  { id: "p_mw_03", text: "He said you're overthinking. What did she hear?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["He Said / She Heard"] },
  { id: "p_mw_04", text: "He said he was going to do it later. What did she hear?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["He Said / She Heard"] },
  { id: "p_mw_05", text: "He watched the kids but left the whole kitchen destroyed. Helping or making it worse?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Helping or Making It Worse?"] },
  { id: "p_mw_06", text: "He said 'just tell me what to do.' Helping or making it worse?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Helping or Making It Worse?"] },
  { id: "p_mw_07", text: "He cleaned but moved everything to the wrong place. Helping or making it worse?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Helping or Making It Worse?"] },
  { id: "p_mw_08", text: "He wants your location on. Caring or controlling?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Caring or Controlling?"] },
  { id: "p_mw_09", text: "He asks what you're wearing before you leave. Caring or controlling?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Caring or Controlling?"] },
  { id: "p_mw_10", text: "He checks if you made it home. Caring or controlling?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Caring or Controlling?"] },
  { id: "p_mw_11", text: "He wants passwords. Caring or controlling?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Caring or Controlling?"] },
  { id: "p_mw_12", text: "Leaving you on read. Men think this means nothing. What do women notice?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Men Think This Means Nothing"] },
  { id: "p_mw_13", text: "Saying 'do what you want.' Men think this means nothing. What do women notice?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Men Think This Means Nothing"] },
  { id: "p_mw_14", text: "Not planning the date. Men think this means nothing. What do women notice?", category: "Men, Women & the Script", type: "Evergreen", status: "Active", worksBestWith: ["Men Think This Means Nothing"] },

  // ===== ARIZONA — EVERGREEN =====
  { id: "p_az_01", text: "You know you live in Arizona when...", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Arizona Micro-Moment", "Different Women Different Answer"] },
  { id: "p_az_02", text: "What Arizona thing makes no sense to outsiders?", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Only Arizona People Understand", "One-Line Verdict"] },
  { id: "p_az_03", text: "Arizona made me...", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Arizona Made Me This Way"] },
  { id: "p_az_04", text: "Only Arizona people understand why...", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Only Arizona People Understand"] },
  { id: "p_az_05", text: "Before I leave the house in Arizona, I need...", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Before I Leave the House"] },
  { id: "p_az_06", text: "What's an Arizona habit you can't shake?", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Arizona Made Me This Way", "Real Quick"] },
  { id: "p_az_07", text: "Arizona woman math: ...", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["Arizona Woman Math"] },
  { id: "p_az_08", text: "What's the most Arizona thing about you?", category: "Arizona", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "p_az_09", text: "Things only Arizona people understand in July.", category: "Arizona", type: "Seasonal", status: "Active", worksBestWith: ["Only Arizona People Understand", "Arizona Micro-Moment"], season: "Summer" },
  { id: "p_az_10", text: "Signs you survived an Arizona summer.", category: "Arizona", type: "Seasonal", status: "Active", worksBestWith: ["Arizona Micro-Moment", "Rank It"], season: "Summer" },

  // ===== MOM-LIFE — EVERGREEN =====
  { id: "p_mm_01", text: "If I sit down for five minutes, that counts as rest.", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Mom Math"] },
  { id: "p_mm_02", text: "If the kids ate fruit snacks, that was fruit.", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Mom Math"] },
  { id: "p_mm_03", text: "If I bought it for the house, it was not shopping.", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Mom Math"] },
  { id: "p_mm_04", text: "If everyone is alive, I did enough.", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Mom Math"] },
  { id: "p_mm_05", text: "Who makes the appointments?", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Who Was Supposed to Do That?"] },
  { id: "p_mm_06", text: "Who knows the kids' shoe sizes?", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Who Was Supposed to Do That?"] },
  { id: "p_mm_07", text: "Who remembers picture day?", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Who Was Supposed to Do That?"] },
  { id: "p_mm_08", text: "Who notices the toilet paper is gone?", category: "Mom-Life", type: "Evergreen", status: "Active", worksBestWith: ["Who Was Supposed to Do That?"] },

  // ===== FAMILY — EVERGREEN =====
  { id: "p_fa_01", text: "'You got big.' React.", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["The Family Said What?"] },
  { id: "p_fa_02", text: "'When are you having another baby?' React.", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["The Family Said What?"] },
  { id: "p_fa_03", text: "'You look tired.' React.", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["The Family Said What?"] },
  { id: "p_fa_04", text: "'That's just how they are.' React.", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["The Family Said What?"] },
  { id: "p_fa_05", text: "They never apologize. Be the bigger person or finally stop?", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["Be the Bigger Person Court"] },
  { id: "p_fa_06", text: "They only call when they need something. Be the bigger person or finally stop?", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["Be the Bigger Person Court"] },
  { id: "p_fa_07", text: "They invite everybody except you. Be the bigger person or finally stop?", category: "Family", type: "Evergreen", status: "Active", worksBestWith: ["Be the Bigger Person Court"] },

  // ===== ADULTING — EVERGREEN =====
  { id: "p_ad_01", text: "A 45-minute meeting for one question. Can this be an email?", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["Can This Be an Email?"] },
  { id: "p_ad_02", text: "A phone call that could have been a text. Can this be an email?", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["Can This Be an Email?"] },
  { id: "p_ad_03", text: "A 'quick favor' that takes three hours. Can this be an email?", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["Can This Be an Email?"] },
  { id: "p_ad_04", text: "Rank these errands from worst to least worst.", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["Errand Olympics"] },
  { id: "p_ad_05", text: "Too many people talking at once. Nervous system said no?", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["My Nervous System Said No"] },
  { id: "p_ad_06", text: "A surprise phone call. Nervous system said no?", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["My Nervous System Said No"] },
  { id: "p_ad_07", text: "A text that says 'call me.' Nervous system said no?", category: "Adulting", type: "Evergreen", status: "Active", worksBestWith: ["My Nervous System Said No"] },

  // ===== TEXTING — EVERGREEN =====
  { id: "p_tx_01", text: "'K.' What does it really mean?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Text Translation"] },
  { id: "p_tx_02", text: "'Do what you want.' What does it really mean?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Text Translation"] },
  { id: "p_tx_03", text: "'I'm not mad.' What does it really mean?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Text Translation"] },
  { id: "p_tx_04", text: "'We'll see.' What does it really mean?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Text Translation"] },
  { id: "p_tx_05", text: "'It's fine.' What does it really mean?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Text Translation"] },
  { id: "p_tx_06", text: "Replying in 30 seconds. Too fast, too slow, or normal?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Too Fast, Too Slow, or Normal?"] },
  { id: "p_tx_07", text: "Taking 8 hours to reply. Too fast, too slow, or normal?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Too Fast, Too Slow, or Normal?"] },
  { id: "p_tx_08", text: "Watching stories but not replying. Too fast, too slow, or normal?", category: "Texting", type: "Evergreen", status: "Active", worksBestWith: ["Too Fast, Too Slow, or Normal?"] },

  // ===== FUNNY DEBATES — EVERGREEN =====
  { id: "p_fd_01", text: "Something everyone pretends to like?", category: "Funny Debates", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "p_fd_02", text: "What's something that's overrated?", category: "Funny Debates", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Two-Second Opinion"] },
  { id: "p_fd_03", text: "What's something that's underrated?", category: "Funny Debates", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Two-Second Opinion"] },
  { id: "p_fd_04", text: "What's a hill you're willing to die on?", category: "Funny Debates", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "p_fd_05", text: "What's something people brag about that's not impressive?", category: "Funny Debates", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Face-Only Reaction"] },
  { id: "p_fd_06", text: "What's an unpopular opinion you stand by?", category: "Funny Debates", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },

  // ===== SERIOUS CONVERSATIONS — EVERGREEN =====
  { id: "p_sc_01", text: "Real quick, I'm tired of explaining normal things.", category: "Serious Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick"] },
  { id: "p_sc_02", text: "Real quick, being quiet does not mean I agree.", category: "Serious Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick"] },
  { id: "p_sc_03", text: "Real quick, I can be kind and still be done.", category: "Serious Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick"] },
  { id: "p_sc_04", text: "Real quick, I'm not available for every version of me people expect.", category: "Serious Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick"] },
  { id: "p_sc_05", text: "What is something women are expected to tolerate but shouldn't?", category: "Serious Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Different Women Different Answer"] },
  { id: "p_sc_06", text: "What's a boundary you had to learn the hard way?", category: "Serious Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick", "One-Line Verdict"] },

  // ===== CULTURAL CONVERSATIONS — EVERGREEN =====
  { id: "p_cc_01", text: "What would your auntie/tía say?", category: "Cultural Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Black + Latina Lens"] },
  { id: "p_cc_02", text: "Family group chat translation.", category: "Cultural Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Black + Latina Lens", "Text Translation"] },
  { id: "p_cc_03", text: "The look your mom gives before she says something wild.", category: "Cultural Conversations", type: "Evergreen", status: "Active", worksBestWith: ["Black + Latina Lens", "Face-Only Reaction"] },

  // ===== BEAUTY / STYLE — EVERGREEN =====
  { id: "p_bs_01", text: "Comfortable but still cute. Show the fit.", category: "Beauty / Style", type: "Evergreen", status: "Active", worksBestWith: ["The Outfit Has Entered the Chat"] },
  { id: "p_bs_02", text: "Overdressed or everybody else underdressed?", category: "Beauty / Style", type: "Evergreen", status: "Active", worksBestWith: ["The Outfit Has Entered the Chat"] },
  { id: "p_bs_03", text: "The outfit I planned vs the outfit I survived in.", category: "Beauty / Style", type: "Evergreen", status: "Active", worksBestWith: ["The Outfit Has Entered the Chat"] },
  { id: "p_bs_04", text: "Cute but can I chase a kid in it?", category: "Beauty / Style", type: "Evergreen", status: "Active", worksBestWith: ["The Outfit Has Entered the Chat"] },
  { id: "p_bs_05", text: "Would you approve this angle? Post it, crop it, or delete it?", category: "Beauty / Style", type: "Evergreen", status: "Active", worksBestWith: ["The Bad Angle Veto"] },

  // ===== PUBLIC BEHAVIOR — EVERGREEN =====
  { id: "p_pb_01", text: "Someone says something wild in public. Act normal.", category: "Public Behavior", type: "Evergreen", status: "Active", worksBestWith: ["Act Normal Challenge"] },
  { id: "p_pb_02", text: "The total at checkout is higher than expected. Act normal.", category: "Public Behavior", type: "Evergreen", status: "Active", worksBestWith: ["Act Normal Challenge"] },
  { id: "p_pb_03", text: "You see someone you were avoiding. Act normal.", category: "Public Behavior", type: "Evergreen", status: "Active", worksBestWith: ["Act Normal Challenge"] },
  { id: "p_pb_04", text: "They have food in their teeth. Say the truth or keep the peace?", category: "Public Behavior", type: "Evergreen", status: "Active", worksBestWith: ["Don't Make It Awkward"] },
  { id: "p_pb_05", text: "The group plan is too expensive. Say the truth or keep the peace?", category: "Public Behavior", type: "Evergreen", status: "Active", worksBestWith: ["Don't Make It Awkward"] },
  { id: "p_pb_06", text: "Nobody likes the restaurant choice. Say the truth or keep the peace?", category: "Public Behavior", type: "Evergreen", status: "Active", worksBestWith: ["Don't Make It Awkward"] },

  // ===== SOFT TRUTHS — EVERGREEN =====
  { id: "p_st_01", text: "'I'll think about it.' What did your face say?", category: "Soft Truths", type: "Evergreen", status: "Active", worksBestWith: ["The Polite Line"] },
  { id: "p_st_02", text: "'No worries.' What did your face say?", category: "Soft Truths", type: "Evergreen", status: "Active", worksBestWith: ["The Polite Line"] },
  { id: "p_st_03", text: "'I'm good.' What did your face say?", category: "Soft Truths", type: "Evergreen", status: "Active", worksBestWith: ["The Polite Line"] },
  { id: "p_st_04", text: "'Let me check my schedule.' What did your face say?", category: "Soft Truths", type: "Evergreen", status: "Active", worksBestWith: ["The Polite Line"] },

  // ===== WORK / MONEY — EVERGREEN =====
  { id: "p_wm_01", text: "What's a work rule you disagree with?", category: "Work / Money", type: "Evergreen", status: "Active", worksBestWith: ["One-Line Verdict", "Different Women Different Answer"] },
  { id: "p_wm_02", text: "What's something about money nobody talks about honestly?", category: "Work / Money", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick", "One-Line Verdict"] },
  { id: "p_wm_03", text: "What's a responsibility you have that people don't appreciate?", category: "Work / Money", type: "Evergreen", status: "Active", worksBestWith: ["Real Quick"] },

  // ===== SEASONAL — SUMMER =====
  { id: "p_ss_01", text: "Things only Arizona people understand in July.", category: "Arizona", type: "Seasonal", status: "Active", worksBestWith: ["Only Arizona People Understand"], season: "Summer" },
  { id: "p_ss_02", text: "Signs you survived an Arizona summer.", category: "Arizona", type: "Seasonal", status: "Active", worksBestWith: ["Arizona Micro-Moment", "Rank It"], season: "Summer" },
  { id: "p_ss_03", text: "Arizona summer essentials. What's on your list?", category: "Arizona", type: "Seasonal", status: "Active", worksBestWith: ["Before I Leave the House"], season: "Summer" },

  // ===== SEASONAL — BACK TO SCHOOL =====
  { id: "p_sbs_01", text: "Things parents are not ready for at back to school.", category: "Mom-Life", type: "Seasonal", status: "Active", worksBestWith: ["Arizona Micro-Moment", "Real Quick"], season: "Back to School" },
  { id: "p_sbs_02", text: "Back to school errands ranked from worst to least worst.", category: "Mom-Life", type: "Seasonal", status: "Active", worksBestWith: ["Errand Olympics"], season: "Back to School" },

  // ===== SEASONAL — HOLIDAYS =====
  { id: "p_ho_01", text: "Family holiday opinions.", category: "Family", type: "Seasonal", status: "Active", worksBestWith: ["The Family Said What?"], season: "Holidays" },
  { id: "p_ho_02", text: "Holiday family gatherings: be the bigger person or finally stop?", category: "Family", type: "Seasonal", status: "Active", worksBestWith: ["Be the Bigger Person Court"], season: "Holidays" },

  // ===== SEASONAL — NEW YEAR =====
  { id: "p_ny_01", text: "Things we are leaving behind this year.", category: "Serious Conversations", type: "Seasonal", status: "Active", worksBestWith: ["Real Quick", "One-Line Verdict"], season: "New Year" },
  { id: "p_ny_02", text: "Things we are taking with us this year.", category: "Serious Conversations", type: "Seasonal", status: "Active", worksBestWith: ["Real Quick", "One-Line Verdict"], season: "New Year" },
];

// ===== Helper functions =====

export function getPromptsByCategory(category: PromptCategory): Prompt[] {
  return PROMPTS.filter((p) => p.category === category);
}

export function getPromptsByType(type: PromptType): Prompt[] {
  return PROMPTS.filter((p) => p.type === type);
}

export function getActivePrompts(): Prompt[] {
  return PROMPTS.filter((p) => p.status === "Active");
}

export function getEvergreenPrompts(): Prompt[] {
  return getPromptsByType("Evergreen");
}

export function getSeasonalPrompts(): Prompt[] {
  return getPromptsByType("Seasonal");
}

export function getPromptsByFormat(formatName: string): Prompt[] {
  return PROMPTS.filter((p) => p.worksBestWith.includes(formatName));
}

export function getUnusedPrompts(): Prompt[] {
  return PROMPTS.filter((p) => !p.lastUsed || p.timesUsed === 0);
}
