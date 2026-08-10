"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { InfoTooltip } from "@/components/InfoTooltip";
import { createClient } from "@/lib/supabase/client";
import { getArchivedMemberIds, archivedInFilter } from "@/lib/archived-members";
import { MascotImage } from "@/components/MascotImage";
import type { Database, IdeaCategory, IdeaStatus } from "@/lib/types/db";

type Idea = Database["public"]["Tables"]["ideas"]["Row"];

const CATEGORIES: IdeaCategory[] = [
  "Hot Takes", "Funny Questions", "AZ Moments", "Group Games",
  "Trends", "Skits", "BTS Chaos", "Merch Quotes",
];

const STATUS_CHIP: Record<IdeaStatus, string> = {
  "New": "chip-yellow",
  "Crew Favorite": "chip-copper",
  "Planned": "chip-teal",
  "Filmed": "chip-review",
  "Used": "chip-dark",
  "Saved for Later": "chip-cream",
  "Archived": "chip-cream",
};

const CATEGORY_CHIP: Partial<Record<IdeaCategory, string>> = {
  "Hot Takes": "chip-danger",
  "Funny Questions": "chip-yellow",
  "AZ Moments": "chip-teal",
  "Group Games": "chip-copper",
  "Trends": "chip-review",
  "Skits": "chip-dark",
  "BTS Chaos": "chip-cream",
  "Merch Quotes": "chip-copper",
};

export default function SparkBoardPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<IdeaCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<IdeaCategory>("Hot Takes");
  const [newEnergy, setNewEnergy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const archivedIds = await getArchivedMemberIds(supabase);
    const archFilter = archivedInFilter(archivedIds);
    let q = supabase.from("ideas").select("*").order("created_at", { ascending: false });
    if (archFilter) q = q.not("submitted_by", "in", archFilter);
    if (activeCategory !== "all") q = q.eq("category", activeCategory);
    const { data } = await q;
    setIdeas(data ?? []);
    setLoading(false);
  }, [supabase, activeCategory]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("spark-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, supabase]);

  async function submitIdea() {
    if (!member || !newTitle.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("ideas").insert({
      title: newTitle.trim(),
      category: newCategory,
      energy: newEnergy.trim() || null,
      submitted_by: member.id,
      submitted_by_name: member.name,
    });
    if (!error) {
      await supabase.from("activity").insert({
        actor_id: member.id,
        actor_name: member.name,
        kind: "idea_sparked",
        body: `${member.name} sparked an idea: "${newTitle.trim()}"`,
      });
      setNewTitle(""); setNewEnergy(""); setShowForm(false);
      await load();
    } else {
      alert(error.message);
    }
    setSubmitting(false);
  }

  async function vote(id: string, currentVotes: number) {
    const { error } = await supabase.from("ideas").update({ votes: currentVotes + 1 }).eq("id", id);
    if (!error) await load();
  }

  async function markCrewFavorite(id: string, current: boolean) {
    if (member?.role !== "admin") return;
    const { error } = await supabase.from("ideas").update({ crew_favorite: !current, status: !current ? "Crew Favorite" : "New" }).eq("id", id);
    if (!error) await load();
  }

  async function moveToRunSheet(id: string) {
    if (member?.role !== "admin") return;
    const { error } = await supabase.from("ideas").update({ status: "Planned" }).eq("id", id);
    if (!error) await load();
  }

  async function deleteIdea(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    const { error } = await supabase.from("ideas").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await load();
  }

  const isAdmin = member?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Spark Board</h1>
          <InfoTooltip text="Drop raw content ideas here — anything you think could be a video. Vote on ideas you like. Admins can mark the best ones as Crew Favorites, which moves them to the Ready Bank for planning." />
          <p className="text-smoked-charcoal/70 mt-2 text-lg">Got a wild idea? Toss it in.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
          {showForm ? "Cancel" : "Spark an Idea"}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 animate-slide-in">
          <div>
            <label className="label" htmlFor="idea-title">What's the idea?</label>
            <input
              id="idea-title"
              className="field"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What's the idea?"
              maxLength={200}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewCategory(c)}
                  className={`chip ${newCategory === c ? "chip-copper" : "chip-cream"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="idea-energy">Energy (optional)</label>
            <input
              id="idea-energy"
              className="field"
              value={newEnergy}
              onChange={(e) => setNewEnergy(e.target.value)}
              placeholder="funny, easy, low-edit…"
              maxLength={80}
            />
          </div>
          <button onClick={submitIdea} className="btn btn-primary" disabled={submitting || !newTitle.trim()}>
            {submitting ? "Sparking…" : "Drop it in"}
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`chip ${activeCategory === "all" ? "chip-dark" : "chip-cream"}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`chip ${activeCategory === c ? "chip-dark" : CATEGORY_CHIP[c] ?? "chip-cream"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="animate-pulse-slow"><MascotImage pose="peace" size={100} /></div>
          <p className="font-display text-xl text-desert-night">Loading sparks…</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="inline-block"><MascotImage pose="peace" size={120} /></div>
          <p className="font-display text-2xl text-desert-night mt-4">No sparks yet.</p>
          <p className="text-smoked-charcoal/70 mt-2">Add your first idea — questions, games, trends, chaos.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-6">Spark an Idea</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea, i) => (
            <div
              key={idea.id}
              className={`card p-5 ${i % 3 === 0 ? "sticker" : i % 3 === 1 ? "sticker-right" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`chip ${CATEGORY_CHIP[idea.category] ?? "chip-cream"} !text-[10px]`}>
                  {idea.category}
                </span>
                <span className={`chip ${STATUS_CHIP[idea.status]} !text-[10px]`}>
                  {idea.status}
                </span>
              </div>
              <h3 className="font-bold text-desert-night text-lg leading-tight">{idea.title}</h3>
              {idea.energy && (
                <p className="text-xs text-cactus-teal font-bold mt-1">Energy: {idea.energy}</p>
              )}
              <p className="text-xs text-smoked-charcoal/60 mt-2">by {idea.submitted_by_name}</p>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => vote(idea.id, idea.votes)}
                  className="flex items-center gap-1 text-sm font-bold text-copper-clay hover:text-heat-orange"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {idea.votes}
                </button>
                {idea.crew_favorite && <span className="chip chip-copper !text-[10px]">Crew Favorite</span>}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => markCrewFavorite(idea.id, idea.crew_favorite)}
                      className="btn btn-secondary btn-sm"
                    >
                      {idea.crew_favorite ? "Unfavorite" : "Crew Favorite"}
                    </button>
                    <button
                      onClick={() => moveToRunSheet(idea.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Move to Run Sheet
                    </button>
                    <button
                      onClick={() => deleteIdea(idea.id, idea.title)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
