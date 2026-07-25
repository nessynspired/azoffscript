/**
 * Content planning defaults.
 *
 * The portal should not make people fill out every deadline from scratch.
 * Instead, we calculate defaults from a single "goes live" date:
 *   - Drop-by: 3 days before goes live
 *   - Cut ready: 2 days before goes live
 *   - Greenlight: 1 day before goes live
 *
 * And we default other things:
 *   - Effort: 10-Min Drop
 *   - Visibility: main page first
 *   - Kids: no kids by default
 *   - Tagging: only if allowed in Kit settings
 */

export interface DeadlineSet {
  idea_due_date: string;   // Spark-by
  clip_due_date: string;   // Drop-by
  final_cut_due: string;   // Cut ready
  approval_due: string;    // Greenlight
  scheduled_date: string;  // Goes live
}

/**
 * Calculate all deadlines from a "goes live" date.
 * Returns ISO strings (timestamptz).
 *
 * Defaults:
 *   Drop-by (clip_due_date): 3 days before live
 *   Cut ready (final_cut_due): 2 days before live
 *   Greenlight (approval_due): 1 day before live
 *   Spark-by (idea_due_date): 5 days before live
 */
export function calcDeadlinesFromLive(liveDate: Date | string): DeadlineSet {
  const live = new Date(liveDate);
  const days = (n: number) => {
    const d = new Date(live);
    d.setDate(d.getDate() - n);
    // Set to 8 PM for drops, noon for greenlights
    if (n === 1) { d.setHours(12, 0, 0, 0); } // greenlight at noon
    else { d.setHours(20, 0, 0, 0); } // drops at 8 PM
    return d.toISOString();
  };

  return {
    idea_due_date: days(5),    // Spark-by: 5 days before
    clip_due_date: days(3),    // Drop-by: 3 days before
    final_cut_due: days(2),    // Cut ready: 2 days before
    approval_due: days(1),     // Greenlight: 1 day before
    scheduled_date: live.toISOString(),
  };
}

/**
 * Get the next Sunday from today (default goes-live day).
 */
export function nextSunday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilSunday);
  sunday.setHours(12, 0, 0, 0);
  return sunday;
}

/**
 * Get the next Wednesday from today (default drop-by day).
 */
export function nextWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilWed = day <= 3 ? 3 - day : 7 - day + 3;
  const wed = new Date(now);
  wed.setDate(now.getDate() + daysUntilWed);
  wed.setHours(20, 0, 0, 0);
  return wed;
}

// ===========================================================================
// Heat Builder defaults
// ===========================================================================

export const HEAT_VIBES = [
  { id: "hot_takes", label: "Hot Takes", desc: "Strong opinions, quick reactions" },
  { id: "az_moments", label: "Arizona Moments", desc: "Local life, AZ-specific chaos" },
  { id: "trend_week", label: "Trend Week", desc: "Riding what's hot on TikTok" },
  { id: "easy_week", label: "Easy Week", desc: "Low-edit, quick drops" },
  { id: "mixed", label: "Mixed", desc: "A little of everything" },
] as const;

export const POST_COUNTS = [1, 2, 3, 5] as const;

export const EFFORT_LEVELS = [
  { id: "10min", label: "10-Min Drop", desc: "Quick, one take, minimal edit" },
  { id: "standard", label: "Standard", desc: "Film + light edit" },
  { id: "produced", label: "Produced", desc: "Multi-clip, stitched, polished" },
] as const;

/**
 * Generate a weekly plan from the Heat Builder parameters.
 * Returns an array of planned content items with auto-calculated deadlines.
 */
export interface PlannedItem {
  title: string;
  vibe: string;
  effort: string;
  deadlines: DeadlineSet;
  dayLabel: string;
}

export function generateWeekPlan(
  postCount: number,
  vibe: string,
  effort: string,
  crewNames: string[],
  startDate?: Date | string,
): PlannedItem[] {
  const sunday = startDate ? new Date(startDate) : nextSunday();
  sunday.setHours(12, 0, 0, 0);
  const vibeLabel = HEAT_VIBES.find((v) => v.id === vibe)?.label ?? vibe;
  const items: PlannedItem[] = [];

  // Spread posts across the week: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const liveDays = [0, 1, 2, 3, 4, 5, 6]; // all days available
  const selectedDays = liveDays.slice(0, postCount);

  const promptIdeas: Record<string, string[]> = {
    hot_takes: ["Red Flag or Real Life", "Hot Take Tuesday", "Unpopular AZ Opinion"],
    az_moments: ["Arizona Moment", "Only in AZ", "Desert Life Check"],
    trend_week: ["Trend Drop", "Trending Now", "AZ Does the Trend"],
    easy_week: ["Quick Check-In", "10-Min Drop", "Fast One"],
    mixed: ["Red Flag or Real Life", "Group Chat Court", "AZ Tried It"],
  };

  const ideas = promptIdeas[vibe] ?? promptIdeas.mixed;

  for (let i = 0; i < postCount; i++) {
    const liveDate = new Date(sunday);
    liveDate.setDate(sunday.getDate() + selectedDays[i]);
    liveDate.setHours(12, 0, 0, 0);

    const idea = ideas[i % ideas.length];
    const crewTag = crewNames.length > 0 ? ` — ${crewNames.slice(0, 3).join(", ")}` : "";

    items.push({
      title: `${idea}${crewTag}`,
      vibe: vibeLabel,
      effort,
      deadlines: calcDeadlinesFromLive(liveDate),
      dayLabel: liveDate.toLocaleDateString(undefined, { weekday: "long" }),
    });
  }

  return items;
}
