"use client";

import { useState } from "react";
import { MascotImage } from "@/components/MascotImage";

export function CollabForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: "", city: "", whatToFeature: "", productEvent: "",
    timeline: "", budget: "", socials: "", contact: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Store as activity log entry via Supabase (or just show success for now)
    // In production this would save to a collab_requests table or send an email
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card p-8 text-center">
        <MascotImage pose="shades" size={100} className="inline-block" />
        <h3 className="font-display text-2xl text-desert-night mt-4">We got it.</h3>
        <p className="text-smoked-charcoal/70 mt-2">
          Thanks for reaching out. We&apos;ll be in touch about bringing your brand into the room.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label" htmlFor="biz-name">Business name</label>
        <input id="biz-name" className="field" required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="biz-city">City</label>
        <input id="biz-city" className="field" required placeholder="Phoenix, Tucson, Mesa, Goodyear…" value={form.city} onChange={(e) => update("city", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="biz-feature">What do you want featured?</label>
        <input id="biz-feature" className="field" required placeholder="Product, event, service, location…" value={form.whatToFeature} onChange={(e) => update("whatToFeature", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="biz-type">Product / event / service</label>
        <input id="biz-type" className="field" value={form.productEvent} onChange={(e) => update("productEvent", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="biz-timeline">Timeline</label>
          <input id="biz-timeline" className="field" placeholder="ASAP, next month…" value={form.timeline} onChange={(e) => update("timeline", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="biz-budget">Budget range</label>
          <input id="biz-budget" className="field" placeholder="$500–$1k, $1k–$5k…" value={form.budget} onChange={(e) => update("budget", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="biz-socials">Social handles</label>
        <input id="biz-socials" className="field" placeholder="@yourbusiness on IG/TikTok/FB" value={form.socials} onChange={(e) => update("socials", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="biz-contact">Contact info</label>
        <input id="biz-contact" className="field" required placeholder="Email or phone" value={form.contact} onChange={(e) => update("contact", e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary btn-lg w-full">Bring it to the room</button>
    </form>
  );
}
