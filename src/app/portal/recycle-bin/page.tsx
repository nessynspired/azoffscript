"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { Database } from "@/lib/types/db";

type DeletedRow = Database["public"]["Tables"]["deleted_rows"]["Row"];
type DeletedFile = Database["public"]["Tables"]["deleted_files"]["Row"];
const TABLE_LABELS: Record<string, string> = {
  clips: "Clip",
  content_assignments: "Assignment",
  trend_references: "Trend",
  clip_people: "Crew in clip",
  approvals: "Approval",
  comments: "Comment",
  ideas: "Idea",
  gear: "Gear item",
  assignment_comments: "Assignment comment",
  content_themes: "Content theme",
  approved_public_profile: "Public profile",
  profile_change_requests: "Profile change request",
  quick_terms_acceptances: "Quick terms acceptance",
  revenue_events: "Revenue event",
  invite_codes: "Invite code",
  join_submissions: "Join submission",
  notifications: "Notification",
  activity: "Activity log entry",
};

// Which field to show as the title for each table
function getRowTitle(tableName: string, data: Record<string, unknown>): string {
  switch (tableName) {
    case "clips": return (data.title as string) ?? "Untitled clip";
    case "content_assignments": return `${data.member_name ?? "Unknown"} · ${data.role ?? "On-Camera"}`;
    case "trend_references": return (data.title as string) ?? "Untitled trend";
    case "clip_people": return (data.member_name as string) ?? "Unknown crew";
    case "approvals": return `${data.member_name ?? "Unknown"} · ${data.status ?? "Waiting"}`;
    case "comments": return (data.comment as string)?.slice(0, 60) ?? "Comment";
    case "ideas": return (data.title as string) ?? "Untitled idea";
    case "gear": return `${data.item_type ?? "Gear"} for ${data.member_name ?? "unknown"}`;
    case "assignment_comments": return (data.comment as string)?.slice(0, 60) ?? "Comment";
    case "content_themes": return (data.name as string) ?? "Untitled theme";
    case "approved_public_profile": return (data.display_name as string) ?? "Public profile";
    case "profile_change_requests": return `Change request for ${data.member_id ?? "unknown"}`;
    case "quick_terms_acceptances": return `Terms acceptance by ${data.member_name ?? "unknown"}`;
    case "revenue_events": return (data.description as string) ?? "Revenue event";
    case "invite_codes": return `Invite: ${data.code ?? "unknown"}`;
    case "join_submissions": return (data.name as string) ?? "Join submission";
    case "notifications": return (data.body as string)?.slice(0, 60) ?? "Notification";
    case "activity": return (data.body as string)?.slice(0, 60) ?? "Activity entry";
    default: return "Deleted item";
  }
}

function getRowSubtitle(tableName: string, data: Record<string, unknown>): string {
  const parts: string[] = [];
  if (data.status) parts.push(data.status as string);
  if (data.type) parts.push(data.type as string);
  if (data.platform) parts.push(data.platform as string);
  if (data.category) parts.push(data.category as string);
  return parts.join(" · ");
}

// Tables we can restore (must have an id column and not conflict with FKs)
const RESTORABLE_TABLES = new Set([
  "clips",
  "content_assignments",
  "trend_references",
  "clip_people",
  "approvals",
  "comments",
  "ideas",
  "gear",
  "assignment_comments",
  "content_themes",
  "approved_public_profile",
  "profile_change_requests",
  "quick_terms_acceptances",
  "revenue_events",
  "invite_codes",
  "join_submissions",
]);

export default function RecycleBinPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [deletedRows, setDeletedRows] = useState<DeletedRow[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<DeletedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    const [rRes, fRes] = await Promise.all([
      supabase.from("deleted_rows").select("*").order("deleted_at", { ascending: false }).limit(200),
      supabase.from("deleted_files").select("*").order("deleted_at", { ascending: false }).limit(100),
    ]);
    setDeletedRows(rRes.data ?? []);
    setDeletedFiles(fRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function restoreRow(item: DeletedRow) {
    if (!RESTORABLE_TABLES.has(item.table_name)) {
      alert(`Cannot auto-restore ${item.table_name} — this table needs manual recovery.`);
      return;
    }
    setRestoring((r) => ({ ...r, [item.id]: true }));
    const { error } = await supabase.rpc("restore_deleted_row", { p_archive_id: item.id });
    if (error) {
      alert(`Restore failed: ${error.message}\n\nThe row may reference a deleted parent. Try restoring the parent first.`);
      setRestoring((r) => ({ ...r, [item.id]: false }));
      return;
    }
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

  const tableNames = Array.from(new Set(deletedRows.map((r) => r.table_name))).sort();
  const filteredRows = filter === "all" ? deletedRows : deletedRows.filter((r) => r.table_name === filter);
  const hasItems = filteredRows.length > 0 || deletedFiles.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-5xl text-desert-night leading-none">Recycle Bin</h1>
        <InfoTooltip text="Admin only. Everything deleted through the UI is archived here — clips, assignments, trends, approvals, comments, ideas, gear, profiles, and uploaded files. Restore any item with one click." />
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Restore deleted content before it&apos;s gone forever.</p>
      </div>

      {!hasItems && filter === "all" && (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl text-desert-night">Recycle bin is empty.</p>
          <p className="text-smoked-charcoal/70 mt-2">Nothing has been deleted through the UI recently.</p>
        </div>
      )}

      {/* Filter buttons */}
      {tableNames.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`chip !text-xs ${filter === "all" ? "chip-dark" : "chip-cream"}`}
          >
            All ({deletedRows.length})
          </button>
          {tableNames.map((t) => {
            const count = deletedRows.filter((r) => r.table_name === t).length;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`chip !text-xs ${filter === t ? "chip-dark" : "chip-cream"}`}
              >
                {TABLE_LABELS[t] ?? t} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Deleted rows */}
      {filteredRows.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Deleted Items</h2>
          <div className="space-y-2">
            {filteredRows.map((item) => {
              const data = item.data as Record<string, unknown>;
              const title = getRowTitle(item.table_name, data);
              const subtitle = getRowSubtitle(item.table_name, data);
              const canRestore = RESTORABLE_TABLES.has(item.table_name);
              return (
                <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="chip chip-cream !text-[9px] shrink-0">{TABLE_LABELS[item.table_name] ?? item.table_name}</span>
                      {subtitle && <span className="text-[10px] text-smoked-charcoal/50 truncate">{subtitle}</span>}
                    </div>
                    <p className="font-bold text-desert-night truncate">{title}</p>
                    <p className="text-xs text-smoked-charcoal/60 mt-0.5">
                      Deleted {new Date(item.deleted_at).toLocaleString()}
                    </p>
                  </div>
                  {canRestore && (
                    <button
                      onClick={() => restoreRow(item)}
                      disabled={restoring[item.id]}
                      className="btn btn-primary btn-sm shrink-0"
                    >
                      {restoring[item.id] ? "Restoring…" : "Restore"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Deleted files */}
      {deletedFiles.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-desert-night mb-3">Deleted Files</h2>
          <div className="space-y-2">
            {deletedFiles.map((item) => (
              <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="chip chip-cream !text-[9px] shrink-0">{item.bucket_id}</span>
                    {item.mime_type && <span className="text-[10px] text-smoked-charcoal/50 truncate">{item.mime_type}</span>}
                  </div>
                  <p className="font-bold text-desert-night truncate text-sm">{item.file_path}</p>
                  <p className="text-xs text-smoked-charcoal/60 mt-0.5">
                    Deleted {new Date(item.deleted_at).toLocaleString()}
                    {item.file_size ? ` · ${Math.round(item.file_size / 1024)}KB` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-smoked-charcoal/50 mt-2">
            Note: Files in Supabase Storage are not automatically deleted when a clip is removed —
            they remain in the bucket. This log tracks any files explicitly deleted through the UI.
          </p>
        </section>
      )}
    </div>
  );
}
