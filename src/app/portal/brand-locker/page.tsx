"use client";

import { useState } from "react";
import { MascotImage, PosterImage } from "@/components/MascotImage";

const HASHTAGS = [
  "#AZOffScript", "#OffScriptRoom", "#ArizonaOurWay", "#RedFlagOrRealLife",
  "#AZCreator", "#DesertEnergy", "#FirstWave", "#OffScriptCrew",
];

const CAPTIONS = [
  { text: "When he says 'we'll see'… 🚩", tag: "Red Flag or Real Life" },
  { text: "Arizona, our way.", tag: "Brand" },
  { text: "We don't script this. We just hit record.", tag: "BTS" },
  { text: "First Wave only. You had to be there.", tag: "Crew" },
  { text: "Hot take: [blank] is overrated.", tag: "Hot Takes" },
  { text: "POV: you're in the Off Script Room", tag: "Skits" },
];

const BRAND_COLORS = [
  { name: "Desert Night", hex: "#1A1F2C", var: "--desert-night" },
  { name: "Sunburst Yellow", hex: "#F4C430", var: "--sunburst-yellow" },
  { name: "Heat Orange", hex: "#E85D2C", var: "--heat-orange" },
  { name: "Cactus Teal", hex: "#2D8B7A", var: "--cactus-teal" },
  { name: "Copper Clay", hex: "#B5663F", var: "--copper-clay" },
  { name: "Copper Deep", hex: "#8B3A1F", var: "--copper-deep" },
  { name: "Sandstone Cream", hex: "#F5E6D3", var: "--sandstone-cream" },
  { name: "Smoked Charcoal", hex: "#2A2A2A", var: "--smoked-charcoal" },
];

const CONTENT_FORMATS = [
  { name: "Group Chat Court", desc: "We bring the question. The room decides." },
  { name: "Dry Heat Hot Takes", desc: "Arizona opinions, served at 112 degrees." },
  { name: "Red Flag or Real Life?", desc: "The game where the room gets honest fast." },
  { name: "Who's Most Likely To", desc: "First Wave edition. Somebody is getting exposed lightly." },
  { name: "AZ Moments", desc: "Local things that only make sense here." },
  { name: "Off Script Afterthoughts", desc: "The thing someone says after the camera was supposed to stop." },
];

const GEAR_TEMPLATES = [
  { name: "Blank Tumbler Template", desc: "Personalized tumbler — add member name" },
  { name: "Blank Shirt Template", desc: "AZ Off Script logo + First Wave sleeve" },
  { name: "Blank Mug Template", desc: "Personalized mug — add member name" },
  { name: "Blank Badge Template", desc: "Member name + title" },
  { name: "Blank Sticker Template", desc: "Title/edition sticker" },
  { name: "Blank Member Card Template", desc: "Digital member card — name, title, First Wave" },
  { name: "Blank Invite Template", desc: "Welcome to the room invite" },
];

type Tab = "logos" | "mascot" | "colors" | "captions" | "hashtags" | "formats" | "templates";

const TABS: { key: Tab; label: string }[] = [
  { key: "logos", label: "Logos" },
  { key: "mascot", label: "Mascot" },
  { key: "colors", label: "Colors" },
  { key: "captions", label: "Captions" },
  { key: "hashtags", label: "Hashtags" },
  { key: "formats", label: "Formats" },
  { key: "templates", label: "Gear Templates" },
];

export default function BrandLockerPage() {
  const [tab, setTab] = useState<Tab>("logos");
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">Brand Locker</h1>
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Everything approved for AZ Off Script lives here.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-desert-night/10 rounded-full p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-black uppercase whitespace-nowrap ${tab === t.key ? "bg-desert-night text-sunburst-yellow" : "text-desert-night"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOGOS */}
      {tab === "logos" && (
        <div className="space-y-8">
          {/* Wordmark lockups */}
          <div>
            <h2 className="font-display text-2xl text-desert-night mb-1">Wordmark</h2>
            <p className="text-sm text-smoked-charcoal/60 mb-4">
              The official AZ Off Script logo. Use the transparent versions on colored backgrounds, or the boxed versions for posters and gear.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* White text on transparent — for dark backgrounds */}
              <div className="card overflow-hidden">
                <div className="aspect-[3/1] bg-desert-night flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/logos/logo-white.png" alt="AZ Off Script logo — white text, transparent" className="max-h-full max-w-full" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-desert-night text-sm">White · Transparent</p>
                    <p className="text-xs text-smoked-charcoal/60">For dark backgrounds</p>
                  </div>
                  <a href="/assets/logos/logo-white.png" download className="btn btn-ghost btn-sm !text-xs">Download</a>
                </div>
              </div>

              {/* Black text on transparent — for light backgrounds */}
              <div className="card overflow-hidden">
                <div className="aspect-[3/1] bg-sandstone-cream flex items-center justify-center p-4 border-b">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/logos/logo-black.png" alt="AZ Off Script logo — black text, transparent" className="max-h-full max-w-full" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-desert-night text-sm">Black · Transparent</p>
                    <p className="text-xs text-smoked-charcoal/60">For light backgrounds</p>
                  </div>
                  <a href="/assets/logos/logo-black.png" download className="btn btn-ghost btn-sm !text-xs">Download</a>
                </div>
              </div>

              {/* White on black — poster style */}
              <div className="card overflow-hidden">
                <div className="aspect-[3/1] bg-black flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/logos/logo-white-on-black.png" alt="AZ Off Script logo — white on black" className="max-h-full max-w-full" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-desert-night text-sm">White on Black</p>
                    <p className="text-xs text-smoked-charcoal/60">Poster / gear style</p>
                  </div>
                  <a href="/assets/logos/logo-white-on-black.png" download className="btn btn-ghost btn-sm !text-xs">Download</a>
                </div>
              </div>

              {/* Black on white — print friendly */}
              <div className="card overflow-hidden">
                <div className="aspect-[3/1] bg-white flex items-center justify-center p-2 border-b">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/logos/logo-black-on-white.png" alt="AZ Off Script logo — black on white" className="max-h-full max-w-full" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-desert-night text-sm">Black on White</p>
                    <p className="text-xs text-smoked-charcoal/60">Print friendly</p>
                  </div>
                  <a href="/assets/logos/logo-black-on-white.png" download className="btn btn-ghost btn-sm !text-xs">Download</a>
                </div>
              </div>
            </div>
          </div>

          {/* Stacked lockups (square — for avatars / profile pics) */}
          <div>
            <h2 className="font-display text-2xl text-desert-night mb-1">Stacked (Square)</h2>
            <p className="text-sm text-smoked-charcoal/60 mb-4">
              Square version for profile pictures, avatars, and stickers.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { file: "logo-stacked-white.png", label: "White · Transparent", bg: "bg-desert-night" },
                { file: "logo-stacked-black.png", label: "Black · Transparent", bg: "bg-sandstone-cream border-b" },
                { file: "logo-stacked-white-on-black.png", label: "White on Black", bg: "bg-black" },
                { file: "logo-stacked-black-on-white.png", label: "Black on White", bg: "bg-white border-b" },
              ].map((l) => (
                <div key={l.file} className="card overflow-hidden">
                  <div className={`aspect-square ${l.bg} flex items-center justify-center p-3`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/assets/logos/${l.file}`} alt={`AZ Off Script stacked logo — ${l.label}`} className="max-h-full max-w-full" />
                  </div>
                  <div className="p-2 text-center">
                    <p className="font-bold text-desert-night text-xs">{l.label}</p>
                    <a href={`/assets/logos/${l.file}`} download className="text-[10px] text-copper-deep hover:underline">Download</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posters */}
          <div>
            <h2 className="font-display text-2xl text-desert-night mb-3">Posters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["primary", "shades", "peace"] as const).map((p) => (
                <div key={p} className="card overflow-hidden">
                  <div className="aspect-square bg-desert-night/10">
                    <PosterImage poster={p} fill alt={`Poster ${p}`} />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-desert-night text-sm capitalize">{p} Poster</p>
                    <p className="text-xs text-smoked-charcoal/60">Right-click to save</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MASCOT */}
      {tab === "mascot" && (
        <div>
          <h2 className="font-display text-2xl text-desert-night mb-3">Approved Cactus Poses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["main", "shades", "peace"] as const).map((m) => (
              <div key={m} className="card p-4 flex flex-col items-center">
                <div className="h-32 flex items-center justify-center">
                  <MascotImage pose={m} size={120} />
                </div>
                <p className="font-bold text-desert-night text-sm mt-2 capitalize">{m} Mascot</p>
                <p className="text-xs text-smoked-charcoal/60">Transparent PNG</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COLORS */}
      {tab === "colors" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BRAND_COLORS.map((c) => (
            <div key={c.name} className="card overflow-hidden">
              <div
                className="h-24 cursor-pointer"
                style={{ backgroundColor: c.hex }}
                onClick={() => copy(c.hex, c.name)}
                title="Click to copy hex"
              />
              <div className="p-3">
                <p className="font-bold text-desert-night text-sm">{c.name}</p>
                <p className="text-xs text-smoked-charcoal/60 font-mono">
                  {copied === c.name ? "Copied!" : c.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CAPTIONS */}
      {tab === "captions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAPTIONS.map((c, i) => (
            <div key={i} className="card p-5">
              <span className="chip chip-teal !text-[10px] mb-2">{c.tag}</span>
              <p className="font-script text-xl text-desert-night">&ldquo;{c.text}&rdquo;</p>
              <button
                onClick={() => copy(c.text, `caption-${i}`)}
                className="btn btn-secondary btn-sm mt-3"
              >
                {copied === `caption-${i}` ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* HASHTAGS */}
      {tab === "hashtags" && (
        <div className="card p-6">
          <div className="flex flex-wrap gap-3">
            {HASHTAGS.map((h, i) => (
              <button
                key={h}
                onClick={() => copy(h, `tag-${i}`)}
                className={`chip ${copied === `tag-${i}` ? "chip-approved" : "chip-dark"} text-base px-4 py-2`}
              >
                {copied === `tag-${i}` ? "Copied!" : h}
              </button>
            ))}
          </div>
          <button
            onClick={() => copy(HASHTAGS.join(" "), "all-tags")}
            className="btn btn-primary mt-6"
          >
            {copied === "all-tags" ? "All copied!" : "Copy all hashtags"}
          </button>
        </div>
      )}

      {/* CONTENT FORMATS */}
      {tab === "formats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTENT_FORMATS.map((f) => (
            <div key={f.name} className="card p-5">
              <p className="font-display text-lg text-desert-night">{f.name}</p>
              <p className="text-sm text-smoked-charcoal/70 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* GEAR TEMPLATES */}
      {tab === "templates" && (
        <div className="space-y-4">
          <p className="text-sm text-smoked-charcoal/70">
            Blank templates for personalized gear. Vanessa uses these in the Gear Board to create each member&apos;s items.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GEAR_TEMPLATES.map((t) => (
              <div key={t.name} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-desert-night/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <p className="font-bold text-desert-night text-sm">{t.name}</p>
                  <p className="text-xs text-smoked-charcoal/60 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
