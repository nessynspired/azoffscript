"use client";

import { useState, useRef } from "react";
import { MascotImage } from "@/components/MascotImage";

// ===== JOIN FORM DROPDOWN OPTIONS =====

const CAMERA_COMFORT_OPTIONS = [
  "Yes, I'm comfortable",
  "Yes, but I warm up first",
  "Yes, mostly in group videos",
  "Yes, mostly with quick clips",
  "Maybe, I'm nervous but interested",
  "Not sure yet",
  "No, I prefer behind the scenes",
] as const;

const CONTENT_INTEREST_OPTIONS = [
  "Funny trends",
  "Reaction videos",
  "Group games",
  "Hot takes",
  "Comedy skits",
  "Mom-life content",
  "Friendship topics",
  "Dating / relationship topics",
  "Group chat situations",
  "Arizona local humor",
  "Food / taste tests",
  "Beauty / style content",
  "No-talking reaction clips",
  "Facial expression / side-eye clips",
  "Quick yes/no prompts",
  "Bloopers",
  "Random ideas",
  "Not sure yet",
] as const;

const WILLINGNESS_OPTIONS = [
  { value: "yes", label: "Yes, send me the first prompt" },
  { value: "maybe", label: "Maybe, I want to ask questions first" },
  { value: "not_sure", label: "Not sure yet" },
  { value: "no", label: "No, I'm looking for something more guaranteed" },
] as const;

const AVAILABILITY_OPTIONS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekdays after 5 PM",
  "Friday evenings",
  "Saturday mornings",
  "Saturday afternoons",
  "Saturday evenings",
  "Sunday mornings",
  "Sunday afternoons",
  "Sunday evenings",
  "Once a week",
  "Twice a month",
  "Once a month",
  "Flexible with notice",
  "Depends on childcare",
  "Depends on transportation",
] as const;

export function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    socials: "",
    comfortableOnCamera: "",
    contentInterests: [] as string[],
    willingness: "",
    availability: [] as string[],
    anythingElse: "",
  });

  // Anti-spam: honeypot (hidden field bots fill) + time trap (form load timestamp)
  const [honeypot, setHoneypot] = useState("");
  const formLoadedAt = useRef(Date.now());

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: "contentInterests" | "availability", item: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((x) => x !== item)
        : [...prev[key], item],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Client-side anti-spam checks (server also checks)
    // 1. Honeypot — if filled, a bot did it. Pretend success so they don't retry.
    if (honeypot) {
      setSubmitted(true);
      setSubmitting(false);
      return;
    }
    // 2. Time trap — if submitted in under 3 seconds, it's a bot auto-submitting
    const timeOnForm = Date.now() - formLoadedAt.current;
    if (timeOnForm < 3000) {
      setSubmitted(true);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/join/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          _hp: honeypot,           // honeypot field (server validates it's empty)
          _t: formLoadedAt.current, // form load timestamp (server validates elapsed time)
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card p-8 text-center">
        <MascotImage pose="peace" size={100} className="inline-block" />
        <h3 className="font-display text-2xl text-desert-night mt-4">We got your vibe.</h3>
        <p className="text-smoked-charcoal/70 mt-2">
          Thanks for reaching out. If the room feels like a fit, we&apos;ll send you the first prompt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {/* Name */}
      <div>
        <label className="label" htmlFor="join-name">Name</label>
        <input id="join-name" className="field" required value={form.name} onChange={(e) => update("name", e.target.value)} />
      </div>

      {/* City */}
      <div>
        <label className="label" htmlFor="join-city">City</label>
        <input id="join-city" className="field" required placeholder="Phoenix, Tucson, Mesa…" value={form.city} onChange={(e) => update("city", e.target.value)} />
      </div>

      {/* Social handles */}
      <div>
        <label className="label" htmlFor="join-socials">Social handles</label>
        <input id="join-socials" className="field" placeholder="@yourhandle" value={form.socials} onChange={(e) => update("socials", e.target.value)} />
      </div>

      {/* Camera comfort — dropdown */}
      <div>
        <label className="label" htmlFor="join-camera">Are you comfortable on camera?</label>
        <select id="join-camera" className="field" value={form.comfortableOnCamera} onChange={(e) => update("comfortableOnCamera", e.target.value)}>
          <option value="">Select…</option>
          {CAMERA_COMFORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Content interests — multi-select chips */}
      <div>
        <label className="label">What kind of content sounds fun to you?</label>
        <p className="text-xs text-smoked-charcoal/50 mb-2">Pick all that sound fun.</p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleArrayItem("contentInterests", opt)}
              className={`chip ${form.contentInterests.includes(opt) ? "chip-copper" : "chip-cream"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Willingness — dropdown */}
      <div>
        <label className="label" htmlFor="join-willing">Are you willing to try one simple Round 2 drop?</label>
        <select id="join-willing" className="field" value={form.willingness} onChange={(e) => update("willingness", e.target.value)}>
          <option value="">Select…</option>
          {WILLINGNESS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Availability — multi-select chips */}
      <div>
        <label className="label">Availability</label>
        <p className="text-xs text-smoked-charcoal/50 mb-2">Pick all that work for you.</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleArrayItem("availability", opt)}
              className={`chip ${form.availability.includes(opt) ? "chip-copper" : "chip-cream"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Anything we should know — free text */}
      <div>
        <label className="label" htmlFor="join-anything">Anything we should know?</label>
        <textarea
          id="join-anything"
          className="field min-h-[100px]"
          placeholder="Tell us your vibe, boundaries, questions, or anything that would help us know if you fit the room."
          value={form.anythingElse}
          onChange={(e) => update("anythingElse", e.target.value)}
        />
      </div>

      {/* Honeypot — hidden from humans, bots fill it. Never visible. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor="company-website">Company website (leave empty)</label>
        <input
          type="text"
          id="company-website"
          name="company-website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Quick note */}
      <div className="card p-4 bg-sandstone-cream/60 border border-copper-clay/30 text-xs text-smoked-charcoal/70 leading-relaxed space-y-2">
        <p className="font-bold text-desert-night">Quick note:</p>
        <p>
          Submitting this form does not guarantee selection, posting, tagging, payment, personal page
          promotion, partnership, ownership, or a permanent spot.
        </p>
        <p>
          Round 2 starts with a simple content drop. AZ Off Script chooses what fits based on the
          prompt, comfort, chemistry, timing, consistency, and what makes the room stronger.
        </p>
      </div>

      <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? "Sending…" : "Tell Us Your Vibe"}
      </button>
      {error && (
        <p className="text-sm text-copper-deep font-bold text-center">{error}</p>
      )}
    </form>
  );
}
