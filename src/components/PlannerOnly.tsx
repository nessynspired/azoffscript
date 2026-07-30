"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * PlannerOnly — hides children from non-planners (crew members).
 * Shows a "planner-only" message instead.
 *
 * Usage:
 *   <PlannerOnly>
 *     <SensitiveContent />
 *   </PlannerOnly>
 */
export function PlannerOnly({ children, label = "This area" }: {
  children: React.ReactNode;
  label?: string;
}) {
  const { member } = useAuth();
  const isPlanner = member?.role === "admin" || member?.can_plan_content === true;

  if (!isPlanner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-5xl">🔒</div>
        <h1 className="font-display text-2xl md:text-3xl text-desert-night">{label} is planner-only</h1>
        <p className="text-smoked-charcoal/60 max-w-md">
          This contains brand strategy and intellectual property that&apos;s reserved for content planners.
          If you think you should have access, ask an admin to grant you planning permissions.
        </p>
        <Link href="/portal/lobby" className="btn btn-secondary mt-2">Back to Lobby</Link>
      </div>
    );
  }

  return <>{children}</>;
}
