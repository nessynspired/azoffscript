/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 3: Caption Framework Library
 *
 * Purpose:
 *   Not individual captions. Frameworks.
 *   Because captions change, but the frameworks stay.
 *
 *   Each framework has a formula, a purpose, and examples.
 *   The examples can be rotated. The framework is permanent.
 */

export type CaptionFrameworkPurpose =
  | "Comments"
  | "Shares"
  | "Retention"
  | "Participation"
  | "Brand Recognition"
  | "Saves";

export interface CaptionFramework {
  id: string;
  name: string;
  purpose: CaptionFrameworkPurpose;
  /** The formula — how to construct a caption in this framework */
  formula: string;
  /** Why this framework works */
  whyItWorks: string;
  /** Example captions using this framework */
  examples: string[];
  /** Content formats this framework works best with */
  worksBestWith: string[];
  /** What to avoid when using this framework */
  avoid: string[];
}

export const FRAMEWORK_PURPOSES: CaptionFrameworkPurpose[] = [
  "Comments",
  "Shares",
  "Retention",
  "Participation",
  "Brand Recognition",
  "Saves",
];

export const PURPOSE_COLORS: Record<CaptionFrameworkPurpose, string> = {
  Comments: "💬",
  Shares: "📤",
  Retention: "⏱️",
  Participation: "🤝",
  "Brand Recognition": "🏷️",
  Saves: "🔖",
};

export const CAPTION_FRAMEWORKS: CaptionFramework[] = [
  {
    id: "cf_01",
    name: "Debate Framework",
    purpose: "Comments",
    formula: "Statement + disagreement invitation",
    whyItWorks: "Binary questions get the most comments. People want to pick a side. The caption sets up the debate that the video delivers.",
    examples: [
      "Okay, we need answers on this one… 👀",
      "Who is right? The room is split.",
      "Guilty or not guilty? You decide.",
      "Settle this for us. We can't agree.",
      "Red flag or are we doing too much?",
    ],
    worksBestWith: ["Group Chat Court", "Fake Scenario Court", "Friend or Follower?", "Girl Code or Just Drama?"],
    avoid: [
      "Giving your own opinion in the caption — let the video do that",
      "Making it too long — the caption should be short",
      "Using 'follow for more' — the question is the call to action",
    ],
  },
  {
    id: "cf_02",
    name: "Community Framework",
    purpose: "Participation",
    formula: "Question + invitation to participate",
    whyItWorks: "Makes viewers feel like they're part of the conversation, not just watching it. The invitation is the engagement.",
    examples: [
      "What would you add? 👇",
      "Your turn. What's your answer?",
      "Women, what's your take?",
      "Arizona, we need to talk about this.",
      "What question should we ask next?",
    ],
    worksBestWith: ["Different Women Different Answer", "One-Line Verdict", "Real Quick"],
    avoid: [
      "Making it feel like a poll — it's a conversation",
      "Using generic 'comment below' — be specific",
      "Asking yes/no — open questions get longer comments",
    ],
  },
  {
    id: "cf_03",
    name: "Relatable Framework",
    purpose: "Shares",
    formula: "Shared experience + emotional connection",
    whyItWorks: "People share content that makes them feel seen. The caption names the experience before the video shows it.",
    examples: [
      "Tell me I'm not the only one… 😅",
      "If you know, you know 🌵",
      "My nervous system said no 😮‍💨",
      "Act normal. Act normal. Act normal. 😬",
      "Mom math. What's your equation? 😂",
    ],
    worksBestWith: ["Mom Math", "My Nervous System Said No", "Act Normal Challenge", "Arizona Micro-Moment"],
    avoid: [
      "Overexplaining the relatable moment — let the video show it",
      "Using 'relatable' in the caption — the caption IS the relatable moment",
      "Making it too niche — relatable means broadly relatable",
    ],
  },
  {
    id: "cf_04",
    name: "Story Framework",
    purpose: "Retention",
    formula: "'I didn't realize this until…' + setup",
    whyItWorks: "Creates curiosity about the realization. Viewer stays to hear the full story. The caption is the hook.",
    examples: [
      "I didn't realize this until…",
      "Real quick… what did you learn?",
      "Arizona made me this way. What did it do to you? 🌵",
      "Behind the scenes of building something real 🤍",
      "This started as a joke. It became a real conversation.",
    ],
    worksBestWith: ["Real Quick", "Arizona Made Me This Way", "BTS / Real Process", "Soft Truths"],
    avoid: [
      "Telling the whole story in the caption — the caption is the setup",
      "Giving away the ending — curiosity drives retention",
      "Making it too long — the caption should be a sentence, not a paragraph",
    ],
  },
  {
    id: "cf_05",
    name: "Identity Framework",
    purpose: "Shares",
    formula: "'If you're [identity], you know…' + experience",
    whyItWorks: "People share content that names their identity. The caption claims the viewer before the video starts.",
    examples: [
      "If you're from Arizona, you know… 🌵",
      "Only moms understand this…",
      "Women will understand this one.",
      "Quiet girls, is this you? 🤍",
      "If you're the one who always…",
    ],
    worksBestWith: ["Only Arizona People Understand", "Mom Math", "The Friend Every Group Has", "No Words Needed"],
    avoid: [
      "Making the identity too narrow — 'if you're a mom from Buckeye who works from home' is too specific",
      "Using identity without a payoff — the video has to deliver on the identity claim",
      "Excluding people unnecessarily — 'if you're NOT from Arizona' creates the wrong energy",
    ],
  },
  {
    id: "cf_06",
    name: "Brand Framework",
    purpose: "Brand Recognition",
    formula: "Brand voice + signature language + invitation",
    whyItWorks: "Builds brand recognition through consistent voice. The caption sounds like AZ Off Script, not like anyone else.",
    examples: [
      "Meet the AZ Off Script crew. Who's your favorite?",
      "Arizona is the setting. Social scripts are the engine. 🌵",
      "We're building the room. Want in? 👀",
      "Off Script Looks. The fit has entered the chat 💅",
      "The room has a verdict. Do you agree?",
    ],
    worksBestWith: ["Crew Intro Pass", "Crew vs Future Wave", "Search Explainers", "Off Script Looks"],
    avoid: [
      "Sounding like a generic brand — use the AZ Off Script voice",
      "Being too promotional — the invitation is soft, not a sales pitch",
      "Inconsistent voice — every brand caption should sound like the same person wrote it",
    ],
  },
  {
    id: "cf_07",
    name: "Curiosity Framework",
    purpose: "Retention",
    formula: "Incomplete statement + implied answer in video",
    whyItWorks: "The caption creates an information gap. The viewer has to watch the video to close the gap.",
    examples: [
      "Everyone answered this differently…",
      "The last answer surprised us.",
      "We asked Arizona women something nobody asks…",
      "Not one person gave the same answer.",
      "This question broke the group chat.",
    ],
    worksBestWith: ["Different Women Different Answer", "Group Chat Court", "One-Line Verdict"],
    avoid: [
      "Answering the curiosity in the caption — the video is the answer",
      "Making the curiosity too vague — 'you won't believe what happened' is lazy",
      "Overusing this framework — if every video is curiosity, none of them are",
    ],
  },
  {
    id: "cf_08",
    name: "Emotional Framework",
    purpose: "Saves",
    formula: "Honest statement + vulnerability",
    whyItWorks: "People save content that makes them feel something. The caption is the emotional hook.",
    examples: [
      "Real quick… what are you tired of explaining? 🤍",
      "Being the person everyone depends on but nobody checks on.",
      "I can be kind and still be done. 🤍",
      "Nobody talks about this part.",
      "This is for the women who are tired of being strong.",
    ],
    worksBestWith: ["Real Quick", "Soft Truths", "Different Women Different Answer"],
    avoid: [
      "Being preachy — the caption is a feeling, not a lesson",
      "Overexplaining the emotion — let the video carry it",
      "Using this framework too often — emotional content is powerful because it's not constant",
    ],
  },
  {
    id: "cf_09",
    name: "Funny Framework",
    purpose: "Shares",
    formula: "Setup + punchline (or setup + implied punchline in video)",
    whyItWorks: "People share funny content. The caption either delivers the joke or sets it up for the video.",
    examples: [
      "The family said WHAT?! 😭",
      "Can this be an email? PLEASE? 😩",
      "Errand Olympics. Rank them worst to least worst 🥇",
      "Don't make it awkward 😬",
      "Mom math. What's your equation? 😂",
    ],
    worksBestWith: ["The Family Said What?", "Can This Be an Email?", "Errand Olympics", "Don't Make It Awkward", "Mom Math"],
    avoid: [
      "Explaining the joke — if the caption explains it, the video can't deliver it",
      "Being funny without substance — the humor should come from truth",
      "Using the same joke structure every time — vary the setup",
    ],
  },
  {
    id: "cf_10",
    name: "Challenge Framework",
    purpose: "Comments",
    formula: "Direct challenge + binary or ranked choice",
    whyItWorks: "Challenges create immediate engagement. The viewer has to participate — rank it, pick one, vote.",
    examples: [
      "Which one are you? Don't lie. 😂",
      "Rank these from worst to least worst.",
      "Post it, crop it, or delete it?",
      "Tag yourself. Don't lie.",
      "Can you watch this without reacting?",
    ],
    worksBestWith: ["The Friend Every Group Has", "Errand Olympics", "The Bad Angle Veto", "Act Normal Challenge"],
    avoid: [
      "Making the challenge too complex — it should be answerable in 2 seconds",
      "Not delivering on the challenge — if you ask them to rank, the video should show rankings",
      "Using 'comment below' — be specific about what to comment",
    ],
  },
];

// ===== Helper functions =====

export function getFrameworksByPurpose(purpose: CaptionFrameworkPurpose): CaptionFramework[] {
  return CAPTION_FRAMEWORKS.filter((f) => f.purpose === purpose);
}
