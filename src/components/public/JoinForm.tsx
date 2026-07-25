"use client";

import { useState } from "react";
import { MascotImage } from "@/components/MascotImage";

const ROLES = ["On camera", "Ideas", "Filming", "Editing", "Planning", "Behind the scenes"];

export function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", city: "", socials: "", comfortableOnCamera: "",
    contentType: "", roles: [] as string[], availability: "",
    boundaries: "", why: "",
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
        <label className="label">What role fits you best?</label>
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
      <button type="submit" className="btn btn-primary btn-lg w-full">Tell Us Your Vibe</button>
    </form>
  );
}
