"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];

const SORT_MODES = [
  { value: "first_wave_first", label: "First Wave first, then by name" },
  { value: "manual", label: "Manual order (by display order number)" },
  { value: "alpha", label: "Alphabetical by name" },
];

export default function CrewProfilesPage() {
  const { member: me } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("first_wave_first");
  const [savingSortMode, setSavingSortMode] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    public_visible: false,
    public_bio: "",
    nickname: "",
    slug: "",
    display_order: 100,
    card_image: "",
    gear_image: "",
    favorite_content: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [memRes, settingsRes] = await Promise.all([
      supabase.from("members").select("*").order("name"),
      supabase.from("site_settings").select("value").eq("key", "crew_sort_mode").single(),
    ]);
    setMembers(memRes.data ?? []);
    if (settingsRes.data?.value) setSortMode(settingsRes.data.value);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function saveSortMode(mode: string) {
    setSortMode(mode);
    setSavingSortMode(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "crew_sort_mode", value: mode, updated_at: new Date().toISOString() });
    if (error) alert(error.message);
    setSavingSortMode(false);
  }

  function startEditing(m: Member) {
    setEditing(m);
    setEditForm({
      public_visible: m.public_visible,
      public_bio: m.public_bio ?? "",
      nickname: m.nickname ?? "",
      slug: m.slug ?? "",
      display_order: m.display_order,
      card_image: m.card_image ?? "",
      gear_image: m.gear_image ?? "",
      favorite_content: (m.favorite_content ?? []).join(", "),
    });
    setSaveError(null);
  }

  async function saveProfile() {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/crew-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          public_visible: editForm.public_visible,
          public_bio: editForm.public_bio.trim() || null,
          nickname: editForm.nickname.trim() || null,
          slug: editForm.slug.trim() || null,
          display_order: editForm.display_order,
          card_image: editForm.card_image.trim() || null,
          gear_image: editForm.gear_image.trim() || null,
          favorite_content: editForm.favorite_content
            ? editForm.favorite_content.split(",").map((s) => s.trim()).filter(Boolean)
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      await load();
      setEditing(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublic(m: Member) {
    const { error } = await supabase
      .from("members")
      .update({ public_visible: !m.public_visible })
      .eq("id", m.id);
    if (error) { alert(error.message); return; }
    setMembers((prev) => prev.map((p) => p.id === m.id ? { ...p, public_visible: !p.public_visible } : p));
  }

  if (me?.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-smoked-charcoal/70 mt-2">Only admins can manage crew profiles.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="font-display text-xl text-desert-night">Loading…</p>;
  }

  const publicCount = members.filter((m) => m.public_visible).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Crew Profiles</h1>
        <p className="text-smoked-charcoal/70 mt-2 text-lg">
          Control who appears on the public website and how they&apos;re shown.
        </p>
      </div>

      {/* Sort mode selector */}
      <div className="card p-5">
        <h2 className="font-display text-xl text-desert-night mb-3">Sort Order</h2>
        <p className="text-xs text-smoked-charcoal/60 mb-3">
          How crew members are arranged on the public homepage and /crew page.
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={sortMode}
            onChange={(e) => saveSortMode(e.target.value)}
            disabled={savingSortMode}
            className="field max-w-xs"
          >
            {SORT_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {savingSortMode && <span className="text-xs text-smoked-charcoal/50">Saving…</span>}
        </div>
      </div>

      {/* Member list */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-desert-night">Members</h2>
          <span className="text-xs text-smoked-charcoal/50">
            {publicCount} public · {members.length - publicCount} portal-only
          </span>
        </div>

        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className={`flex items-center justify-between gap-3 rounded-xl p-3 ${
                m.public_visible ? "bg-copper-clay/10 border border-copper-clay/20" : "bg-sandstone-cream/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-copper-clay/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-sm text-copper-clay">
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-desert-night truncate">{m.name}</p>
                    {m.first_wave && <span className="chip chip-yellow !text-[9px]">First Wave</span>}
                    {m.public_visible && <span className="chip chip-approved !text-[9px]">Public</span>}
                  </div>
                  <p className="text-xs text-smoked-charcoal/50 truncate">
                    {m.nickname ?? "No nickname"} · Order: {m.display_order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublic(m)}
                  className={`btn btn-sm ${m.public_visible ? "btn-ghost" : "btn-primary"}`}
                >
                  {m.public_visible ? "Hide" : "Make Public"}
                </button>
                <button
                  onClick={() => startEditing(m)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-desert-night/70 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditing(null)}
        >
          <div
            className="card max-w-lg w-full p-6 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-desert-night">Edit {editing.name}</h2>
              <button
                onClick={() => setEditing(null)}
                className="text-smoked-charcoal/40 hover:text-desert-night text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer bg-copper-clay/10 rounded-xl p-3 border-2 border-copper-clay/30">
                <input
                  type="checkbox"
                  checked={editForm.public_visible}
                  onChange={(e) => setEditForm((p) => ({ ...p, public_visible: e.target.checked }))}
                  className="w-5 h-5 accent-copper-clay"
                />
                <span className="text-sm font-bold text-desert-night">
                  Show on public website (homepage + /crew page)
                </span>
              </label>

              <div>
                <label className="label">Nickname (public title)</label>
                <input
                  className="field"
                  placeholder="The Wild Card"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm((p) => ({ ...p, nickname: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Public bio</label>
                <textarea
                  className="field min-h-[80px]"
                  placeholder="The one people need to watch because you don't know what direction her answer is about to go."
                  value={editForm.public_bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, public_bio: e.target.value }))}
                />
                <p className="text-xs text-smoked-charcoal/50 mt-1">
                  This is the longer description shown on the public crew page. Separate from the plot twist.
                </p>
              </div>

              <div>
                <label className="label">Tags (comma-separated)</label>
                <input
                  className="field"
                  placeholder="Wild Card, Unpredictable Answers, Real Talk"
                  value={editForm.favorite_content}
                  onChange={(e) => setEditForm((p) => ({ ...p, favorite_content: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Display order</label>
                  <input
                    type="number"
                    className="field"
                    value={editForm.display_order}
                    onChange={(e) => setEditForm((p) => ({ ...p, display_order: parseInt(e.target.value) || 100 }))}
                  />
                  <p className="text-xs text-smoked-charcoal/50 mt-1">Lower = appears first</p>
                </div>
                <div>
                  <label className="label">URL slug</label>
                  <input
                    className="field"
                    placeholder="latasha"
                    value={editForm.slug}
                    onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label">Card image path (optional)</label>
                <input
                  className="field"
                  placeholder="/cards/Latasha-Card.webp"
                  value={editForm.card_image}
                  onChange={(e) => setEditForm((p) => ({ ...p, card_image: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Gear image path (optional)</label>
                <input
                  className="field"
                  placeholder="/gear/latashagear.webp"
                  value={editForm.gear_image}
                  onChange={(e) => setEditForm((p) => ({ ...p, gear_image: e.target.value }))}
                />
              </div>

              {saveError && (
                <p className="text-sm text-copper-deep font-bold">{saveError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Profile"}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
