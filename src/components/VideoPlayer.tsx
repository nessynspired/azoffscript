"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * VideoPlayer — plays videos and shows images uploaded to the Supabase
 * "clips" storage bucket. The bucket is private, so we generate a signed
 * URL (valid for 1 hour).
 *
 * Props:
 *  - filePath: the path in the clips bucket (e.g. "user-uuid/filename.mp4")
 *  - title: video title for accessibility
 *  - className: optional extra classes
 */
export function VideoPlayer({
  filePath,
  title,
  className = "",
}: {
  filePath: string;
  title?: string;
  className?: string;
}) {
  const supabase = createClient();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect if this is an image based on file extension
  const isImage = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(filePath);

  useEffect(() => {
    let cancelled = false;
    async function getSignedUrl() {
      const { data, error } = await supabase
        .storage
        .from("clips")
        .createSignedUrl(filePath, 3600); // 1 hour

      if (cancelled) return;
      if (error || !data?.signedUrl) {
        setError(error?.message ?? "Could not load file");
        return;
      }
      setUrl(data.signedUrl);
    }
    getSignedUrl();
    return () => { cancelled = true; };
  }, [filePath, supabase]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-desert-night/10 rounded-xl ${className}`}>
        <p className="text-sm text-smoked-charcoal/60 px-3 text-center">{error}</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-desert-night/10 rounded-xl ${className}`}>
        <div className="animate-pulse text-2xl">🎬</div>
      </div>
    );
  }

  // Render as image if it's an image file
  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={title ?? "Uploaded image"}
        className={`w-full rounded-xl bg-desert-night object-contain ${className}`}
      />
    );
  }

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className={`w-full rounded-xl bg-desert-night object-contain ${className}`}
      title={title}
    />
  );
}
