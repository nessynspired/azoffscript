"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { Database, JoinSubmissionStatus } from "@/lib/types/db";

type Submission = Database["public"]["Tables"]["join_submissions"]["Row"];

const STATUSES: JoinSubmissionStatus[] = ["New", "Contacted", "Approved", "Rejected", "Archived"];

const STATUS_CHIP: Record<JoinSubmissionStatus, string> = {
  New: "chip-copper",
  Contacted: "chip-teal",
  Approved: "chip-yellow",
  Rejected: "chip-cream",
  Archived: "chip-cream",
};

function generateCode(name: string): string {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "JOIN";
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CREW-${prefix}-${random}${random2}`;
}

export default function JoinSubmissionsPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<JoinSubmissionStatus | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<Record<string, { kind: "sending" | "sent" | "error"; message?: string; email?: string }>>({});

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("join_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { alert(error.message); return; }
    setSubmissions(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: JoinSubmissionStatus) {
    setBusyId(id);
    const { error } = await supabase
      .from("join_submissions")
      .update({ status })
      .eq("id", id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    load();
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Delete this submission permanently?")) return;
    setBusyId(id);
    const { error } = await supabase
      .from("join_submissions")
      .delete()
      .eq("id", id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    if (expandedId === id) setExpandedId(null);
    load();
  }

  async function convertToInvite(sub: Submission) {
    const code = generateCode(sub.name);
    const plotTwist = sub.why
      ? sub.why.slice(0, 200)
      : sub.lane
        ? `Interested in: ${sub.lane}`
        : "Joined via the public interest form.";
    setBusyId(sub.id);
    setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "sending" } }));
    const { data: invite, error: inviteErr } = await supabase
      .from("invite_codes")
      .insert({
        code,
        name: sub.name,
        plot_twist: plotTwist,
        favorite_content: sub.roles ?? [],
        role: "member",
      })
      .select("id, code")
      .single();
    if (inviteErr || !invite) {
      setBusyId(null);
      setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "error", message: inviteErr?.message ?? "Failed to create invite code" } }));
      alert(inviteErr?.message ?? "Failed to create invite code");
      return;
    }
    const { error: updateErr } = await supabase
      .from("join_submissions")
      .update({ status: "Approved", converted_invite_id: invite.id })
      .eq("id", sub.id);
    if (updateErr) {
      setBusyId(null);
      setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "error", message: updateErr.message } }));
      alert(updateErr.message);
      return;
    }

    // Invite created — now email the applicant their code automatically.
    let emailResult: { kind: "sent"; email: string } | { kind: "error"; message: string } | null = null;
    try {
      const res = await fetch("/api/admin/send-invite-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: sub.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        emailResult = { kind: "sent", email: data.sentTo ?? sub.email ?? "" };
      } else {
        emailResult = { kind: "error", message: data.error ?? "Email send failed" };
      }
    } catch (err) {
      emailResult = { kind: "error", message: err instanceof Error ? err.message : "Email send failed" };
    }

    setBusyId(null);
    setCopiedCode(invite.code);
    setInviteStatus((prev) => ({
      ...prev,
      [sub.id]: emailResult?.kind === "sent"
        ? { kind: "sent", email: emailResult.email }
        : { kind: "error", message: emailResult?.kind === "error" ? emailResult.message : "Email send failed" },
    }));
    load();
  }

  async function resendInviteEmail(sub: Submission) {
    if (!sub.converted_invite_id) return;
    setBusyId(sub.id);
    setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "sending" } }));
    try {
      const res = await fetch("/api/admin/send-invite-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: sub.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "sent", email: data.sentTo ?? sub.email ?? "" } }));
      } else {
        setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "error", message: data.error ?? "Email send failed" } }));
      }
    } catch (err) {
      setInviteStatus((prev) => ({ ...prev, [sub.id]: { kind: "error", message: err instanceof Error ? err.message : "Email send failed" } }));
    } finally {
      setBusyId(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (member?.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-smoked-charcoal/70 mt-2">Only admins can review join submissions.</p>
      </div>
    );
  }

  const visible = filter === "All"
    ? submissions
    : submissions.filter((s) => s.status === filter);

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = submissions.filter((sub) => sub.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Join Submissions</h1>
        <InfoTooltip text="Admin only. When someone fills out the public /join form on the website, their submission shows up here. Review their info (name, city, vibe, socials) and decide if you want to invite them. Approved submissions can be converted into invite codes." />
        <p className="text-smoked-charcoal/70 mt-2 text-lg">
          People who filled out the public /join form. Review, follow up, or convert to an invite code.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("All")}
          className={`chip ${filter === "All" ? "chip-copper" : "chip-cream"}`}
        >
          All ({submissions.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`chip ${filter === s ? "chip-copper" : "chip-cream"}`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-display text-xl text-desert-night">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-smoked-charcoal/70">
            {submissions.length === 0
              ? "No submissions yet. When someone fills out the /join form, they'll show up here."
              : "No submissions match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((sub) => {
            const expanded = expandedId === sub.id;
            const isBusy = busyId === sub.id;
            return (
              <div key={sub.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(expanded ? null : sub.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-desert-night">{sub.name}</p>
                      <span className={`chip ${STATUS_CHIP[sub.status]} !text-[10px]`}>{sub.status}</span>
                      {sub.converted_invite_id && (
                        <span className="chip chip-teal !text-[10px]">Invite sent</span>
                      )}
                    </div>
                    <p className="text-sm text-smoked-charcoal/70 mt-1">
                      {sub.city}{sub.lane ? ` · ${sub.lane}` : ""}
                    </p>
                    <p className="text-xs text-smoked-charcoal/50 mt-1">
                      {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sub.status}
                      disabled={isBusy}
                      onChange={(e) => updateStatus(sub.id, e.target.value as JoinSubmissionStatus)}
                      className="field !py-1 !px-2 !text-sm w-auto"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-desert-night/10 space-y-3 text-sm">
                    {sub.email && (
                      <Field label="Email" value={sub.email} />
                    )}
                    {sub.socials && (
                      <Field label="Socials" value={sub.socials} />
                    )}
                    {sub.comfortable_on_camera && (
                      <Field
                        label="Comfortable on camera"
                        value={
                          sub.comfortable_on_camera === "yes" ? "Yes, bring it on"
                          : sub.comfortable_on_camera === "somewhat" ? "Somewhat — warming up to it"
                          : sub.comfortable_on_camera === "no" ? "Not yet — prefer behind the scenes"
                          : sub.comfortable_on_camera
                        }
                      />
                    )}
                    {sub.content_type && (
                      <Field label="Content they'd enjoy" value={sub.content_type} />
                    )}
                    {sub.roles && sub.roles.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-desert-night/60 mb-1">Roles</p>
                        <div className="flex flex-wrap gap-1">
                          {sub.roles.map((r) => (
                            <span key={r} className="chip chip-cream !text-[10px]">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.content_interests && sub.content_interests.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-desert-night/60 mb-1">Content interests</p>
                        <div className="flex flex-wrap gap-1">
                          {sub.content_interests.map((r) => (
                            <span key={r} className="chip chip-copper !text-[10px]">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.availability && (
                      <Field label="Availability" value={sub.availability} />
                    )}
                    {sub.availability_slots && sub.availability_slots.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-desert-night/60 mb-1">Availability</p>
                        <div className="flex flex-wrap gap-1">
                          {sub.availability_slots.map((r) => (
                            <span key={r} className="chip chip-cream !text-[10px]">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {sub.willingness && (
                      <Field
                        label="Willing to try first drop"
                        value={
                          sub.willingness === "yes" ? "Yes, send me the first prompt"
                          : sub.willingness === "maybe" ? "Maybe, I want to ask questions first"
                          : sub.willingness === "not_sure" ? "Not sure yet"
                          : sub.willingness === "no" ? "No, looking for something more guaranteed"
                          : sub.willingness
                        }
                      />
                    )}
                    {sub.boundaries && (
                      <Field label="Boundaries" value={sub.boundaries} />
                    )}
                    {sub.anything_else && (
                      <Field label="Anything we should know" value={sub.anything_else} />
                    )}
                    {sub.why && (
                      <Field label="Why this interests them" value={sub.why} />
                    )}
                    {sub.lane && (
                      <Field label="Lane" value={sub.lane} />
                    )}
                    {sub.guest_or_recurring && (
                      <Field
                        label="Okay starting as guest/featured"
                        value={
                          sub.guest_or_recurring === "yes" ? "Yes"
                          : sub.guest_or_recurring === "maybe" ? "Maybe, explain it to me"
                          : sub.guest_or_recurring === "no" ? "No, only if I'm a main recurring face"
                          : sub.guest_or_recurring
                        }
                      />
                    )}
                    {sub.clips_not_guaranteed && (
                      <Field
                        label="Okay if not every clip posts"
                        value={
                          sub.clips_not_guaranteed === "yes" ? "Yes, I understand the brand chooses what fits"
                          : sub.clips_not_guaranteed === "maybe" ? "Maybe, I want to understand the process"
                          : sub.clips_not_guaranteed === "no" ? "No, only if my clips are guaranteed to post"
                          : sub.clips_not_guaranteed
                        }
                      />
                    )}
                    {sub.admin_notes && (
                      <Field label="Admin notes" value={sub.admin_notes} />
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {!sub.converted_invite_id && (
                        <button
                          onClick={() => convertToInvite(sub)}
                          disabled={isBusy}
                          className="btn btn-primary btn-sm disabled:opacity-60"
                        >
                          {isBusy ? "Working…" : "Convert to invite"}
                        </button>
                      )}
                      <button
                        onClick={() => deleteSubmission(sub.id)}
                        disabled={isBusy}
                        className="text-copper-deep text-xs hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>

                    {copiedCode && sub.converted_invite_id && (
                      <div className="bg-sandstone-cream/50 rounded-xl p-3 flex items-center justify-between gap-2">
                        <p className="font-mono text-sm text-copper-clay font-bold">{copiedCode}</p>
                        <button
                          onClick={() => copyCode(copiedCode)}
                          className="btn btn-secondary btn-sm"
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {/* Invite email status + resend */}
                    {sub.converted_invite_id && (() => {
                      const status = inviteStatus[sub.id];
                      return (
                        <div className="space-y-2">
                          {status?.kind === "sending" && (
                            <div className="rounded-xl p-3 bg-sandstone-cream/40 text-sm text-desert-night">
                              Sending invite email…
                            </div>
                          )}
                          {status?.kind === "sent" && (
                            <div className="rounded-xl p-3 bg-teal-cyan/10 border border-teal-cyan/30 text-sm text-desert-night">
                              <p className="font-bold">Invite emailed to {status.email}</p>
                              <p className="text-xs text-smoked-charcoal/70 mt-1">They can use the code at /login → &ldquo;Need access?&rdquo;</p>
                              <button
                                onClick={() => resendInviteEmail(sub)}
                                disabled={isBusy}
                                className="btn btn-secondary btn-sm mt-2 disabled:opacity-50"
                              >
                                Resend email
                              </button>
                            </div>
                          )}
                          {status?.kind === "error" && (
                            <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-sm text-red-900 space-y-2">
                              <p className="font-bold">Email didn&rsquo;t send.</p>
                              <p className="text-xs">{status.message}</p>
                              <p className="text-xs text-smoked-charcoal/70">Copy the code above and DM them manually — they still need it to get in.</p>
                              <button
                                onClick={() => resendInviteEmail(sub)}
                                disabled={isBusy}
                                className="btn btn-secondary btn-sm disabled:opacity-50"
                              >
                                Try sending again
                              </button>
                            </div>
                          )}
                          {!status && sub.email && (
                            <button
                              onClick={() => resendInviteEmail(sub)}
                              disabled={isBusy}
                              className="btn btn-secondary btn-sm disabled:opacity-50"
                            >
                              Resend invite email
                            </button>
                          )}
                          {!status && !sub.email && (
                            <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-sm text-red-900">
                              <p className="font-bold">No email on file.</p>
                              <p className="text-xs mt-1">Copy the code above and DM them manually — they still need it to get in.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-desert-night/60 mb-1">{label}</p>
      <p className="text-desert-night whitespace-pre-wrap">{value}</p>
    </div>
  );
}
