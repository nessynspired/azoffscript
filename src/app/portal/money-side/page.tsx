"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import type { Database } from "@/lib/types/db";

type Member = Pick<Database["public"]["Tables"]["members"]["Row"], "id" | "name" | "role" | "can_plan_content">;
type RevenueEvent = Database["public"]["Tables"]["revenue_events"]["Row"];

// Split templates
const SPLIT_TEMPLATES = {
  "Paid Content": { brand: 50, planner: 15, contributor: 35 },
  "Platform Revenue": { brand: 50, planner: 15, contributor: 35 },
  "Merch Revenue": { brand: 80, planner: 0, contributor: 20 },
  "Custom": { brand: 0, planner: 0, contributor: 0 },
} as const;

const REVENUE_TYPE_LABEL: Record<string, string> = {
  "Paid Content": "Paid Content / Sponsor",
  "Platform Revenue": "Platform Revenue",
  "Merch Revenue": "Merch Revenue",
  "Events": "Events / Special",
};

const STATUS_CHIP: Record<string, string> = {
  "Draft": "chip-cream",
  "Pending Approval": "chip-yellow",
  "Approved": "chip-teal",
  "Paid": "chip-approved",
  "On Hold": "chip-hold",
};

const DISCLOSURE_CHIP: Record<string, string> = {
  "None": "chip-cream",
  "Sponsored": "chip-danger",
  "Gifted": "chip-yellow",
  "Affiliate": "chip-copper",
  "Paid Partnership": "chip-danger",
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function MoneySidePage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<RevenueEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const isAdmin = member?.role === "admin";
  const isPlanner = isAdmin || member?.can_plan_content === true;

  const load = useCallback(async () => {
    const [membersRes, eventsRes] = await Promise.all([
      supabase.from("members").select("id, name, role, can_plan_content").order("name"),
      supabase.from("revenue_events").select("*").order("created_at", { ascending: false }),
    ]);
    setMembers(membersRes.data ?? []);
    setEvents(eventsRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Crew view — simple explanation only
  if (!isPlanner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">Money Side</h1>
        </div>

        <div className="card-dark p-8 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <MascotImage pose="shades" size={180} />
          </div>
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="inline-block mb-4">
              <MascotImage pose="shades" size={100} />
            </div>
            <span className="chip chip-yellow mb-4">Not Active Yet</span>
            <h2 className="font-display text-2xl text-sandstone-cream leading-tight">
              Nothing is paid or promised right now.
            </h2>
            <div className="text-sandstone-cream/80 mt-4 space-y-3 text-sm leading-relaxed">
              <p>
                If AZ Off Script starts earning money, payouts will only happen after money is
                received, direct costs are deducted, and a written agreement is in place.
              </p>
              <p>
                Money is not automatically split equally. Splits depend on the type of revenue
                and who contributed to that specific content, campaign, or merch sale.
              </p>
              <div className="bg-white/5 rounded-xl p-4 mt-4">
                <p className="text-xs font-bold text-sunburst-yellow/60 uppercase mb-2">How it works</p>
                <ul className="space-y-1.5">
                  <li>• Direct costs are deducted first (shirts, props, printing, shipping, tools)</li>
                  <li>• The revenue type is selected (paid content, platform, merch, events)</li>
                  <li>• Contributors are identified for that specific content</li>
                  <li>• Vanessa/admin approves the split</li>
                  <li>• Written agreements must be in place before any payout</li>
                </ul>
              </div>
              <p className="text-sandstone-cream/50 text-xs mt-4">
                For now, focus on dropping clips and getting them greenlit. The money follows the content.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Planner view — can see events but not approve payouts (unless admin)
  // Admin view — full revenue event setup
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">Money Side</h1>
          <p className="text-smoked-charcoal/70 mt-2">
            Revenue events, splits, and payouts. {isAdmin ? "You can approve payouts." : "You can view but not approve payouts."}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm shrink-0">
            + Revenue Event
          </button>
        )}
      </div>

      {/* Money rules banner */}
      <div className="card p-5 bg-copper-clay/10 border-l-4 border-copper-clay">
        <p className="font-display text-lg text-desert-night">AZ Off Script Money Rules</p>
        <div className="text-sm text-smoked-charcoal/70 mt-2 space-y-1.5">
          <p>Money is not active yet. No payment is promised until revenue is received and a written agreement is in place.</p>
          <p>Money is not automatically split evenly. Revenue is handled by type:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="bg-white/50 rounded-lg p-3">
              <p className="font-bold text-desert-night text-sm">Paid Content / Sponsor</p>
              <p className="text-xs text-smoked-charcoal/60 mt-1">50% Brand · 15% Planner · 35% Contributor Pool</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="font-bold text-desert-night text-sm">Platform Revenue</p>
              <p className="text-xs text-smoked-charcoal/60 mt-1">50% Brand · 15% Planner · 35% Contributor Pool (monthly, after threshold)</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="font-bold text-desert-night text-sm">Merch Revenue</p>
              <p className="text-xs text-smoked-charcoal/60 mt-1">80% Brand · 20% Promo Pool (only if crew helped promote/sell)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {events.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4 text-center">
            <p className="font-display text-2xl text-desert-night">{events.length}</p>
            <p className="text-xs text-smoked-charcoal/60">Total events</p>
          </div>
          <div className="card p-4 text-center">
            <p className="font-display text-2xl text-desert-night">{formatMoney(events.reduce((s, e) => s + e.gross_cents, 0))}</p>
            <p className="text-xs text-smoked-charcoal/60">Gross revenue</p>
          </div>
          <div className="card p-4 text-center">
            <p className="font-display text-2xl text-desert-night">{formatMoney(events.reduce((s, e) => s + e.expenses_cents, 0))}</p>
            <p className="text-xs text-smoked-charcoal/60">Direct costs</p>
          </div>
          <div className="card p-4 text-center">
            <p className="font-display text-2xl text-desert-night">{formatMoney(events.reduce((s, e) => s + e.net_cents, 0))}</p>
            <p className="text-xs text-smoked-charcoal/60">Net revenue</p>
          </div>
        </div>
      )}

      {/* Revenue events list */}
      {loading ? (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">Loading…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card-dark p-10 text-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <MascotImage pose="shades" size={180} />
          </div>
          <div className="relative z-10">
            <MascotImage pose="shades" size={100} />
            <span className="chip chip-yellow block w-fit mx-auto mb-3 mt-4">Not Active Yet</span>
            <h2 className="font-display text-2xl text-sandstone-cream">No revenue events yet.</h2>
            <p className="text-sandstone-cream/70 mt-2 text-sm">
              When money comes in, add a revenue event here. Focus on content first — the money follows.
            </p>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm mt-4">
                + Add First Revenue Event
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <RevenueEventCard
              key={e.id}
              event={e}
              members={members}
              isAdmin={isAdmin}
              onUpdate={load}
            />
          ))}
        </div>
      )}

      {/* Revenue event form modal */}
      {showForm && isAdmin && member && (
        <RevenueEventForm
          member={member}
          members={members}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}

// ===========================================================================
// REVENUE EVENT CARD
// ===========================================================================
function RevenueEventCard({ event, members, isAdmin, onUpdate }: {
  event: RevenueEvent;
  members: Member[];
  isAdmin: boolean;
  onUpdate: () => Promise<void>;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const template = SPLIT_TEMPLATES[event.split_template] ?? SPLIT_TEMPLATES["Paid Content"];
  const contributors = event.contributor_ids.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
  const promoContributors = event.promo_contributor_ids.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
  const planner = event.planner_id ? members.find((m) => m.id === event.planner_id) : null;

  const brandShare = Math.round(event.net_cents * template.brand / 100);
  const plannerShare = event.planner_involved ? Math.round(event.net_cents * template.planner / 100) : 0;
  const contributorPool = Math.round(event.net_cents * template.contributor / 100);
  const perContributor = contributors.length > 0 ? Math.round(contributorPool / contributors.length) : 0;

  async function updateStatus(status: Database["public"]["Tables"]["revenue_events"]["Row"]["status"]) {
    setUpdating(true);
    await supabase.from("revenue_events").update({ status }).eq("id", event.id);
    await onUpdate();
    setUpdating(false);
  }

  async function markPaid() {
    if (!confirm("Mark this as paid out? This confirms all contributors have been paid.")) return;
    setUpdating(true);
    await supabase.from("revenue_events").update({ status: "Paid", paid_out: true, paid_at: new Date().toISOString() }).eq("id", event.id);
    await onUpdate();
    setUpdating(false);
  }

  return (
    <div className="card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg text-desert-night">{event.title}</p>
          <p className="text-xs text-smoked-charcoal/50 mt-0.5">{REVENUE_TYPE_LABEL[event.revenue_type] ?? event.revenue_type}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <span className={`chip !text-[9px] ${STATUS_CHIP[event.status] ?? "chip-cream"}`}>{event.status}</span>
          {event.disclosure !== "None" && (
            <span className={`chip !text-[9px] ${DISCLOSURE_CHIP[event.disclosure] ?? "chip-cream"}`}>{event.disclosure}</span>
          )}
        </div>
      </div>

      {/* Money summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-sandstone-cream/50 rounded-lg p-2 text-center">
          <p className="text-xs text-smoked-charcoal/50">Gross</p>
          <p className="font-bold text-desert-night text-sm">{formatMoney(event.gross_cents)}</p>
        </div>
        <div className="bg-sandstone-cream/50 rounded-lg p-2 text-center">
          <p className="text-xs text-smoked-charcoal/50">Costs</p>
          <p className="font-bold text-desert-night text-sm">{formatMoney(event.expenses_cents)}</p>
        </div>
        <div className="bg-copper-clay/15 rounded-lg p-2 text-center">
          <p className="text-xs text-smoked-charcoal/50">Net</p>
          <p className="font-bold text-desert-night text-sm">{formatMoney(event.net_cents)}</p>
        </div>
      </div>

      {/* Expand/collapse */}
      <button onClick={() => setExpanded(!expanded)} className="btn btn-ghost btn-sm !text-xs w-full">
        {expanded ? "Hide split details ▲" : "Show split details ▼"}
      </button>

      {expanded && (
        <div className="space-y-3 pt-2 border-t border-desert-night/10">
          {/* Split breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Split ({event.split_template})</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-desert-night">Brand / Operations ({template.brand}%)</span>
                <span className="font-bold text-desert-night">{formatMoney(brandShare)}</span>
              </div>
              {event.planner_involved && template.planner > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-desert-night">Planner / Orchestration ({template.planner}%) {planner && `· ${planner.name}`}</span>
                  <span className="font-bold text-desert-night">{formatMoney(plannerShare)}</span>
                </div>
              )}
              {template.contributor > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-desert-night">Contributor Pool ({template.contributor}%)</span>
                  <span className="font-bold text-desert-night">{formatMoney(contributorPool)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contributors */}
          {contributors.length > 0 && (
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Content contributors ({contributors.length})</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {contributors.map((c) => (
                  <span key={c.id} className="chip chip-cream !text-[10px]">
                    {c.name} · {formatMoney(perContributor)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Promo contributors (merch) */}
          {promoContributors.length > 0 && (
            <div>
              <p className="text-xs font-bold text-desert-night/50 uppercase">Promo contributors ({promoContributors.length})</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {promoContributors.map((c) => (
                  <span key={c.id} className="chip chip-cream !text-[10px]">{c.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Agreement + disclosure status */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`chip !text-[9px] ${event.agreement_signed ? "chip-approved" : "chip-hold"}`}>
              {event.agreement_signed ? "✓ Agreement signed" : "⚠ No agreement"}
            </span>
            <span className={`chip !text-[9px] ${event.paid_out ? "chip-approved" : "chip-cream"}`}>
              {event.paid_out ? "✓ Paid out" : "Not paid yet"}
            </span>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-desert-night/10">
              {event.status === "Draft" && (
                <button onClick={() => updateStatus("Pending Approval")} disabled={updating} className="btn btn-secondary btn-sm !text-xs">
                  Submit for Approval
                </button>
              )}
              {event.status === "Pending Approval" && (
                <button onClick={() => updateStatus("Approved")} disabled={updating} className="btn btn-primary btn-sm !text-xs">
                  Approve Split
                </button>
              )}
              {event.status === "Approved" && (
                <button onClick={markPaid} disabled={updating} className="btn btn-positive btn-sm !text-xs">
                  Mark Paid Out
                </button>
              )}
              {event.status !== "On Hold" && event.status !== "Paid" && (
                <button onClick={() => updateStatus("On Hold")} disabled={updating} className="btn btn-ghost btn-sm !text-xs">
                  Put on Hold
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// REVENUE EVENT FORM (admin only)
// ===========================================================================
function RevenueEventForm({ member, members, onClose, onSaved }: {
  member: { id: string; name: string };
  members: Member[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [revenueType, setRevenueType] = useState<"Paid Content" | "Platform Revenue" | "Merch Revenue" | "Events">("Paid Content");
  const [splitTemplate, setSplitTemplate] = useState<"Paid Content" | "Platform Revenue" | "Merch Revenue" | "Custom">("Paid Content");
  const [disclosure, setDisclosure] = useState<"None" | "Sponsored" | "Gifted" | "Affiliate" | "Paid Partnership">("None");
  const [grossDollars, setGrossDollars] = useState("");
  const [expensesDollars, setExpensesDollars] = useState("");
  const [plannerInvolved, setPlannerInvolved] = useState(false);
  const [plannerId, setPlannerId] = useState<string>("");
  const [contributorIds, setContributorIds] = useState<string[]>([]);
  const [promoContributorIds, setPromoContributorIds] = useState<string[]>([]);
  const [agreementSigned, setAgreementSigned] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-set split template based on revenue type
  useEffect(() => {
    if (revenueType === "Merch Revenue") setSplitTemplate("Merch Revenue");
    else if (revenueType === "Paid Content") setSplitTemplate("Paid Content");
    else if (revenueType === "Platform Revenue") setSplitTemplate("Platform Revenue");
  }, [revenueType]);

  const template = SPLIT_TEMPLATES[splitTemplate as keyof typeof SPLIT_TEMPLATES] ?? SPLIT_TEMPLATES["Paid Content"];
  const grossCents = Math.round(parseFloat(grossDollars || "0") * 100);
  const expensesCents = Math.round(parseFloat(expensesDollars || "0") * 100);
  const netCents = grossCents - expensesCents;
  const brandShare = Math.round(netCents * template.brand / 100);
  const plannerShare = plannerInvolved ? Math.round(netCents * template.planner / 100) : 0;
  const contributorPool = Math.round(netCents * template.contributor / 100);
  const perContributor = contributorIds.length > 0 ? Math.round(contributorPool / contributorIds.length) : 0;

  async function save() {
    if (!title || grossCents <= 0) {
      alert("Add a title and gross amount.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("revenue_events").insert({
      title,
      description: description || null,
      revenue_type: revenueType,
      split_template: splitTemplate,
      disclosure,
      gross_cents: grossCents,
      expenses_cents: expensesCents,
      planner_involved: plannerInvolved,
      planner_id: plannerInvolved && plannerId ? plannerId : null,
      contributor_ids: contributorIds,
      promo_contributor_ids: promoContributorIds,
      agreement_signed: agreementSigned,
      status: "Draft",
      created_by: member.id,
    });
    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }
    await onSaved();
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-sandstone-cream rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-desert-night">New Revenue Event</h2>
          <button onClick={onClose} className="text-desert-night/40 text-2xl">×</button>
        </div>

        {/* Title */}
        <div>
          <p className="label">Title</p>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Local drink sponsor — July" />
        </div>

        {/* Description */}
        <div>
          <p className="label">Description <span className="font-normal text-desert-night/40">(optional)</span></p>
          <textarea className="field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?" />
        </div>

        {/* Revenue type */}
        <div>
          <p className="label">Revenue type</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(REVENUE_TYPE_LABEL).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRevenueType(key as typeof revenueType)}
                className={`chip !text-xs ${revenueType === key ? "chip-copper" : "chip-cream"}`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Disclosure */}
        <div>
          <p className="label">Disclosure status <span className="font-normal text-desert-night/40">(FTC requirement)</span></p>
          <div className="flex flex-wrap gap-2">
            {["None", "Sponsored", "Gifted", "Affiliate", "Paid Partnership"].map((d) => (
              <button
                key={d}
                onClick={() => setDisclosure(d as typeof disclosure)}
                className={`chip !text-xs ${disclosure === d ? "chip-copper" : "chip-cream"}`}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Money */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Gross amount ($)</p>
            <input type="number" className="field" value={grossDollars} onChange={(e) => setGrossDollars(e.target.value)} placeholder="500" />
          </div>
          <div>
            <p className="label">Direct costs ($)</p>
            <input type="number" className="field" value={expensesDollars} onChange={(e) => setExpensesDollars(e.target.value)} placeholder="100" />
          </div>
        </div>

        {/* Split template */}
        <div>
          <p className="label">Split template</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SPLIT_TEMPLATES).map((t) => (
              <button
                key={t}
                onClick={() => setSplitTemplate(t as typeof splitTemplate)}
                className={`chip !text-xs ${splitTemplate === t ? "chip-copper" : "chip-cream"}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Planner */}
        {template.planner > 0 && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={plannerInvolved} onChange={(e) => setPlannerInvolved(e.target.checked)} />
              <span className="text-sm font-bold text-desert-night">Planner involved ({template.planner}%)</span>
            </label>
            {plannerInvolved && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {members.filter((m) => m.can_plan_content || m.role === "admin").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPlannerId(m.id)}
                    className={`chip !text-xs ${plannerId === m.id ? "chip-copper" : "chip-cream"}`}
                  >{m.name}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contributors */}
        {template.contributor > 0 && (
          <div>
            <p className="label">Content contributors <span className="font-normal text-desert-night/40">(people in the content)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setContributorIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                  className={`chip !text-xs ${contributorIds.includes(m.id) ? "chip-copper" : "chip-cream"}`}
                >{m.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Promo contributors (merch only) */}
        {splitTemplate === "Merch Revenue" && (
          <div>
            <p className="label">Promo contributors <span className="font-normal text-desert-night/40">(crew who helped promote/sell)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPromoContributorIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                  className={`chip !text-xs ${promoContributorIds.includes(m.id) ? "chip-copper" : "chip-cream"}`}
                >{m.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Agreement */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={agreementSigned} onChange={(e) => setAgreementSigned(e.target.checked)} />
          <span className="text-sm font-bold text-desert-night">Written agreement is in place</span>
        </label>

        {/* Live split preview */}
        {netCents > 0 && (
          <div className="bg-cactus-teal/10 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-bold text-desert-night/50 uppercase">Split preview</p>
            <div className="flex justify-between text-sm"><span>Brand / Operations ({template.brand}%)</span><span className="font-bold">{formatMoney(brandShare)}</span></div>
            {plannerInvolved && template.planner > 0 && (
              <div className="flex justify-between text-sm"><span>Planner ({template.planner}%)</span><span className="font-bold">{formatMoney(plannerShare)}</span></div>
            )}
            {template.contributor > 0 && (
              <>
                <div className="flex justify-between text-sm"><span>Contributor Pool ({template.contributor}%)</span><span className="font-bold">{formatMoney(contributorPool)}</span></div>
                {contributorIds.length > 0 && (
                  <p className="text-xs text-smoked-charcoal/60">{contributorIds.length} contributors · {formatMoney(perContributor)} each</p>
                )}
              </>
            )}
          </div>
        )}

        <button onClick={save} disabled={saving} className="btn btn-primary btn-lg w-full">
          {saving ? "Saving…" : "Create Revenue Event"}
        </button>
      </div>
    </div>
  );
}
