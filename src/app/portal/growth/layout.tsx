"use client";

import { AdminOnly } from "@/components/AdminOnly";

/**
 * Layout for /portal/growth/* — gates all growth library pages
 * (hooks, prompts, captions, market gaps, trends, seasonal, search,
 * do-not-chase, brand moat) to ADMINS ONLY.
 * Planners and crew see an "admin-only" message instead.
 * This protects brand IP — nobody but the owner sees the strategy.
 */
export default function GrowthLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly label="The Growth Intelligence System">{children}</AdminOnly>;
}
