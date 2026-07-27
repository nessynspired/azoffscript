"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyMember, notifyAdminsAndPlanners } from "@/lib/notify";
import { MascotImage } from "@/components/MascotImage";
import { InfoTooltip } from "@/components/InfoTooltip";
import { DROP_LANES, LANE_META, DESTINATIONS } from "@/lib/crew-data";
import { useTermsStatus } from "@/lib/hooks/use-terms-status";
import type { Database, DropType } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];

const LINK_PATTERNS: { test: RegExp; platform: string }[] = [
  { test: /tiktok\.com/i, platform: "TikTok" },
  { test: /instagram\.com/i, platform: "Instagram" },
  { test: /youtube\.com|youtu\.be/i, platform: "YouTube" },
  { test: /facebook\.com|fb\.watch|fb\.com/i, platform: "Facebook" },
  { test: /twitter\.com|x\.com/i, platform: "X / Twitter" },
  { test: /threads\.net/i, platform: "Threads" },
  { test: /pinterest\.com|pin\.it/i, platform: "Pinterest" },
  { test: /snapchat\.com/i, platform: "Snapchat" },
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

  // Pre-fill from URL params (shared from TikTok/Instagram/etc via Web Share Target)
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
          <h1 className="font-display text-4xl md:text-5xl text-desert-night mt-6 stamp-in">DROPPED.</h1>
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

  // ===== DROP FORM — quick actions first, details after =====
  const [dropMode, setDropMode] = useState<"link" | "clip" | "prompt" | "caption" | null>(null);
  const termsStatus = useTermsStatus();
  // Admins bypass all term locks — they're the brand owner, not bound by their own terms
  const isAdmin = member?.role === "admin";
  const clipLocked = !isAdmin && !termsStatus.loading && !termsStatus.creatorReleaseSigned;
  const termsLocked = !isAdmin && !termsStatus.loading && !termsStatus.quickTermsAccepted;

  return (
    <main className="portal-shell px-4 pt-6">
      <div className="max-w-lg mx-auto pt-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl md:text-4xl text-desert-night">Drop something.</h1>
          <InfoTooltip text="Drop a video file, paste any social link (TikTok, Instagram, Facebook, YouTube, etc.), or type a text idea. Pick a lane (content category), choose where it's going, and tag anyone who's in it. It goes straight to the Run Sheet for planning." />
          <p className="text-smoked-charcoal/60 mt-2">
            One take is fine. No pressure to be perfect.
          </p>
        </div>

        {/* Quick terms lock — blocks all drops until the room rules are agreed */}
        {termsLocked && (
          <div className="card p-6 mb-4 bg-copper-deep/10 border-2 border-copper-clay text-center">
            <span className="text-3xl">🔒</span>
            <p className="font-display text-xl text-desert-night mt-2">Agree to the room rules first.</p>
            <p className="text-sm text-smoked-charcoal/70 mt-1">
              You can review and accept the Quick Room Rules in one minute.
            </p>
            <a href="/portal/quick-terms" className="btn btn-primary mt-4 inline-block">
              Review &amp; Agree →
            </a>
          </div>
        )}

        {/* Quick action buttons — pick what you're dropping */}
        {!dropMode && !termsLocked && (
          <div className="space-y-3">
            <button
              onClick={() => setDropMode("link")}
              className="card p-5 w-full text-left hover:-translate-y-0.5 transition-transform flex items-center gap-4"
            >
              <span className="text-3xl">🔗</span>
              <div>
                <p className="font-display text-xl text-desert-night">Drop a Link</p>
                <p className="text-sm text-smoked-charcoal/60">TikTok, Instagram, Facebook, YouTube — paste any social link.</p>
              </div>
            </button>

            <button
              onClick={() => !clipLocked && setDropMode("clip")}
              disabled={clipLocked}
              className={`card p-5 w-full text-left flex items-center gap-4 ${clipLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 transition-transform"}`}
            >
              <span className="text-3xl">🎬</span>
              <div className="flex-1">
                <p className="font-display text-xl text-desert-night">Drop a Quick Clip</p>
                <p className="text-sm text-smoked-charcoal/60">Record a video and send it.</p>
                {clipLocked && (
                  <p className="text-xs text-copper-deep font-bold mt-2">
                    🔒 Sign the Creator Release first to upload clips.
                  </p>
                )}
              </div>
              {clipLocked && <span className="text-2xl">🔒</span>}
            </button>

            <button
              onClick={() => setDropMode("prompt")}
              className="card p-5 w-full text-left hover:-translate-y-0.5 transition-transform flex items-center gap-4"
            >
              <span className="text-3xl">💬</span>
              <div>
                <p className="font-display text-xl text-desert-night">Answer the Prompt</p>
                <p className="text-sm text-smoked-charcoal/60">Type your answer to this week&apos;s question.</p>
              </div>
            </button>

            <button
              onClick={() => setDropMode("caption")}
              className="card p-5 w-full text-left hover:-translate-y-0.5 transition-transform flex items-center gap-4"
            >
              <span className="text-3xl">✍️</span>
              <div>
                <p className="font-display text-xl text-desert-night">Send a Caption Idea</p>
                <p className="text-sm text-smoked-charcoal/60">Got a funny caption? Drop it.</p>
              </div>
            </button>
          </div>
        )}

        {/* ===== LINK DROP ===== */}
        {dropMode === "link" && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-desert-night">🔗 Paste the link</h2>
              <button onClick={() => { setDropMode(null); setText(""); }} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any social link — TikTok, Instagram, Facebook, YouTube…"
              className="field text-lg"
              autoFocus
            />
            {text.trim() && isLink(text.trim()) && (
              <span className="chip chip-dark !text-[10px] mt-2 inline-block">
                {detectPlatform(text.trim()) ?? "Link"} detected
              </span>
            )}
            {error && <p className="mt-3 text-sm text-copper-deep font-bold">{error}</p>}
            <button
              onClick={submit}
              disabled={submitting || !text.trim()}
              className="btn btn-primary btn-lg w-full mt-4"
            >
              {submitting ? "Dropping…" : "Drop It"}
            </button>
          </div>
        )}

        {/* ===== CLIP DROP ===== */}
        {dropMode === "clip" && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-desert-night">🎬 Send your clip</h2>
              <button onClick={() => { setDropMode(null); setFile(null); setText(""); }} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {!file ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-desert-night/20 rounded-2xl py-12 flex flex-col items-center gap-3 hover:border-cactus-teal hover:bg-cactus-teal/5 transition-colors"
              >
                <span className="text-5xl">�</span>
                <p className="font-bold text-desert-night">Tap to pick a video</p>
                <p className="text-sm text-smoked-charcoal/60">No edits needed. Just send it.</p>
              </button>
            ) : (
              <div className="bg-cactus-teal/10 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-desert-night truncate">{file.name}</p>
                  <p className="text-xs text-smoked-charcoal/60">{Math.round(file.size / 1024 / 1024)}MB</p>
                </div>
                <button onClick={() => setFile(null)} className="text-copper-deep text-sm font-bold">remove</button>
              </div>
            )}
            {file && (
              <>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What should we call this? (optional)"
                  className="field mt-3"
                />
                {error && <p className="mt-3 text-sm text-copper-deep font-bold">{error}</p>}
                <button
                  onClick={submit}
                  disabled={submitting || !file}
                  className="btn btn-primary btn-lg w-full mt-4"
                >
                  {submitting ? "Uploading…" : "Drop It"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ===== PROMPT / IDEA DROP ===== */}
        {dropMode === "prompt" && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-desert-night">💬 Your answer</h2>
              <button onClick={() => { setDropMode(null); setText(""); }} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer…"
              className="field min-h-[120px] text-lg"
              autoFocus
            />
            {error && <p className="mt-3 text-sm text-copper-deep font-bold">{error}</p>}
            <button
              onClick={submit}
              disabled={submitting || !text.trim()}
              className="btn btn-primary btn-lg w-full mt-4"
            >
              {submitting ? "Dropping…" : "Drop It"}
            </button>
          </div>
        )}

        {/* ===== CAPTION DROP ===== */}
        {dropMode === "caption" && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-desert-night">✍️ Caption idea</h2>
              <button onClick={() => { setDropMode(null); setText(""); }} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Drop your caption…"
              className="field min-h-[80px] text-lg"
              autoFocus
            />
            {error && <p className="mt-3 text-sm text-copper-deep font-bold">{error}</p>}
            <button
              onClick={submit}
              disabled={submitting || !text.trim()}
              className="btn btn-primary btn-lg w-full mt-4"
            >
              {submitting ? "Dropping…" : "Drop It"}
            </button>
          </div>
        )}

        {/* ===== OPTIONAL EXTRAS — only after they've picked a mode ===== */}
        {dropMode && (text.trim() || file) && (
          <div className="mt-4 space-y-4">
            {/* Tag people — optional */}
            {members.length > 1 && (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-desert-night/50 mb-2">
                  Who&apos;s in it? <button onClick={() => setTaggedMemberIds([])} className="text-desert-night/30 hover:text-desert-night/60 normal-case font-normal">skip</button>
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

            {/* Lane + destination — optional, collapsed */}
            <details className="card p-3">
              <summary className="font-bold text-desert-night cursor-pointer text-sm">
                More details (optional)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-bold text-desert-night/50 mb-1">Lane</p>
                  <div className="flex flex-wrap gap-1">
                    {DROP_LANES.map((l) => (
                      <button key={l} onClick={() => setLane(lane === l ? "" : l)} className={`chip !text-xs ${lane === l ? "chip-copper" : "chip-cream"}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-desert-night/50 mb-1">Going to</p>
                  <div className="flex flex-wrap gap-1">
                    {DESTINATIONS.map((d) => (
                      <button key={d} onClick={() => setDestination(destination === d ? "" : d)} className={`chip !text-xs ${destination === d ? "chip-copper" : "chip-cream"}`}>{d}</button>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
