"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * AdminOnly — hides children from everyone except admins.
 * Planners (can_plan_content) and crew see nothing at all.
 * No locked message — just silently hidden.
 *
 * Use this for brand IP: hooks, captions, hashtags, market gaps,
 * brand moats, prompts, discovery — anything you don't want anyone
 * copying, including planners.
 *
 * Usage:
 *   <AdminOnly>
 *     <SensitiveContent />
 *   </AdminOnly>
 */
export function AdminOnly({ children, label }: {
  children: React.ReactNode;
  label?: string;
}) {
  // `label` is accepted for backward compatibility but ignored —
  // non-admins see nothing at all (no locked message).
  const { member } = useAuth();
  const isAdmin = member?.role === "admin";

  if (!isAdmin) return null;

  return <>{children}</>;
}
