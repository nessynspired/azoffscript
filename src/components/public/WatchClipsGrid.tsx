"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";
import type { Database } from "@/lib/types/db";

type ClipMeta = Database["public"]["Views"]["clips_with_meta"]["Row"];

export function WatchClipsGrid() {
  const supabase = createClient();
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("clips_with_meta")
      .select("*")
      .eq("status", "Live")
      .order("updated_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setClips(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="animate-pulse-slow">
          <MascotImage pose="shades" size={80} />
        </div>
        <p className="font-display text-xl text-desert-night">Loading clips…</p>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="inline-block">
          <MascotImage pose="shades" size={100} />
        </div>
        <p className="font-display text-2xl text-desert-night mt-4">Clips dropping soon.</p>
        <p className="text-smoked-charcoal/70 mt-2">
          The crew is filming. Check back or follow us on social.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {clips.map((clip, i) => (
        <a
          key={clip.id}
          href={clip.link ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`card overflow-hidden hover:-translate-y-1 transition-transform ${i % 3 === 0 ? "sticker" : ""}`}
        >
          <div className="aspect-[9/16] bg-desert-night/10 relative flex items-end p-4">
            {clip.link && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-desert-night/60 flex items-center justify-center backdrop-blur">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#F5E6D3">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="relative z-10">
              <span className="chip chip-dark !text-[10px]">
                {clip.type === "tiktok_link" ? "TikTok" : clip.type === "final_cut" ? "Final Cut" : clip.type}
              </span>
              <h3 className="font-bold text-sandstone-cream mt-2 leading-tight">{clip.title}</h3>
              <p className="text-xs text-sandstone-cream/60 mt-1">by {clip.submitted_by_name}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
