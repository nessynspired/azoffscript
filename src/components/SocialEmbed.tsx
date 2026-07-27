"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SocialEmbed — embeds social media posts/videos inline.
 *
 * Supports:
 *   - YouTube      → iframe embed (no script needed)
 *   - TikTok       → blockquote + embed.js script
 *   - Instagram    → blockquote + embed.js script
 *   - Facebook     → div.fb-post + SDK script
 *   - Other links  → "Open link" fallback button
 *
 * Usage:
 *   <SocialEmbed url="https://www.tiktok.com/@user/video/123" />
 */
export function SocialEmbed({ url, title }: { url: string; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // Detect platform
  const isYouTube = /youtube\.com|youtu\.be/i.test(url);
  const isTikTok = /tiktok\.com/i.test(url);
  const isInstagram = /instagram\.com/i.test(url);
  const isFacebook = /facebook\.com|fb\.watch|fb\.com/i.test(url);

  // YouTube — direct iframe, no script needed
  const ytEmbedUrl = (() => {
    if (!isYouTube) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  })();

  // TikTok / Instagram / Facebook — need to load embed scripts after render
  useEffect(() => {
    if (ytEmbedUrl) {
      setLoading(false);
      return;
    }

    if (isTikTok) {
      // TikTok embed: render a blockquote with data attributes, then load embed.js
      setLoading(false);
      // Wait for the blockquote to be in the DOM, then (re)load the script
      const existing = document.querySelector('script[src*="tiktok.com/embed.js"]');
      if (existing) {
        // Re-trigger by removing + re-adding
        existing.remove();
      }
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
      // TikTok embed.js processes blockquotes with class tiktok-embed
      return;
    }

    if (isInstagram) {
      setLoading(false);
      const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error - Instagram's embed.js adds this to window
        if (window.instgrm) window.instgrm.Embeds.process();
      };
      document.body.appendChild(script);
      return;
    }

    if (isFacebook) {
      setLoading(false);
      const existing = document.querySelector('script[src*="connect.facebook.net"]');
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error - Facebook SDK adds this to window
        if (window.FB) window.FB.XFBML.parse();
      };
      document.body.appendChild(script);
      return;
    }

    // Unknown platform — show fallback
    setLoading(false);
    setFailed(true);
  }, [url, ytEmbedUrl, isTikTok, isInstagram, isFacebook]);

  // YouTube — iframe
  if (ytEmbedUrl) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-desert-night">
        <iframe
          src={ytEmbedUrl}
          title={title ?? "YouTube video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // TikTok — blockquote embed
  if (isTikTok) {
    return (
      <div ref={containerRef} className="flex justify-center rounded-xl overflow-hidden bg-desert-night/5">
        <blockquote
          className="tiktok-embed"
          data-video-id={extractTikTokId(url)}
          cite={url}
          style={{ maxWidth: "380px", minWidth: "325px" }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">Loading TikTok…</a>
        </blockquote>
      </div>
    );
  }

  // Instagram — blockquote embed
  if (isInstagram) {
    return (
      <div ref={containerRef} className="flex justify-center rounded-xl overflow-hidden bg-desert-night/5">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ maxWidth: "420px", minWidth: "326px", width: "calc(100% - 2px)" }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">Loading Instagram post…</a>
        </blockquote>
      </div>
    );
  }

  // Facebook — fb-post embed
  if (isFacebook) {
    return (
      <div ref={containerRef} className="flex justify-center rounded-xl overflow-hidden bg-desert-night/5">
        <div
          className="fb-post"
          data-href={url}
          data-width="500"
          data-show-text="true"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">Loading Facebook post…</a>
        </div>
      </div>
    );
  }

  // Fallback — link out
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-secondary w-full text-center"
    >
      Open link →
    </a>
  );
}

/** Extract the numeric video ID from a TikTok URL */
function extractTikTokId(url: string): string | undefined {
  // Format: https://www.tiktok.com/@user/video/1234567890
  const m = url.match(/\/video\/(\d+)/);
  if (m) return m[1];
  // Format: https://vm.tiktok.com/Z123abc/
  return undefined;
}
