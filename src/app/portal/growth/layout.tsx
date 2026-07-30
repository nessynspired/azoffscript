"use client";

import { PlannerOnly } from "@/components/PlannerOnly";

/**
 * Layout for /portal/growth/* — gates all growth library pages
 * (hooks, prompts, captions, market gaps, trends, seasonal, search,
 * do-not-chase, brand moat) to planners/admins only.
 * Crew members see a "planner-only" message instead.
 */
export default function GrowthLayout({ children }: { children: React.ReactNode }) {
  return <PlannerOnly label="The Growth Intelligence System">{children}</PlannerOnly>;
}
