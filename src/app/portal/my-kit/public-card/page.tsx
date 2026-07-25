"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
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
  const [preferredEmailName, setPreferredEmailName] = useState("");
  const [publicTitle, setPublicTitle] = useState("");
  const [secondaryRole, setSecondaryRole] = useState("");
  const [shortLine, setShortLine] = useState("");
  const [websiteBio, setWebsiteBio] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [tagPref, setTagPref] = useState<TagPreference>("ask_every_time");
  const [visibility, setVisibility] = useState<ProfileVisibility>("public");
  const [websitePhoto, setWebsitePhoto] = useState<string | null>(null);
  const [portalAvatar, setPortalAvatar] = useState<string | null>(null);
  const [emailSigPhoto, setEmailSigPhoto] = useState<string | null>(null);
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
      setPreferredEmailName(p.preferred_email_signature_name ?? "");
      setPublicTitle(p.public_title ?? "");
      setSecondaryRole(p.secondary_role ?? "");
      setShortLine(p.short_personality_line ?? "");
      setWebsiteBio(p.website_bio ?? "");
      setSocialHandle(p.social_handle ?? "");
      setTagPref(p.tag_preference ?? "ask_every_time");
      setVisibility(p.profile_visibility ?? "public");
      setWebsitePhoto(p.website_photo_url ?? null);
      setPortalAvatar(p.portal_avatar_url ?? null);
      setEmailSigPhoto(p.email_signature_photo_url ?? null);
    }
    setLoading(false);
  }, [member, supabase]);

  useEffect(() => { load(); }, [load]);

  // When "use same photo" is on, mirror website photo to all three
  useEffect(() => {
    if (useSamePhoto && websitePhoto) {
      setPortalAvatar(websitePhoto);
      setEmailSigPhoto(websitePhoto);
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
      preferred_email_signature_name: preferredEmailName || null,
      public_title: publicTitle || null,
      secondary_role: secondaryRole || null,
      short_personality_line: shortLine || null,
      website_bio: websiteBio || null,
      social_handle: socialHandle || null,
      tag_preference: tagPref,
      profile_visibility: visibility,
      website_photo_url: websitePhoto,
      portal_avatar_url: portalAvatar,
      email_signature_photo_url: emailSigPhoto,
      photo_permission_status: (websitePhoto || portalAvatar || emailSigPhoto) ? "Pending Review" as PhotoPermissionStatus : "Pending Upload" as PhotoPermissionStatus,
      profile_approval_status: "Draft" as const,
      requested_changes_note: changeNote || null,
    };
    const { error: insErr } = await supabase.from("approved_public_profile").upsert(payload, { onConflict: "member_id" });
    setSaving(false);
    if (insErr) { setError(insErr.message); return; }
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
      preferred_email_signature_name: preferredEmailName || null,
      public_title: publicTitle || null,
      secondary_role: secondaryRole || null,
      short_personality_line: shortLine || null,
      website_bio: websiteBio || null,
      social_handle: socialHandle || null,
      tag_preference: tagPref,
      profile_visibility: visibility,
      website_photo_url: websitePhoto,
      portal_avatar_url: portalAvatar,
      email_signature_photo_url: emailSigPhoto,
      photo_permission_status: (websitePhoto || portalAvatar || emailSigPhoto) ? "Pending Review" as PhotoPermissionStatus : "Pending Upload" as PhotoPermissionStatus,
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
      preferred_email_signature_name: preferredEmailName || null,
      public_title: publicTitle || null,
      secondary_role: secondaryRole || null,
      short_personality_line: shortLine || null,
      website_bio: websiteBio || null,
      social_handle: socialHandle || null,
      tag_preference: tagPref,
      profile_visibility: visibility,
      portal_avatar_url: portalAvatar,
      website_photo_url: websitePhoto,
      email_signature_photo_url: emailSigPhoto,
      requested_changes_note: changeNote || null,
      status: "Submitted",
    });
    setSubmitting(false);
    if (reqErr) { setError(reqErr.message); return; }
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
        <p className="text-sandstone-cream/60 text-sm mt-2 max-w-xl">
          This is how you show up on the website, portal, member cards, and email signatures.
          You can request changes — Vanessa approves before anything public changes.
        </p>
      </section>

      {saved && (
        <div className="card p-4 bg-cactus-teal/15 border-2 border-cactus-teal animate-slide-in">
          <p className="font-bold text-cactus-teal">Saved. Your request was sent to Vanessa for review.</p>
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
              Submitted {new Date(pendingRequest.created_at).toLocaleDateString()} — waiting for Vanessa to review.
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
          Edit any field below, then click <strong>Submit for Vanessa Approval</strong>. Nothing public changes until she approves.
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
            <p className="label">Preferred email signature name</p>
            <input className="field" value={preferredEmailName} onChange={(e) => setPreferredEmailName(e.target.value)} placeholder="Name for email signatures" />
          </div>
          <div>
            <p className="label">Social handle / tag</p>
            <input className="field" value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
        </div>

        {/* Titles */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="label">Public role / title</p>
            <input className="field" value={publicTitle} onChange={(e) => setPublicTitle(e.target.value)} placeholder="e.g. The Sweet Touch" />
          </div>
          <div>
            <p className="label">Secondary role</p>
            <input className="field" value={secondaryRole} onChange={(e) => setSecondaryRole(e.target.value)} placeholder="e.g. First Wave Creator" />
          </div>
        </div>

        {/* Personality + bio */}
        <div>
          <p className="label">Short personality line</p>
          <input className="field" value={shortLine} onChange={(e) => setShortLine(e.target.value)} placeholder="One sentence — used on cards and short bios" />
        </div>
        <div>
          <p className="label">Website bio (longer)</p>
          <textarea className="field min-h-[100px]" value={websiteBio} onChange={(e) => setWebsiteBio(e.target.value)} placeholder="2-4 sentences for the website crew page" />
        </div>

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
              Use the same photo for all three
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Website photo */}
            <PhotoUpload
              label="Website photo"
              url={websitePhoto}
              onUpload={(e) => uploadPhoto(e, useSamePhoto ? (u) => { setWebsitePhoto(u); setPortalAvatar(u); setEmailSigPhoto(u); } : setWebsitePhoto, "crew-photos")}
              onClear={() => { setWebsitePhoto(null); if (useSamePhoto) { setPortalAvatar(null); setEmailSigPhoto(null); } }}
            />
            {/* Portal avatar */}
            <PhotoUpload
              label="Portal avatar"
              url={portalAvatar}
              onUpload={(e) => uploadPhoto(e, setPortalAvatar, "crew-photos")}
              onClear={() => setPortalAvatar(null)}
              disabled={useSamePhoto}
            />
            {/* Email signature photo */}
            <PhotoUpload
              label="Email signature photo"
              url={emailSigPhoto}
              onUpload={(e) => uploadPhoto(e, setEmailSigPhoto, "crew-photos")}
              onClear={() => setEmailSigPhoto(null)}
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
              Vanessa reviews every photo. She may approve it for the website, portal only, email signature only, or ask for a new one.
            </p>
          </div>
        </div>

        {/* Change note */}
        <div>
          <p className="label">Note for Vanessa (optional)</p>
          <textarea className="field min-h-[60px]" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Anything you want her to know about this request" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap pt-2 border-t border-copper-clay/20">
          <button onClick={saveDraft} disabled={saving} className="btn btn-ghost">
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button onClick={submitForApproval} disabled={submitting} className="btn btn-primary">
            {submitting ? "Submitting…" : "Submit for Vanessa Approval"}
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
                    <p className="text-xs text-copper-deep mt-1">Vanessa: "{r.admin_review_note}"</p>
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

      {/* Email signature preview */}
      <EmailSignaturePreview
        name={preferredEmailName || displayName || member?.name || ""}
        title={publicTitle || ""}
        secondaryRole={secondaryRole || ""}
        photoUrl={emailSigPhoto ?? undefined}
      />
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

// ---------------------------------------------------------------------------
// EmailSignaturePreview — branded signature with copy + download
// ---------------------------------------------------------------------------
function EmailSignaturePreview({
  name,
  title,
  secondaryRole,
  photoUrl,
}: {
  name: string;
  title: string;
  secondaryRole?: string;
  photoUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  const sigHtml = buildSignatureHtml({ name, title, secondaryRole, photoUrl });

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(sigHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard HTML support
      const ta = document.createElement("textarea");
      ta.value = sigHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadHtml() {
    const blob = new Blob([sigHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AZOffScript-signature-${name.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="card p-5 space-y-3">
      <h2 className="font-display text-xl text-desert-night">Your branded email signature</h2>
      <p className="text-sm text-smoked-charcoal/60">
        This is what your email signature will look like once approved. Copy the HTML to paste into your email client, or download it.
      </p>

      {/* Preview */}
      <div className="bg-white rounded-xl p-4 border border-copper-clay/20">
        <div dangerouslySetInnerHTML={{ __html: sigHtml }} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={copyHtml} className="btn btn-ghost btn-sm">
          {copied ? "✓ Copied!" : "Copy HTML"}
        </button>
        <button onClick={downloadHtml} className="btn btn-ghost btn-sm">
          Download HTML
        </button>
      </div>
      <p className="text-[10px] text-smoked-charcoal/40">
        Note: This is a preview based on your requested values. The final signature is locked once Vanessa approves.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// buildSignatureHtml — the branded AZ Off Script email signature
// ---------------------------------------------------------------------------
function buildSignatureHtml(opts: { name: string; title: string; secondaryRole?: string; photoUrl?: string }): string {
  const photoCell = opts.photoUrl
    ? `<td style="padding-right:16px;vertical-align:top;"><img src="${opts.photoUrl}" alt="${escapeHtml(opts.name)}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" /></td>`
    : "";
  const secondaryLine = opts.secondaryRole
    ? `<div style="color:#9a3412;font-size:12px;">${escapeHtml(opts.secondaryRole)}</div>`
    : "";
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,'Times New Roman',serif;color:#1f2937;max-width:420px;">
  <tr>
    ${photoCell}
    <td style="vertical-align:top;">
      <div style="font-size:18px;font-weight:bold;color:#7c2d12;">${escapeHtml(opts.name)}</div>
      <div style="font-size:14px;color:#c2410c;font-weight:bold;">${escapeHtml(opts.title)}</div>
      ${secondaryLine}
      <div style="font-size:13px;color:#1f2937;margin-top:4px;"><strong>AZ Off Script</strong></div>
      <div style="font-size:11px;color:#6b7280;margin-top:8px;font-style:italic;">Arizona, Our Way.<br/>The group chat got a camera.</div>
      <div style="font-size:11px;color:#6b7280;margin-top:6px;">
        <a href="https://www.tiktok.com/@azoffscript" style="color:#6b7280;text-decoration:none;">TikTok: @azoffscript</a><br/>
        <a href="https://www.instagram.com/@azoffscript" style="color:#6b7280;text-decoration:none;">Instagram: @azoffscript</a><br/>
        <a href="https://azoffscript.com" style="color:#6b7280;text-decoration:none;">Website: azoffscript.com</a>
      </div>
    </td>
  </tr>
</table>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
