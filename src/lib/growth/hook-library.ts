/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 2: Hook Library
 *
 * Purpose:
 *   The first 1-3 seconds. Because people decide immediately
 *   whether to keep watching.
 *
 *   Not trends. Hooks that work repeatedly.
 *
 *   This document will eventually contain hundreds of hooks.
 *
 * Hook types:
 *   - Curiosity: makes people want to know the answer
 *   - Debate: makes people want to pick a side
 *   - Identity: makes people feel "that's me"
 *   - Emotional: makes people feel something before the content starts
 *   - Pattern Interrupt: breaks expectations
 *   - Local: Arizona-specific identity
 *   - Story: sets up a narrative
 *   - Challenge: invites participation
 */

export type HookType =
  | "Curiosity"
  | "Debate"
  | "Identity"
  | "Emotional"
  | "Pattern Interrupt"
  | "Local"
  | "Story"
  | "Challenge";

export interface Hook {
  id: string;
  text: string;
  type: HookType;
  /** What this hook does to the viewer */
  effect: string;
  /** Content formats this hook works best with */
  worksBestWith: string[];
  /** Whether this is a visual hook (shown on screen) or spoken */
  delivery: "On-screen text" | "Spoken" | "Either";
}

export const HOOK_TYPES: HookType[] = [
  "Curiosity",
  "Debate",
  "Identity",
  "Emotional",
  "Pattern Interrupt",
  "Local",
  "Story",
  "Challenge",
];

export const HOOK_TYPE_COLORS: Record<HookType, string> = {
  Curiosity: "🤔",
  Debate: "⚖️",
  Identity: "🪪",
  Emotional: "🤍",
  "Pattern Interrupt": "⚡",
  Local: "🌵",
  Story: "📖",
  Challenge: "🎯",
};

export const HOOKS: Hook[] = [
  // ===== CURIOSITY =====
  { id: "h_cu_01", text: "Everyone answered this differently…", type: "Curiosity", effect: "Makes viewer want to see the different answers", worksBestWith: ["Different Women Different Answer", "One-Line Verdict"], delivery: "On-screen text" },
  { id: "h_cu_02", text: "We asked Arizona women something nobody asks…", type: "Curiosity", effect: "Local + curiosity combo. Viewer wants to know the question AND the answers.", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_cu_03", text: "The last answer surprised us.", type: "Curiosity", effect: "Viewer stays to the end to see the surprising answer", worksBestWith: ["Different Women Different Answer", "Group Chat Court"], delivery: "On-screen text" },
  { id: "h_cu_04", text: "Nobody talks about this part.", type: "Curiosity", effect: "Viewer wants to know what 'this part' is", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "Either" },
  { id: "h_cu_05", text: "We asked women something they never get asked.", type: "Curiosity", effect: "Viewer wants to know both the question and the answers", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_cu_06", text: "The room was divided on this one.", type: "Curiosity", effect: "Viewer wants to see the disagreement", worksBestWith: ["Group Chat Court", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_cu_07", text: "Wait until you hear what she said.", type: "Curiosity", effect: "Viewer stays to hear the specific answer", worksBestWith: ["Different Women Different Answer", "Group Chat Court"], delivery: "On-screen text" },
  { id: "h_cu_08", text: "We weren't expecting this answer.", type: "Curiosity", effect: "Viewer wants to see the unexpected answer", worksBestWith: ["Different Women Different Answer", "One-Line Verdict"], delivery: "On-screen text" },
  { id: "h_cu_09", text: "This question got more honest answers than we expected.", type: "Curiosity", effect: "Viewer wants to hear the honest answers", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_cu_10", text: "We asked the crew a question and the answers split the room.", type: "Curiosity", effect: "Viewer wants to see the split", worksBestWith: ["Group Chat Court", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_cu_11", text: "Not one person gave the same answer.", type: "Curiosity", effect: "Viewer wants to see the variety", worksBestWith: ["Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_cu_12", text: "The question was simple. The answers were not.", type: "Curiosity", effect: "Viewer wants to see the complex answers", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_cu_13", text: "We found out something about Arizona women…", type: "Curiosity", effect: "Local + curiosity. Viewer wants to know what we found out.", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_cu_14", text: "This started a bigger conversation than we planned.", type: "Curiosity", effect: "Viewer wants to be part of the conversation", worksBestWith: ["Group Chat Court", "Real Quick"], delivery: "On-screen text" },
  { id: "h_cu_15", text: "We asked moms something they don't say out loud.", type: "Curiosity", effect: "Viewer wants to hear the unspoken truth", worksBestWith: ["Mom Math", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_cu_16", text: "The crew had to think about this one.", type: "Curiosity", effect: "Viewer wants to see the thinking process", worksBestWith: ["Different Women Different Answer", "One-Line Verdict"], delivery: "On-screen text" },
  { id: "h_cu_17", text: "This one hit different.", type: "Curiosity", effect: "Short, punchy. Viewer wants to see why it hit different.", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_cu_18", text: "We weren't ready for this answer.", type: "Curiosity", effect: "Viewer wants to see the answer we weren't ready for", worksBestWith: ["Different Women Different Answer", "Group Chat Court"], delivery: "On-screen text" },
  { id: "h_cu_19", text: "This is the question that broke the group chat.", type: "Curiosity", effect: "Viewer wants to see the question that caused the debate", worksBestWith: ["Group Chat Court", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_cu_20", text: "Three women. One question. Completely different answers.", type: "Curiosity", effect: "Viewer wants to see the different answers", worksBestWith: ["Different Women Different Answer"], delivery: "On-screen text" },

  // ===== DEBATE =====
  { id: "h_de_01", text: "Okay, we need a ruling.", type: "Debate", effect: "Viewer wants to be the judge", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "Either" },
  { id: "h_de_02", text: "Arizona, settle this.", type: "Debate", effect: "Local + debate. Viewer feels invited to judge.", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "Either" },
  { id: "h_de_03", text: "Who is wrong?", type: "Debate", effect: "Direct. Viewer immediately picks a side.", worksBestWith: ["Group Chat Court", "Be the Bigger Person Court"], delivery: "Either" },
  { id: "h_de_04", text: "Guilty or not guilty? The room decides.", type: "Debate", effect: "Court format. Viewer wants to vote.", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "On-screen text" },
  { id: "h_de_05", text: "Red flag, real life, or just tired?", type: "Debate", effect: "Three options. Viewer wants to pick one.", worksBestWith: ["Red Flag, Real Life, or Just Tired?"], delivery: "On-screen text" },
  { id: "h_de_06", text: "Friend code or just drama?", type: "Debate", effect: "Binary. Viewer picks a side immediately.", worksBestWith: ["Girl Code or Just Drama?"], delivery: "On-screen text" },
  { id: "h_de_07", text: "Caring or controlling? Where's the line?", type: "Debate", effect: "Nuanced debate. Viewer wants to weigh in.", worksBestWith: ["Caring or Controlling?"], delivery: "On-screen text" },
  { id: "h_de_08", text: "We need your opinion on this one.", type: "Debate", effect: "Direct invitation. Viewer feels asked.", worksBestWith: ["Group Chat Court", "Different Women Different Answer"], delivery: "Either" },
  { id: "h_de_09", text: "Settle this for us.", type: "Debate", effect: "Short, direct. Viewer feels needed.", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "Either" },
  { id: "h_de_10", text: "The room is split. Who do you agree with?", type: "Debate", effect: "Viewer wants to pick a side", worksBestWith: ["Group Chat Court", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_de_11", text: "Is this a red flag or are we doing too much?", type: "Debate", effect: "Relatable + debate. Viewer wants to weigh in.", worksBestWith: ["Red Flag, Real Life, or Just Tired?"], delivery: "Either" },
  { id: "h_de_12", text: "Apology or excuse? We're not fooled.", type: "Debate", effect: "Viewer wants to judge the apology", worksBestWith: ["Apology or Excuse?"], delivery: "On-screen text" },
  { id: "h_de_13", text: "Helping or making it worse?", type: "Debate", effect: "Viewer has an immediate opinion", worksBestWith: ["Helping or Making It Worse?"], delivery: "On-screen text" },
  { id: "h_de_14", text: "Friend or follower?", type: "Debate", effect: "Binary. Viewer starts thinking about their own friends.", worksBestWith: ["Friend or Follower?"], delivery: "On-screen text" },
  { id: "h_de_15", text: "Be the bigger person or finally stop?", type: "Debate", effect: "Emotional + debate. Viewer has a strong opinion.", worksBestWith: ["Be the Bigger Person Court"], delivery: "On-screen text" },
  { id: "h_de_16", text: "Does this apology count?", type: "Debate", effect: "Viewer wants to judge", worksBestWith: ["Apology or Excuse?"], delivery: "Either" },
  { id: "h_de_17", text: "Okay, settle this.", type: "Debate", effect: "Short, casual. Like a friend asking.", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "Either" },
  { id: "h_de_18", text: "The room has a verdict. Do you agree?", type: "Debate", effect: "Viewer wants to compare their verdict to ours", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "On-screen text" },
  { id: "h_de_19", text: "This caused a debate. We need answers.", type: "Debate", effect: "Viewer wants to join the debate", worksBestWith: ["Group Chat Court", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_de_20", text: "Two sides. One question. You decide.", type: "Debate", effect: "Clean setup. Viewer feels like the judge.", worksBestWith: ["Group Chat Court", "Fake Scenario Court"], delivery: "On-screen text" },

  // ===== IDENTITY =====
  { id: "h_id_01", text: "If you're from Arizona, you know…", type: "Identity", effect: "Arizona viewers feel seen. Non-Arizona viewers feel curious.", worksBestWith: ["Only Arizona People Understand", "Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_id_02", text: "Only moms understand this…", type: "Identity", effect: "Moms feel seen. Non-moms feel curious.", worksBestWith: ["Mom Math", "Who Was Supposed to Do That?"], delivery: "On-screen text" },
  { id: "h_id_03", text: "Women will understand this one.", type: "Identity", effect: "Women feel included. Creates in-group feeling.", worksBestWith: ["Real Quick", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_id_04", text: "If you're the friend who…", type: "Identity", effect: "Viewer starts identifying as that friend", worksBestWith: ["The Friend Every Group Has"], delivery: "On-screen text" },
  { id: "h_id_05", text: "Quiet girls, is this you?", type: "Identity", effect: "Introverted viewers feel seen and included", worksBestWith: ["No Words Needed", "Soft POV"], delivery: "On-screen text" },
  { id: "h_id_06", text: "If your nervous system says no to…", type: "Identity", effect: "Viewer identifies with the feeling", worksBestWith: ["My Nervous System Said No"], delivery: "On-screen text" },
  { id: "h_id_07", text: "Arizona women, you already know.", type: "Identity", effect: "Local identity. Arizona women feel claimed.", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"], delivery: "On-screen text" },
  { id: "h_id_08", text: "If you're the one who always…", type: "Identity", effect: "Viewer starts thinking 'that's me'", worksBestWith: ["The Friend Every Group Has", "Who Was Supposed to Do That?"], delivery: "On-screen text" },
  { id: "h_id_09", text: "Moms, does this hit for you?", type: "Identity", effect: "Moms feel directly addressed", worksBestWith: ["Mom Math", "Real Quick"], delivery: "Either" },
  { id: "h_id_10", text: "If you're from Buckeye…", type: "Identity", effect: "Hyper-local. Creates strong in-group.", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"], delivery: "On-screen text" },
  { id: "h_id_11", text: "If you're the planner friend…", type: "Identity", effect: "Viewer identifies as the planner", worksBestWith: ["The Friend Every Group Has"], delivery: "On-screen text" },
  { id: "h_id_12", text: "If you're the late friend…", type: "Identity", effect: "Viewer identifies as the late one", worksBestWith: ["The Friend Every Group Has"], delivery: "On-screen text" },
  { id: "h_id_13", text: "Women who hold it together, this one's for you.", type: "Identity", effect: "Emotional + identity. Viewer feels seen.", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_id_14", text: "If you're the one everyone depends on…", type: "Identity", effect: "Viewer identifies with the role", worksBestWith: ["Real Quick", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_id_15", text: "Phoenix, you already know.", type: "Identity", effect: "Hyper-local identity", worksBestWith: ["Arizona Micro-Moment"], delivery: "On-screen text" },

  // ===== EMOTIONAL =====
  { id: "h_em_01", text: "Nobody talks about this part.", type: "Emotional", effect: "Viewer feels like they're about to hear a truth", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "Either" },
  { id: "h_em_02", text: "We asked women something they never get asked.", type: "Emotional", effect: "Viewer feels the weight of the question", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_em_03", text: "Real quick… I'm tired of this.", type: "Emotional", effect: "Raw, honest, immediate. Viewer feels the exhaustion.", worksBestWith: ["Real Quick"], delivery: "Spoken" },
  { id: "h_em_04", text: "Being the person everyone depends on but nobody checks on.", type: "Emotional", effect: "Deeply relatable. Viewer feels seen.", worksBestWith: ["Real Quick", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_em_05", text: "I can be kind and still be done.", type: "Emotional", effect: "Boundary statement. Viewer feels the truth.", worksBestWith: ["Real Quick"], delivery: "Either" },
  { id: "h_em_06", text: "We asked a question that got unexpectedly honest answers.", type: "Emotional", effect: "Viewer wants to hear the honesty", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_em_07", text: "This one was hard to answer.", type: "Emotional", effect: "Viewer feels the vulnerability", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_em_08", text: "The room got quiet after this one.", type: "Emotional", effect: "Viewer feels the weight", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_em_09", text: "Some answers stayed with us.", type: "Emotional", effect: "Viewer wants to hear the memorable answers", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_em_10", text: "We didn't expect to feel this.", type: "Emotional", effect: "Viewer feels the authenticity", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_em_11", text: "This is for the women who are tired of being strong.", type: "Emotional", effect: "Directly addresses the emotional state", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_em_12", text: "Real quick… what are you tired of explaining?", type: "Emotional", effect: "Viewer starts answering in their head", worksBestWith: ["Real Quick"], delivery: "Either" },
  { id: "h_em_13", text: "Not everything needs a response. This does.", type: "Emotional", effect: "Viewer feels the importance", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_em_14", text: "This is the part nobody prepares you for.", type: "Emotional", effect: "Viewer feels the truth of unpreparedness", worksBestWith: ["Real Quick", "Mom Math", "Arizona Micro-Moment"], delivery: "Either" },
  { id: "h_em_15", text: "We asked the crew to be honest. They were.", type: "Emotional", effect: "Viewer wants to hear the honesty", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },

  // ===== PATTERN INTERRUPT =====
  { id: "h_pi_01", text: "We thought everyone would agree…", type: "Pattern Interrupt", effect: "Viewer expects agreement, stays to see the disagreement", worksBestWith: ["Different Women Different Answer", "Group Chat Court"], delivery: "On-screen text" },
  { id: "h_pi_02", text: "We were wrong.", type: "Pattern Interrupt", effect: "Short. Breaks the pattern. Viewer wants to see how.", worksBestWith: ["Different Women Different Answer", "Group Chat Court"], delivery: "On-screen text" },
  { id: "h_pi_03", text: "Almost nobody answered the same.", type: "Pattern Interrupt", effect: "Viewer expects similarity, stays for the variety", worksBestWith: ["Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_pi_04", text: "This started as a joke. It became a real conversation.", type: "Pattern Interrupt", effect: "Viewer expects comedy, stays for the depth", worksBestWith: ["Real Quick", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_pi_05", text: "We asked a simple question. We got complicated answers.", type: "Pattern Interrupt", effect: "Viewer expects simple, stays for the complex", worksBestWith: ["Different Women Different Answer", "Real Quick"], delivery: "On-screen text" },
  { id: "h_pi_06", text: "The first answer was not what we expected.", type: "Pattern Interrupt", effect: "Viewer stays to see the unexpected answer", worksBestWith: ["Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_pi_07", text: "We stopped recording. She kept talking.", type: "Pattern Interrupt", effect: "Viewer feels the authenticity of the moment", worksBestWith: ["Real Quick", "BTS / Real Process"], delivery: "On-screen text" },
  { id: "h_pi_08", text: "This was supposed to be funny. Then it got real.", type: "Pattern Interrupt", effect: "Viewer expects funny, stays for the real", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "On-screen text" },
  { id: "h_pi_09", text: "We asked the question wrong. The answers were still right.", type: "Pattern Interrupt", effect: "Viewer is intrigued by the imperfection", worksBestWith: ["Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_pi_10", text: "Nobody agreed. That was the point.", type: "Pattern Interrupt", effect: "Viewer understands the format immediately", worksBestWith: ["Different Women Different Answer", "Group Chat Court"], delivery: "On-screen text" },

  // ===== LOCAL =====
  { id: "h_lo_01", text: "Only Arizona people understand this.", type: "Local", effect: "Arizona viewers feel seen. Others feel curious.", worksBestWith: ["Only Arizona People Understand"], delivery: "On-screen text" },
  { id: "h_lo_02", text: "Arizona made me this way.", type: "Local", effect: "Local identity. Viewer wants to see the habit.", worksBestWith: ["Arizona Made Me This Way"], delivery: "Either" },
  { id: "h_lo_03", text: "You know you live in Arizona when…", type: "Local", effect: "Arizona viewers complete the sentence in their head", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"], delivery: "On-screen text" },
  { id: "h_lo_04", text: "Phoenix, we need to talk about this.", type: "Local", effect: "Hyper-local. Phoenix viewers feel addressed.", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_lo_05", text: "Buckeye, you already know.", type: "Local", effect: "Hyper-local. Buckeye viewers feel claimed.", worksBestWith: ["Arizona Micro-Moment", "Only Arizona People Understand"], delivery: "On-screen text" },
  { id: "h_lo_06", text: "Arizona women, this one's for you.", type: "Local", effect: "Local + identity. Arizona women feel addressed.", worksBestWith: ["Different Women Different Answer", "Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_lo_07", text: "Living in Arizona taught me…", type: "Local", effect: "Viewer wants to hear the lesson", worksBestWith: ["Arizona Made Me This Way"], delivery: "Either" },
  { id: "h_lo_08", text: "Arizona summer is different.", type: "Local", effect: "Seasonal + local. Arizona viewers relate.", worksBestWith: ["Only Arizona People Understand", "Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_lo_09", text: "The Valley hits different.", type: "Local", effect: "Local slang. Valley viewers feel included.", worksBestWith: ["Arizona Micro-Moment"], delivery: "On-screen text" },
  { id: "h_lo_10", text: "Arizona woman math: …", type: "Local", effect: "Local + format name. Viewer wants to hear the math.", worksBestWith: ["Arizona Woman Math"], delivery: "On-screen text" },

  // ===== STORY =====
  { id: "h_st_01", text: "I didn't realize this was an Arizona thing until…", type: "Story", effect: "Sets up a story with a local twist", worksBestWith: ["Arizona Made Me This Way", "Real Quick"], delivery: "Spoken" },
  { id: "h_st_02", text: "Real quick, let me tell you something.", type: "Story", effect: "Casual, intimate. Like a friend about to share.", worksBestWith: ["Real Quick"], delivery: "Spoken" },
  { id: "h_st_03", text: "This happened last week and I'm still thinking about it.", type: "Story", effect: "Viewer wants to hear what happened", worksBestWith: ["Real Quick", "BTS / Real Process"], delivery: "Spoken" },
  { id: "h_st_04", text: "I wasn't going to say this but…", type: "Story", effect: "Creates intimacy. Viewer feels trusted.", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "Spoken" },
  { id: "h_st_05", text: "Behind the scenes of building this…", type: "Story", effect: "Viewer gets access to the process", worksBestWith: ["BTS / Real Process"], delivery: "Either" },
  { id: "h_st_06", text: "Here's something nobody sees.", type: "Story", effect: "Viewer feels like they're getting exclusive access", worksBestWith: ["BTS / Real Process", "Real Quick"], delivery: "Either" },
  { id: "h_st_07", text: "I learned this the hard way.", type: "Story", effect: "Viewer wants to hear the lesson", worksBestWith: ["Real Quick", "Soft Truths"], delivery: "Spoken" },
  { id: "h_st_08", text: "Let me tell you about the time…", type: "Story", effect: "Classic story setup. Viewer settles in.", worksBestWith: ["Real Quick", "BTS / Real Process"], delivery: "Spoken" },

  // ===== CHALLENGE =====
  { id: "h_ch_01", text: "Act normal. Act normal. Act normal.", type: "Challenge", effect: "Viewer wants to see if they can act normal", worksBestWith: ["Act Normal Challenge"], delivery: "On-screen text" },
  { id: "h_ch_02", text: "Try not to react.", type: "Challenge", effect: "Viewer tries it themselves while watching", worksBestWith: ["Act Normal Challenge", "Face-Only Reaction"], delivery: "On-screen text" },
  { id: "h_ch_03", text: "Don't make it awkward.", type: "Challenge", effect: "Viewer wants to see the awkward moment", worksBestWith: ["Don't Make It Awkward"], delivery: "On-screen text" },
  { id: "h_ch_04", text: "Can you watch this without reacting?", type: "Challenge", effect: "Challenges the viewer directly", worksBestWith: ["Act Normal Challenge", "Face-Only Reaction"], delivery: "On-screen text" },
  { id: "h_ch_05", text: "We tried to keep a straight face.", type: "Challenge", effect: "Viewer wants to see who breaks first", worksBestWith: ["Act Normal Challenge"], delivery: "On-screen text" },
  { id: "h_ch_06", text: "Rank these from worst to least worst.", type: "Challenge", effect: "Viewer starts ranking in their head", worksBestWith: ["Errand Olympics", "Rank It"], delivery: "On-screen text" },
  { id: "h_ch_07", text: "Which one are you? Don't lie.", type: "Challenge", effect: "Viewer starts identifying themselves", worksBestWith: ["The Friend Every Group Has", "Different Women Different Answer"], delivery: "On-screen text" },
  { id: "h_ch_08", text: "Post it, crop it, or delete it?", type: "Challenge", effect: "Viewer makes a choice immediately", worksBestWith: ["The Bad Angle Veto"], delivery: "On-screen text" },
];

// ===== Helper functions =====

export function getHooksByType(type: HookType): Hook[] {
  return HOOKS.filter((h) => h.type === type);
}

export function getHooksByFormat(formatName: string): Hook[] {
  return HOOKS.filter((h) => h.worksBestWith.includes(formatName));
}

export function getOnScreenHooks(): Hook[] {
  return HOOKS.filter((h) => h.delivery === "On-screen text");
}

export function getSpokenHooks(): Hook[] {
  return HOOKS.filter((h) => h.delivery === "Spoken");
}
