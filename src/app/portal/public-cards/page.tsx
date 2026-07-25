"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Database, PhotoPermissionStatus, ProfileApprovalStatus } from "@/lib/types/db";

type ApprovedProfile = Database["public"]["Tables"]["approved_public_profile"]["Row"];
type ChangeRequest = Database["public"]["Tables"]["profile_change_requests"]["Row"];
type MemberLite = { id: string; name: string; email: string; role: string };

const PHOTO_STATUSES: PhotoPermissionStatus[] = [
  "Pending Upload",
  "Pending Review",
  "Approved for Website",
  "Approved for Portal Only",
  "Approved for Email Signature",
  "Rejected / Needs New Photo",
];

const STATUS_CHIP: Record<ProfileApprovalStatus, string> = {
  "Draft": "chip-cream",
  "Submitted": "chip-yellow",
  "Needs Review": "chip-copper",
  "Approved": "chip-approved",
  "Rejected": "chip-hold",
  "Archived": "chip-dark",
};

export default function PublicCardsAdminPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<(ApprovedProfile & { member?: MemberLite })[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<ApprovedProfile | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [photoStatus, setPhotoStatus] = useState<PhotoPermissionStatus>("Pending Review");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [profRes, reqRes, memRes] = await Promise.all([
      supabase.from("approved_public_profile").select("*").order("display_name"),
      supabase.from("profile_change_requests").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("members").select("id, name, email, role"),
    ]);
    const memMap = new Map((memRes.data ?? []).map((m) => [m.id, m]));
    setProfiles((profRes.data ?? []).map((p) => ({ ...p, member: memMap.get(p.member_id) })));
    setRequests(reqRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Non-admins can't be here
  useEffect(() => {
    if (member && member.role !== "admin") {
      window.location.href = "/portal/lobby";
    }
  }, [member]);

  async function approve(profile: ApprovedProfile) {
    if (!member) return;
    setActing(true);
    // Update the approved profile
    const { error } = await supabase.from("approved_public_profile").update({
      profile_approval_status: "Approved",
      photo_permission_status: photoStatus,
      admin_review_note: adminNote || null,
      approved_by: member.id,
      approved_at: new Date().toISOString(),
    }).eq("id", profile.id);
    if (error) { alert(error.message); setActing(false); return; }

    // Mark all Submitted requests for this member as Approved
    await supabase.from("profile_change_requests").update({
      status: "Approved",
      admin_review_note: adminNote || null,
      reviewed_by: member.id,
      reviewed_at: new Date().toISOString(),
    }).eq("member_id", profile.member_id).in("status", ["Submitted", "Needs Review"]);

    setActing(false);
    setReviewing(null);
    setAdminNote("");
    load();
  }

  async function reject(profile: ApprovedProfile) {
    if (!member) return;
    if (!confirm("Reject this request? The crew member will see your note.")) return;
    setActing(true);
    const note = adminNote || "Please review the requested changes and resubmit.";
    await supabase.from("approved_public_profile").update({
      profile_approval_status: "Rejected",
      admin_review_note: note,
      approved_by: member.id,
      approved_at: new Date().toISOString(),
    }).eq("id", profile.id);

    await supabase.from("profile_change_requests").update({
      status: "Rejected",
      admin_review_note: note,
      reviewed_by: member.id,
      reviewed_at: new Date().toISOString(),
    }).eq("member_id", profile.member_id).in("status", ["Submitted", "Needs Review"]);

    setActing(false);
    setReviewing(null);
    setAdminNote("");
    load();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <p className="font-display text-xl text-desert-night">Loading public cards…</p>
      </div>
    );
  }

  const pending = profiles.filter((p) => p.profile_approval_status === "Submitted" || p.profile_approval_status === "Needs Review");
  const approved = profiles.filter((p) => p.profile_approval_status === "Approved");
  const drafts = profiles.filter((p) => p.profile_approval_status === "Draft" || p.profile_approval_status === "Rejected");

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-desert-night p-6 md:p-8 rounded-2xl">
        <p className="text-sandstone-cream/70 text-sm font-bold uppercase tracking-wide">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl text-sandstone-cream mt-1">Public Cards</h1>
        <p className="text-sandstone-cream/60 text-sm mt-2 max-w-xl">
          Review crew profile change requests. Approve, edit, or reject before anything goes public.
        </p>
      </section>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-desert-night">Pending review ({pending.length})</h2>
          {pending.map((p) => (
            <div key={p.id} className="card p-5 space-y-3 border-2 border-copper-clay/30">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-display text-lg text-desert-night">{p.display_name ?? p.member?.name ?? "Unknown"}</p>
                  <p className="text-sm text-copper-deep font-bold">{p.public_title ?? "No title"}</p>
                  {p.secondary_role && <p className="text-xs text-smoked-charcoal/60">{p.secondary_role}</p>}
                  {p.requested_changes_note && (
                    <p className="text-xs text-smoked-charcoal/70 mt-2 italic">Crew note: "{p.requested_changes_note}"</p>
                  )}
                </div>
                <span className={`chip ${STATUS_CHIP[p.profile_approval_status ?? "Draft"]}`}>{p.profile_approval_status}</span>
              </div>

              {/* Photos preview */}
              {(p.website_photo_url || p.portal_avatar_url || p.email_signature_photo_url) && (
                <div className="flex gap-3 flex-wrap">
                  {p.website_photo_url && <PhotoPreview label="Website" url={p.website_photo_url} />}
                  {p.portal_avatar_url && <PhotoPreview label="Portal" url={p.portal_avatar_url} />}
                  {p.email_signature_photo_url && <PhotoPreview label="Email sig" url={p.email_signature_photo_url} />}
                </div>
              )}

              <button onClick={() => { setReviewing(p); setPhotoStatus(p.photo_permission_status ?? "Pending Review"); setAdminNote(""); }} className="btn btn-primary btn-sm">
                Review & approve/reject
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Approved profiles */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl text-desert-night">Approved ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="text-sm text-smoked-charcoal/50">No approved profiles yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {approved.map((p) => (
              <div key={p.id} className="card p-4 flex gap-3 items-start">
                {p.website_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.website_photo_url} alt={p.display_name ?? ""} className="w-16 h-16 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-copper-clay/20 flex items-center justify-center shrink-0">
                    <span className="font-display text-xl text-copper-clay">{(p.display_name ?? "?")[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base text-desert-night">{p.display_name ?? "Unknown"}</p>
                  <p className="text-sm text-copper-deep font-bold">{p.public_title}</p>
                  {p.short_personality_line && <p className="text-xs text-smoked-charcoal/60 italic mt-1">"{p.short_personality_line}"</p>}
                  <p className="text-[10px] text-smoked-charcoal/40 mt-1">Photo: {p.photo_permission_status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drafts / rejected */}
      {drafts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-desert-night">Drafts & rejected ({drafts.length})</h2>
          {drafts.map((p) => (
            <div key={p.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-display text-base text-desert-night">{p.display_name ?? p.member?.name ?? "Unknown"}</p>
                <p className="text-xs text-smoked-charcoal/60">{p.profile_approval_status}</p>
                {p.admin_review_note && <p className="text-xs text-copper-deep mt-1">Your note: "{p.admin_review_note}"</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Review modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setReviewing(null)}>
          <div className="bg-sandstone-cream rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl text-desert-night">Review: {reviewing.display_name}</p>
                <p className="text-sm text-copper-deep">{reviewing.public_title}</p>
              </div>
              <button onClick={() => setReviewing(null)} className="text-2xl text-smoked-charcoal/40 hover:text-smoked-charcoal">×</button>
            </div>

            {/* Photo status */}
            <div>
              <p className="label">Photo approval status</p>
              <select className="field" value={photoStatus} onChange={(e) => setPhotoStatus(e.target.value as PhotoPermissionStatus)}>
                {PHOTO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Bio preview */}
            <div className="bg-white/60 rounded-xl p-3 text-sm">
              <p className="font-bold text-desert-night">{reviewing.preferred_website_name ?? reviewing.display_name}</p>
              <p className="text-copper-deep">{reviewing.public_title}</p>
              {reviewing.secondary_role && <p className="text-xs text-smoked-charcoal/60">{reviewing.secondary_role}</p>}
              <p className="mt-2 italic text-smoked-charcoal">"{reviewing.short_personality_line}"</p>
              {reviewing.website_bio && <p className="mt-2 text-xs text-smoked-charcoal/70">{reviewing.website_bio}</p>}
            </div>

            {/* Admin note */}
            <div>
              <p className="label">Note to crew (visible to them)</p>
              <textarea className="field min-h-[60px]" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="e.g. Looks great! or Please upload a clearer photo without the kids in the background." />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => approve(reviewing)} disabled={acting} className="btn btn-positive flex-1">
                {acting ? "Approving…" : "Approve & Publish"}
              </button>
              <button onClick={() => reject(reviewing)} disabled={acting} className="btn btn-hold flex-1">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoPreview({ label, url }: { label: string; url: string }) {
  return (
    <div className="text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="w-20 h-20 rounded-xl object-cover border-2 border-copper-clay/20" />
      <p className="text-[10px] text-smoked-charcoal/50 mt-1">{label}</p>
    </div>
  );
}
