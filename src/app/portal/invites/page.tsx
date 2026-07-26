"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Database, UserRole } from "@/lib/types/db";

type InviteCode = Database["public"]["Tables"]["invite_codes"]["Row"];

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
  const [customForm, setCustomForm] = useState({ name: "", nickname: "", plot_twist: "", role: "member" as UserRole });
  const [customError, setCustomError] = useState<string | null>(null);
  const [creatingCustom, setCreatingCustom] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
    setInvites(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function createCustomInvite() {
    if (!customForm.name.trim()) {
      setCustomError("Name is required");
      return;
    }
    setCreatingCustom(true);
    setCustomError(null);
    const code = generateCode(customForm.name);
    const { error } = await supabase.from("invite_codes").insert({
      code,
      name: customForm.name.trim(),
      nickname: customForm.nickname.trim() || null,
      plot_twist: customForm.plot_twist.trim() || null,
      role: customForm.role,
    });
    if (error) {
      setCustomError(error.message);
      setCreatingCustom(false);
      return;
    }
    setCustomForm({ name: "", nickname: "", plot_twist: "", role: "member" });
    setCreatingCustom(false);
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
        <p className="text-smoked-charcoal/70 mt-2">Only admins can manage invite codes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Invite Codes</h1>
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Generate a code for each crew member. They enter it when signing up.</p>
      </div>

      {/* Create invite — works for anyone */}
      <div className="card p-5">
        <h2 className="font-display text-xl text-desert-night mb-1">Create Invite</h2>
        <p className="text-xs text-smoked-charcoal/60 mb-4">
          Generate an invite code for a new crew member, guest, or anyone joining the room. They&apos;ll use this code when signing up.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Name</label>
            <input
              className="field"
              placeholder="Jamie"
              value={customForm.name}
              onChange={(e) => setCustomForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Nickname (optional)</label>
            <input
              className="field"
              placeholder="The New Energy"
              value={customForm.nickname}
              onChange={(e) => setCustomForm((p) => ({ ...p, nickname: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Plot twist / bio (optional)</label>
            <input
              className="field"
              placeholder="What they bring to the room…"
              value={customForm.plot_twist}
              onChange={(e) => setCustomForm((p) => ({ ...p, plot_twist: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="field"
              value={customForm.role}
              onChange={(e) => setCustomForm((p) => ({ ...p, role: e.target.value as UserRole }))}
            >
              <option value="member">Member (crew)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={createCustomInvite}
              disabled={!customForm.name.trim() || creatingCustom}
              className="btn btn-primary btn-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingCustom ? "Creating…" : "Generate Code"}
            </button>
          </div>
        </div>
        {customError && (
          <p className="text-sm text-copper-deep font-bold mt-3">{customError}</p>
        )}
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
