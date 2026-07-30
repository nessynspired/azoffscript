/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 1: Market Gap Intelligence Library
 *
 * Purpose:
 *   Understand where the market is crowded, where opportunities exist,
 *   and how AZ Off Script enters differently.
 *
 *   This protects against becoming another generic creator page.
 *
 * Structure:
 *   Part 1 — Saturated Markets (what everyone does + our opportunity)
 *   Part 2 — White Space Opportunities (lanes we can own)
 *   Part 3 — What We Refuse To Become (the anti-brand list)
 */

// ===== PART 1: SATURATED MARKETS =====

export type MarketSaturation = "Flooded" | "Crowded" | "Competitive" | "Growing";

export interface SaturatedMarket {
  id: string;
  market: string;
  saturation: MarketSaturation;
  /** What the current market looks like — the flooded version */
  currentState: string[];
  /** Why this market is a problem for a new entrant */
  problem: string;
  /** What AZ Off Script does instead — the differentiation */
  azOffScriptOpportunity: string[];
  /** Specific content formats that fit this gap */
  bestFormats: string[];
  /** Example prompts that would work in this gap */
  examplePrompts: string[];
}

export const SATURATION_COLORS: Record<MarketSaturation, string> = {
  Flooded: "🌊",
  Crowded: "👥",
  Competitive: "⚔️",
  Growing: "🌱",
};

export const SATURATED_MARKETS: SaturatedMarket[] = [
  // ===== WOMEN'S CONTENT =====
  {
    id: "sm_01",
    market: "Women's Empowerment",
    saturation: "Flooded",
    currentState: [
      "Motivational quotes on aesthetic backgrounds",
      "'You are enough' graphics",
      "'Boss babe' hustle content",
      "Generic confidence posts",
      "Self-care routine videos",
      "'Women supporting women' with no real conversation",
    ],
    problem: "Everyone sounds the same. There is no personality, no disagreement, no real conversation. It is copy-paste motivation.",
    azOffScriptOpportunity: [
      "Real women having real conversations — not quotes",
      "What women actually disagree about (not what we all agree on)",
      "Things women don't say out loud",
      "Different generations of women answering the same question",
      "Expectations women are tired of explaining",
      "The conversations women have privately, made public",
    ],
    bestFormats: ["Different Women Different Answer", "Real Quick", "One-Line Verdict", "Group Chat Court"],
    examplePrompts: [
      "What is something women are expected to tolerate but shouldn't?",
      "What is a 'women's issue' that men should care about more?",
      "What do older women and younger women disagree on?",
      "What is something women pretend to like but don't?",
    ],
  },
  {
    id: "sm_02",
    market: "Women's Lifestyle / Day-in-the-Life",
    saturation: "Flooded",
    currentState: [
      "Aesthetic morning routines",
      "'Day in my life' vlogs with perfect lighting",
      "5 AM productivity content",
      "Self-care Sunday videos",
      "Aesthetic apartment tours",
      "'That girl' lifestyle content",
    ],
    problem: "It's performance, not life. Nobody's morning looks like that. It creates comparison, not connection.",
    azOffScriptOpportunity: [
      "Before I Leave the House — the real version, not the aesthetic version",
      "Things moms pretend they have together",
      "Arizona Micro-Moment — real local life, not aesthetic life",
      "The gap between the plan and what actually happened",
      "Real mornings, real chaos, real honesty",
    ],
    bestFormats: ["Before I Leave the House", "Arizona Micro-Moment", "Mom Math", "BTS / Real Process"],
    examplePrompts: [
      "Before I leave the house, I need… (the real list)",
      "My morning routine vs what I pretend it is",
      "Things I pretend I have together",
      "The gap between my plan and my reality",
    ],
  },

  // ===== MOM CONTENT =====
  {
    id: "sm_03",
    market: "Mom Content — Routines & Aesthetic",
    saturation: "Flooded",
    currentState: [
      "Morning routines with clean kitchens",
      "Cleaning videos with satisfying music",
      "Grocery hauls and meal prep",
      "'Perfect mom' aesthetic content",
      "Montessori-inspired playroom tours",
      "Aesthetic lunchbox prep",
    ],
    problem: "It's aspirational, not relatable. Most moms watch and feel worse, not better. There's no honesty about the struggle.",
    azOffScriptOpportunity: [
      "Different moms answer: what nobody warned you about motherhood",
      "Mom math — tired logic that only makes sense if you're a mom",
      "Who was supposed to do that? — the invisible labor debate",
      "The things moms pretend they have together",
      "Real mom moments — the chaos, not the aesthetic",
    ],
    bestFormats: ["Mom Math", "Who Was Supposed to Do That?", "Different Women Different Answer", "Real Quick"],
    examplePrompts: [
      "What's your mom math?",
      "Who makes the appointments in your house?",
      "What did nobody warn you about motherhood?",
      "What's something you pretend to have together?",
    ],
  },
  {
    id: "sm_04",
    market: "Mom Content — Advice & Parenting Tips",
    saturation: "Crowded",
    currentState: [
      "One mom giving parenting advice",
      "'Gentle parenting' explainers",
      "Discipline technique videos",
      "Screen time debate content",
      "'What I did right' mom content",
    ],
    problem: "One perspective presented as the right way. No room for disagreement. Moms feel judged, not supported.",
    azOffScriptOpportunity: [
      "Multiple moms give their real take — not advice",
      "The room debates parenting choices — no one is the expert",
      "Generational differences in parenting — grandma vs mom vs millennial mom",
      "What works for one kid doesn't work for another — the honest version",
    ],
    bestFormats: ["Different Women Different Answer", "Group Chat Court", "One-Line Verdict"],
    examplePrompts: [
      "What parenting advice did you ignore?",
      "What did your mom do that you swore you'd never do — but did?",
      "What's a parenting choice people judge you for?",
      "Gentle parenting or survival parenting?",
    ],
  },

  // ===== DATING CONTENT =====
  {
    id: "sm_05",
    market: "Dating Content — Red Flags & Advice",
    saturation: "Flooded",
    currentState: [
      "'5 dating red flags' list videos",
      "Dating advice from one person",
      "Relationship quote graphics",
      "'Therapist says...' videos",
      "Men vs women argument content",
      "'How to know he's the one' content",
    ],
    problem: "It's one person giving advice as if there's one answer. Real dating is messy and everyone's experience is different.",
    azOffScriptOpportunity: [
      "10 women answer: what's a red flag you ignored? — real experiences, not lists",
      "He said / she heard — translation, not advice",
      "Red flag, real life, or just tired? — not everything is toxic",
      "Apology or excuse — real phrases, real translations",
      "The difference between answers IS the content",
    ],
    bestFormats: ["Different Women Different Answer", "He Said / She Heard", "Red Flag, Real Life, or Just Tired?", "Apology or Excuse?"],
    examplePrompts: [
      "What's a red flag you ignored and regretted?",
      "What's a red flag everyone talks about that isn't actually a red flag?",
      "He said 'I'm bad at texting.' What did you hear?",
      "What's an apology that's actually an excuse?",
    ],
  },
  {
    id: "sm_06",
    market: "Dating Content — Men vs Women",
    saturation: "Crowded",
    currentState: [
      "'What men really want' videos",
      "'What women really mean' videos",
      "Gender war debate content",
      "Pick-me content",
      "'Modern women are the problem' takes",
      "Relationship coach content",
    ],
    problem: "It's adversarial. It pits men and women against each other for engagement. It's not a conversation, it's a fight.",
    azOffScriptOpportunity: [
      "Not men vs women — women translating what men say (without anger)",
      "Caring or controlling — the nuance, not the war",
      "Helping or making it worse — the real conversation",
      "Men think this means nothing — women notice — the translation, not the fight",
    ],
    bestFormats: ["He Said / She Heard", "Caring or Controlling?", "Helping or Making It Worse?", "Men Think This Means Nothing"],
    examplePrompts: [
      "He said 'do what you want.' What did you hear?",
      "He helped with the kids but left the kitchen destroyed. Helping or making it worse?",
      "He wants your location on. Caring or controlling?",
      "What's something men think means nothing but women notice?",
    ],
  },

  // ===== FRIENDSHIP CONTENT =====
  {
    id: "sm_07",
    market: "Friendship Content",
    saturation: "Crowded",
    currentState: [
      "Friendship quotes",
      "'Send this to your bestie' graphics",
      "Friendship meme reposts",
      "'Types of friends' list videos",
      "Friendship bracelet content",
      "'Friendship goals' couple-style content",
    ],
    problem: "It's surface-level. No one is talking about the hard parts of friendship — the betrayal, the growing apart, the boundaries.",
    azOffScriptOpportunity: [
      "When do you know a friendship changed? — the real conversation",
      "Friendship rules nobody talks about",
      "Friend or follower — the difference between a real friend and an audience member",
      "Girl code or just drama — the actual debate",
      "Be the bigger person or finally stop — the hard boundary question",
    ],
    bestFormats: ["Group Chat Court", "Friend or Follower?", "Girl Code or Just Drama?", "Be the Bigger Person Court"],
    examplePrompts: [
      "What makes someone a real friend vs a follower?",
      "What's a friendship red flag?",
      "When do you know a friendship has changed?",
      "Be the bigger person or finally stop?",
    ],
  },

  // ===== RELATIONSHIP ADVICE =====
  {
    id: "sm_08",
    market: "Relationship Advice",
    saturation: "Flooded",
    currentState: [
      "One person giving advice",
      "'Therapist says...' videos",
      "Couples coaching content",
      "'Signs your relationship is toxic' lists",
      "Relationship check-in templates",
      "'Green flags in a relationship' lists",
    ],
    problem: "One expert, one answer. Real relationships don't work like a checklist. The nuance is missing.",
    azOffScriptOpportunity: [
      "Multiple women give their real verdict — not advice",
      "Court format — the room decides, not one expert",
      "Caring or controlling — debate, not rules",
      "Apology or excuse — translation, not therapy",
      "The room debates, the audience votes",
    ],
    bestFormats: ["Group Chat Court", "Caring or Controlling?", "Apology or Excuse?", "Fake Scenario Court"],
    examplePrompts: [
      "Is this caring or controlling?",
      "Does this apology count?",
      "What's a green flag people ignore?",
      "What's a relationship rule you disagree with?",
    ],
  },

  // ===== ARIZONA / LOCAL CONTENT =====
  {
    id: "sm_09",
    market: "Arizona / Local Content",
    saturation: "Competitive",
    currentState: [
      "Generic Arizona scenery",
      "Tourist Arizona content",
      "'Living in Arizona' vlogs",
      "Restaurant and event reviews",
      "Real estate content",
      "Weather complaint content",
    ],
    problem: "It's about places, not people. Nobody is capturing the voices of the women who actually live there.",
    azOffScriptOpportunity: [
      "Arizona made me — habits and instincts AZ gave us",
      "Only Arizona people understand — inside jokes",
      "Arizona woman math — local logic",
      "Buckeye/Phoenix/Valley specific experiences",
      "The voices of Arizona women, not the views of Arizona",
    ],
    bestFormats: ["Arizona Made Me This Way", "Only Arizona People Understand", "Arizona Micro-Moment", "Arizona Woman Math"],
    examplePrompts: [
      "Arizona made me...",
      "You know you live in Arizona when...",
      "What's the most Arizona thing about you?",
      "Only Arizona people understand why...",
    ],
  },

  // ===== CULTURAL CONTENT =====
  {
    id: "sm_10",
    market: "Cultural / Identity Content",
    saturation: "Crowded",
    currentState: [
      "Cultural stereotype content",
      "'As a [culture] woman' solo takes",
      "Cultural meme pages",
      "Cultural comparison videos",
      "'Things [culture] moms do' lists",
    ],
    problem: "It's stereotypes presented as culture. One person speaking for an entire group. No nuance, no disagreement within the culture.",
    azOffScriptOpportunity: [
      "Black + Latina lens — multiple women, same question",
      "What would your auntie/tía say — real family voice",
      "Family group chat translation — real conversations",
      "The look your mom gives — shared cultural moments",
      "Multiple women from the same culture disagreeing — the nuance",
    ],
    bestFormats: ["Black + Latina Lens", "The Family Said What?", "Text Translation", "Different Women Different Answer"],
    examplePrompts: [
      "What would your auntie say about this?",
      "Translate your family group chat",
      "What's the look your mom gives before she says something wild?",
      "What's something your culture normalizes that shouldn't be?",
    ],
  },

  // ===== BEAUTY / STYLE =====
  {
    id: "sm_11",
    market: "Beauty / Style Content",
    saturation: "Flooded",
    currentState: [
      "Get ready with me videos",
      "Outfit of the day posts",
      "Haul videos",
      "Aesthetic lookbooks",
      "Product reviews",
      "'What I eat in a day' beauty content",
    ],
    problem: "It's showcase, not conversation. Nobody is asking whether the outfit actually works for real life.",
    azOffScriptOpportunity: [
      "The outfit has entered the chat — verdict, not showcase",
      "Cute but can I chase a kid in it — real mom style",
      "The bad angle veto — would you post it, crop it, or delete it",
      "Off Script Looks — brand style with personality",
      "The room rates the fit — multiple opinions, not one showcase",
    ],
    bestFormats: ["The Outfit Has Entered the Chat", "The Bad Angle Veto", "Off Script Looks"],
    examplePrompts: [
      "Cute but can I chase a kid in it?",
      "Would you approve this angle? Post it, crop it, or delete it?",
      "The outfit I planned vs the outfit I survived in",
      "Overdressed or everybody else underdressed?",
    ],
  },

  // ===== TEXTING / COMMUNICATION =====
  {
    id: "sm_12",
    market: "Texting / Communication Content",
    saturation: "Growing",
    currentState: [
      "'What his text really means' videos",
      "Text screenshot content",
      "Texting rule lists",
      "'Red flags in texting' content",
    ],
    problem: "It's one person's interpretation presented as fact. No debate about what texts actually mean.",
    azOffScriptOpportunity: [
      "Text translation — multiple women translate the same text",
      "Too fast, too slow, or normal — the room debates texting timing",
      "The polite line — what your face says vs what you texted",
      "Group chat evidence — real texts, real reactions",
    ],
    bestFormats: ["Text Translation", "Too Fast, Too Slow, or Normal?", "The Polite Line", "Group Chat Evidence"],
    examplePrompts: [
      "'K.' What does it really mean?",
      "Replying in 30 seconds. Too fast, too slow, or normal?",
      "'I'm not mad.' What does it really mean?",
      "'We'll see.' What does it really mean?",
    ],
  },

  // ===== ADULTING =====
  {
    id: "sm_13",
    market: "Adulting Content",
    saturation: "Growing",
    currentState: [
      "'Things nobody teaches you about adulting' lists",
      "Budgeting advice",
      "Career advice from one person",
      "'Adulting is hard' meme content",
    ],
    problem: "It's either meme-level or advice-level. Nobody is having the real conversation about how exhausting adulting actually is.",
    azOffScriptOpportunity: [
      "Can this be an email? — the real workplace debate",
      "Errand Olympics — ranking the worst adult tasks",
      "My nervous system said no — the real adulting overwhelm",
      "The room commiserates — shared adulting struggles",
    ],
    bestFormats: ["Can This Be an Email?", "Errand Olympics", "My Nervous System Said No", "Real Quick"],
    examplePrompts: [
      "Can this be an email? (show the meeting)",
      "Rank these errands worst to least worst",
      "What makes your nervous system say no?",
      "What's an adulting thing nobody teaches you?",
    ],
  },

  // ===== PUBLIC BEHAVIOR / SOCIAL =====
  {
    id: "sm_14",
    market: "Social Anxiety / Public Behavior Content",
    saturation: "Growing",
    currentState: [
      "'Introvert problems' meme content",
      "Social anxiety relatable videos",
      "'Things introverts understand' lists",
    ],
    problem: "It's all memes. Nobody is actually showing what social anxiety looks like in real moments.",
    azOffScriptOpportunity: [
      "Act normal challenge — try not to react to something wild",
      "Don't make it awkward — say the truth or keep the peace",
      "The polite line — what your face says vs what you said",
      "Quiet girl friendly — content that doesn't require talking",
    ],
    bestFormats: ["Act Normal Challenge", "Don't Make It Awkward", "The Polite Line", "No Words Needed"],
    examplePrompts: [
      "Someone says something wild in public. Act normal.",
      "They have food in their teeth. Say the truth or keep the peace?",
      "'I'm good.' What did your face say?",
      "What's a social situation that makes you freeze?",
    ],
  },

  // ===== DEEP / EMOTIONAL =====
  {
    id: "sm_15",
    market: "Deep / Emotional Content",
    saturation: "Competitive",
    currentState: [
      "'Things I wish I knew at 25' videos",
      "Life advice from one person",
      "Aesthetic quote content about healing",
      "'Growth mindset' content",
    ],
    problem: "It's one person's journey presented as universal truth. No room for different paths.",
    azOffScriptOpportunity: [
      "Real quick — one honest thought, not a whole speech",
      "Soft truths — the things women don't say out loud",
      "Different women, different lessons — same question, different growth",
      "The room shares — multiple perspectives on the same life lesson",
    ],
    bestFormats: ["Real Quick", "Soft Truths", "Different Women Different Answer"],
    examplePrompts: [
      "Real quick, I'm tired of explaining...",
      "What's a boundary you had to learn the hard way?",
      "What's something you're tired of tolerating?",
      "What did you learn that nobody taught you?",
    ],
  },

  // ===== CREATOR / BEHIND THE SCENES =====
  {
    id: "sm_16",
    market: "Creator / Behind-the-Scenes Content",
    saturation: "Crowded",
    currentState: [
      "'How I went viral' videos",
      "Day in the life of a creator",
      "Income reports",
      "'Build your brand' coaching content",
      "Aesthetic workspace tours",
    ],
    problem: "It's either bragging or selling. Nobody is showing the real, messy, uncertain process of building something.",
    azOffScriptOpportunity: [
      "BTS / Real Process — the actual behind-the-scenes, not the highlight reel",
      "Building the room — the real journey of building a creator collective",
      "The mistakes, the doubts, the pivots — not just the wins",
      "Arizona women building something — the local angle on creator life",
    ],
    bestFormats: ["BTS / Real Process", "Real Quick", "Arizona Micro-Moment"],
    examplePrompts: [
      "What's something about building this that nobody sees?",
      "What's a mistake you made that taught you something?",
      "What does a real day of building look like?",
      "What's harder than people think?",
    ],
  },
];

// ===== PART 2: WHITE SPACE OPPORTUNITIES =====

export interface WhiteSpaceOpportunity {
  id: string;
  opportunity: string;
  /** The lane we can own */
  lane: string;
  /** Why no one else is doing this */
  whyNoOneOwnsIt: string;
  /** How AZ Off Script fills it */
  howWeFillIt: string;
  /** What makes this defensible — why it's hard to copy */
  moat: string;
  /** Content formats that fit this lane */
  bestFormats: string[];
  /** How to measure if we're winning this lane */
  successMetrics: string[];
}

export const WHITE_SPACE_OPPORTUNITIES: WhiteSpaceOpportunity[] = [
  {
    id: "ws_01",
    opportunity: "The Room of Opinions",
    lane: "Multiple women giving multiple perspectives on the same question — as a format, not a one-off.",
    whyNoOneOwnsIt: "Most pages are built around one person. Building a room requires coordinating multiple people, which is harder than being a solo creator.",
    howWeFillIt: "Different Women Different Answer as a recurring format. The crew IS the content. The difference between answers is the product.",
    moat: "You can't copy 10 real women with real dynamic. A solo creator can't replicate a room. The collective is the moat.",
    bestFormats: ["Different Women Different Answer", "Group Chat Court", "One-Line Verdict", "Two-Second Opinion"],
    successMetrics: [
      "Viewers recognize the format by name",
      "Comments reference specific crew members",
      "People tag friends saying 'which one are you'",
      "The format gets requested by the audience",
    ],
  },
  {
    id: "ws_02",
    opportunity: "Arizona Women's Voices",
    lane: "The voices of Arizona women — not Arizona places, not Arizona events, the women.",
    whyNoOneOwnsIt: "Local pages focus on restaurants, events, and real estate. Nobody is capturing the culture through the women who live there.",
    howWeFillIt: "Arizona Made Me, Only Arizona People Understand, Arizona Micro-Moment. The local identity is woven into everything.",
    moat: "Local community is powerful because it feels like belonging. A national page can't replicate Arizona-specific inside jokes and experiences.",
    bestFormats: ["Arizona Made Me This Way", "Only Arizona People Understand", "Arizona Micro-Moment", "Arizona Woman Math"],
    successMetrics: [
      "Arizona viewers comment with local references",
      "People tag Arizona friends",
      "Local businesses reach out for collaboration",
      "Arizona becomes part of the brand identity",
    ],
  },
  {
    id: "ws_03",
    opportunity: "Friendship Court",
    lane: "Debating friendship behavior in a court format — the room decides.",
    whyNoOneOwnsIt: "Friendship content is all quotes and memes. Nobody is treating friendship behavior like a debatable offense.",
    howWeFillIt: "Group Chat Court, Friend or Follower, Girl Code or Just Drama. The friendship debate is our lane.",
    moat: "The format is recognizable. The crew dynamic can't be copied. The debate structure creates comments naturally.",
    bestFormats: ["Group Chat Court", "Friend or Follower?", "Girl Code or Just Drama?", "Be the Bigger Person Court"],
    successMetrics: [
      "Comments argue the verdict",
      "People share with 'who is right?'",
      "The format gets recognized — 'is this a court video?'",
      "Friendship scenarios get submitted by the audience",
    ],
  },
  {
    id: "ws_04",
    opportunity: "Translation, Not Advice",
    lane: "Translating what people say vs what they mean — without giving advice.",
    whyNoOneOwnsIt: "Everyone gives advice. Nobody just translates. Translation is less preachy and more relatable.",
    howWeFillIt: "He Said / She Heard, Text Translation, Apology or Excuse. We translate, we don't preach.",
    moat: "Translation requires multiple perspectives (what he said vs what she heard). Solo creators can't do this naturally.",
    bestFormats: ["He Said / She Heard", "Text Translation", "Apology or Excuse?", "The Polite Line"],
    successMetrics: [
      "Comments add their own translations",
      "People share with 'is this what you meant?'",
      "The translation format gets recognized",
      "Couples tag each other",
    ],
  },
  {
    id: "ws_05",
    opportunity: "Quiet Creator Inclusion",
    lane: "Content formats that don't require talking — for women who are quiet, shy, or just don't want to perform.",
    whyNoOneOwnsIt: "Creator culture rewards loud personalities. Quiet women are excluded by default. Nobody is building formats for them.",
    howWeFillIt: "No Words Needed, Face-Only Reaction, Silent Visual. The room includes everyone, not just the loudest.",
    moat: "Inclusion is a brand value, not a trend. It builds loyalty with a demographic that's underserved.",
    bestFormats: ["No Words Needed", "Face-Only Reaction", "Silent Visual", "Off Script Looks"],
    successMetrics: [
      "Quiet creators join the crew",
      "Comments from introverted viewers saying 'this is me'",
      "The quiet formats perform as well as the loud ones",
      "The crew represents different energy levels",
    ],
  },
  {
    id: "ws_06",
    opportunity: "The Crew as the Brand",
    lane: "Building a recognizable crew dynamic — not one influencer, a room full of personalities.",
    whyNoOneOwnsIt: "Creator culture is built on personal brands. Building a collective brand is harder and less common.",
    howWeFillIt: "Crew Intro Pass, The Friend Every Group Has, Group Chat Court. The dynamic IS the content.",
    moat: "If one person leaves, the room continues. The collective is more durable than a personal brand. The dynamic can't be copied.",
    bestFormats: ["Crew Intro Pass", "The Friend Every Group Has", "Group Chat Court", "Crew vs Future Wave"],
    successMetrics: [
      "Viewers have favorite crew members",
      "People comment about the dynamic, not just the topic",
      "The crew is recognizable as a group",
      "New members are welcomed by the audience",
    ],
  },
  {
    id: "ws_07",
    opportunity: "Real Life, Not Performance",
    lane: "Content that shows real life — the chaos, the honesty, the imperfection — as a deliberate brand choice.",
    whyNoOneOwnsIt: "Most creators perform a version of their life. The shift toward authenticity is happening, but few are building it as a brand identity.",
    howWeFillIt: "Natural Life Moment recording style, BTS / Real Process, Mom Math. Real is the brand, not the exception.",
    moat: "Authenticity can't be faked at scale. The crew is genuinely real, not performing real. Audiences can tell the difference.",
    bestFormats: ["BTS / Real Process", "Mom Math", "Arizona Micro-Moment", "Real Quick"],
    successMetrics: [
      "Comments say 'this is so real'",
      "Viewers share with 'this is literally me'",
      "The aesthetic is recognizable as 'not aesthetic'",
      "People trust the crew's honesty",
    ],
  },
  {
    id: "ws_08",
    opportunity: "Conversation as Content Engine",
    lane: "Every video ends with a question. Comments become the next video. The audience feeds the content.",
    whyNoOneOwnsIt: "Most creators end with 'follow for more.' Nobody is building a system where comments generate the next content.",
    howWeFillIt: "Comment prompts built into every Shot Recipe. Community prompts feed back into the Prompt Library. The audience is part of the engine.",
    moat: "The system creates a flywheel — content generates comments, comments generate content. It's self-sustaining.",
    bestFormats: ["Any format — the comment prompt is built into the Shot Recipe"],
    successMetrics: [
      "Comments suggest future topics",
      "Videos are made from audience questions",
      "Comment-to-video cycle is visible to the audience",
      "Engagement rate is higher than views would suggest",
    ],
  },
];

// ===== PART 3: WHAT WE REFUSE TO BECOME =====

export interface AntiBrandRule {
  id: string;
  category: string;
  /** What we refuse to become */
  refuse: string;
  /** Why we refuse it */
  why: string;
  /** What we do instead */
  doInstead: string;
  /** The specific behavior to avoid */
  behaviors: string[];
}

export const ANTI_BRAND_RULES: AntiBrandRule[] = [
  {
    id: "ab_01",
    category: "Fake Drama",
    refuse: "A page that manufactures conflict for engagement.",
    why: "Fake drama burns trust. AZ Off Script is built on real conversations, not performance drama. Once people sense it's staged, they leave.",
    doInstead: "Real debates on real topics. The disagreement is natural, not staged. The room genuinely disagrees.",
    behaviors: [
      "Staging arguments between crew members",
      "Creating fake scenarios and presenting them as real",
      "Exaggerating reactions for the camera",
      "Picking topics designed to cause outrage, not conversation",
    ],
  },
  {
    id: "ab_02",
    category: "Forced Controversy",
    refuse: "A page that picks controversial topics just for comments.",
    why: "Controversy for controversy's sake is empty. It gets engagement but destroys brand identity. We're a conversation page, not an outrage page.",
    doInstead: "Pick topics that create genuine debate — where reasonable people can disagree. The debate is the content, not the outrage.",
    behaviors: [
      "Choosing topics solely because they're controversial",
      "Framing questions to maximize outrage",
      "Pitting crew members against each other artificially",
      "Covering culture war topics with no connection to our brand",
    ],
  },
  {
    id: "ab_03",
    category: "Copying Influencers",
    refuse: "A page that copies what big influencers do — the aesthetic, the pacing, the vibe.",
    why: "We are not influencers. We are a room. The collective is the brand, not one aesthetic. Copying influencers makes us a worse version of them.",
    doInstead: "Build the AZ Off Script identity — desert colors, real people, Arizona local, conversation-driven. Our own thing.",
    behaviors: [
      "Copying trending influencer formats without our twist",
      "Adopting influencer aesthetics that don't fit the brand",
      "Trying to sound like popular creators",
      "Following influencer content calendars",
    ],
  },
  {
    id: "ab_04",
    category: "Trend Chasing Without Purpose",
    refuse: "A page that does every trend just because it's trending.",
    why: "Trends without purpose dilute the brand. We become a trend-chasing page, not a conversation page. The trend should serve the brand, not the other way around.",
    doInstead: "Run every trend through the Trend Filter. If it doesn't fit, skip it. If it fits, add the AZ Off Script twist.",
    behaviors: [
      "Doing a trend because everyone else is doing it",
      "Using trending sounds with no connection to the content",
      "Jumping on formats that don't match our brand",
      "Posting trend content instead of conversation content",
    ],
  },
  {
    id: "ab_05",
    category: "Scripted Personalities",
    refuse: "A page where crew members perform a personality instead of being themselves.",
    why: "Scripted personalities are obvious. Audiences can tell when someone is performing. The crew's real personalities are the brand.",
    doInstead: "Let crew members be themselves. The diversity of real personalities is what makes the room interesting.",
    behaviors: [
      "Telling crew members how to react",
      "Scripting answers instead of letting people think",
      "Creating personas for crew members",
      "Editing out personality to fit a template",
    ],
  },
  {
    id: "ab_06",
    category: "Unrealistic Perfection",
    refuse: "A page that presents a perfect, polished, aesthetic version of life.",
    why: "Perfection creates comparison, not connection. We're building relatability, not aspiration. Perfect is the opposite of our brand.",
    doInstead: "Show the real version — the chaos, the honesty, the imperfection. Real is the brand.",
    behaviors: [
      "Filtering and editing to look perfect",
      "Only showing the good parts",
      "Hiding the mess, the struggle, the uncertainty",
      "Presenting a version of life that doesn't exist",
    ],
  },
  {
    id: "ab_07",
    category: "Generic Motivation",
    refuse: "A page that posts generic motivational quotes and empowerment graphics.",
    why: "It's the most flooded content on the internet. It requires no personality. It is copy-paste content. We are a conversation, not a quote page.",
    doInstead: "Real women saying real things. The quote becomes a conversation, not a graphic. The conversation IS the motivation.",
    behaviors: [
      "Posting quote graphics",
      "'You are enough' style content",
      "Generic empowerment posts",
      "Aesthetic motivation with no substance",
    ],
  },
  {
    id: "ab_08",
    category: "Every Viral Sound",
    refuse: "A page that uses every viral sound just because it's trending.",
    why: "Using every sound with no brand connection makes us a trend-chasing page, not a brand. The sound should serve the content, not the other way around.",
    doInstead: "Use trending sounds only when they fit a conversation format. The sound supports the content, not the other way around.",
    behaviors: [
      "Lip-syncing to trending audio with no original content",
      "Using sounds because they're trending, not because they fit",
      "Building content around sounds instead of conversations",
      "Posting sound-based content instead of conversation content",
    ],
  },
  {
    id: "ab_09",
    category: "Overproduced Influencer Style",
    refuse: "A page with overproduced, highly edited, influencer-style content.",
    why: "Overproduction conflicts with the real-person identity. We're building authenticity, not production value. Polish is the enemy of real.",
    doInstead: "Keep editing clean but not overproduced. The content should feel like a real moment, not a commercial.",
    behaviors: [
      "Heavy filters and color grading",
      "Over-edited transitions that look too polished",
      "Professional lighting that looks studio-grade",
      "Production value that overshadows the conversation",
    ],
  },
  {
    id: "ab_10",
    category: "Follow-for-Follow Engagement Bait",
    refuse: "A page that ends every video with 'follow for more.'",
    why: "It's generic and it doesn't build community. Comments build community. 'Follow for more' is a dead end.",
    doInstead: "End every video with a question. 'Who is right?' not 'Follow for more.' The question drives comments, comments drive reach.",
    behaviors: [
      "Ending videos with 'follow for more'",
      "Generic call-to-actions",
      "Begging for follows",
      "Engagement bait that doesn't start a conversation",
    ],
  },
];

// ===== Helper functions =====

export function getSaturatedMarketsByLevel(saturation: MarketSaturation): SaturatedMarket[] {
  return SATURATED_MARKETS.filter((m) => m.saturation === saturation);
}

export function getFloodedMarkets(): SaturatedMarket[] {
  return getSaturatedMarketsByLevel("Flooded");
}

export function getGrowingMarkets(): SaturatedMarket[] {
  return getSaturatedMarketsByLevel("Growing");
}
