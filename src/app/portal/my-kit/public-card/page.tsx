"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { InfoTooltip } from "@/components/InfoTooltip";
import { DropdownOrOther } from "@/components/DropdownOrOther";
import {
  PUBLIC_TITLE_OPTIONS,
  SECONDARY_ROLE_OPTIONS,
  PERSONALITY_LINE_OPTIONS,
  WEBSITE_BIO_OPTIONS,
} from "@/lib/profile-options";
// These are re-exported with expanded lists from profile-options
import type { Database, TagPreference, ProfileVisibility, PhotoPermissionStatus } from "@/lib/types/db";

type ApprovedProfile = Database["public"]["Tables"]["approved_public_profile"]["Row"];
type ChangeRequest = Database["public"]["Tables"]["profile_change_requests"]["Row"];

const TAG_OPTIONS: { value: TagPreference; label: string }[] = [
  { value: "yes", label: "Yes — tag me" },
  { value: "no", label: "No — don't tag me" },
  { value: "ask_every_time", label: "Ask every time" },
];

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: "public", label: "Public — show on website" },
  { value: "portal_only", label: "Portal only — crew can see, not public" },
  { value: "hidden", label: "Hidden — don't show me anywhere" },
];

const PHOTO_WARNINGS = [
  "Blurry or low resolution",
  "Kids in the background",
  "License plates or house numbers visible",
  "School logos or workplace names",
  "Unsafe location details",
  "Other people who haven't agreed to be photographed",
];

export default function MyPublicCardPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState<ApprovedProfile | null>(null);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable form state (the crew member's requested values)
  const [displayName, setDisplayName] = useState("");
  const [preferredWebsiteName, setPreferredWebsiteName] = useState("");
  const [publicTitle, setPublicTitle] = useState("");
  const [secondaryRole, setSecondaryRole] = useState("");
  const [shortLine, setShortLine] = useState("");
  const [websiteBio, setWebsiteBio] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [tagPref, setTagPref] = useState<TagPreference>("ask_every_time");
  const [visibility, setVisibility] = useState<ProfileVisibility>("public");
  const [websitePhoto, setWebsitePhoto] = useState<string | null>(null);
  const [portalAvatar, setPortalAvatar] = useState<string | null>(null);
  const [useSamePhoto, setUseSamePhoto] = useState(false);
  const [changeNote, setChangeNote] = useState("");

  const load = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    const [profRes, reqRes] = await Promise.all([
      supabase.from("approved_public_profile").select("*").eq("member_id", member.id).maybeSingle(),
      supabase.from("profile_change_requests").select("*").eq("member_id", member.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setProfile(profRes.data ?? null);
    setRequests(reqRes.data ?? []);

    if (profRes.data) {
      const p = profRes.data;
      setDisplayName(p.display_name ?? "");
      setPreferredWebsiteName(p.preferred_website_name ?? "");
      setPublicTitle(p.public_title ?? "");
      setSecondaryRole(p.secondary_role ?? "");
      setShortLine(p.short_personality_line ?? "");
      setWebsiteBio(p.website_bio ?? "");
      setSocialHandle(p.social_handle ?? "");
      setTagPref(p.tag_preference ?? "ask_every_time");
      setVisibility(p.profile_visibility ?? "public");
      setWebsitePhoto(p.website_photo_url ?? null);
      setPortalAvatar(p.portal_avatar_url ?? null);
    }
    setLoading(false);
  }, [member, supabase]);

  useEffect(() => { load(); }, [load]);

  // When "use same photo" is on, mirror website photo to portal avatar
  useEffect(() => {
    if (useSamePhoto && websitePhoto) {
      setPortalAvatar(websitePhoto);
    }
  }, [useSamePhoto, websitePhoto]);

  async function uploadPhoto(
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (url: string | null) => void,
    bucket: string
  ) {
    const file = e.target.files?.[0];
    if (!file || !member) return;
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${member.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (upErr) {
      setError(`Upload failed: ${upErr.message}`);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl);
  }

  async function saveDraft() {
    if (!member) return;
    setSaving(true);
    setError(null);
    const payload = {
      member_id: member.id,
      display_name: displayName || null,
      preferred_website_name: preferredWebsiteName || null,
      public_title: publicTitle || null,
      secondary_role: secondaryRole || null,
      short_personality_line: shortLine || null,
      website_bio: websiteBio || null,
      social_handle: socialHandle || null,
      tag_preference: tagPref,
      profile_visibility: visibility,
      website_photo_url: websitePhoto,
      portal_avatar_url: portalAvatar,
      photo_permission_status: (websitePhoto || portalAvatar) ? "Pending Review" as PhotoPermissionStatus : "Pending Upload" as PhotoPermissionStatus,
      profile_approval_status: "Draft" as const,
      requested_changes_note: changeNote || null,
    };
    const { error: insErr } = await supabase.from("approved_public_profile").upsert(payload, { onConflict: "member_id" });
    if (insErr) { setSaving(false); setError(insErr.message); return; }

    // Also save portal avatar to members.photo_url so it shows in the portal nav
    if (portalAvatar) {
      await supabase.from("members").update({ photo_url: portalAvatar }).eq("id", member.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    load();
  }

  async function submitForApproval() {
    if (!member) return;
    setSubmitting(true);
    setError(null);
    // 1. Save the draft to approved_public_profile
    const payload = {
      member_id: member.id,
      display_name: displayName || null,
      preferred_website_name: preferredWebsiteName || null,
      public_title: publicTitle || null,
      secondary_role: secondaryRole || null,
      short_personality_line: shortLine || null,
      website_bio: websiteBio || null,
      social_handle: socialHandle || null,
      tag_preference: tagPref,
      profile_visibility: visibility,
      website_photo_url: websitePhoto,
      portal_avatar_url: portalAvatar,
      photo_permission_status: (websitePhoto || portalAvatar) ? "Pending Review" as PhotoPermissionStatus : "Pending Upload" as PhotoPermissionStatus,
      profile_approval_status: "Submitted" as const,
      requested_changes_note: changeNote || null,
    };
    const { error: profErr } = await supabase.from("approved_public_profile").upsert(payload, { onConflict: "member_id" });
    if (profErr) { setSubmitting(false); setError(profErr.message); return; }

    // 2. Create a snapshot in profile_change_requests
    const { error: reqErr } = await supabase.from("profile_change_requests").insert({
      member_id: member.id,
      display_name: displayName || null,
      preferred_website_name: preferredWebsiteName || null,
      public_title: publicTitle || null,
      secondary_role: secondaryRole || null,
      short_personality_line: shortLine || null,
      website_bio: websiteBio || null,
      social_handle: socialHandle || null,
      tag_preference: tagPref,
      profile_visibility: visibility,
      portal_avatar_url: portalAvatar,
      website_photo_url: websitePhoto,
      requested_changes_note: changeNote || null,
      status: "Submitted",
    });
    setSubmitting(false);
    if (reqErr) { setError(reqErr.message); return; }

    // Also save portal avatar to members.photo_url so it shows in the portal nav
    if (portalAvatar) {
      await supabase.from("members").update({ photo_url: portalAvatar }).eq("id", member.id);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    load();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <p className="font-display text-xl text-desert-night">Loading your public card…</p>
      </div>
    );
  }

  const status = profile?.profile_approval_status ?? "Draft";
  const photoStatus = profile?.photo_permission_status ?? "Pending Upload";
  const pendingRequest = requests.find((r) => r.status === "Submitted" || r.status === "Needs Review");

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/portal/my-kit" className="btn btn-ghost btn-sm">← Back to My Kit</Link>

      {/* Header */}
      <section className="bg-desert-night p-6 md:p-8 rounded-2xl">
        <p className="text-sandstone-cream/70 text-sm font-bold uppercase tracking-wide">My Kit</p>
        <h1 className="font-display text-3xl md:text-4xl text-sandstone-cream mt-1">My Public Card</h1>
        <div className="mt-1"><InfoTooltip dark text="This is how you show up on the public website (azoffscript.com). Edit your display name, title, bio, photo, and social links. When you submit changes, they get reviewed before going live. You can also control whether your card is visible at all." /></div>
        <p className="text-sandstone-cream/60 text-sm mt-2 max-w-xl">
          This is how you show up on the website, portal, and member cards.
          You can request changes — they get reviewed before anything public changes.
        </p>
      </section>

      {saved && (
        <div className="card p-4 bg-cactus-teal/15 border-2 border-cactus-teal animate-slide-in">
          <p className="font-bold text-cactus-teal">Saved. Your request was submitted for review.</p>
        </div>
      )}
      {error && (
        <div className="card p-4 bg-red-50 border-2 border-red-300">
          <p className="font-bold text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Status banner */}
      <section className="card p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-smoked-charcoal/50 uppercase tracking-wide">Approval status</p>
          <p className="font-display text-lg text-desert-night">{status}</p>
          {pendingRequest && (
            <p className="text-xs text-smoked-charcoal/60 mt-0.5">
              Submitted {new Date(pendingRequest.created_at).toLocaleDateString()} — waiting for review.
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-smoked-charcoal/50 uppercase tracking-wide">Photo status</p>
          <p className="font-display text-sm text-desert-night">{photoStatus}</p>
        </div>
      </section>

      {/* Currently approved (read-only preview) */}
      {profile && (profile.public_title || profile.short_personality_line) && (
        <section className="card p-5 bg-sandstone-cream/40">
          <p className="text-xs text-smoked-charcoal/50 uppercase tracking-wide mb-2">Currently approved (public)</p>
          <p className="font-display text-2xl text-desert-night">{profile.display_name ?? member?.name}</p>
          {profile.public_title && <p className="text-copper-deep font-bold">{profile.public_title}</p>}
          {profile.secondary_role && <p className="text-sm text-smoked-charcoal/70">{profile.secondary_role}</p>}
          {profile.short_personality_line && <p className="text-sm text-smoked-charcoal mt-2 italic">"{profile.short_personality_line}"</p>}
        </section>
      )}

      {/* Editable form */}
      <section className="card p-6 space-y-5">
        <h2 className="font-display text-2xl text-desert-night">Request changes</h2>
        <p className="text-sm text-smoked-charcoal/60">
          Edit any field below, then click <strong>Submit for Review</strong>. Nothing public changes until it's approved.
        </p>

        {/* Names */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="label">Display name</p>
            <input className="field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How you want to be called" />
          </div>
          <div>
            <p className="label">Preferred website name</p>
            <input className="field" value={preferredWebsiteName} onChange={(e) => setPreferredWebsiteName(e.target.value)} placeholder="Name for the website" />
          </div>
          <div>
            <p className="label">Social handle / tag</p>
            <input className="field" value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
        </div>

        {/* Titles */}
        <div className="grid md:grid-cols-2 gap-4">
          <DropdownOrOther
            label="Public role / title"
            value={publicTitle}
            onChange={setPublicTitle}
            options={PUBLIC_TITLE_OPTIONS}
            placeholder="e.g. The Sweet Touch"
          />
          <DropdownOrOther
            label="Secondary role"
            value={secondaryRole}
            onChange={setSecondaryRole}
            options={SECONDARY_ROLE_OPTIONS}
            placeholder="e.g. First Wave Creator"
          />
        </div>

        {/* Personality + bio */}
        <DropdownOrOther
          label="Short personality line"
          value={shortLine}
          onChange={setShortLine}
          options={PERSONALITY_LINE_OPTIONS}
          placeholder="One sentence — used on cards and short bios"
        />
        <DropdownOrOther
          label="Website bio (longer)"
          value={websiteBio}
          onChange={setWebsiteBio}
          options={WEBSITE_BIO_OPTIONS}
          placeholder="2-4 sentences for the website crew page"
          textarea
        />

        {/* Preferences */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="label">Tag me?</p>
            <select className="field" value={tagPref} onChange={(e) => setTagPref(e.target.value as TagPreference)}>
              {TAG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <p className="label">Profile visibility</p>
            <select className="field" value={visibility} onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}>
              {VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Photos */}
        <div className="border-t border-copper-clay/20 pt-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display text-lg text-desert-night">Photos</h3>
            <label className="flex items-center gap-2 text-sm text-smoked-charcoal">
              <input type="checkbox" checked={useSamePhoto} onChange={(e) => setUseSamePhoto(e.target.checked)} />
              Use the same photo for both
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Website photo */}
            <PhotoUpload
              label="Website photo"
              url={websitePhoto}
              onUpload={(e) => uploadPhoto(e, useSamePhoto ? (u) => { setWebsitePhoto(u); setPortalAvatar(u); } : setWebsitePhoto, "crew-photos")}
              onClear={() => { setWebsitePhoto(null); if (useSamePhoto) { setPortalAvatar(null); } }}
            />
            {/* Portal avatar */}
            <PhotoUpload
              label="Portal avatar"
              url={portalAvatar}
              onUpload={(e) => uploadPhoto(e, setPortalAvatar, "crew-photos")}
              onClear={() => setPortalAvatar(null)}
              disabled={useSamePhoto}
            />
          </div>

          {/* Photo warnings */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3">
            <p className="text-xs font-bold text-yellow-800 mb-1">Before you upload — check for:</p>
            <ul className="text-xs text-yellow-800/80 space-y-0.5">
              {PHOTO_WARNINGS.map((w) => <li key={w}>• {w}</li>)}
            </ul>
            <p className="text-[10px] text-yellow-800/60 mt-2">
              Every photo is reviewed before it goes live. It may be approved for the website, portal only, or you may be asked for a new one.
            </p>
          </div>
        </div>

        {/* Change note */}
        <div>
          <p className="label">Note (optional)</p>
          <textarea className="field min-h-[60px]" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Anything you want us to know about this request" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap pt-2 border-t border-copper-clay/20">
          <button onClick={saveDraft} disabled={saving} className="btn btn-ghost">
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button onClick={submitForApproval} disabled={submitting} className="btn btn-primary">
            {submitting ? "Submitting…" : "Submit for Review"}
          </button>
        </div>
      </section>

      {/* Request history */}
      {requests.length > 0 && (
        <section className="card p-5">
          <h2 className="font-display text-xl text-desert-night mb-3">Your request history</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="bg-sandstone-cream/40 rounded-xl p-3 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-desert-night">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.requested_changes_note && (
                    <p className="text-xs text-smoked-charcoal/60 mt-0.5">"{r.requested_changes_note}"</p>
                  )}
                  {r.admin_review_note && (
                    <p className="text-xs text-copper-deep mt-1">Review note: "{r.admin_review_note}"</p>
                  )}
                </div>
                <span className={`chip !text-[10px] ${
                  r.status === "Approved" ? "chip-approved" :
                  r.status === "Rejected" ? "chip-hold" :
                  r.status === "Submitted" ? "chip-yellow" :
                  "chip-cream"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// PhotoUpload — small reusable photo uploader with preview
// ---------------------------------------------------------------------------
function PhotoUpload({
  label,
  url,
  onUpload,
  onClear,
  disabled,
}: {
  label: string;
  url: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <p className="label">{label}</p>
      <div className="relative bg-sandstone-cream/40 rounded-xl border-2 border-copper-clay/20 overflow-hidden aspect-square flex items-center justify-center">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-smoked-charcoal/30 text-xs text-center px-2">No photo yet</span>
        )}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        <label className={`btn btn-ghost btn-sm !text-xs flex-1 text-center ${disabled ? "pointer-events-none" : ""}`}>
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={disabled} />
        </label>
        {url && !disabled && (
          <button onClick={onClear} className="btn btn-ghost btn-sm !text-xs">Clear</button>
        )}
      </div>
    </div>
  );
}
