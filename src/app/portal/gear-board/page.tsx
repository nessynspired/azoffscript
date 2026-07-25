"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getMemberGear } from "@/lib/crew-data";
import type { Database, GearItemType, GearStatus } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];
type Gear = Database["public"]["Tables"]["gear"]["Row"];

const ITEM_TYPES: GearItemType[] = ["tumbler", "mug", "shirt", "badge", "sticker", "invite", "member_card"];

const STATUSES: GearStatus[] = [
  "not_started", "needs_name_check", "mockup_ready", "approved", "ordered", "delivered", "hold",
];

const STATUS_LABELS: Record<GearStatus, string> = {
  not_started: "Not started",
  needs_name_check: "Needs name check",
  mockup_ready: "Mockup ready",
  approved: "Approved",
  ordered: "Ordered",
  delivered: "Delivered",
  hold: "Hold",
};

const STATUS_CHIP: Record<GearStatus, string> = {
  not_started: "chip-cream",
  needs_name_check: "chip-yellow",
  mockup_ready: "chip-copper",
  approved: "chip-approved",
  ordered: "chip-teal",
  delivered: "chip-dark",
  hold: "chip-hold",
};

export default function AdminGearBoardPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [gear, setGear] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGear, setEditingGear] = useState<string | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);

  // New gear form state
  const [newItemType, setNewItemType] = useState<GearItemType>("tumbler");
  const [newPersonalizedName, setNewPersonalizedName] = useState("");
  const [newTitleEdition, setNewTitleEdition] = useState("");
  const [newStatus, setNewStatus] = useState<GearStatus>("not_started");
  const [newNotes, setNewNotes] = useState("");

  const load = useCallback(async () => {
    const [memRes, gearRes] = await Promise.all([
      supabase.from("members").select("*").order("name"),
      supabase.from("gear").select("*").order("member_name").order("item_type"),
    ]);
    setMembers(memRes.data ?? []);
    setGear(gearRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function addGear(memberId: string, memberName: string) {
    const { error } = await supabase.from("gear").insert({
      member_id: memberId,
      member_name: memberName,
      item_type: newItemType,
      personalized_name: newPersonalizedName || null,
      title_edition: newTitleEdition || null,
      status: newStatus,
      notes: newNotes || null,
    });
    if (error) { alert(error.message); return; }
    setAddingFor(null);
    setNewItemType("tumbler");
    setNewPersonalizedName("");
    setNewTitleEdition("");
    setNewStatus("not_started");
    setNewNotes("");
    load();
  }

  async function updateGearStatus(gearId: string, status: GearStatus) {
    const { error } = await supabase.from("gear").update({ status }).eq("id", gearId);
    if (error) { alert(error.message); return; }
    load();
  }

  async function deleteGear(gearId: string) {
    const { error } = await supabase.from("gear").delete().eq("id", gearId);
    if (error) { alert(error.message); return; }
    load();
  }

  if (member?.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-smoked-charcoal/70 mt-2">Only Vanessa can manage gear.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="font-display text-xl text-desert-night">Loading gear board…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Gear Board</h1>
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Manage personalized gear for every member.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map((s) => {
          const count = gear.filter((g) => g.status === s).length;
          if (count === 0) return null;
          return (
            <div key={s} className="card p-4 text-center">
              <p className="text-2xl font-display text-desert-night">{count}</p>
              <span className={`chip ${STATUS_CHIP[s]} !text-[10px] mt-1`}>{STATUS_LABELS[s]}</span>
            </div>
          );
        })}
      </div>

      {/* Per-member gear table */}
      <div className="space-y-4">
        {members.map((m) => {
          const memberGear = gear.filter((g) => g.member_id === m.id);
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display text-xl text-desert-night">{m.name}</h3>
                  {m.nickname && <p className="text-cactus-teal font-bold text-sm">{m.nickname}</p>}
                </div>
                <button
                  onClick={() => setAddingFor(addingFor === m.id ? null : m.id)}
                  className="btn btn-secondary !text-xs"
                >
                  + Add Item
                </button>
              </div>

              {/* Gear image only */}
              {getMemberGear(m.name) && (
                <div className="rounded-xl overflow-hidden border border-desert-night/10 mb-3 max-w-[50%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getMemberGear(m.name)!} alt={`${m.name} gear`} className="w-full" />
                </div>
              )}

              {/* Add item form */}
              {addingFor === m.id && (
                <div className="bg-sandstone-cream/50 rounded-xl p-4 space-y-3 mb-3 animate-slide-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Item type</label>
                      <select className="field" value={newItemType} onChange={(e) => setNewItemType(e.target.value as GearItemType)}>
                        {ITEM_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="field" value={newStatus} onChange={(e) => setNewStatus(e.target.value as GearStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Personalized name</label>
                      <input className="field" value={newPersonalizedName} onChange={(e) => setNewPersonalizedName(e.target.value)} placeholder={m.name} />
                    </div>
                    <div>
                      <label className="label">Title/Edition</label>
                      <input className="field" value={newTitleEdition} onChange={(e) => setNewTitleEdition(e.target.value)} placeholder={m.nickname ?? "First Wave"} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Notes (optional)</label>
                    <input className="field" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Any notes about this item" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAddingFor(null)} className="btn btn-ghost">Cancel</button>
                    <button onClick={() => addGear(m.id, m.name)} className="btn btn-primary flex-1">Add Item</button>
                  </div>
                </div>
              )}

              {/* Gear list */}
              {memberGear.length === 0 ? (
                <p className="text-sm text-smoked-charcoal/50">No gear items yet.</p>
              ) : (
                <div className="space-y-2">
                  {memberGear.map((g) => (
                    <div key={g.id} className="flex items-center justify-between bg-sandstone-cream/30 rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-desert-night capitalize text-sm">
                          {g.personalized_name ? `${g.personalized_name} ` : ""}{g.item_type.replace("_", " ")}
                        </p>
                        {g.title_edition && <p className="text-xs text-cactus-teal">{g.title_edition}</p>}
                        {g.notes && <p className="text-xs text-smoked-charcoal/60 mt-0.5">{g.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={g.status}
                          onChange={(e) => updateGearStatus(g.id, e.target.value as GearStatus)}
                          className="text-xs font-bold border-0 bg-transparent text-desert-night cursor-pointer"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                        <button
                          onClick={() => deleteGear(g.id)}
                          className="text-copper-deep text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
