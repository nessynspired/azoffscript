"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { Database } from "@/lib/types/db";

type DeletedClip = Database["public"]["Tables"]["deleted_clips"]["Row"];
type DeletedAssignment = Database["public"]["Tables"]["deleted_content_assignments"]["Row"];
type DeletedTrend = Database["public"]["Tables"]["deleted_trend_references"]["Row"];

function safeJson<T>(value: Record<string, unknown>): T {
  return value as unknown as T;
}

export default function RecycleBinPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [deletedClips, setDeletedClips] = useState<DeletedClip[]>([]);
  const [deletedAssignments, setDeletedAssignments] = useState<DeletedAssignment[]>([]);
  const [deletedTrends, setDeletedTrends] = useState<DeletedTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const [cRes, aRes, tRes] = await Promise.all([
      supabase.from("deleted_clips").select("*").order("deleted_at", { ascending: false }),
      supabase.from("deleted_content_assignments").select("*").order("deleted_at", { ascending: false }),
      supabase.from("deleted_trend_references").select("*").order("deleted_at", { ascending: false }),
    ]);
    setDeletedClips(cRes.data ?? []);
    setDeletedAssignments(aRes.data ?? []);
    setDeletedTrends(tRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function restoreClip(item: DeletedClip) {
    setRestoring((r) => ({ ...r, [item.id]: true }));
    const data = { ...item.data } as Record<string, unknown>;
    delete data.planned_clip_id; // avoid FK errors if the parent clip is also gone
    const { error } = await supabase.from("clips").insert(safeJson<Database["public"]["Tables"]["clips"]["Insert"]>(data));
    if (error) { alert(`Restore failed: ${error.message}`); setRestoring((r) => ({ ...r, [item.id]: false })); return; }
    await supabase.from("deleted_clips").delete().eq("id", item.id);
    await load();
    setRestoring((r) => ({ ...r, [item.id]: false }));
  }

  async function restoreAssignment(item: DeletedAssignment) {
    setRestoring((r) => ({ ...r, [item.id]: true }));
    const { error } = await supabase.from("content_assignments").insert(safeJson<Database["public"]["Tables"]["content_assignments"]["Insert"]>(item.data as Record<string, unknown>));
    if (error) { alert(`Restore failed: ${error.message}`); setRestoring((r) => ({ ...r, [item.id]: false })); return; }
    await supabase.from("deleted_content_assignments").delete().eq("id", item.id);
    await load();
    setRestoring((r) => ({ ...r, [item.id]: false }));
  }

  async function restoreTrend(item: DeletedTrend) {
    setRestoring((r) => ({ ...r, [item.id]: true }));
    const { error } = await supabase.from("trend_references").insert(safeJson<Database["public"]["Tables"]["trend_references"]["Insert"]>(item.data as Record<string, unknown>));
    if (error) { alert(`Restore failed: ${error.message}`); setRestoring((r) => ({ ...r, [item.id]: false })); return; }
    await supabase.from("deleted_trend_references").delete().eq("id", item.id);
    await load();
    setRestoring((r) => ({ ...r, [item.id]: false }));
  }

  if (member?.role !== "admin") {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl text-desert-night">Admin only.</p>
        <p className="text-smoked-charcoal/70 mt-2">The recycle bin is for admins only.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="font-display text-xl text-desert-night">Loading recycle bin…</p>;
  }

  const hasItems = deletedClips.length > 0 || deletedAssignments.length > 0 || deletedTrends.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Recycle Bin</h1>
        <InfoTooltip text="Admin only. Deleted clips, assignments, and trends are archived here before they're gone forever. You can restore items back to the main tables." />
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Restore deleted content before it's gone forever.</p>
      </div>

      {!hasItems && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">Recycle bin is empty.</p>
          <p className="text-smoked-charcoal/70 mt-2">Nothing has been deleted through the UI recently.</p>
        </div>
      )}

      {deletedClips.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Deleted Clips</h2>
          <div className="space-y-2">
            {deletedClips.map((item) => {
              const data = item.data as Record<string, unknown>;
              return (
                <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night truncate">{(data.title as string) ?? "Untitled clip"}</p>
                    <p className="text-xs text-smoked-charcoal/60">
                      {data.status as string} · {new Date(item.deleted_at).toLocaleString()} · {(data.type as string) ?? "clip"}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreClip(item)}
                    disabled={restoring[item.id]}
                    className="btn btn-primary btn-sm shrink-0"
                  >
                    {restoring[item.id] ? "Restoring…" : "Restore"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {deletedAssignments.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Deleted Assignments</h2>
          <div className="space-y-2">
            {deletedAssignments.map((item) => {
              const data = item.data as Record<string, unknown>;
              return (
                <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night truncate">{(data.member_name as string) ?? "Unknown member"} · {(data.role as string) ?? "On-Camera"}</p>
                    <p className="text-xs text-smoked-charcoal/60">
                      {new Date(item.deleted_at).toLocaleString()} · {(data.status as string) ?? "Not Started"}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreAssignment(item)}
                    disabled={restoring[item.id]}
                    className="btn btn-primary btn-sm shrink-0"
                  >
                    {restoring[item.id] ? "Restoring…" : "Restore"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {deletedTrends.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Deleted Trends</h2>
          <div className="space-y-2">
            {deletedTrends.map((item) => {
              const data = item.data as Record<string, unknown>;
              return (
                <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-desert-night truncate">{(data.title as string) ?? "Untitled trend"}</p>
                    <p className="text-xs text-smoked-charcoal/60">
                      {new Date(item.deleted_at).toLocaleString()} · {(data.platform as string) ?? "link"}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreTrend(item)}
                    disabled={restoring[item.id]}
                    className="btn btn-primary btn-sm shrink-0"
                  >
                    {restoring[item.id] ? "Restoring…" : "Restore"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
