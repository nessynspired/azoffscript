/**
 * AZ Off Script Transition Chain System
 *
 * When 4, 5, or 6 creators each record separately, they can't just "use an
 * object transition" as a loose idea — that creates six clips that may not
 * connect. They need a Transition Chain Plan.
 *
 * The full group shares one coordinated transition sequence, but each creator
 * receives only her specific position and instructions.
 *
 * Chain structure:
 *   Creator 1 (Opener)   → Opening only → Content → Transition out
 *   Creator 2 (Middle)   → Transition in → Content → Transition out
 *   Creator 3 (Middle)   → Transition in → Content → Transition out
 *   ...
 *   Creator N (Closer)   → Transition in → Content → Final ending
 *
 * The system generates a chain based on the selected participant count.
 * It does NOT build separate concepts for 4, 5, and 6 women — it generates
 * the chain dynamically.
 */

import type { Transition, TransitionChainTier } from "./transition-library";
import { getTransition, getTransitionsByChainTier } from "./transition-library";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreatorRole = "Opener" | "Middle" | "Closer";

export type AssemblyMode = "Remote Transition Chain" | "Solo" | "In-Person Group";

/**
 * Chain strategy — which of the three approaches from the spec:
 * - "Repeating"     → Option 1: One repeating transition (same action, same object)
 * - "Family"        → Option 2: One transition family, different objects per creator
 * - "Action Chain"  → Option 3: Planned action chain (different transition per pair)
 */
export type ChainStrategy = "Repeating" | "Family" | "Action Chain";

/**
 * Content type — determines the recommended chain strategy:
 * - "Default Remote"  → consistent family (Repeating or Family)
 * - "Featured"        → planned action chain (Action Chain)
 * - "Debate / Court"  → simple look-based transitions, don't distract from conversation
 */
export type ChainContentType = "Default Remote" | "Featured" | "Debate / Court";

/**
 * A single link in the transition chain — the handoff between two creators.
 */
export interface TransitionLink {
  /** Position number of the outgoing creator (1-based) */
  fromPosition: number;
  /** Position number of the incoming creator (1-based) */
  toPosition: number;
  /** Transition library ID used for this handoff */
  transitionId: string;
  /** Short label for this handoff (e.g. "Hairbrush hit") */
  label: string;
  /** What the outgoing creator does */
  outgoingAction: string;
  /** What the incoming creator does to match */
  incomingAction: string;
  /** Required screen direction */
  direction: string;
}

/**
 * Per-creator instructions generated from the chain plan.
 * Each creator receives only her piece.
 */
export interface CreatorChainPosition {
  /** Creator name */
  name: string;
  /** 1-based position in the chain */
  position: number;
  /** Total number of creators */
  totalCreators: number;
  /** Role in the chain */
  role: CreatorRole;
  /** Name of the creator before them (null for Opener) */
  previousCreator: string | null;
  /** Name of the creator after them (null for Closer) */
  nextCreator: string | null;
  /** How their clip starts (transition in, or "Natural opening" for Opener) */
  transitionIn: string;
  /** Steps for the transition in */
  transitionInSteps: string[];
  /** How their clip ends (transition out, or "Final ending" for Closer) */
  transitionOut: string;
  /** Steps for the transition out */
  transitionOutSteps: string[];
  /** Screen direction for their transitions */
  direction: string;
  /** Their content action (from the recipe) */
  contentAction: string;
  /** Optional: the object this creator uses for her transition (Option 2: Family) */
  object?: string;
}

/**
 * The full chain plan for a multi-creator video.
 */
export interface TransitionChainPlan {
  assemblyMode: AssemblyMode;
  /** Which chain strategy is being used */
  chainStrategy: ChainStrategy;
  /** Content type that informed the strategy choice */
  contentType: ChainContentType;
  participantCount: number;
  /** Ordered list of creator names */
  creatorOrder: string[];
  /** The transition family/tier used */
  transitionFamily: string;
  chainTier: TransitionChainTier;
  /** The transition links between each pair of creators */
  transitionMap: TransitionLink[];
  /** Opening instruction (what the Opener does) */
  opening: string;
  /** Closing instruction (what the Closer does) */
  closing: string;
  /** Per-creator positions */
  positions: CreatorChainPosition[];
}

// ---------------------------------------------------------------------------
// Chain Planner
// ---------------------------------------------------------------------------

/**
 * Options for planning a transition chain.
 */
export interface PlanChainOptions {
  /** Override the opening instruction */
  opening?: string;
  /** Override the closing instruction */
  closing?: string;
  /** Chain strategy (defaults based on contentType if not set) */
  strategy?: ChainStrategy;
  /** Content type that informs the strategy */
  contentType?: ChainContentType;
  /**
   * Per-pair transition IDs for Action Chain strategy.
   * Keyed by "fromPosition-toPosition" (e.g. "1-2", "2-3").
   * If not provided for Action Chain, falls back to a single transitionId.
   */
  pairTransitions?: Record<string, string>;
  /** Per-creator objects for Family strategy (keyed by position number, 1-based) */
  creatorObjects?: Record<number, string>;
}

/**
 * Plan a transition chain for a group of creators.
 *
 * Supports three strategies:
 *   - "Repeating"    → Option 1: One repeating transition for all handoffs
 *   - "Family"       → Option 2: One transition family, different objects per creator
 *   - "Action Chain" → Option 3: Different transition per pair (planned action chain)
 *
 * @param creatorNames - Ordered list of creator names
 * @param transitionId - Default transition library ID (used for all handoffs in Repeating/Family,
 *                       or as fallback in Action Chain)
 * @param contentAction - What each creator does in the middle
 * @param options - Strategy, content type, per-pair transitions, per-creator objects, opening/closing
 *
 * @returns A complete TransitionChainPlan with per-creator positions
 */
export function planTransitionChain(
  creatorNames: string[],
  transitionId: string | null,
  contentAction: string,
  options?: PlanChainOptions,
): TransitionChainPlan {
  const count = creatorNames.length;
  const contentType = options?.contentType ?? "Default Remote";
  const strategy = options?.strategy ?? recommendedStrategy(contentType);

  if (count < 2) {
    // Solo — no chain needed
    return {
      assemblyMode: "Solo",
      chainStrategy: strategy,
      contentType,
      participantCount: count,
      creatorOrder: creatorNames,
      transitionFamily: "None",
      chainTier: "Easy Chain",
      transitionMap: [],
      opening: options?.opening ?? "Begin naturally",
      closing: options?.closing ?? "End naturally",
      positions: creatorNames.map((name, i) => ({
        name,
        position: i + 1,
        totalCreators: count,
        role: "Opener" as CreatorRole,
        previousCreator: null,
        nextCreator: null,
        transitionIn: "Natural opening",
        transitionInSteps: [],
        transitionOut: "End naturally",
        transitionOutSteps: [],
        direction: "Any",
        contentAction,
      })),
    };
  }

  const defaultTransition = transitionId ? getTransition(transitionId) : null;

  // Build the transition map (links between each pair)
  const transitionMap: TransitionLink[] = [];
  for (let i = 0; i < count - 1; i++) {
    const pairKey = `${i + 1}-${i + 2}`;
    const pairTransitionId = options?.pairTransitions?.[pairKey] ?? transitionId ?? "hand_cover";
    const t = getTransition(pairTransitionId) ?? defaultTransition;
    transitionMap.push({
      fromPosition: i + 1,
      toPosition: i + 2,
      transitionId: pairTransitionId,
      label: t?.name ?? "Hand Cover",
      outgoingAction: t?.outgoingAction ?? "Cover the lens",
      incomingAction: t?.incomingAction ?? "Start with the lens covered, then reveal",
      direction: t?.requiredDirection ?? "Any",
    });
  }

  // Determine the chain tier — use the highest tier across all links
  const tiers = transitionMap.map(l => getTransition(l.transitionId)?.chainTier ?? "Easy Chain");
  const chainTier: TransitionChainTier = tiers.includes("Advanced Chain")
    ? "Advanced Chain"
    : tiers.includes("Medium Chain")
      ? "Medium Chain"
      : "Easy Chain";

  // Determine the transition family label
  const transitionFamily = strategy === "Action Chain"
    ? "Creator Action Chain"
    : defaultTransition?.name ?? "Hand Cover";

  // Build per-creator positions
  const positions: CreatorChainPosition[] = creatorNames.map((name, i) => {
    const position = i + 1;
    const role: CreatorRole = position === 1 ? "Opener" : position === count ? "Closer" : "Middle";
    const previousCreator = i > 0 ? creatorNames[i - 1] : null;
    const nextCreator = i < count - 1 ? creatorNames[i + 1] : null;

    // Get the incoming and outgoing transitions for this creator
    const incomingLink = i > 0 ? transitionMap[i - 1] : null;
    const outgoingLink = i < count - 1 ? transitionMap[i] : null;
    const incomingTransition = incomingLink ? getTransition(incomingLink.transitionId) : null;
    const outgoingTransition = outgoingLink ? getTransition(outgoingLink.transitionId) : null;

    // Transition in (not for Opener)
    const transitionIn = role === "Opener"
      ? "Natural opening"
      : incomingLink?.incomingAction ?? "Start with the lens covered, then reveal";
    const transitionInSteps = role === "Opener"
      ? []
      : incomingTransition?.nextPersonSteps ?? ["Start with the lens covered.", "Remove the cover.", "Continue your video."];

    // Transition out (not for Closer)
    const transitionOut = role === "Closer"
      ? "Final ending"
      : outgoingLink?.outgoingAction ?? "Cover the lens";
    const transitionOutSteps = role === "Closer"
      ? []
      : outgoingTransition?.firstPersonSteps ?? ["Cover the lens.", "End recording."];

    // Direction — use the outgoing link's direction (or incoming if closer)
    const direction = outgoingLink?.direction ?? incomingLink?.direction ?? "Any";

    // Per-creator object (Option 2: Family)
    const object = options?.creatorObjects?.[position];

    return {
      name,
      position,
      totalCreators: count,
      role,
      previousCreator,
      nextCreator,
      transitionIn,
      transitionInSteps,
      transitionOut,
      transitionOutSteps,
      direction,
      contentAction,
      ...(object ? { object } : {}),
    };
  });

  return {
    assemblyMode: "Remote Transition Chain",
    chainStrategy: strategy,
    contentType,
    participantCount: count,
    creatorOrder: creatorNames,
    transitionFamily,
    chainTier,
    transitionMap,
    opening: options?.opening ?? `${creatorNames[0]} begins naturally`,
    closing: options?.closing ?? `${creatorNames[count - 1]} delivers the final ending`,
    positions,
  };
}

// ---------------------------------------------------------------------------
// Strategy recommendations
// ---------------------------------------------------------------------------

/**
 * Recommend a chain strategy based on content type.
 *
 * - "Default Remote"  → Repeating (consistent family, reliable and quick)
 * - "Featured"        → Action Chain (planned action chain, higher production)
 * - "Debate / Court"  → Repeating with look-based transitions (don't distract from conversation)
 */
export function recommendedStrategy(contentType: ChainContentType): ChainStrategy {
  switch (contentType) {
    case "Featured":
      return "Action Chain";
    case "Debate / Court":
      return "Repeating";
    case "Default Remote":
    default:
      return "Repeating";
  }
}

/**
 * Recommend a default transition for a content type.
 * Debate/Court videos should use simple look-based transitions, not object throws.
 */
export function recommendedTransitionId(contentType: ChainContentType): string {
  switch (contentType) {
    case "Debate / Court":
      return "point_to_next"; // look left → react → answer → look right
    case "Featured":
      return "object_throw"; // action chain — planner will customize per pair
    case "Default Remote":
    default:
      return "hand_cover"; // consistent cover/reveal family
  }
}

// ---------------------------------------------------------------------------
// Chain Preview — text representation for display before assigning
// ---------------------------------------------------------------------------

/**
 * Generate a text preview of the full chain for display before assigning.
 * Shows the complete chain so the planner can verify it before each creator
 * receives only their piece.
 */
export function chainPreviewText(plan: TransitionChainPlan): string {
  if (plan.assemblyMode === "Solo" || plan.positions.length === 0) {
    return `${plan.creatorOrder[0] ?? "Creator"} — solo video`;
  }

  const lines: string[] = [];
  for (const pos of plan.positions) {
    if (pos.role === "Opener") {
      lines.push(`${pos.name}${pos.object ? ` (${pos.object})` : ""}`);
      lines.push(`Opening → ${pos.contentAction} → ${pos.transitionOut}`);
    } else if (pos.role === "Closer") {
      // Show the handoff label for the incoming link
      const inLink = plan.transitionMap.find(l => l.toPosition === pos.position);
      lines.push(`↓ ${inLink?.label ?? ""}`);
      lines.push(`${pos.name}${pos.object ? ` (${pos.object})` : ""}`);
      lines.push(`${pos.transitionIn} → ${pos.contentAction} → Final ending`);
    } else {
      const inLink = plan.transitionMap.find(l => l.toPosition === pos.position);
      lines.push(`↓ ${inLink?.label ?? ""}`);
      lines.push(`${pos.name}${pos.object ? ` (${pos.object})` : ""}`);
      lines.push(`${pos.transitionIn} → ${pos.contentAction} → ${pos.transitionOut}`);
    }
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the chain position for a specific creator from a chain plan.
 */
export function getPositionForCreator(
  plan: TransitionChainPlan,
  creatorName: string,
): CreatorChainPosition | null {
  return plan.positions.find((p) => p.name === creatorName) ?? null;
}

/**
 * Get all transitions suitable for a given chain tier.
 */
export function getTransitionsForChainTier(tier: TransitionChainTier): Transition[] {
  return getTransitionsByChainTier(tier);
}

/**
 * Get the recommended chain tier for a content type.
 * Debate/court videos should use Easy Chain (don't distract from the conversation).
 * Featured transition videos can use Medium or Advanced.
 */
export function recommendedChainTier(contentType: string): TransitionChainTier {
  const lower = contentType.toLowerCase();
  if (lower.includes("debate") || lower.includes("court") || lower.includes("verdict") || lower.includes("reaction")) {
    return "Easy Chain";
  }
  if (lower.includes("featured") || lower.includes("transition") || lower.includes("choreographed")) {
    return "Advanced Chain";
  }
  return "Easy Chain";
}
