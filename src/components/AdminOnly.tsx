"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * AdminOnly — hides children from everyone except admins.
 * Planners (can_plan_content) and crew see a locked message.
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
export function AdminOnly({ children, label = "This area" }: {
  children: React.ReactNode;
  label?: string;
}) {
  const { member } = useAuth();
  const isAdmin = member?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-5xl">🔒</div>
        <h1 className="font-display text-2xl md:text-3xl text-desert-night">{label} is admin-only</h1>
        <p className="text-smoked-charcoal/60 max-w-md">
          This contains brand strategy and intellectual property reserved for the brand owner.
          Planners and crew don&apos;t have access to this.
        </p>
        <Link href="/portal/lobby" className="btn btn-secondary mt-2">Back to Lobby</Link>
      </div>
    );
  }

  return <>{children}</>;
}
