/**
 * AZ OFF SCRIPT GROWTH INTELLIGENCE SYSTEM
 * Document 5: Search Keyword Intelligence Library
 *
 * Purpose:
 *   Tracks the search terms and discovery keywords that lead real people
 *   to AZ Off Script content. Organized by category so we can see which
 *   searches are growing, which are fading, and where new demand is forming.
 *
 *   This is how we stop guessing and start answering the questions
 *   people are already typing into the search bar.
 */

export type SearchCategory =
  | "Local SEO"
  | "Community Search"
  | "Relationship Search"
  | "Parenting Search"
  | "Adulting Search"
  | "Beauty Search"
  | "Cultural Search"
  | "Brand Search";

export type KeywordPerformance = "High" | "Medium" | "Low" | "New" | "Fading";

export interface SearchKeywordIntelligence {
  id: string;
  keyword: string;
  category: SearchCategory;
  performance: KeywordPerformance;
  /** Other keywords this one is semantically connected to */
  relatedTo?: string[];
  /** Estimated or observed search volume */
  searchVolume?: string;
  notes?: string;
}

export const PERFORMANCE_COLORS: Record<KeywordPerformance, string> = {
  High: "🟢",
  Medium: "🟡",
  Low: "⚪",
  New: "🔵",
  Fading: "🟠",
};

export const SEARCH_KEYWORDS: SearchKeywordIntelligence[] = [
  // ===== LOCAL SEO =====
  { id: "sk_l_01", keyword: "Arizona", category: "Local SEO", performance: "High", searchVolume: "Very High", notes: "Anchor local term, always relevant" },
  { id: "sk_l_02", keyword: "Phoenix", category: "Local SEO", performance: "High", searchVolume: "Very High", relatedTo: ["sk_l_01"], notes: "Largest metro in AZ" },
  { id: "sk_l_03", keyword: "Buckeye", category: "Local SEO", performance: "Medium", searchVolume: "Growing", relatedTo: ["sk_l_01"], notes: "Fast-growing West Valley city" },
  { id: "sk_l_04", keyword: "West Valley", category: "Local SEO", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_l_03", "sk_l_02"], notes: "Regional identity anchor" },
  { id: "sk_l_05", keyword: "Arizona lifestyle", category: "Local SEO", performance: "High", searchVolume: "High", relatedTo: ["sk_l_01"], notes: "Lifestyle content performs well" },
  { id: "sk_l_06", keyword: "desert life", category: "Local SEO", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_l_01", "sk_l_05"], notes: "Niche but loyal audience" },
  { id: "sk_l_07", keyword: "living in Arizona", category: "Local SEO", performance: "High", searchVolume: "High", relatedTo: ["sk_l_01", "sk_l_05"] },
  { id: "sk_l_08", keyword: "Arizona summer", category: "Local SEO", performance: "New", searchVolume: "Rising", relatedTo: ["sk_l_01"], notes: "Seasonal spike incoming" },
  { id: "sk_l_09", keyword: "things to do in Phoenix", category: "Local SEO", performance: "Medium", searchVolume: "High", relatedTo: ["sk_l_02"] },
  { id: "sk_l_10", keyword: "Arizona moms", category: "Local SEO", performance: "High", searchVolume: "Medium", relatedTo: ["sk_l_01"], notes: "Crosses into Parenting Search" },

  // ===== COMMUNITY SEARCH =====
  { id: "sk_c_01", keyword: "women conversations", category: "Community Search", performance: "High", searchVolume: "High", notes: "Core brand territory" },
  { id: "sk_c_02", keyword: "women opinions", category: "Community Search", performance: "High", searchVolume: "High", relatedTo: ["sk_c_01"] },
  { id: "sk_c_03", keyword: "real women stories", category: "Community Search", performance: "High", searchVolume: "Medium", relatedTo: ["sk_c_01", "sk_c_02"], notes: "Authenticity signal" },
  { id: "sk_c_04", keyword: "women supporting women", category: "Community Search", performance: "Medium", searchVolume: "High", relatedTo: ["sk_c_01"] },
  { id: "sk_c_05", keyword: "women's real talk", category: "Community Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_c_01", "sk_c_02"] },
  { id: "sk_c_06", keyword: "honest women talk", category: "Community Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_c_03"] },
  { id: "sk_c_07", keyword: "women community Phoenix", category: "Community Search", performance: "Low", searchVolume: "Low", relatedTo: ["sk_l_02", "sk_c_01"], notes: "Geo + community crossover" },

  // ===== RELATIONSHIP SEARCH =====
  { id: "sk_r_01", keyword: "friendship advice", category: "Relationship Search", performance: "High", searchVolume: "High", notes: "Evergreen demand" },
  { id: "sk_r_02", keyword: "dating conversations", category: "Relationship Search", performance: "High", searchVolume: "High", relatedTo: ["sk_r_01"] },
  { id: "sk_r_03", keyword: "relationship questions", category: "Relationship Search", performance: "High", searchVolume: "Very High", relatedTo: ["sk_r_02"] },
  { id: "sk_r_04", keyword: "red flags dating", category: "Relationship Search", performance: "High", searchVolume: "Very High", relatedTo: ["sk_r_02"], notes: "Consistently strong" },
  { id: "sk_r_05", keyword: "green flags relationship", category: "Relationship Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_r_03", "sk_r_04"] },
  { id: "sk_r_06", keyword: "friendship red flags", category: "Relationship Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_r_01", "sk_r_04"] },
  { id: "sk_r_07", keyword: "how to make friends as an adult", category: "Relationship Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_r_01"], notes: "Growing pain point" },
  { id: "sk_r_08", keyword: "toxic friendship signs", category: "Relationship Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_r_01", "sk_r_06"] },

  // ===== PARENTING SEARCH =====
  { id: "sk_p_01", keyword: "mom life", category: "Parenting Search", performance: "High", searchVolume: "Very High", notes: "Massive evergreen category" },
  { id: "sk_p_02", keyword: "Arizona moms", category: "Parenting Search", performance: "High", searchVolume: "Medium", relatedTo: ["sk_l_01", "sk_p_01"], notes: "Local + parenting crossover" },
  { id: "sk_p_03", keyword: "parenting struggles", category: "Parenting Search", performance: "High", searchVolume: "High", relatedTo: ["sk_p_01"] },
  { id: "sk_p_04", keyword: "mom guilt", category: "Parenting Search", performance: "High", searchVolume: "High", relatedTo: ["sk_p_01", "sk_p_03"] },
  { id: "sk_p_05", keyword: "working mom", category: "Parenting Search", performance: "Medium", searchVolume: "High", relatedTo: ["sk_p_01"] },
  { id: "sk_p_06", keyword: "mom friends", category: "Parenting Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_p_01", "sk_r_01"], notes: "Loneliness angle growing" },
  { id: "sk_p_07", keyword: "toddler mom", category: "Parenting Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_p_01"] },
  { id: "sk_p_08", keyword: "stay at home mom", category: "Parenting Search", performance: "Medium", searchVolume: "High", relatedTo: ["sk_p_01", "sk_p_05"] },

  // ===== ADULTING SEARCH =====
  { id: "sk_a_01", keyword: "adulting", category: "Adulting Search", performance: "High", searchVolume: "High", notes: "Cultural shorthand for the struggle" },
  { id: "sk_a_02", keyword: "burnout", category: "Adulting Search", performance: "High", searchVolume: "Very High", relatedTo: ["sk_a_01"] },
  { id: "sk_a_03", keyword: "work life balance", category: "Adulting Search", performance: "Medium", searchVolume: "High", relatedTo: ["sk_a_01", "sk_a_02"] },
  { id: "sk_a_04", keyword: "setting boundaries", category: "Adulting Search", performance: "High", searchVolume: "High", relatedTo: ["sk_a_01"] },
  { id: "sk_a_05", keyword: "people pleasing", category: "Adulting Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_a_04"], notes: "Trending topic" },
  { id: "sk_a_06", keyword: "overwhelmed mom", category: "Adulting Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_a_02", "sk_p_01"] },

  // ===== BEAUTY SEARCH =====
  { id: "sk_b_01", keyword: "natural beauty", category: "Beauty Search", performance: "Medium", searchVolume: "High", notes: "Aligns with brand authenticity" },
  { id: "sk_b_02", keyword: "desert skincare", category: "Beauty Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_l_06"], notes: "Local + beauty crossover" },
  { id: "sk_b_03", keyword: "low maintenance beauty", category: "Beauty Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_b_01"] },
  { id: "sk_b_04", keyword: "Arizona heat hair", category: "Beauty Search", performance: "Low", searchVolume: "Low", relatedTo: ["sk_l_01", "sk_b_02"], notes: "Niche seasonal" },
  { id: "sk_b_05", keyword: "everyday makeup", category: "Beauty Search", performance: "Fading", searchVolume: "Declining", relatedTo: ["sk_b_01"], notes: "Saturated category" },

  // ===== CULTURAL SEARCH =====
  { id: "sk_cu_01", keyword: "generational differences", category: "Cultural Search", performance: "High", searchVolume: "High", notes: "Strong conversation driver" },
  { id: "sk_cu_02", keyword: "millennial vs gen z", category: "Cultural Search", performance: "High", searchVolume: "Very High", relatedTo: ["sk_cu_01"] },
  { id: "sk_cu_03", keyword: "women's expectations", category: "Cultural Search", performance: "Medium", searchVolume: "Medium", relatedTo: ["sk_c_02"] },
  { id: "sk_cu_04", keyword: "social media pressure", category: "Cultural Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_a_02"] },
  { id: "sk_cu_05", keyword: "cancel culture", category: "Cultural Search", performance: "Fading", searchVolume: "Declining", notes: "Audience fatigue" },

  // ===== BRAND SEARCH =====
  { id: "sk_br_01", keyword: "AZ Off Script", category: "Brand Search", performance: "High", searchVolume: "Growing", notes: "Direct brand searches are the goal" },
  { id: "sk_br_02", keyword: "Off Script Arizona", category: "Brand Search", performance: "Medium", searchVolume: "Low", relatedTo: ["sk_br_01"] },
  { id: "sk_br_03", keyword: "AZ Off Script women", category: "Brand Search", performance: "New", searchVolume: "Rising", relatedTo: ["sk_br_01", "sk_c_01"], notes: "Brand + community forming" },
  { id: "sk_br_04", keyword: "Off Script crew", category: "Brand Search", performance: "Low", searchVolume: "Low", relatedTo: ["sk_br_01"], notes: "Crew recognition building" },
];

/**
 * Returns all keywords that belong to a given search category.
 */
export function getKeywordsByCategory(category: SearchCategory): SearchKeywordIntelligence[] {
  return SEARCH_KEYWORDS.filter((k) => k.category === category);
}

/**
 * Returns all keywords currently rated as High performance.
 */
export function getHighPerformingKeywords(): SearchKeywordIntelligence[] {
  return SEARCH_KEYWORDS.filter((k) => k.performance === "High");
}
