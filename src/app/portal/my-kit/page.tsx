"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getMemberCard, getMemberGear } from "@/lib/crew-data";
import type { Database, GearStatus } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];
type Gear = Database["public"]["Tables"]["gear"]["Row"];
type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];
type Approval = Database["public"]["Tables"]["approvals"]["Row"];
type Assignment = Database["public"]["Tables"]["content_assignments"]["Row"];

const GEAR_STATUS_LABELS: Record<GearStatus, string> = {
  not_started: "Not started",
  needs_name_check: "Needs name check",
  mockup_ready: "Mockup ready",
  approved: "Approved",
  ordered: "Ordered",
  delivered: "Delivered",
  hold: "Hold",
};

const GEAR_STATUS_CHIP: Record<GearStatus, string> = {
  not_started: "chip-cream",
  needs_name_check: "chip-yellow",
  mockup_ready: "chip-copper",
  approved: "chip-approved",
  ordered: "chip-teal",
  delivered: "chip-dark",
  hold: "chip-hold",
};

const CAMERA_COMFORT_OPTIONS = ["Yes", "Maybe", "Behind-the-scenes"];

const COMFORT_LEVELS = [
  { value: "Low-Key", desc: "Involved, but don't make me the main focus without asking" },
  { value: "Comfortable", desc: "Okay being in regular group clips after approval" },
  { value: "Spotlight Okay", desc: "Okay being featured more directly if I approve the clip" },
  { value: "Behind the Scenes", desc: "I want to help, but don't post me much or at all" },
  { value: "Ask Every Time", desc: "Clip-by-clip approval before anything with me goes public" },
];

const SHARE_COMFORTS = [
  { value: "Main page only", desc: "Okay on AZ Off Script page, but don't ask me to share it" },
  { value: "Okay to share", desc: "I'm okay sharing/reposting clips I approve" },
  { value: "Ask before tagging/sharing", desc: "Ask me before tagging me or asking me to repost" },
  { value: "Do not tag me", desc: "I can appear if approved, but don't tag my socials" },
  { value: "Do not post me", desc: "I'm behind the scenes only" },
];

const DO_NOT_USE_FOR_OPTIONS = [
  { value: "silly", label: "Silly/goofy clips" },
  { value: "reaction_memes", label: "Reaction memes" },
  { value: "relationship", label: "Relationship topics" },
  { value: "drama", label: "Drama/debate topics" },
  { value: "beauty_body", label: "Beauty/body/appearance jokes" },
  { value: "parenting", label: "Parenting/kids topics" },
  { value: "sponsored", label: "Sponsored content" },
  { value: "main_focus", label: "Anything where I'm the main focus" },
  { value: "tagging", label: "Tagging my social page" },
];

export default function MyWaveKitPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState<Member | null>(null);
  const [gear, setGear] = useState<Gear[]>([]);
  const [myClips, setMyClips] = useState<ClipMeta[]>([]);
  const [myApprovals, setMyApprovals] = useState<Approval[]>([]);
  const [assignedClips, setAssignedClips] = useState<ClipMeta[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [assignmentClips, setAssignmentClips] = useState<Record<string, ClipMeta>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simple settings state
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [plotTwist, setPlotTwist] = useState("");
  const [availability, setAvailability] = useState("");
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [mailingAddress, setMailingAddress] = useState("");
  const [canTag, setCanTag] = useState<boolean | null>(null);
  const [cameraComfort, setCameraComfort] = useState("");
  const [comfortLevel, setComfortLevel] = useState("Ask Every Time");
  const [shareComfort, setShareComfort] = useState("Ask before tagging/sharing");
  const [doNotUseFor, setDoNotUseFor] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!member) return;
    const [profileRes, gearRes, clipsRes, approvalsRes, assignedRes, asgnRes] = await Promise.all([
      supabase.from("members").select("*").eq("id", member.id).single(),
      supabase.from("gear").select("*").eq("member_id", member.id).order("item_type"),
      supabase.from("clips_with_meta").select("*").eq("submitted_by", member.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("approvals").select("*").eq("member_id", member.id).order("created_at", { ascending: false }),
      supabase.from("clips_with_meta").select("*").order("created_at", { ascending: false }),
      supabase.from("content_assignments").select("*").eq("member_id", member.id).order("drop_by_date", { ascending: true }),
    ]);

    setProfile(profileRes.data);
    setGear(gearRes.data ?? []);
    setMyClips(clipsRes.data ?? []);
    setMyApprovals((approvalsRes.data ?? []).filter((a) => a.status === "Waiting" || a.status === "Needs Review"));

    // Assigned clips = clips where this member is in clip_people
    const allClips = assignedRes.data ?? [];
    if (allClips.length > 0) {
      const clipIds = allClips.map((c) => c.id);
      const { data: myPeople } = await supabase.from("clip_people").select("clip_id").eq("member_id", member.id);
      const myClipIds = new Set((myPeople ?? []).map((p) => p.clip_id));
      setAssignedClips(allClips.filter((c) => myClipIds.has(c.id)));
    }

    // My assignments ("Your Part")
    const activeAssignments = (asgnRes.data ?? []).filter((a) => a.status !== "Done" && a.status !== "Skipped" && a.status !== "Greenlit");
    setMyAssignments(activeAssignments);
    const clipMap: Record<string, ClipMeta> = {};
    allClips.forEach((c) => { clipMap[c.id] = c; });
    setAssignmentClips(clipMap);

    if (profileRes.data) {
      const d = profileRes.data;
      setName(d.name ?? "");
      setNickname(d.nickname ?? "");
      setPlotTwist(d.plot_twist ?? "");
      setAvailability(d.availability ?? "");
      setSocials(d.socials ?? {});
      setMailingAddress(d.mailing_address ?? "");
      // Parse can_tag from comfort_tags or a dedicated approach — using comfort_tags for now
      setCanTag(d.comfort_tags?.includes("No tag") ? false : true);
      setCameraComfort(d.design_edition ?? "");
      setComfortLevel(d.comfort_level ?? "Ask Every Time");
      setShareComfort(d.share_comfort ?? "Ask before tagging/sharing");
      setDoNotUseFor(d.do_not_use_for ?? []);
    }
  }, [member, supabase]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!member) return;
    setSaving(true);
    const { error } = await supabase.from("members").update({
      name, nickname: nickname || null, plot_twist: plotTwist || null,
      design_edition: cameraComfort || null,
      availability: availability || null, socials,
      mailing_address: mailingAddress || null,
      comfort_level: comfortLevel,
      share_comfort: shareComfort,
      do_not_use_for: doNotUseFor,
      kit_acknowledged: true,
    }).eq("id", member.id);
    if (!error) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
      load();
    } else {
      alert(error.message);
    }
    setSaving(false);
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <p className="font-display text-xl text-desert-night">Loading your kit…</p>
      </div>
    );
  }

  const firstName = profile.name?.split(" ")[0] ?? "Crew";
  const title = profile.nickname ?? "First Wave Member";
  const tags = profile.favorite_content ?? [];
  const cardImg = getMemberCard(profile.name);
  const gearImg = getMemberGear(profile.name);

  // Upcoming deadlines from assigned clips
  const upcomingDeadlines = assignedClips
    .filter((c) => c.status !== "Live" && c.status !== "Vault")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ===== WELCOME ===== */}
      <section className="bg-desert-night p-6 md:p-8 rounded-2xl">
        <p className="text-sandstone-cream/70 text-sm font-bold uppercase tracking-wide">Welcome, {firstName}.</p>
        <h1 className="font-display text-3xl md:text-4xl text-sandstone-cream mt-1">
          You&apos;re part of the First Wave.
        </h1>
        <Link href="/portal/my-kit/public-card" className="inline-flex items-center gap-2 mt-4 bg-copper-clay/20 hover:bg-copper-clay/30 text-sandstone-cream rounded-xl px-4 py-2 text-sm font-bold transition">
          <span>My Public Card</span>
          <span className="text-sandstone-cream/60">→</span>
        </Link>
      </section>

      {saved && (
        <div className="card p-4 bg-cactus-teal/15 border-2 border-cactus-teal animate-slide-in">
          <p className="font-bold text-cactus-teal">Kit saved. You&apos;re all set.</p>
        </div>
      )}

      {/* ===== FIRST WAVE CARD ===== */}
      <div className="card p-6 ticket-stub">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-copper-clay/20 flex items-center justify-center shrink-0 overflow-hidden">
            {profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-copper-clay">
                {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-3xl text-desert-night leading-none">{profile.name}</h2>
            <p className="text-cactus-teal font-bold mt-1 text-lg">{title}</p>
            {profile.plot_twist && (
              <p className="font-script text-lg text-desert-night/70 mt-1">&ldquo;{profile.plot_twist}&rdquo;</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.first_wave && <span className="chip chip-copper">First Wave</span>}
              {profile.role === "admin" && <span className="chip chip-yellow">Admin</span>}
              {tags.map((t) => <span key={t} className="chip chip-teal !text-[10px]">{t}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MEMBER CARD + GEAR IMAGES SIDE BY SIDE ===== */}
      {(cardImg || gearImg) && (
        <div className="flex gap-4 justify-center">
          {cardImg && (
            <div className="card overflow-hidden w-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardImg} alt={`${profile.name} member card`} className="w-full" />
            </div>
          )}
          {gearImg && (
            <div className="card overflow-hidden w-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gearImg} alt={`${profile.name} gear`} className="w-full" />
            </div>
          )}
        </div>
      )}

      {/* ===== YOUR GEAR ===== */}
      <section>
        <h2 className="font-display text-2xl text-desert-night mb-3">Your Gear</h2>
        {gear.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-smoked-charcoal/70">Your gear hasn&apos;t been set up yet. Vanessa will add your items soon.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gear.map((g) => (
              <div key={g.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-desert-night capitalize">
                    {g.personalized_name ? `${g.personalized_name} ` : ""}{g.item_type.replace("_", " ")}
                  </p>
                  {g.title_edition && <p className="text-xs text-cactus-teal font-bold">{g.title_edition}</p>}
                  {g.notes && <p className="text-xs text-smoked-charcoal/60 mt-1">{g.notes}</p>}
                </div>
                <span className={`chip ${GEAR_STATUS_CHIP[g.status]} !text-[10px] shrink-0`}>
                  {GEAR_STATUS_LABELS[g.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== YOUR PART ===== */}
      <section>
        <h2 className="font-display text-2xl text-desert-night mb-3">Your Part</h2>
        {myAssignments.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-smoked-charcoal/70">Nothing on your plate right now. You&apos;re clear.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myAssignments.map((a) => {
              const clip = assignmentClips[a.clip_id];
              const now = new Date();
              const isLate = a.drop_by_date && new Date(a.drop_by_date) < now;
              return (
                <Link key={a.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-desert-night truncate">{clip?.title ?? "Content item"}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="chip chip-dark !text-[9px]">{a.role}</span>
                        <span className="chip chip-cream !text-[9px]">{a.task_type}</span>
                        {!a.is_required && <span className="chip chip-cream !text-[9px]">Optional</span>}
                      </div>
                      {a.task_title && <p className="text-sm text-desert-night mt-2">{a.task_title}</p>}
                      {a.task_notes && <p className="text-xs text-smoked-charcoal/60 mt-1">{a.task_notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {a.drop_by_date && (
                        <span className={`text-xs font-bold ${isLate ? "text-heat-orange" : "text-copper-deep"}`}>
                          {isLate ? "⚠ Late — " : ""}Drop-by {new Date(a.drop_by_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      )}
                      <span className="chip chip-cream !text-[9px]">{a.status}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== YOUR WEEKLY HEAT ===== */}
      <section>
        <h2 className="font-display text-2xl text-desert-night mb-3">Your Weekly Heat</h2>
        {upcomingDeadlines.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-smoked-charcoal/70">Nothing due right now. You&apos;re clear.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingDeadlines.map((clip) => (
              <Link key={clip.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-desert-night leading-tight">{clip.title}</p>
                  <span className="chip chip-cream !text-[10px] shrink-0">{clip.status}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                  {clip.clip_due_date && (
                    <span className="text-copper-deep font-bold">
                      Send your clip by: {new Date(clip.clip_due_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  )}
                  {clip.final_cut_due && (
                    <span className="text-copper-clay font-bold">
                      Send your final by: {new Date(clip.final_cut_due).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  )}
                  {clip.approval_due && (
                    <span className="text-heat-orange font-bold">
                      Greenlight by: {new Date(clip.approval_due).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  )}
                  {clip.scheduled_date && (
                    <span className="text-cactus-teal font-bold">
                      Goes live: {new Date(clip.scheduled_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                {clip.destination && (
                  <p className="text-xs text-desert-night/50 mt-1">For: {clip.destination}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== YOUR DROPS ===== */}
      <section>
        <h2 className="font-display text-2xl text-desert-night mb-3">Your Drops</h2>
        {myClips.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-smoked-charcoal/70">No clips dropped yet.</p>
            <Link href="/portal/drop" className="btn btn-primary mt-3">Drop something</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myClips.map((clip) => (
              <Link key={clip.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-desert-night leading-tight">{clip.title}</p>
                  <span className={`chip ${clip.type === "tiktok_link" ? "chip-cream" : "chip-teal"} !text-[10px] shrink-0`}>
                    {clip.type === "tiktok_link" ? "Link" : clip.type === "idea" ? "Idea" : clip.type === "video" ? "Video" : clip.type}
                  </span>
                </div>
                <p className="text-xs text-smoked-charcoal/60 mt-1">
                  {clip.status} · {new Date(clip.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== YOUR APPROVALS ===== */}
      <section>
        <h2 className="font-display text-2xl text-desert-night mb-3">Your Approvals</h2>
        {myApprovals.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-smoked-charcoal/70">Nothing waiting on you right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myApprovals.map((app) => {
              const clip = assignedClips.find((c) => c.id === app.clip_id) ?? myClips.find((c) => c.id === app.clip_id);
              return (
                <Link key={app.id} href="/portal/run-sheet" className="card p-4 block hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-desert-night">{clip?.title ?? "A clip needs your greenlight"}</p>
                    <span className="chip chip-waiting !text-[10px] shrink-0">{app.status}</span>
                  </div>
                  {clip?.approval_due && (
                    <p className="text-xs text-heat-orange font-bold mt-1">
                      Greenlight by: {new Date(clip.approval_due).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== QUICK SETTINGS ===== */}
      {!editing ? (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Quick Settings</h2>
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="label">Can we tag your social handle?</span>
              <span className="font-bold text-desert-night">{canTag === false ? "No" : "Yes"}</span>
            </div>
            {socials && Object.keys(socials).length > 0 && (
              <div className="flex justify-between items-center">
                <span className="label">Best social handle</span>
                <span className="font-bold text-desert-night">
                  {Object.entries(socials).filter(([, h]) => h).map(([p, h]) => `${p}: ${h}`).join(", ") || "Not set"}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="label">Camera comfort</span>
              <span className="font-bold text-desert-night">{cameraComfort || "Not set"}</span>
            </div>
            {availability && (
              <div className="flex justify-between items-center">
                <span className="label">Best days/times</span>
                <span className="font-bold text-desert-night text-right">{availability}</span>
              </div>
            )}
            {mailingAddress && (
              <div>
                <span className="label">Mailing Address <span className="text-xs text-cactus-teal normal-case">🔒 private</span></span>
                <p className="text-desert-night mt-1 whitespace-pre-line text-sm">{mailingAddress}</p>
              </div>
            )}
            <div className="pt-3 border-t border-desert-night/10">
              <span className="label">Content Comfort</span>
              <p className="font-bold text-desert-night">{profile.comfort_level ?? "Ask Every Time"}</p>
            </div>
            <div>
              <span className="label">Share Comfort</span>
              <p className="font-bold text-desert-night">{profile.share_comfort ?? "Ask before tagging/sharing"}</p>
            </div>
            {doNotUseFor.length > 0 && (
              <div>
                <span className="label">Please don&apos;t use me for</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {doNotUseFor.map((d) => (
                    <span key={d} className="chip chip-copper !text-[10px]">
                      {DO_NOT_USE_FOR_OPTIONS.find((o) => o.value === d)?.label ?? d}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setEditing(true)} className="btn btn-secondary w-full mt-2">Edit Settings</button>
          </div>
        </section>
      ) : (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Edit Settings</h2>
          <div className="card p-6 space-y-5 animate-slide-in">
            <div>
              <label className="label" htmlFor="kit-name">Name</label>
              <input id="kit-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="kit-nickname">Your Title</label>
              <input id="kit-nickname" className="field" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. The Real One" />
            </div>
            <div>
              <label className="label" htmlFor="kit-twist">One-liner (optional)</label>
              <input id="kit-twist" className="field" value={plotTwist} onChange={(e) => setPlotTwist(e.target.value)} placeholder="One line that describes you" maxLength={120} />
            </div>
            <div>
              <label className="label">Can we tag your social handle?</label>
              <div className="flex gap-2">
                <button onClick={() => setCanTag(true)} className={`chip ${canTag === true ? "chip-approved" : "chip-cream"}`}>Yes</button>
                <button onClick={() => setCanTag(false)} className={`chip ${canTag === false ? "chip-danger" : "chip-cream"}`}>No</button>
              </div>
            </div>
            <div>
              <label className="label">Best social handle</label>
              <div className="grid grid-cols-2 gap-3">
                {["tiktok", "instagram", "youtube", "twitter"].map((p) => (
                  <input key={p} className="field" placeholder={`${p} handle`} value={socials[p] ?? ""} onChange={(e) => setSocials({ ...socials, [p]: e.target.value })} />
                ))}
              </div>
            </div>
            <div>
              <label className="label">Camera comfort</label>
              <div className="flex gap-2">
                {CAMERA_COMFORT_OPTIONS.map((opt) => (
                  <button key={opt} onClick={() => setCameraComfort(opt)} className={`chip ${cameraComfort === opt ? "chip-copper" : "chip-cream"}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="kit-avail">Best days/times</label>
              <input id="kit-avail" className="field" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Weekdays after 5, weekends free" />
            </div>
            <div>
              <label className="label" htmlFor="kit-address">Mailing Address <span className="text-xs text-cactus-teal font-bold normal-case">🔒 private</span></label>
              <textarea id="kit-address" className="field min-h-[80px]" value={mailingAddress} onChange={(e) => setMailingAddress(e.target.value)} placeholder="Where should we send merch?&#10;Street, City, State, Zip" />
            </div>

            {/* ===== COMFORT + RESPECT ===== */}
            <div className="pt-4 border-t border-desert-night/10">
              <h3 className="font-display text-lg text-desert-night mb-1">Comfort + Respect</h3>
              <p className="text-xs text-smoked-charcoal/60 mb-4">You control how you&apos;re shown. Defaults to &ldquo;Ask Every Time&rdquo; until you change it.</p>
            </div>
            <div>
              <label className="label">Content Comfort Level</label>
              <div className="space-y-2">
                {COMFORT_LEVELS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setComfortLevel(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${comfortLevel === opt.value ? "border-copper-clay bg-copper-clay/10" : "border-desert-night/10 hover:border-desert-night/20"}`}
                  >
                    <p className="font-bold text-desert-night text-sm">{opt.value}</p>
                    <p className="text-xs text-smoked-charcoal/60">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Share Comfort</label>
              <div className="space-y-2">
                {SHARE_COMFORTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setShareComfort(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${shareComfort === opt.value ? "border-cactus-teal bg-cactus-teal/10" : "border-desert-night/10 hover:border-desert-night/20"}`}
                  >
                    <p className="font-bold text-desert-night text-sm">{opt.value}</p>
                    <p className="text-xs text-smoked-charcoal/60">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Please don&apos;t use me for</label>
              <p className="text-xs text-smoked-charcoal/60 mb-2">Check anything you don&apos;t want to be part of. Leave blank if you&apos;re open.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DO_NOT_USE_FOR_OPTIONS.map((opt) => {
                  const checked = doNotUseFor.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDoNotUseFor(checked ? doNotUseFor.filter((v) => v !== opt.value) : [...doNotUseFor, opt.value])}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-colors ${checked ? "border-copper-deep bg-copper-deep/10" : "border-desert-night/10"}`}
                    >
                      <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "bg-copper-deep border-copper-deep text-white" : "border-desert-night/20"}`}>
                        {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span className="text-sm text-desert-night">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={save} className="btn btn-primary flex-1" disabled={saving}>
                {saving ? "Saving…" : "Save My Kit"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Default rule note */}
      <p className="text-xs text-desert-night/40 text-center pb-4">
        No kids are posted unless Vanessa separately approves and gets clear permission.
      </p>
    </div>
  );
}
