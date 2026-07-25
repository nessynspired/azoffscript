"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import type { Database } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];

export default function CrewPage() {
  const { member: me } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [toggling, setToggling] = useState(false);

  const isAdmin = me?.role === "admin";

  useEffect(() => {
    supabase.from("members").select("*").order("role", { ascending: false }).order("name").then(({ data }) => {
      setMembers(data ?? []);
      setLoading(false);
    });
  }, [supabase]);

  async function togglePlanContent(memberId: string, current: boolean) {
    setToggling(true);
    const { error } = await supabase.from("members").update({ can_plan_content: !current }).eq("id", memberId);
    if (error) {
      alert(error.message);
    } else {
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, can_plan_content: !current } : m));
      setSelected((prev) => prev && prev.id === memberId ? { ...prev, can_plan_content: !current } : prev);
    }
    setToggling(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="animate-pulse-slow"><MascotImage pose="peace" size={100} /></div>
        <p className="font-display text-xl text-desert-night">Loading the crew…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with peace poster */}
      <section className="hero-band p-6 md:p-8 relative overflow-hidden min-h-[200px]">
        <div className="absolute inset-0 opacity-40">
          <PosterImage poster="peace" fill alt="AZ Off Script crew poster" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-3xl md:text-5xl text-sandstone-cream leading-none drop-shadow-lg">The Crew</h1>
          <p className="text-sandstone-cream/90 mt-2 text-lg drop-shadow">First Wave members of The Off Script Room.</p>
        </div>
      </section>

      {members.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="inline-block"><MascotImage pose="peace" size={120} /></div>
          <p className="font-display text-2xl text-desert-night mt-4">No crew members yet.</p>
          <p className="text-smoked-charcoal/70 mt-2">Once people sign up, they'll show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`card p-5 text-left hover:-translate-y-1 transition-transform ${i % 3 === 0 ? "sticker" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-full bg-copper-clay/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-2xl text-copper-clay">
                      {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-desert-night truncate">{m.name}</h3>
                  {m.nickname && <p className="text-sm text-cactus-teal font-bold">"{m.nickname}"</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.role === "admin" && <span className="chip chip-yellow !text-[10px]">Admin</span>}
                    {m.can_plan_content && m.role !== "admin" && <span className="chip chip-teal !text-[10px]">Planner</span>}
                    {m.first_wave && <span className="chip chip-copper !text-[10px]">First Wave</span>}
                  </div>
                </div>
              </div>
              {m.plot_twist && (
                <p className="text-sm text-smoked-charcoal/70 mt-3 italic font-script text-base">
                  "{m.plot_twist}"
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Member detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-desert-night/70 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card p-6 max-w-md w-full animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-copper-clay/20 flex items-center justify-center overflow-hidden">
                  {selected.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.photo_url} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-3xl text-copper-clay">
                      {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl text-desert-night leading-none">{selected.name}</h2>
                  {selected.nickname && <p className="text-cactus-teal font-bold mt-1">"{selected.nickname}"</p>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {selected.role === "admin" && <span className="chip chip-yellow">Admin</span>}
              {selected.can_plan_content && selected.role !== "admin" && <span className="chip chip-teal">Content Planner</span>}
              {selected.first_wave && <span className="chip chip-copper">First Wave</span>}
              {selected.design_edition && <span className="chip chip-teal">Edition {selected.design_edition}</span>}
            </div>

            {/* Admin permission controls */}
            {isAdmin && selected.role !== "admin" && (
              <div className="mt-4 card-dark p-4">
                <p className="text-sandstone-cream font-bold text-sm mb-1">Content Planning</p>
                <p className="text-sandstone-cream/60 text-xs mb-3">
                  Lets this crew member edit the calendar, set deadlines, and move clips through the studio flow. They cannot delete clips, invite people, or manage gear.
                </p>
                <button
                  onClick={() => togglePlanContent(selected.id, selected.can_plan_content)}
                  disabled={toggling}
                  className={`btn btn-sm ${selected.can_plan_content ? "btn-positive" : "btn-primary"}`}
                >
                  {toggling ? "Saving…" : selected.can_plan_content ? "✓ Can Plan Content" : "Grant Planning Access"}
                </button>
              </div>
            )}

            {selected.plot_twist && (
              <div className="mt-4 bg-sandstone-cream/50 rounded-xl p-4">
                <p className="text-xs font-black uppercase text-cactus-teal">Plot Twist</p>
                <p className="font-script text-xl text-desert-night mt-1">"{selected.plot_twist}"</p>
              </div>
            )}

            {selected.comfort_tags && selected.comfort_tags.length > 0 && (
              <div className="mt-4">
                <p className="label">Comfort Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selected.comfort_tags.map((t) => (
                    <span key={t} className="chip chip-cream">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.favorite_content && selected.favorite_content.length > 0 && (
              <div className="mt-4">
                <p className="label">Favorite Content</p>
                <div className="flex flex-wrap gap-2">
                  {selected.favorite_content.map((t) => (
                    <span key={t} className="chip chip-teal">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.availability && (
              <div className="mt-4">
                <p className="label">Availability</p>
                <p className="text-sm text-desert-night">{selected.availability}</p>
              </div>
            )}

            {selected.socials && Object.keys(selected.socials).length > 0 && (
              <div className="mt-4">
                <p className="label">Socials</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected.socials).map(([platform, handle]) => (
                    <span key={platform} className="chip chip-dark">{platform}: {handle}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.id === me?.id && (
              <Link href="/portal/my-kit" className="btn btn-primary w-full mt-6">Edit My Kit</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
