"use client";

import { useState } from "react";
import {
  FULL_READY_RECIPES,
  type FullReadyRecipe,
  type RecipeVersion,
} from "@/lib/full-ready-recipes";

// ---------------------------------------------------------------------------
// Full Ready Recipe Detail Modal
// ---------------------------------------------------------------------------

export function FullReadyRecipeDetail({
  recipe,
  onClose,
  onPlan,
  canPlanContent = false,
}: {
  recipe: FullReadyRecipe;
  onClose: () => void;
  onPlan?: (recipe: FullReadyRecipe) => void;
  canPlanContent?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"creator" | "admin" | "assembly">("creator");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-desert-night/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-w-2xl w-full p-6 my-auto max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-smoked-charcoal/40 hover:text-smoked-charcoal text-2xl"
          aria-label="Close"
        >×</button>

        {/* Header */}
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-smoked-charcoal/50 font-bold uppercase">{recipe.category} · {recipe.topicWorld}</p>
            <h2 className="font-display text-2xl text-desert-night leading-tight">{recipe.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="chip chip-cream !text-[10px]">{recipe.effort}</span>
              <span className="chip chip-cream !text-[10px]">{recipe.difficulty}</span>
              <span className="chip chip-cream !text-[10px]">{recipe.assemblyMode}</span>
              <span className="chip chip-teal !text-[10px]">{recipe.transitionFamily}</span>
              <span className={`chip !text-[10px] ${recipe.version.startsWith("A") ? "chip-copper" : "chip-cream"}`}>{recipe.version}</span>
            </div>
            {recipe.toneMix && recipe.toneMix.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[9px] font-bold text-desert-night/50 uppercase">Tone Mix:</span>
                {recipe.toneMix.map(t => (
                  <span key={t} className="chip chip-copper !text-[10px]">{t}</span>
                ))}
              </div>
            )}
          </div>
          {onPlan && (
            <button
              onClick={() => onPlan(recipe)}
              className="btn btn-primary btn-sm shrink-0"
            >Plan from this →</button>
          )}
        </div>

        {/* Card Preview */}
        <div className="mt-4 bg-sandstone-cream/50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-desert-night/50 uppercase">Card Preview</p>
          <div>
            <p className="text-sm text-desert-night"><span className="font-bold">Creator task:</span> {recipe.creatorTask}</p>
          </div>
          {recipe.introductionDirection && (
            <div>
              <p className="text-sm text-desert-night"><span className="font-bold">Introduction Direction:</span> {recipe.introductionDirection}</p>
            </div>
          )}
          {recipe.assignedMovementOrLine && (
            <div>
              <p className="text-sm text-desert-night"><span className="font-bold">Assigned Movement or Line:</span> {recipe.assignedMovementOrLine}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-desert-night"><span className="font-bold">Content Action:</span> {recipe.contentAction}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-desert-night/10">
          <button
            onClick={() => setActiveTab("creator")}
            className={`px-3 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "creator" ? "border-copper-clay text-copper-deep" : "border-transparent text-smoked-charcoal/50 hover:text-desert-night"}`}
          >Creator Instructions</button>
          <button
            onClick={() => setActiveTab("assembly")}
            className={`px-3 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "assembly" ? "border-copper-clay text-copper-deep" : "border-transparent text-smoked-charcoal/50 hover:text-desert-night"}`}
          >Group Assembly</button>
          {canPlanContent && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "admin" ? "border-copper-clay text-copper-deep" : "border-transparent text-smoked-charcoal/50 hover:text-desert-night"}`}
            >Admin Editing</button>
          )}
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === "creator" && <CreatorTab recipe={recipe} />}
          {activeTab === "assembly" && <AssemblyTab recipe={recipe} />}
          {canPlanContent && activeTab === "admin" && <AdminTab recipe={recipe} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Creator Tab
// ---------------------------------------------------------------------------

function CreatorTab({ recipe }: { recipe: FullReadyRecipe }) {
  return (
    <div className="space-y-4">
      {/* Goal */}
      {recipe.goal && (
        <Section title="Goal">
          <p className="text-sm text-smoked-charcoal/80 leading-relaxed">{recipe.goal}</p>
        </Section>
      )}

      {/* What You Are Making */}
      {recipe.whatYouAreMaking && (
        <Section title="What You Are Making">
          <p className="text-sm text-smoked-charcoal/80">{recipe.whatYouAreMaking}</p>
        </Section>
      )}

      {/* Your Content Action */}
      {recipe.yourContentAction && (
        <Section title="Your Content Action">
          <p className="text-sm text-smoked-charcoal/80">{recipe.yourContentAction}</p>
        </Section>
      )}

      {/* Introduction Direction / Assigned Movement */}
      {recipe.introductionDirection && (
        <Section title="Introduction Direction">
          <p className="text-sm text-desert-night italic bg-sandstone-cream/30 rounded-lg p-3">{recipe.introductionDirection}</p>
        </Section>
      )}
      {recipe.assignedMovementOrLine && (
        <Section title="Assigned Movement or Line">
          <p className="text-sm text-desert-night italic bg-sandstone-cream/30 rounded-lg p-3">{recipe.assignedMovementOrLine}</p>
        </Section>
      )}

      {/* Make It Your Own */}
      {recipe.makeItYourOwn.length > 0 && (
        <Section title="Make It Your Own">
          <ul className="space-y-1">
            {recipe.makeItYourOwn.map((item, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex items-start gap-2">
                <span className="text-copper-clay shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Content Shape */}
      {recipe.contentShape.length > 0 && (
        <Section title="Content Shape">
          <ol className="space-y-1.5">
            {recipe.contentShape.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-copper-clay/20 text-copper-deep text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Example Directions */}
      {recipe.exampleDirections.length > 0 && (
        <Section title="Example Directions">
          <p className="text-xs text-smoked-charcoal/50 italic mb-2">These examples show the type and length of contribution. They are not scripts.</p>
          <ul className="space-y-1">
            {recipe.exampleDirections.map((item, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex items-start gap-2">
                <span className="text-cactus-teal shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* One-Video Formula */}
      {recipe.oneVideoFormula && (
        <Section title="Your One-Video Formula">
          <p className="text-sm text-desert-night bg-cactus-teal/10 rounded-lg p-3 leading-relaxed">{recipe.oneVideoFormula}</p>
        </Section>
      )}

      {/* Part 1 — Transition-In */}
      {recipe.part1TransitionIn.description || recipe.part1TransitionIn.steps.length > 0 ? (
        <Section title="Part 1 — Transition-In" accent="copper">
          {recipe.part1TransitionIn.description && (
            <p className="text-sm text-desert-night font-bold mb-2">{recipe.part1TransitionIn.description}</p>
          )}
          {recipe.part1TransitionIn.steps.length > 0 && (
            <ol className="space-y-1.5">
              {recipe.part1TransitionIn.steps.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-copper-clay/20 text-copper-deep text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      ) : null}

      {/* Part 2 — Content Action */}
      {recipe.part2ContentAction.steps.length > 0 && (
        <Section title="Part 2 — Assigned Content Action" accent="teal">
          <ol className="space-y-1.5">
            {recipe.part2ContentAction.steps.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-cactus-teal/20 text-cactus-teal text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Part 3 — Transition-Out */}
      {recipe.part3TransitionOut.description || recipe.part3TransitionOut.steps.length > 0 ? (
        <Section title="Part 3 — Transition-Out" accent="copper">
          {recipe.part3TransitionOut.description && (
            <p className="text-sm text-desert-night font-bold mb-2">{recipe.part3TransitionOut.description}</p>
          )}
          {recipe.part3TransitionOut.steps.length > 0 && (
            <ol className="space-y-1.5">
              {recipe.part3TransitionOut.steps.map((step, i) => (
                <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-copper-clay/20 text-copper-deep text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      ) : null}

      {/* Creator Position Card */}
      {recipe.creatorPositionCard.length > 0 && (
        <Section title="Creator Position Card">
          <p className="text-xs text-smoked-charcoal/50 italic mb-2">Admin replaces the placeholders before assignment:</p>
          <div className="space-y-1">
            {recipe.creatorPositionCard.map((field, i) => (
              <div key={i} className="text-sm text-smoked-charcoal/80 flex items-start gap-2">
                <span className="font-bold text-desert-night shrink-0">{field.label}:</span>
                <span className="text-smoked-charcoal/60">{field.value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recording Setup */}
      {recipe.recordingSetup.length > 0 && (
        <Section title="Recording Setup">
          <ul className="space-y-1">
            {recipe.recordingSetup.map((item, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex items-start gap-2">
                <span className="text-cactus-teal shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Record From Start to Finish */}
      {recipe.recordSteps.length > 0 && (
        <Section title="Record From Start to Finish">
          <ol className="space-y-1.5">
            {recipe.recordSteps.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-desert-night/10 text-desert-night text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* What to Send */}
      {recipe.whatToSend.length > 0 && (
        <Section title="What to Send">
          <ul className="space-y-1">
            {recipe.whatToSend.map((item, i) => (
              <li key={i} className="text-sm text-desert-night flex items-start gap-2">
                <span className="text-cactus-teal shrink-0">✅</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assembly Tab
// ---------------------------------------------------------------------------

function AssemblyTab({ recipe }: { recipe: FullReadyRecipe }) {
  return (
    <div className="space-y-4">
      <Section title="Group Assembly Plan">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="chip chip-copper !text-[10px]">Default: {recipe.defaultParticipantCount} creators</span>
          <span className="chip chip-cream !text-[10px]">Supports: {recipe.supportedParticipantCounts.join(", ")}</span>
        </div>

        {/* Six-person order */}
        {recipe.sixPersonOrder.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Six-person order</p>
            <div className="space-y-1">
              {recipe.sixPersonOrder.map((role, i) => (
                <div key={i} className="text-sm text-desert-night flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-copper-clay/20 text-copper-deep text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="font-bold">{role}</span>
                  {i === 0 && <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">Opener</span>}
                  {i === recipe.sixPersonOrder.length - 1 && <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">Closer</span>}
                  {i > 0 && i < recipe.sixPersonOrder.length - 1 && <span className="chip chip-cream !text-[8px] !px-1.5 !py-0.5">Middle</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Five-person fallback */}
        {recipe.fivePersonFallback.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Five-person fallback</p>
            <div className="space-y-1">
              {recipe.fivePersonFallback.map((role, i) => (
                <div key={i} className="text-sm text-desert-night flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cactus-teal/20 text-cactus-teal text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="font-bold">{role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Four-person fallback */}
        {recipe.fourPersonFallback.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">Four-person fallback</p>
            <div className="space-y-1">
              {recipe.fourPersonFallback.map((role, i) => (
                <div key={i} className="text-sm text-desert-night flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-desert-night/10 text-desert-night text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="font-bold">{role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repair rule */}
        {recipe.repairRule && (
          <div className="bg-heat-orange/10 rounded-lg p-3">
            <p className="text-xs font-bold text-heat-orange uppercase">Repair Rule</p>
            <p className="text-sm text-desert-night mt-1">{recipe.repairRule}</p>
          </div>
        )}
      </Section>

      {/* One-Video Formula */}
      {recipe.oneVideoFormula && (
        <Section title="Your One-Video Formula">
          <p className="text-sm text-desert-night bg-cactus-teal/10 rounded-lg p-3 leading-relaxed">{recipe.oneVideoFormula}</p>
        </Section>
      )}

      {/* Transition Family info */}
      <Section title="Transition Family">
        <p className="text-sm text-smoked-charcoal/80">
          <span className="font-bold text-desert-night">{recipe.transitionFamily}</span> · {recipe.assemblyMode}
        </p>
        <p className="text-xs text-smoked-charcoal/60 mt-1">
          Each creator receives her specific position and transition instructions. The opener uses a natural opening, the closer uses a final ending, and middle links use matching transition-in and transition-out.
        </p>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Tab
// ---------------------------------------------------------------------------

function AdminTab({ recipe }: { recipe: FullReadyRecipe }) {
  return (
    <div className="space-y-4">
      {/* Admin Editing Recipe */}
      <Section title="Admin Editing Recipe">
        {recipe.adminEditStyle && (
          <p className="text-sm text-desert-night font-bold mb-2">Edit style: {recipe.adminEditStyle}</p>
        )}
        {recipe.adminEditSteps.length > 0 && (
          <ol className="space-y-1.5">
            {recipe.adminEditSteps.map((step, i) => (
              <li key={i} className="text-sm text-smoked-charcoal/80 flex gap-2">
                <span className="w-5 h-5 rounded-full bg-desert-night/10 text-desert-night text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Transition repair rule */}
      {recipe.transitionRepairRule && (
        <Section title="Transition Repair Rule">
          <p className="text-sm text-desert-night bg-heat-orange/10 rounded-lg p-3">{recipe.transitionRepairRule}</p>
        </Section>
      )}

      {/* Creator freedom rule */}
      {recipe.creatorFreedomRule && (
        <Section title="Creator Freedom Rule">
          <p className="text-sm text-desert-night bg-cactus-teal/10 rounded-lg p-3">{recipe.creatorFreedomRule}</p>
        </Section>
      )}

      {/* Caption Package */}
      {(recipe.caption || recipe.commentPrompt || recipe.searchTerms.length > 0 || recipe.hashtags.length > 0) && (
        <Section title="Caption Package">
          {recipe.caption && (
            <div className="mb-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Caption</p>
              <p className="text-sm text-desert-night mt-1">{recipe.caption}</p>
            </div>
          )}
          {recipe.commentPrompt && (
            <div className="mb-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Comment Prompt</p>
              <p className="text-sm text-desert-night mt-1">{recipe.commentPrompt}</p>
            </div>
          )}
          {recipe.searchTerms.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-bold text-desert-night/50 uppercase">Search Terms</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {recipe.searchTerms.map((term, i) => (
                  <span key={i} className="chip chip-cream !text-[10px]">{term}</span>
                ))}
              </div>
            </div>
          )}
          {recipe.hashtags.length > 0 && (
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Hashtags</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {recipe.hashtags.map((tag, i) => (
                  <span key={i} className="chip chip-teal !text-[10px]">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: "copper" | "teal" }) {
  const borderClass = accent === "copper" ? "border-l-copper-clay" : accent === "teal" ? "border-l-cactus-teal" : "border-l-desert-night/10";
  return (
    <div className={`border-l-2 ${borderClass} pl-3`}>
      <p className="text-xs font-bold text-desert-night/50 uppercase mb-1.5">{title}</p>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full Ready Recipe Card (for the Ready Bank grid)
// ---------------------------------------------------------------------------

export function FullReadyRecipeCard({
  recipe,
  onClick,
}: {
  recipe: FullReadyRecipe;
  onClick: () => void;
}) {
  const isVersionA = recipe.version.startsWith("A");
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left space-y-2 hover:-translate-y-0.5 transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-desert-night leading-tight">{recipe.name}</p>
          <p className="text-[10px] text-smoked-charcoal/50 mt-0.5">{recipe.category}</p>
        </div>
        <span className={`chip !text-[8px] !px-1.5 !py-0.5 shrink-0 ${isVersionA ? "chip-copper" : "chip-cream"}`}>
          {isVersionA ? "A" : "B"}
        </span>
      </div>

      {/* Creator task */}
      <p className="text-xs text-smoked-charcoal/70 line-clamp-2">{recipe.creatorTask}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        <span className="chip chip-cream !text-[9px]">{recipe.effort}</span>
        <span className="chip chip-cream !text-[9px]">{recipe.difficulty}</span>
        <span className="chip chip-teal !text-[9px]">{recipe.transitionFamily}</span>
      </div>

      {/* Tone Mix */}
      {recipe.toneMix && recipe.toneMix.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.toneMix.map(t => (
            <span key={t} className="chip chip-copper !text-[8px] !px-1.5 !py-0.5">{t}</span>
          ))}
        </div>
      )}

      {/* Participant count */}
      <div className="flex items-center gap-1 text-[10px] text-smoked-charcoal/50">
        <span>👥 {recipe.defaultParticipantCount}</span>
        <span>·</span>
        <span>{recipe.supportedParticipantCounts.join("/")}</span>
      </div>

      <p className="text-xs text-copper-clay font-bold pt-1">Tap for full breakdown →</p>
    </button>
  );
}
