"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyMember, notifyAdminsAndPlanners } from "@/lib/notify";
import { MascotImage } from "@/components/MascotImage";
import { DROP_LANES, LANE_META, DESTINATIONS } from "@/lib/crew-data";
import type { Database, DropType } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];

const LINK_PATTERNS: { test: RegExp; platform: string }[] = [
  { test: /tiktok\.com/i, platform: "TikTok" },
  { test: /instagram\.com/i, platform: "Instagram" },
  { test: /youtube\.com|youtu\.be/i, platform: "YouTube" },
  { test: /drive\.google\.com/i, platform: "Google Drive" },
  { test: /dropbox\.com/i, platform: "Dropbox" },
];

function detectPlatform(url: string): string | null {
  for (const p of LINK_PATTERNS) if (p.test.test(url)) return p.platform;
  return null;
}

function isLink(text: string): boolean {
  try {
    new URL(text.trim());
    return true;
  } catch {
    return false;
  }
}

export default function DropPage() {
  const router = useRouter();
  const { member, user } = useAuth();
  const supabase = createClient();

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [taggedMemberIds, setTaggedMemberIds] = useState<string[]>([]);
  const [lane, setLane] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dropped, setDropped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from URL params (shared from TikTok/etc via Web Share Target)
  // Or show success if the share auto-dropped (?shared=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("shared") === "1") {
      setDropped(true);
      return;
    }
    const sharedText = params.get("text") || params.get("url") || params.get("title");
    if (sharedText) setText(sharedText);
  }, []);

  useEffect(() => {
    supabase.from("members").select("*").order("name").then(({ data }) => setMembers(data ?? []));
  }, [supabase]);

  // Auto-detect what type of drop this is
  function detectType(): DropType {
    if (file) return "video";
    if (isLink(text)) return "tiktok_link";
    return "idea";
  }

  function toggleTag(id: string) {
    setTaggedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleFile(f: File | null) {
    if (!f) return;
    setError(null);
    if (!f.type.startsWith("video/") && !f.type.startsWith("audio/")) {
      setError("Only video files can be dropped here. For links, just paste them in the text box.");
      return;
    }
    setFile(f);
  }

  async function submit() {
    if (!member || !user) { setError("You need to be signed in to drop something."); return; }
    if (!text.trim() && !file) { setError("Drop something first — a link, an idea, anything."); return; }

    setSubmitting(true);
    setError(null);

    try {
      const type = detectType();
      const isLinkDrop = isLink(text.trim());
      const platform = isLinkDrop ? detectPlatform(text.trim()) : null;

      let filePath: string | null = null;

      // Upload file if video
      if (type === "video" && file) {
        const ext = file.name.split(".").pop() ?? "mp4";
        const path = `${member.user_id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("clips").upload(path, file, { upsert: false });
        if (upErr) {
          setError("Upload paused. Try again.");
          setSubmitting(false);
          return;
        }
        filePath = path;
      }

      // Auto-generate title from text
      const title = text.trim().split("\n")[0].slice(0, 80) || file?.name?.replace(/\.[^.]+$/, "") || "Untitled drop";

      const clipInsert: Database["public"]["Tables"]["clips"]["Insert"] = {
        title,
        type,
        status: "Dropped",
        link: isLinkDrop ? text.trim() : null,
        file_path: filePath,
        idea_text: !isLinkDrop && !file ? text.trim() : null,
        category: lane || null,
        destination: destination || null,
        submitted_by: member.id,
        submitted_by_name: member.name,
        needs_review: false,
      };

      const { data: clip, error: clipErr } = await supabase
        .from("clips")
        .insert(clipInsert)
        .select()
        .single();

      if (clipErr || !clip) {
        setError(clipErr?.message ?? "Could not drop that. Try again.");
        setSubmitting(false);
        return;
      }

      // Tag people + create approval rows
      const tagged = members.filter((m) => taggedMemberIds.includes(m.id));
      if (tagged.length > 0) {
        await supabase.from("clip_people").insert(
          tagged.map((m) => ({ clip_id: clip.id, member_id: m.id, member_name: m.name }))
        );
        await supabase.from("approvals").insert(
          tagged.map((m) => ({ clip_id: clip.id, member_id: m.id, member_name: m.name, status: "Waiting" as const }))
        );
        // Notify tagged people they're in a clip
        await Promise.all(
          tagged.map((m) =>
            m.id !== member.id
              ? notifyMember(supabase, m.id, "tagged", `${member.name} tagged you in "${title}"`, "/portal/ready")
              : Promise.resolve()
          )
        );
      }

      // Activity log
      const activityBody = isLinkDrop
        ? platform
          ? `${member.name} dropped a ${platform} clip`
          : `${member.name} dropped a link`
        : file
        ? `${member.name} dropped a video`
        : `${member.name} dropped a thought: "${title}"`;

      await supabase.from("activity").insert({
        actor_id: member.id,
        actor_name: member.name,
        kind: "dropped",
        body: activityBody,
      });

      // Notify admins + planners that a new clip was dropped
      await notifyAdminsAndPlanners(supabase, "dropped", activityBody, "/portal/run-sheet", member.id);

      setDropped(true);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  function reset() {
    setText("");
    setFile(null);
    setTaggedMemberIds([]);
    setLane("");
    setDestination("");
    setError(null);
    setDropped(false);
  }

  // ===== SUCCESS STATE =====
  if (dropped) {
    const wasShared = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("shared") === "1";
    return (
      <main className="portal-shell px-4 pt-6">
        <div className="max-w-lg mx-auto text-center pt-10">
          <div className="stamp-in inline-block">
            <MascotImage pose="shades" size={160} priority />
          </div>
          <h1 className="font-display text-5xl text-desert-night mt-6 stamp-in">DROPPED.</h1>
          <p className="text-lg text-smoked-charcoal/70 mt-3">
            {wasShared
              ? "That's in the room. Go back to what you were doing."
              : "It's in the room. The crew can see it now."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button onClick={reset} className="btn btn-primary btn-lg">
              Drop Another
            </button>
            <button onClick={() => router.push("/portal/run-sheet")} className="btn btn-secondary btn-lg">
              See Run Sheet
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ===== DROP FORM — one screen, no steps =====
  return (
    <main className="portal-shell px-4 pt-6">
      <div className="max-w-lg mx-auto pt-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-4xl text-desert-night">Send your clip.</h1>
          <p className="text-smoked-charcoal/60 mt-2">
            Paste a link, type a thought, or upload your final. Vanessa stitches it together.
          </p>
        </div>

        {/* The big text box — this is the whole thing */}
        <div className="card p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a link or type an idea…"
            className="field min-h-[140px] text-lg resize-none border-0 focus:ring-0"
            style={{ border: "none", boxShadow: "none" }}
            autoFocus
          />

          {/* File upload — small, optional */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-desert-night/10">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-sm"
            >
              📎 Video
            </button>
            {file && (
              <span className="text-sm text-cactus-teal font-bold flex-1 truncate">
                {file.name} ({Math.round(file.size / 1024 / 1024)}MB)
                <button onClick={() => setFile(null)} className="ml-2 text-copper-deep underline">remove</button>
              </span>
            )}

            {/* Auto-detected type indicator */}
            {text.trim() && (
              <span className="chip chip-dark !text-[10px] ml-auto">
                {isLink(text.trim()) ? `🔗 ${detectPlatform(text.trim()) ?? "Link"}` : "💡 Idea"}
              </span>
            )}
          </div>
        </div>

        {/* Content lane picker — which show format does this belong to? */}
        <div className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-desert-night/50 mb-2">
            Which lane? {lane && <span className="text-cactus-teal">✓ {lane}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {DROP_LANES.map((l) => (
              <button
                key={l}
                onClick={() => setLane(lane === l ? "" : l)}
                className={`chip ${lane === l ? "chip-copper" : "chip-cream"}`}
                title={LANE_META[l]?.tagline}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Destination picker — where is this video going? */}
        <div className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-desert-night/50 mb-2">
            Going to {destination && <span className="text-cactus-teal">✓ {destination}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDestination(destination === d ? "" : d)}
                className={`chip ${destination === d ? "chip-copper" : "chip-cream"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Tag people — inline, optional, not a separate step */}
        {members.length > 1 && (
          <div className="mt-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-desert-night/50 mb-2">
              Tag the room {taggedMemberIds.length > 0 && `(${taggedMemberIds.length})`}
            </p>
            <div className="flex flex-wrap gap-2">
              {members
                .filter((m) => m.id !== member?.id)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleTag(m.id)}
                    className={`chip ${taggedMemberIds.includes(m.id) ? "chip-copper" : "chip-cream"}`}
                  >
                    {m.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-copper-deep/10 text-copper-deep text-sm font-bold">
            {error}
          </div>
        )}

        {/* Drop button — big, obvious */}
        <button
          onClick={submit}
          disabled={submitting || (!text.trim() && !file)}
          className="btn btn-primary btn-lg w-full mt-5 text-xl glow-pulse"
        >
          {submitting ? "Dropping…" : "Drop It 🎬"}
        </button>

        <p className="text-center text-xs text-desert-night/40 mt-3">
          No edits needed. Just send it.
        </p>
      </div>
    </main>
  );
}
