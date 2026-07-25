/**
 * AZ Off Script — First Wave crew data.
 * Real names + brand copy for public-facing pages.
 * Display order: Vanessa, Sholanda, Ronnie, Elaine, Latasha, Maria
 */

export interface CrewMember {
  name: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

export const CREW: CrewMember[] = [
  {
    name: "Vanessa",
    slug: "vanessa",
    title: "The Room Builder",
    description:
      "Founder energy. Vision, direction, ideas, and the one making sure the chaos turns into something real.",
    tags: ["Founder", "Creative Lead", "Organizer", "Off-Script Starter"],
  },
  {
    name: "Sholanda",
    slug: "sholanda",
    title: "The Real One",
    description:
      "Says what everyone else was thinking — and somehow makes it useful.",
    tags: ["Hot Takes", "Real Reactions", "Group Games", "Straightforward Energy"],
  },
  {
    name: "Ronnie",
    slug: "ronnie",
    title: "The Sweet Touch",
    description:
      "Warm, creative, and the one who brings personality into the room while helping shape what hits the calendar next.",
    tags: ["Creative Touch", "Warm Vibe", "Calendar Planner", "Personality"],
  },
  {
    name: "Elaine",
    slug: "elaine",
    title: "The Quiet Surprise",
    description:
      "May not be the loudest in the room, but the reaction can say everything.",
    tags: ["Reaction Queen", "Quiet Humor", "Side-Eye Energy", "Unexpected Moments"],
  },
  {
    name: "Latasha",
    slug: "latasha",
    title: "The Wild Card",
    description:
      "The one people need to watch because you don't know what direction her answer is about to go.",
    tags: ["Wild Card", "Unpredictable Answers", "Real Talk", "Watchable Energy"],
  },
  {
    name: "Maria",
    slug: "maria",
    title: "The Fresh Energy",
    description:
      "Brings a different rhythm into the room and can make a simple question turn into a whole moment.",
    tags: ["Fresh Vibe", "Group Chemistry", "Funny Questions", "Social Energy"],
  },
];

export const CREW_NAMES_SHORT =
  "Vanessa, Ronnie, Sholanda, Elaine, Latasha, and Maria are the first AZ Off Script room — a mix of real reactions, hot takes, calm energy, funny timing, and Arizona personality. They are the First Wave, not the limit of what AZ Off Script can become.";

/**
 * Member image paths — gear mockups and member cards.
 * Files live in /public/gear/ and /public/cards/.
 */
const MEMBER_IMAGE_MAP: Record<string, { card: string; gear: string }> = {
  Vanessa: { card: "/cards/Vanessa-Card.webp", gear: "/gear/vanessagear.webp" },
  Ronnie: { card: "/cards/Ronnie-Card.webp", gear: "/gear/ronniegear.webp" },
  Sholanda: { card: "/cards/Sholanda-Card.webp", gear: "/gear/sholandagear.webp" },
  Elaine: { card: "/cards/Elaine-Card.webp", gear: "/gear/elainegear.webp" },
  Latasha: { card: "/cards/Latasha-Card.webp", gear: "/gear/latashagear.webp" },
  Maria: { card: "/cards/Maria-Card.webp", gear: "/gear/mariagear.webp" },
};

export function getMemberCard(name: string): string | null {
  return MEMBER_IMAGE_MAP[name]?.card ?? null;
}

export function getMemberGear(name: string): string | null {
  return MEMBER_IMAGE_MAP[name]?.gear ?? null;
}

/**
 * Content lanes — the 6 categories of content AZ Off Script makes.
 * Used on the homepage and the SEO landing page.
 */
export interface ContentLane {
  number: number;
  name: string;
  tagline: string;
  description: string;
  searchPhrases: string[];
  examples: string[];
}

export const CONTENT_LANES: ContentLane[] = [
  {
    number: 1,
    name: "Group Chat Court",
    tagline: "We bring the question. The room decides.",
    description:
      "Group reaction videos where the crew debates dating, friendships, group chats, and situations everybody has an opinion about.",
    searchPhrases: ["group reaction videos", "women reaction videos", "funny group questions", "Arizona creators"],
    examples: [
      "Is this a red flag or real life?",
      "Would you forgive this?",
      "Who was wrong here?",
    ],
  },
  {
    number: 2,
    name: "Dry Heat Hot Takes",
    tagline: "Arizona opinions, served at 112 degrees.",
    description:
      "Arizona hot takes and local humor — the opinions that only make sense if you live here.",
    searchPhrases: ["Arizona hot takes", "Arizona humor", "Phoenix humor", "desert humor"],
    examples: [
      "Only Arizona people understand this.",
      "The Arizona version of this is different.",
      "Arizona dating rules nobody warned us about.",
    ],
  },
  {
    number: 3,
    name: "Red Flag or Real Life?",
    tagline: "The game where the room gets honest fast.",
    description:
      "A group game where the crew reads a situation and decides: is this a red flag, or just real life?",
    searchPhrases: ["red flag game", "relationship reaction videos", "TikTok group game", "women discuss red flags"],
    examples: [
      "He said he doesn't text back because he's 'busy.' Red flag or real life?",
      "She checks your location every hour. Red flag or real life?",
    ],
  },
  {
    number: 4,
    name: "Who's Most Likely To",
    tagline: "First Wave edition. Somebody is getting exposed lightly.",
    description:
      "Group game where the crew points to the person most likely to do something nobody wants to admit.",
    searchPhrases: ["who's most likely to game", "group game questions", "TikTok games for groups"],
    examples: [
      "Who's most likely to accidentally start drama and then leave?",
      "Who's most likely to say 'I'm not judging' while judging?",
    ],
  },
  {
    number: 5,
    name: "AZ Moments",
    tagline: "Local things that only make sense here.",
    description:
      "Arizona lifestyle content — the local things, desert habits, and Arizona moments that only make sense if you live here.",
    searchPhrases: ["things only Arizona people understand", "Arizona lifestyle", "Arizona desert life", "living in Arizona"],
    examples: [
      "Arizona people when it drops below 70.",
      "Arizona errands are not regular errands.",
      "Arizona women trying to pick a meetup spot.",
    ],
  },
  {
    number: 6,
    name: "Off Script Afterthoughts",
    tagline: "The thing someone says after the camera was supposed to stop.",
    description:
      "Bloopers, after-reactions, and the quote-worthy moments that happen when nobody's trying to be funny.",
    searchPhrases: ["funny reaction videos", "behind the scenes creators", "creator group clips"],
    examples: ["bloopers", "after-reactions", "quote moments", "caption-worthy lines"],
  },
];

/**
 * Floating badge copy for the hero section.
 */
export const HERO_BADGES = [
  "Real Reactions",
  "Hot Takes",
  "Group Games",
  "Arizona Energy",
  "No Script Needed",
];

/**
 * Content lanes for the Drop page — these map to the 6 show formats.
 * When someone drops something, they pick which lane it belongs to.
 * Stored in the clips.category column.
 */
export const DROP_LANES = CONTENT_LANES.map((l) => l.name);

/**
 * Destination platforms — where a video is going to be posted.
 * Used on the Drop page and shown on the Run Sheet.
 */
export const DESTINATIONS = ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook", "All Platforms"];

/**
 * Lane metadata for quick lookup (color, tagline).
 */
export const LANE_META: Record<string, { tagline: string; color: string }> = {
  "Group Chat Court": { tagline: "We bring the question. The room decides.", color: "var(--color-heat-orange)" },
  "Dry Heat Hot Takes": { tagline: "Arizona opinions, served at 112 degrees.", color: "var(--color-cactus-teal)" },
  "Red Flag or Real Life?": { tagline: "The game where the room gets honest fast.", color: "var(--color-copper-clay)" },
  "Who's Most Likely To": { tagline: "First Wave edition. Somebody is getting exposed lightly.", color: "var(--color-sunburst-yellow)" },
  "AZ Moments": { tagline: "Local things that only make sense here.", color: "var(--color-copper-deep)" },
  "Off Script Afterthoughts": { tagline: "The thing someone says after the camera was supposed to stop.", color: "var(--color-teal-deep)" },
};
