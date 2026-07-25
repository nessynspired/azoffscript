"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Database, UserRole } from "@/lib/types/db";

type InviteCode = Database["public"]["Tables"]["invite_codes"]["Row"];

const CREW_PROFILES = [
  { name: "Vanessa", nickname: "The Room Builder", plot_twist: "Founder energy. Vision, direction, and the one making sure the chaos turns into something real.", favorite_content: ["Founder", "Creative Lead", "Organizer"] },
  { name: "Ronnie", nickname: "The Sweet Touch", plot_twist: "Warm, creative, and the one who can bring personality into the room without forcing it.", favorite_content: ["Creative Energy", "Warm Vibe", "Food / Cake Energy"] },
  { name: "Sholanda", nickname: "The Real One", plot_twist: "Says what everyone else was thinking — and somehow makes it useful.", favorite_content: ["Hot Takes", "Real Reactions", "Group Games"] },
  { name: "Elaine", nickname: "The Quiet Surprise", plot_twist: "May not be the loudest in the room, but the reaction can say everything.", favorite_content: ["Reaction Queen", "Quiet Humor", "Side-Eye Energy"] },
  { name: "Latasha", nickname: "The Wild Card", plot_twist: "The one people need to watch because you don't know what direction her answer is about to go.", favorite_content: ["Wild Card", "Unpredictable Answers", "Real Talk"] },
  { name: "Maria", nickname: "The Fresh Energy", plot_twist: "Brings a different rhythm into the room and can make a simple question turn into a whole moment.", favorite_content: ["Fresh Vibe", "Group Chemistry", "Funny Questions"] },
];

function generateCode(name: string): string {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CREW-${prefix}-${random}${random2}`;
}

export default function AdminInvitesPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
    setInvites(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function createInvite(profile: typeof CREW_PROFILES[0], role: UserRole = "member") {
    const code = generateCode(profile.name);
    const { error } = await supabase.from("invite_codes").insert({
      code,
      name: profile.name,
      nickname: profile.nickname,
      plot_twist: profile.plot_twist,
      favorite_content: profile.favorite_content,
      role,
    });
    if (error) { alert(error.message); return; }
    load();
  }

  async function deleteInvite(id: string) {
    if (!confirm("Delete this invite code?")) return;
    const { error } = await supabase.from("invite_codes").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (member?.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-smoked-charcoal/70 mt-2">Only Vanessa can manage invite codes.</p>
      </div>
    );
  }

  // Which crew members already have codes?
  const codedNames = new Set(invites.map((i) => i.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Invite Codes</h1>
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Generate a code for each crew member. They enter it when signing up.</p>
      </div>

      {/* Generate codes for crew members who don't have one yet */}
      <div className="card p-5">
        <h2 className="font-display text-xl text-desert-night mb-3">Generate Invites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CREW_PROFILES.map((profile) => {
            const hasCode = codedNames.has(profile.name);
            return (
              <div key={profile.name} className="flex items-center justify-between bg-sandstone-cream/50 rounded-xl p-3">
                <div>
                  <p className="font-bold text-desert-night">{profile.name}</p>
                  <p className="text-xs text-cactus-teal font-bold">{profile.nickname}</p>
                </div>
                <button
                  onClick={() => createInvite(profile, profile.name === "Vanessa" ? "admin" : "member")}
                  disabled={hasCode}
                  className={`btn ${hasCode ? "btn-ghost" : "btn-primary"} btn-sm`}
                >
                  {hasCode ? "Code exists" : "Generate"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Existing codes */}
      {loading ? (
        <p className="font-display text-xl text-desert-night">Loading…</p>
      ) : invites.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-smoked-charcoal/70">No invite codes yet. Generate one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-display text-xl text-desert-night">Active Codes</h2>
          {invites.map((invite) => (
            <div key={invite.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-desert-night">{invite.name}</p>
                  {invite.nickname && <span className="chip chip-teal !text-[10px]">{invite.nickname}</span>}
                  {invite.role === "admin" && <span className="chip chip-yellow !text-[10px]">Admin</span>}
                </div>
                <p className="font-mono text-sm text-copper-clay font-bold mt-1">{invite.code}</p>
                {invite.used ? (
                  <p className="text-xs text-cactus-teal font-bold mt-1">
                    ✓ Used{invite.used_at ? ` on ${new Date(invite.used_at).toLocaleDateString()}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-smoked-charcoal/50 mt-1">Not used yet</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!invite.used && (
                  <button onClick={() => copyCode(invite.code)} className="btn btn-secondary btn-sm">
                    {copied === invite.code ? "Copied!" : "Copy"}
                  </button>
                )}
                {!invite.used && (
                  <button onClick={() => deleteInvite(invite.id)} className="text-copper-deep text-xs hover:underline">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="card p-5 bg-sandstone-cream/50">
        <h3 className="font-display text-lg text-desert-night mb-2">How it works</h3>
        <ol className="space-y-2 text-sm text-desert-night/70">
          <li><span className="chip chip-copper !text-[10px]">1</span> Generate a code for each crew member above.</li>
          <li><span className="chip chip-copper !text-[10px]">2</span> Copy the code and send it to them (text, DM, whatever).</li>
          <li><span className="chip chip-copper !text-[10px]">3</span> They go to the login page, tap &ldquo;Need access?&rdquo;, enter the code + their email + password.</li>
          <li><span className="chip chip-copper !text-[10px]">4</span> When they sign up, the code matches them to their pre-configured profile — name, title, tags, gear images.</li>
          <li><span className="chip chip-copper !text-[10px]">5</span> The code is marked as used so it can&apos;t be shared.</li>
        </ol>
        <p className="text-xs text-copper-deep font-bold mt-3">
          Without a valid code, someone can create an auth account but they won&apos;t get a member profile — they can&apos;t access the portal.
        </p>
      </div>
    </div>
  );
}
