/**
 * Quick Drop Library — 12 content categories for AZ Off Script.
 *
 * PHILOSOPHY: Prompt them. Don't script them.
 * We give the idea. They bring the moment.
 *
 * Each template has:
 *  - Idea, Vibe, WhatToDrop, EasyWay, Examples, MakeItYours
 *  - Effort label: "2-Min Drop", "5-Min Drop", "10-Min Drop", "Group Day", "Edit Heavy"
 *  - Home-friendly, needs talking, needs editing flags
 *  - SEO phrase (for on-screen text, caption, hashtags, website recap)
 *  - Caption starter
 *  - Hashtag starter (5-8 hashtags, not 25)
 *  - Category bucket
 */

export type EffortLabel = "2-Min Drop" | "5-Min Drop" | "10-Min Drop" | "Group Day" | "Edit Heavy" | "Save Later";

export interface QuickDropTemplate {
  id: string;
  name: string;
  bucket: string;           // one of the 12 categories
  description: string;
  effort: EffortLabel;
  timeEstimate: string;
  homeFriendly: boolean;
  needsTalking: boolean;
  needsEditing: boolean;
  adminStitches: boolean;
  maxSeconds?: number;
  idea: string;
  vibe: string;
  whatToDrop: string;
  easyWay?: string;
  examples?: string[];
  makeItYours: string;
  transitions?: string[];
  seoPhrase: string;        // main search phrase
  captionStarter: string;   // caption template
  hashtagStarter: string[]; // 5-8 hashtags
  platforms: string[];
}

// The 12 content buckets
export const CONTENT_BUCKETS = [
  "Transitions",
  "Face-Only Reactions",
  "One-Line Verdicts",
  "Arizona Moments",
  "Group Chat Court",
  "Soft POVs",
  "BTS / Real Process",
  "AZ Tried It",
  "Black + Latina Lens",
  "Friendship Energy",
  "Comment-to-Clip",
  "Search Explainers",
] as const;

export const QUICK_DROP_TEMPLATES: QuickDropTemplate[] = [
  // 1. TRANSITIONS
  {
    id: "first_wave_intro",
    name: "First Wave Intro Pass",
    bucket: "Transitions",
    description: "Each person records a short intro using a simple camera transition. Stitched together into one intro video.",
    effort: "10-Min Drop",
    timeEstimate: "5-10 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: true,
    adminStitches: true,
    maxSeconds: 10,
    idea: "Introduce yourself as part of AZ Off Script using a simple camera transition.",
    vibe: "Confident, funny, chill, real. Don't overthink it.",
    whatToDrop: "A short intro clip, 5-10 seconds.",
    easyWay: "Step toward the camera, cover the camera, zoom in/out, or do your own transition.",
    examples: [
      "I'm Vanessa, and I'm building the room.",
      "I'm Ronnie, and I bring the sweet touch.",
      "I'm Sholanda, and somebody had to say it.",
      "I'm Elaine, and my face says enough.",
      "I'm Latasha, and I'm the wild card.",
      "I'm Maria, and I bring the fresh energy.",
    ],
    makeItYours: "Say your name, your vibe, or why people need to watch you. Add your own attitude, humor, face, pose, line, or little moment. This is not a script — bring your own timing, face, attitude, or twist.",
    transitions: [
      "Step toward the camera",
      "Cover the camera with your hand",
      "Cover the camera with a tumbler or phone",
      "Zoom into your face",
      "Start close-up, then step back",
      "Walk into frame",
      "Point at the camera",
      "Do your own transition",
    ],
    seoPhrase: "Arizona creator crew",
    captionStarter: "Meet the AZ Off Script crew. 👋 Who's your favorite?",
    hashtagStarter: ["#AZOffScript", "#ArizonaCreators", "#ArizonaTikTok", "#CreatorCrew", "#MeetTheCrew"],
    platforms: ["TikTok", "Reels", "Facebook", "Shorts"],
  },
  {
    id: "transition_remix",
    name: "Transition Remix",
    bucket: "Transitions",
    description: "Use a trending transition to answer a prompt or reveal something.",
    effort: "5-Min Drop",
    timeEstimate: "3-5 min",
    homeFriendly: true,
    needsTalking: false,
    needsEditing: true,
    adminStitches: true,
    maxSeconds: 10,
    idea: "Use a simple transition to answer a prompt or reveal your take.",
    vibe: "Quick, visual, satisfying. Let the transition do the work.",
    whatToDrop: "A short clip with a transition — before and after.",
    easyWay: "Record the 'before,' do your transition, record the 'after.'",
    examples: [
      "Cover camera → reveal your answer face",
      "Step toward camera → close-up reaction",
      "Zoom out → show the whole room",
    ],
    makeItYours: "Pick any transition or invent your own. The transition is the style — your face is the content.",
    transitions: [
      "Step toward the camera",
      "Cover the camera with your hand",
      "Cover with tumbler or phone",
      "Zoom in / zoom out",
      "Walk into frame",
      "Turn head to next person",
      "Throw object / next person catches",
      "Phone drop transition",
      "Do your own",
    ],
    seoPhrase: "transition challenge reaction",
    captionStarter: "We tried the transition trend. How did we do? 🔥",
    hashtagStarter: ["#AZOffScript", "#TransitionTrend", "#ArizonaCreators", "#TikTokTransition", "#ReactionVideo"],
    platforms: ["TikTok", "Reels", "Shorts"],
  },

  // 2. FACE-ONLY REACTIONS
  {
    id: "face_only_reaction",
    name: "Face-Only Reaction",
    bucket: "Face-Only Reactions",
    description: "No talking — just your face reacting to a prompt.",
    effort: "2-Min Drop",
    timeEstimate: "1-2 min",
    homeFriendly: true,
    needsTalking: false,
    needsEditing: false,
    adminStitches: false,
    maxSeconds: 10,
    idea: "React to a prompt with your face only — no talking.",
    vibe: "Raw, real, unfiltered. Your face does all the work.",
    whatToDrop: "Your reaction face. That's it. No words needed.",
    easyWay: "Read the prompt, hit record, give your honest face.",
    examples: [
      "Side-eye",
      "Slow blink",
      "Walk away",
      "Fake smile",
      "Stare into camera",
      "Deep sigh",
    ],
    makeItYours: "There's no script here. Your face is the content. Whatever you feel, show it.",
    seoPhrase: "face reaction video",
    captionStarter: "No words needed. Just the face. 😳 What's yours?",
    hashtagStarter: ["#AZOffScript", "#FaceReaction", "#ReactionVideo", "#ArizonaCreators", "#NoWords"],
    platforms: ["TikTok", "Reels", "Shorts"],
  },

  // 3. ONE-LINE VERDICTS
  {
    id: "one_line_verdict",
    name: "One-Line Verdict",
    bucket: "One-Line Verdicts",
    description: "One sentence, strong opinion. No long explanation.",
    effort: "2-Min Drop",
    timeEstimate: "1-2 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: false,
    adminStitches: false,
    maxSeconds: 10,
    idea: "Give your verdict in one sentence. No hedging, no explaining.",
    vibe: "Bold, quick, final. Say it and done.",
    whatToDrop: "One line. Your verdict. 5-10 seconds.",
    easyWay: "Just hit record and say the first thing that comes to mind.",
    examples: [
      "Red flag. Next.",
      "Wrong, but I understand.",
      "That's not toxic, that's tired.",
      "Arizona made me this way.",
      "I'm not judging. I'm observing.",
      "Guilty. No further questions.",
    ],
    makeItYours: "Your words, your delivery. The shorter the better. Don't explain — just verdict.",
    seoPhrase: "hot take reaction",
    captionStarter: "One line. That's it. Do you agree? 👇",
    hashtagStarter: ["#AZOffScript", "#HotTakes", "#OneLineVerdict", "#ArizonaCreators", "#ReactionVideo"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 4. ARIZONA MICRO-MOMENTS
  {
    id: "arizona_micro_moment",
    name: "Arizona Micro-Moment",
    bucket: "Arizona Moments",
    description: "Quick local take about living in Arizona.",
    effort: "5-Min Drop",
    timeEstimate: "2-5 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: false,
    adminStitches: false,
    maxSeconds: 20,
    idea: "Give us a quick Arizona take — something only AZ people get.",
    vibe: "Local, real, a little chaotic. Arizona-specific.",
    whatToDrop: "Your AZ take. 10-20 seconds.",
    easyWay: "Just hit record and say the first thing that comes to mind about Arizona life.",
    examples: [
      "Only Arizona people understand...",
      "Arizona hot take...",
      "West Valley behavior is...",
      "A 20-minute drive in Arizona feels like...",
      "The way we plan errands in July should be studied.",
      "Arizona people when it drops below 70.",
    ],
    makeItYours: "Your Arizona, your words. The more specific the better. West Valley, Buckeye, Phoenix — rep your area.",
    seoPhrase: "Arizona hot take",
    captionStarter: "Only Arizona people will understand this. 🌵 You get it?",
    hashtagStarter: ["#AZOffScript", "#ArizonaTikTok", "#ArizonaHotTake", "#WestValleyAZ", "#ArizonaCreators", "#ArizonaLife"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 5. GROUP CHAT COURT
  {
    id: "group_chat_court",
    name: "Group Chat Court",
    bucket: "Group Chat Court",
    description: "The room decides — guilty or not guilty? Right or wrong?",
    effort: "10-Min Drop",
    timeEstimate: "5-10 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: true,
    adminStitches: true,
    maxSeconds: 20,
    idea: "We give you a scenario. You decide: guilty or not guilty? Right or wrong?",
    vibe: "Debate energy. Honest, funny, a little messy. The room decides.",
    whatToDrop: "Your verdict + a quick reason. 15-20 seconds.",
    easyWay: "Just say what you think and why. Don't overthink it.",
    examples: [
      "She invited everyone except one person because the vibe would be better. Wrong or fair?",
      "He watched every story but didn't text back. Guilty or not guilty?",
      "Your friend keeps showing up late. Still invite her or stop telling her the real time?",
    ],
    makeItYours: "Your verdict, your reasoning. Call it like you see it. The comments will vote too.",
    seoPhrase: "group reaction video",
    captionStarter: "The room decides: guilty or not guilty? 🧑‍⚖️ You vote too.",
    hashtagStarter: ["#AZOffScript", "#GroupChatCourt", "#GroupReaction", "#ArizonaCreators", "#ReactionVideo", "#GuiltyOrNot"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 6. SOFT POVs
  {
    id: "soft_pov",
    name: "Soft POV",
    bucket: "Soft POVs",
    description: "Quick POV scenario — not full acting, just the moment.",
    effort: "5-Min Drop",
    timeEstimate: "3-5 min",
    homeFriendly: true,
    needsTalking: false,
    needsEditing: false,
    adminStitches: false,
    maxSeconds: 15,
    idea: "Act out a quick POV scenario. Just the moment, not a whole scene.",
    vibe: "Relatable, funny, recognizable. The 'oh that's me' energy.",
    whatToDrop: "A short POV clip. 10-15 seconds.",
    easyWay: "Just set up the scenario with on-screen text and react.",
    examples: [
      "POV: you said you were leaving but the car is 140 degrees.",
      "POV: the group chat says 'be honest.'",
      "POV: you're trying to pick a brunch spot with six women.",
      "POV: someone says 'I don't care' and definitely cares.",
    ],
    makeItYours: "Your face, your body language, your timing. The POV is the setup — your reaction is the content.",
    seoPhrase: "POV relatable video",
    captionStarter: "POV: you've been here. 😅 Tag someone who does this.",
    hashtagStarter: ["#AZOffScript", "#POV", "#Relatable", "#ArizonaCreators", "#POVTikTok"],
    platforms: ["TikTok", "Reels", "Shorts"],
  },

  // 7. BTS / REAL PROCESS
  {
    id: "bts_real_process",
    name: "BTS / Real Process",
    bucket: "BTS / Real Process",
    description: "Behind the scenes — what it actually looks like to make content.",
    effort: "10-Min Drop",
    timeEstimate: "5-10 min",
    homeFriendly: true,
    needsTalking: false,
    needsEditing: false,
    adminStitches: false,
    maxSeconds: 30,
    idea: "Show what really happens when we try to make content. The chaos, the debates, the real.",
    vibe: "Unfiltered, honest, human. Not polished — real.",
    whatToDrop: "A BTS clip — the mess, the laughs, the process.",
    easyWay: "Just record what's happening. Don't perform — just document.",
    examples: [
      "Getting ready to film but the house is doing the most.",
      "What I thought content day would look like vs what actually happened.",
      "Behind the scenes of trying to make one simple clip.",
      "The 10-minute clip took 2 minutes and 8 mental debates.",
    ],
    makeItYours: "Show your real process. The mess is the content. Don't clean up — that's the point.",
    seoPhrase: "behind the scenes content creator",
    captionStarter: "This is what it actually looks like. 😂 No filter.",
    hashtagStarter: ["#AZOffScript", "#BTS", "#BehindTheScenes", "#ArizonaCreators", "#ContentCreator", "#RealProcess"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 8. AZ TRIED IT
  {
    id: "az_tried_it",
    name: "AZ Tried It",
    bucket: "AZ Tried It",
    description: "Try a local product, spot, or thing. Rate it.",
    effort: "Group Day",
    timeEstimate: "10-30 min",
    homeFriendly: false,
    needsTalking: true,
    needsEditing: true,
    adminStitches: true,
    maxSeconds: 60,
    idea: "Try something local — a drink, a spot, a product. Give your honest rating.",
    vibe: "Curious, honest, fun. Would we drive across town for this?",
    whatToDrop: "Your reaction to trying it + your rating.",
    easyWay: "Just record yourself trying it and react in real time.",
    examples: [
      "Rate this from 'never again' to 'put it in the rotation.'",
      "Would we drive across town for this?",
      "AZ Tried It: local drink edition.",
      "The room reacts to a local business.",
    ],
    makeItYours: "Your honest reaction. If you love it, say it. If you don't, say that too. Real reviews only.",
    seoPhrase: "Arizona local business reaction",
    captionStarter: "We tried it so you don't have to. Would you go? 📍",
    hashtagStarter: ["#AZOffScript", "#AZTriedIt", "#ArizonaLocal", "#ArizonaCreators", "#LocalBusiness", "#ArizonaFood", "#WestValleyAZ"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 9. BLACK + LATINA LENS
  {
    id: "black_latina_lens",
    name: "Black + Latina Lens",
    bucket: "Black + Latina Lens",
    description: "Cultural takes — natural, not performed. Let the women answer as themselves.",
    effort: "5-Min Drop",
    timeEstimate: "3-5 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: false,
    adminStitches: true,
    maxSeconds: 20,
    idea: "Answer a cultural prompt as yourself — not performing, just being.",
    vibe: "Real, warm, honest. No stereotypes. No performing culture.",
    whatToDrop: "Your take on the prompt. 15-20 seconds.",
    easyWay: "Just answer like you're talking to your family or your group chat.",
    examples: [
      "What would your auntie/tía say?",
      "Family group chat translation.",
      "The look your mom gives before she says something wild.",
      "Black and Latina women in Arizona reacting to...",
    ],
    makeItYours: "Answer as yourself. Do not force accents, stereotypes, or 'performing culture.' Your real voice is the point.",
    seoPhrase: "Black Latina women creators Arizona",
    captionStarter: "The auntie would say... 😂 What would yours say?",
    hashtagStarter: ["#AZOffScript", "#BlackWomenCreators", "#LatinaCreators", "#ArizonaWomen", "#ArizonaCreators", "#CulturalReaction"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 10. FRIENDSHIP ENERGY
  {
    id: "friendship_energy",
    name: "Friendship Energy",
    bucket: "Friendship Energy",
    description: "Warm crew content — the friend every group needs.",
    effort: "5-Min Drop",
    timeEstimate: "2-5 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: false,
    adminStitches: true,
    maxSeconds: 20,
    idea: "Describe the friend every group needs — or call out someone in the crew.",
    vibe: "Warm, funny, affectionate. The love is real.",
    whatToDrop: "Your friendship take. 15-20 seconds.",
    easyWay: "Just talk about your friends like you're in the group chat.",
    examples: [
      "The friend every group needs.",
      "The friend who says 'be safe' but also wants the tea.",
      "The friend who shows up late but brings snacks.",
      "The friend who can read your face across the room.",
    ],
    makeItYours: "Call out someone in the crew, or describe your friend type. The warmth is the content.",
    seoPhrase: "friendship group video",
    captionStarter: "Every group has this friend. 🫶 Tag yours.",
    hashtagStarter: ["#AZOffScript", "#FriendshipEnergy", "#ArizonaCreators", "#GroupChemistry", "#FriendshipGoals"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },

  // 11. COMMENT-TO-CLIP
  {
    id: "comment_to_clip",
    name: "Comment-to-Clip",
    bucket: "Comment-to-Clip",
    description: "Turn comments into content — respond to what viewers said.",
    effort: "5-Min Drop",
    timeEstimate: "3-5 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: false,
    adminStitches: true,
    maxSeconds: 20,
    idea: "Read a comment from a previous post and respond to it.",
    vibe: "Responsive, engaged, a little spicy. The comments are writers too.",
    whatToDrop: "Your response to a viewer comment. 15-20 seconds.",
    easyWay: "Screen-record the comment, then record your response.",
    examples: [
      "Someone said we were wrong, so the room is responding.",
      "Comment court: this person said it's not a red flag.",
      "The comments were divided, so we're voting again.",
    ],
    makeItYours: "Your response, your energy. The comment is the prompt — your reaction is the content.",
    seoPhrase: "comment reaction video",
    captionStarter: "You said it, we're responding. 💬 What now?",
    hashtagStarter: ["#AZOffScript", "#CommentReaction", "#ArizonaCreators", "#ReactionVideo", "#CommentCourt"],
    platforms: ["TikTok", "Reels", "Shorts"],
  },

  // 12. SEARCH EXPLAINERS
  {
    id: "search_explainer",
    name: "Search Explainer",
    bucket: "Search Explainers",
    description: "Explain what AZ Off Script is — for search and new viewers.",
    effort: "5-Min Drop",
    timeEstimate: "3-5 min",
    homeFriendly: true,
    needsTalking: true,
    needsEditing: false,
    adminStitches: false,
    maxSeconds: 15,
    idea: "Explain what AZ Off Script is in 10 seconds. For search, new viewers, and the algorithm.",
    vibe: "Clear, quick, confident. This is the elevator pitch.",
    whatToDrop: "A 10-second explainer. What is AZ Off Script?",
    easyWay: "Just say what we are in your own words.",
    examples: [
      "AZ Off Script is a Black and Latina women-led creator crew in Arizona.",
      "We do reactions, group debates, and local hot takes.",
      "It's a room of women keeping it real, off script.",
    ],
    makeItYours: "Your words, your take. The point is clarity — say what we are so people and search understand.",
    seoPhrase: "what is AZ Off Script",
    captionStarter: "So what is AZ Off Script? Here's the 10-second version. 👇",
    hashtagStarter: ["#AZOffScript", "#ArizonaCreators", "#CreatorCrew", "#ArizonaTikTok", "#WhatIsAZOffScript"],
    platforms: ["TikTok", "Reels", "Shorts", "Facebook"],
  },
];

/**
 * Get a template by ID.
 */
export function getTemplate(id: string): QuickDropTemplate | undefined {
  return QUICK_DROP_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all templates in a specific bucket.
 */
export function getTemplatesByBucket(bucket: string): QuickDropTemplate[] {
  return QUICK_DROP_TEMPLATES.filter((t) => t.bucket === bucket);
}

/**
 * Get a personalized example for a crew member.
 */
export function getExampleFor(template: QuickDropTemplate, memberName?: string): string | null {
  if (!template.examples || template.examples.length === 0) return null;
  if (!memberName) return template.examples[0];

  const firstName = memberName.split(" ")[0];
  const match = template.examples.find((line) =>
    line.toLowerCase().includes(firstName.toLowerCase())
  );
  return match ?? template.examples[0];
}
