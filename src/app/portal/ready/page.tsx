"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { notifyAdminsAndPlanners } from "@/lib/notify";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { Database } from "@/lib/types/db";

type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];
type Approval = Database["public"]["Tables"]["approvals"]["Row"];

const APPROVAL_CHIP: Record<string, string> = {
  Waiting: "chip-waiting",
  Approved: "chip-approved",
  "Approved With Edits": "chip-edits",
  "Needs Review": "chip-review",
  "Do Not Post": "chip-danger",
  "No Tag": "chip-notag",
  "Don't Like How I Come Across": "chip-hold",
};

export default function ReadyToPostPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [approvals, setApprovals] = useState<Record<string, Approval[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // clips in Review or Ready status — these need greenlights
    const { data } = await supabase
      .from("clips_with_meta")
      .select("*")
      .in("status", ["Review", "Ready"])
      .order("updated_at", { ascending: false });
    const clipsData = data ?? [];
    setClips(clipsData);

    if (clipsData.length > 0) {
      const ids = clipsData.map((c) => c.id);
      const { data: appData } = await supabase.from("approvals").select("*").in("clip_id", ids);
      const map: Record<string, Approval[]> = {};
      (appData ?? []).forEach((a) => { (map[a.clip_id] ??= []).push(a); });
      setApprovals(map);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("ready-to-post")
      .on("postgres_changes", { event: "*", schema: "public", table: "clips" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, supabase]);

  // clips where I still need to approve
  const myPending = clips.filter((c) => {
    const apps = approvals[c.id] ?? [];
    const mine = apps.find((a) => a.member_id === member?.id);
    return mine && mine.status === "Waiting";
  });

  // clips that are fully approved (Ready)
  const greenlit = clips.filter((c) => {
    if (c.status !== "Ready") return false;
    const apps = approvals[c.id] ?? [];
    return apps.every((a) => a.status === "Approved" || a.status === "No Tag");
  });

  return (
    <div className="space-y-6">
      {/* Header with sunglasses poster */}
      <section className="hero-band p-6 md:p-8 relative overflow-hidden min-h-[200px]">
        <div className="absolute inset-0 opacity-40">
          <PosterImage poster="shades" fill alt="AZ Off Script ready to post poster" />
        </div>
        <div className="absolute right-4 top-4 z-10 hidden md:block">
          <MascotImage pose="shades" size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl md:text-5xl text-sandstone-cream leading-none drop-shadow-lg">
            Ready to Post
          </h1>
          <p className="text-sandstone-cream/90 mt-2 text-lg drop-shadow">
            Final cuts waiting for your greenlight.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="animate-pulse-slow"><MascotImage pose="shades" size={100} /></div>
          <p className="font-display text-xl text-desert-night">Loading clips for greenlight…</p>
        </div>
      ) : clips.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="inline-block"><MascotImage pose="shades" size={120} /></div>
          <p className="font-display text-2xl text-desert-night mt-4">Nothing waiting for your greenlight.</p>
          <p className="text-smoked-charcoal/70 mt-2">When Vanessa puts a clip in Review, it&apos;ll show up here for your approval.</p>
          <Link href="/portal/drop" className="btn btn-primary mt-6">Send a Clip</Link>
        </div>
      ) : (
        <>
          {/* My pending approvals */}
          {myPending.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-desert-night mb-3">
                Waiting on you ({myPending.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPending.map((clip) => (
                  <ClipReviewCard
                    key={clip.id}
                    clip={clip}
                    approvals={approvals[clip.id] ?? []}
                    myApproval={approvals[clip.id]?.find((a) => a.member_id === member?.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Greenlit — ready to go live */}
          {greenlit.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-display text-2xl text-desert-night">Greenlit</h2>
                <span className="chip chip-approved">Ready to post</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {greenlit.map((clip) => (
                  <div key={clip.id} className="card p-5 bg-cactus-teal/10 border-2 border-cactus-teal">
                    <div className="flex items-start gap-3">
                      <MascotImage pose="shades" size={50} className="shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-desert-night">{clip.title}</h3>
                        <p className="text-xs text-smoked-charcoal/60 mt-1">by {clip.submitted_by_name}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(approvals[clip.id] ?? []).map((a) => (
                            <span key={a.id} className={`chip ${APPROVAL_CHIP[a.status]} !text-[10px]`}>
                              {a.member_name.split(" ")[0]}: {a.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All review clips */}
          <div>
            <h2 className="font-display text-2xl text-desert-night mb-3">All in Review</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clips.filter((c) => !greenlit.includes(c)).map((clip) => (
                <ClipReviewCard
                  key={clip.id}
                  clip={clip}
                  approvals={approvals[clip.id] ?? []}
                  myApproval={approvals[clip.id]?.find((a) => a.member_id === member?.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ClipReviewCard({
  clip, approvals, myApproval,
}: {
  clip: ClipMeta;
  approvals: Approval[];
  myApproval?: Approval;
}) {
  const supabase = createClient();
  const [working, setWorking] = useState(false);

  async function approve(status: Approval["status"]) {
    if (!myApproval) return;
    setWorking(true);
    await supabase.from("approvals").update({ status }).eq("id", myApproval.id);
    // Notify admins/planners about the approval decision
    const statusLabel = status === "Approved" ? "greenlit" : status === "Do Not Post" ? "said Do Not Post on" : `marked ${status} on`;
    await notifyAdminsAndPlanners(
      supabase,
      "approved",
      `${myApproval.member_name} ${statusLabel} "${clip.title}"`,
      "/portal/run-sheet",
    );
    setWorking(false);
    // parent will reload via realtime
  }

  return (
    <div className="card p-5">
      <h3 className="font-bold text-desert-night text-lg">{clip.title}</h3>
      <p className="text-xs text-smoked-charcoal/60 mt-1">by {clip.submitted_by_name}</p>

      {clip.link && (
        <a href={clip.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-3">
          Open link →
        </a>
      )}

      {/* Video player — watch before you greenlight */}
      {clip.file_path && (clip.type === "video" || clip.type === "final_cut") && (
        <div className="mt-3">
          <VideoPlayer filePath={clip.file_path} title={clip.title} className="aspect-video" />
        </div>
      )}

      {/* Approval states */}
      <div className="mt-4 space-y-2">
        {approvals.map((a) => (
          <div key={a.id} className="flex items-center justify-between text-sm">
            <span className="font-bold text-desert-night">{a.member_name}</span>
            <span className={`chip ${APPROVAL_CHIP[a.status]} !text-[10px]`}>{a.status}</span>
          </div>
        ))}
      </div>

      {/* My actions */}
      {myApproval && myApproval.status === "Waiting" && (
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => approve("Approved")} className="btn btn-positive btn-sm" disabled={working}>
            Good to Go
          </button>
          <button onClick={() => approve("Approved With Edits")} className="btn btn-warning btn-sm" disabled={working}>
            Needs a Tweak
          </button>
          <button onClick={() => approve("Do Not Post")} className="btn btn-danger btn-sm" disabled={working}>
            Do Not Post
          </button>
          <button onClick={() => approve("Don't Like How I Come Across")} className="btn btn-warning btn-sm" disabled={working}>
            Don&apos;t Like How I Come Across
          </button>
        </div>
      )}
      {myApproval && myApproval.status !== "Waiting" && (
        <p className="text-sm font-bold text-cactus-teal mt-4">
          You said: {myApproval.status}
        </p>
      )}
    </div>
  );
}
