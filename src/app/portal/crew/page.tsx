"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import { QUICK_TERMS_VERSION } from "@/lib/terms";
import type { Database } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];
type Acceptance = Database["public"]["Tables"]["quick_terms_acceptances"]["Row"];
type Signature = Database["public"]["Tables"]["agreement_signatures"]["Row"];

interface MemberTerms {
  quickTerms: boolean;
  quickTermsVersion: string | null;
  quickTermsDate: string | null;
  creatorRelease: boolean;
  creatorReleaseDate: string | null;
}

interface AuthUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  has_member_row: boolean;
  member_name: string | null;
}

export default function CrewPage() {
  const { member: me } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [toggling, setToggling] = useState(false);
  const [termsMap, setTermsMap] = useState<Record<string, MemberTerms>>({});
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [creatingFor, setCreatingFor] = useState<AuthUser | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", nickname: "", plot_twist: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isAdmin = me?.role === "admin";

  useEffect(() => {
    supabase.from("members").select("*").order("role", { ascending: false }).order("name").then(({ data }) => {
      setMembers(data ?? []);
      setLoading(false);
    });

    // Admin: load terms status for all members + auth user login activity
    if (me?.role === "admin") {
      (async () => {
        const [qtRes, sigRes] = await Promise.all([
          supabase.from("quick_terms_acceptances").select("*").order("accepted_at", { ascending: false }),
          supabase.from("agreement_signatures").select("*").order("created_at", { ascending: false }),
        ]);
        const map: Record<string, MemberTerms> = {};
        for (const a of (qtRes.data ?? []) as Acceptance[]) {
          if (!map[a.member_id]) map[a.member_id] = { quickTerms: false, quickTermsVersion: null, quickTermsDate: null, creatorRelease: false, creatorReleaseDate: null };
          if (a.agreement_type === "quick_terms") {
            map[a.member_id].quickTerms = true;
            map[a.member_id].quickTermsVersion = a.agreement_version;
            map[a.member_id].quickTermsDate = a.accepted_at;
          } else if (a.agreement_type === "creator_release") {
            map[a.member_id].creatorRelease = true;
            map[a.member_id].creatorReleaseDate = a.accepted_at;
          }
        }
        for (const s of (sigRes.data ?? []) as Signature[]) {
          if (!map[s.member_id]) map[s.member_id] = { quickTerms: false, quickTermsVersion: null, quickTermsDate: null, creatorRelease: false, creatorReleaseDate: null };
          map[s.member_id].creatorRelease = true;
          if (!map[s.member_id].creatorReleaseDate) map[s.member_id].creatorReleaseDate = s.created_at;
        }
        setTermsMap(map);

        // Pull auth user login activity (service role, admin-only route)
        try {
          const res = await fetch("/api/admin/auth-users");
          if (res.ok) {
            const data = await res.json();
            setAuthUsers(data.users ?? []);
          }
        } catch (err) {
          console.warn("[crew] failed to load auth users:", err);
        }
      })();
    }
  }, [supabase, me]);

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

  async function createMemberRow(authUser: AuthUser) {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: authUser.id,
          email: authUser.email,
          name: createForm.name.trim(),
          nickname: createForm.nickname.trim() || undefined,
          plot_twist: createForm.plot_twist.trim() || undefined,
          role: "member",
          first_wave: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create member");
      // Refresh members + auth users
      const [memRes, authRes] = await Promise.all([
        supabase.from("members").select("*").order("role", { ascending: false }).order("name"),
        fetch("/api/admin/auth-users").then((r) => r.json()),
      ]);
      setMembers(memRes.data ?? []);
      if (authRes.users) setAuthUsers(authRes.users);
      setCreatingFor(null);
      setCreateForm({ name: "", nickname: "", plot_twist: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create member");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="animate-pulse-slow"><MascotImage pose="peace" size={100} /></div>
        <p className="font-display text-xl text-desert-night">Loading the crew…</p>
      </div>
    );
  }

  // Build a lookup of auth users by user_id, and find accounts with no member row
  const authByUserId = new Map(authUsers.map((u) => [u.id, u]));
  const orphans = authUsers.filter((u) => !u.has_member_row);

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

      {/* ===== ADMIN TERMS OVERVIEW ===== */}
      {isAdmin && members.length > 0 && (
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-lg text-desert-night">Terms Status — All Crew</p>
            <span className="text-xs text-smoked-charcoal/50">Quick Terms {QUICK_TERMS_VERSION}</span>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-smoked-charcoal/50 uppercase border-b border-desert-night/10">
                  <th className="py-2 pr-4">Member</th>
                  <th className="py-2 pr-4">Quick Terms</th>
                  <th className="py-2 pr-4">Creator Release</th>
                  <th className="py-2 pr-4">Clip Uploads</th>
                  <th className="py-2 pr-4">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const t = termsMap[m.id];
                  const qtOk = t?.quickTerms && t.quickTermsVersion === QUICK_TERMS_VERSION;
                  const crOk = t?.creatorRelease;
                  const auth = authByUserId.get(m.user_id);
                  return (
                    <tr key={m.id} className="border-b border-desert-night/5">
                      <td className="py-2 pr-4 font-bold text-desert-night">{m.name}</td>
                      <td className="py-2 pr-4">
                        <span className={`chip !text-[10px] ${qtOk ? "chip-approved" : "chip-yellow"}`}>
                          {qtOk ? "✓ Accepted" : "Missing"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`chip !text-[10px] ${crOk ? "chip-approved" : "chip-yellow"}`}>
                          {crOk ? "✓ Signed" : "Not signed"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`chip !text-[10px] ${crOk ? "chip-approved" : "chip-yellow"}`}>
                          {crOk ? "Unlocked" : "🔒 Locked"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-smoked-charcoal/70 whitespace-nowrap">
                        {auth?.last_sign_in_at
                          ? formatLoginTime(auth.last_sign_in_at)
                          : auth
                            ? <span className="text-smoked-charcoal/40">Never</span>
                            : <span className="text-smoked-charcoal/30">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===== ADMIN: LOGGED IN WITHOUT A CREW PROFILE ===== */}
      {isAdmin && orphans.length > 0 && (
        <section className="card p-5 border-2 border-copper-clay/30">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-lg text-desert-night">Logged in — no crew profile</p>
            <span className="text-xs text-smoked-charcoal/50">{orphans.length} account(s)</span>
          </div>
          <p className="text-xs text-smoked-charcoal/60 mb-3">
            These people created an account (or logged in) but never matched to a crew profile — usually because they signed up without a valid invite code. They can&apos;t access the portal. Click <strong>Create Member</strong> to fix them instantly.
          </p>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-smoked-charcoal/50 uppercase border-b border-desert-night/10">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Email Verified</th>
                  <th className="py-2 pr-4">Last Login</th>
                  <th className="py-2 pr-4">Account Created</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {orphans.map((u) => (
                  <Fragment key={u.id}>
                    <tr className="border-b border-desert-night/5">
                      <td className="py-2 pr-4 font-bold text-desert-night break-all">{u.email ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <span className={`chip !text-[10px] ${u.email_confirmed_at ? "chip-approved" : "chip-yellow"}`}>
                          {u.email_confirmed_at ? "✓ Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-smoked-charcoal/70 whitespace-nowrap">
                        {u.last_sign_in_at ? formatLoginTime(u.last_sign_in_at) : <span className="text-smoked-charcoal/40">Never</span>}
                      </td>
                      <td className="py-2 pr-4 text-xs text-smoked-charcoal/70 whitespace-nowrap">
                        {formatLoginTime(u.created_at)}
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          onClick={() => {
                            setCreatingFor(u);
                            setCreateForm({ name: "", nickname: "", plot_twist: "" });
                            setCreateError(null);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Create Member
                        </button>
                      </td>
                    </tr>
                    {creatingFor?.id === u.id && (
                      <tr className="border-b border-desert-night/10 bg-copper-clay/5">
                        <td colSpan={5} className="py-4 px-4">
                          <div className="space-y-3 max-w-md">
                            <p className="text-xs font-bold text-desert-night">
                              Create a crew profile for {u.email}
                            </p>
                            <div>
                              <label className="label">Name</label>
                              <input
                                className="field"
                                placeholder="Latasha"
                                value={createForm.name}
                                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="label">Nickname (optional)</label>
                              <input
                                className="field"
                                placeholder="The Wild Card"
                                value={createForm.nickname}
                                onChange={(e) => setCreateForm((p) => ({ ...p, nickname: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="label">Plot twist / bio (optional)</label>
                              <input
                                className="field"
                                placeholder="The one people need to watch…"
                                value={createForm.plot_twist}
                                onChange={(e) => setCreateForm((p) => ({ ...p, plot_twist: e.target.value }))}
                              />
                            </div>
                            {createError && (
                              <p className="text-sm text-copper-deep font-bold">{createError}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => createMemberRow(u)}
                                disabled={!createForm.name.trim() || creating}
                                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {creating ? "Creating…" : "✓ Create Member"}
                              </button>
                              <button
                                onClick={() => { setCreatingFor(null); setCreateError(null); }}
                                className="btn btn-ghost btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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

            {/* Terms status (admin view) */}
            {isAdmin && termsMap[selected.id] && (
              <div className="mt-4 bg-desert-night/5 rounded-xl p-4">
                <p className="label">Terms Status</p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-desert-night">Quick Room Rules</span>
                    <span className={`chip !text-[10px] ${termsMap[selected.id].quickTerms ? "chip-approved" : "chip-yellow"}`}>
                      {termsMap[selected.id].quickTerms ? `✓ ${termsMap[selected.id].quickTermsVersion}` : "Not accepted"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-desert-night">Creator Release</span>
                    <span className={`chip !text-[10px] ${termsMap[selected.id].creatorRelease ? "chip-approved" : "chip-yellow"}`}>
                      {termsMap[selected.id].creatorRelease ? "✓ Signed" : "Not signed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-desert-night">Clip Uploads</span>
                    <span className={`chip !text-[10px] ${termsMap[selected.id].creatorRelease ? "chip-approved" : "chip-yellow"}`}>
                      {termsMap[selected.id].creatorRelease ? "Unlocked" : "🔒 Locked"}
                    </span>
                  </div>
                </div>
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

/**
 * Format an ISO timestamp as a short relative-ish string.
 * - Within 24h: "Today, 3:45 PM"
 * - Within 7 days: "3 days ago"
 * - Otherwise: "Mar 15, 2026"
 */
function formatLoginTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = diffMs / 60000;
  const diffHr = diffMin / 60;
  const diffDay = diffHr / 24;

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${Math.floor(diffMin)}m ago`;
  if (diffHr < 24 && d.getDate() === now.getDate()) {
    return `Today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  if (diffDay < 7) {
    const days = Math.floor(diffDay);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
