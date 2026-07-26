"use client";

import { useState } from "react";
import { MascotImage } from "@/components/MascotImage";

const ROLES = [
  "On camera talking / giving opinions",
  "Facial reactions / side-eye",
  "Quick yes-or-no answers",
  "Group videos",
  "Solo clips from home",
  "Funny trends",
  "Mom-life content",
  "Comedy skits",
  "Ideas, prompts, or trends",
  "Filming or behind the scenes",
  "Planning or organizing",
  "Still figuring it out",
];

const LANES = [
  "Women's Round 2 room",
  "Guest appearance",
  "Behind the scenes",
  "Couples content later",
  "Local business / community feature",
  "Future AZ Off Script wave",
];

const GUEST_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe, explain it to me" },
  { value: "no", label: "No, I only want to join if I'm a main recurring face" },
];

const POSTING_OPTIONS = [
  { value: "yes", label: "Yes, I understand the brand chooses what fits" },
  { value: "maybe", label: "Maybe, I want to understand the process" },
  { value: "no", label: "No, I only want to participate if my clips are guaranteed to post" },
];

export function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", city: "", socials: "", comfortableOnCamera: "",
    contentType: "", roles: [] as string[], availability: "",
    boundaries: "", why: "", lane: "",
    guestOrRecurring: "", clipsNotGuaranteed: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRole(role: string) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/join/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          Thanks for reaching out. If the room feels like a fit, we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label" htmlFor="join-name">Name</label>
        <input id="join-name" className="field" required value={form.name} onChange={(e) => update("name", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="join-city">City</label>
        <input id="join-city" className="field" required placeholder="Phoenix, Tucson, Mesa…" value={form.city} onChange={(e) => update("city", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="join-socials">Social handles</label>
        <input id="join-socials" className="field" placeholder="@yourhandle" value={form.socials} onChange={(e) => update("socials", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="join-camera">Are you comfortable on camera?</label>
        <select id="join-camera" className="field" value={form.comfortableOnCamera} onChange={(e) => update("comfortableOnCamera", e.target.value)}>
          <option value="">Select…</option>
          <option value="yes">Yes, bring it on</option>
          <option value="somewhat">Somewhat — warming up to it</option>
          <option value="no">Not yet — prefer behind the scenes</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="join-content">What kind of content would you actually enjoy?</label>
        <textarea id="join-content" className="field min-h-[80px]" placeholder="Hot takes, games, reactions…" value={form.contentType} onChange={(e) => update("contentType", e.target.value)} />
      </div>
      <div>
        <label className="label">What feels most like you?</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`chip ${form.roles.includes(role) ? "chip-copper" : "chip-cream"}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="join-avail">Availability</label>
        <input id="join-avail" className="field" placeholder="Weekdays after 5, weekends…" value={form.availability} onChange={(e) => update("availability", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="join-boundaries">Boundaries (optional)</label>
        <input id="join-boundaries" className="field" placeholder="Things to avoid" value={form.boundaries} onChange={(e) => update("boundaries", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="join-why">Why does this interest you?</label>
        <textarea id="join-why" className="field min-h-[80px]" value={form.why} onChange={(e) => update("why", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="join-lane">Which lane are you interested in?</label>
        <select id="join-lane" className="field" value={form.lane} onChange={(e) => update("lane", e.target.value)}>
          <option value="">Select…</option>
          {LANES.map((lane) => (
            <option key={lane} value={lane}>{lane}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="join-guest">Are you okay starting as a guest or featured face before becoming recurring?</label>
        <select id="join-guest" className="field" value={form.guestOrRecurring} onChange={(e) => update("guestOrRecurring", e.target.value)}>
          <option value="">Select…</option>
          {GUEST_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="join-posting">Are you okay submitting clips without every clip being posted?</label>
        <select id="join-posting" className="field" value={form.clipsNotGuaranteed} onChange={(e) => update("clipsNotGuaranteed", e.target.value)}>
          <option value="">Select…</option>
          {POSTING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="card p-4 bg-sandstone-cream/60 border border-copper-clay/30 text-xs text-smoked-charcoal/70 leading-relaxed space-y-2">
        <p className="font-bold text-desert-night">A quick note:</p>
        <p>
          Submitting this form does not guarantee selection, posting, tagging, payment, personal page
          promotion, partnership, ownership, or a permanent recurring spot.
        </p>
        <p>
          AZ Off Script chooses what gets posted based on brand fit, comfort, chemistry, timing,
          consistency, and what makes the room stronger.
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
