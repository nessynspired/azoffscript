"use client";

import Link from "next/link";
import { InfoTooltip } from "@/components/InfoTooltip";

interface GrowthDoc {
  href: string;
  number: number;
  title: string;
  icon: string;
  description: string;
  status: "built" | "planned";
}

const GROWTH_DOCS: GrowthDoc[] = [
  {
    href: "/portal/growth/market-gaps",
    number: 1,
    title: "Market Gap Intelligence",
    icon: "🎯",
    description: "Where the market is crowded, where opportunities exist, and how AZ Off Script enters differently. Saturated markets, white space opportunities, and the anti-brand list.",
    status: "built",
  },
  {
    href: "/portal/growth/hooks",
    number: 2,
    title: "Hook Library",
    icon: "🪝",
    description: "The first 1-3 seconds. Not trends — hooks that work repeatedly. Curiosity, debate, identity, emotional, pattern interrupt, local, story, and challenge hooks.",
    status: "built",
  },
  {
    href: "/portal/growth/captions",
    number: 3,
    title: "Caption Frameworks",
    icon: "📝",
    description: "Not individual captions — frameworks. The formulas stay, the examples rotate. Debate, community, relatable, story, identity, brand, curiosity, emotional, funny, and challenge frameworks.",
    status: "built",
  },
  {
    href: "/portal/growth/prompts",
    number: 4,
    title: "Prompt Intelligence",
    icon: "💡",
    description: "The massive idea engine. Organized by category and sub-topic. Women, men, dating, friendship, Arizona, parenting, adulting, deep conversations, texting, family, and more.",
    status: "built",
  },
  {
    href: "/portal/growth/search",
    number: 5,
    title: "Search Keyword Intelligence",
    icon: "🔍",
    description: "Search keywords organized by category. Local SEO, community search, relationship search, parenting search. Performance tracked so fading keywords get archived.",
    status: "built",
  },
  {
    href: "/portal/growth/trends",
    number: 6,
    title: "Trend Capture System",
    icon: "📈",
    description: "Not 'here are trends' but 'how do we evaluate trends?' Each trend gets: why it works, why people watch, AZ Off Script adaptation, and a Keep/Modify/Ignore decision.",
    status: "built",
  },
  {
    href: "/portal/growth/seasonal",
    number: 7,
    title: "Seasonal Opportunities",
    icon: "📅",
    description: "Timing matters. Arizona summer, back to school, holidays, new year, Valentine's Day, Mother's Day, spring. Each season has prompt ideas, best formats, and timing notes.",
    status: "built",
  },
  {
    href: "/portal/growth/do-not-chase",
    number: 8,
    title: "Do Not Chase Rules",
    icon: "🚫",
    description: "What we refuse to become and why. The anti-brand rules that protect AZ Off Script's identity. Each rule has: what to avoid, why, what to do instead, and severity.",
    status: "built",
  },
  {
    href: "/portal/growth/brand-moat",
    number: 9,
    title: "Brand Moat Library",
    icon: "🛡️",
    description: "Why should someone choose AZ Off Script instead of the thousands of other pages? The things nobody can copy: formats, personality structure, community feeling, recurring segments, signature language, recognizable patterns.",
    status: "built",
  },
];

export default function GrowthHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-desert-night">Growth Intelligence System</h1>
        <InfoTooltip text="9 master documents that make up the AZ Off Script growth strategy. Not just captions and hashtags — this protects the brand identity and answers: how do we make sure people find us AND remember us?" />
        <p className="text-smoked-charcoal/70 mt-2">
          The question is not &ldquo;what is trending?&rdquo; but &ldquo;what is trending that we can make uniquely AZ Off Script?&rdquo;
        </p>
      </div>

      {/* Strategy explainer */}
      <div className="card p-5 bg-sandstone-cream/50">
        <p className="font-display text-lg text-desert-night">This system is different from the production libraries</p>
        <p className="text-sm text-smoked-charcoal/70 mt-2 leading-relaxed">
          The production libraries (content formats, transitions, recording styles, editing recipes) are built once.
          The Growth Intelligence System is a living system that protects the brand identity while driving discovery.
          It&apos;s not just captions and hashtags — it&apos;s market gaps, brand moats, hooks, and the rules about what we refuse to chase.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl">🎯</p>
            <p className="text-xs font-bold text-desert-night mt-1">Market Gaps</p>
            <p className="text-[10px] text-smoked-charcoal/50">Where we differ</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl">🛡️</p>
            <p className="text-xs font-bold text-desert-night mt-1">Brand Moat</p>
            <p className="text-[10px] text-smoked-charcoal/50">What can't be copied</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl">🚫</p>
            <p className="text-xs font-bold text-desert-night mt-1">Don't Chase</p>
            <p className="text-[10px] text-smoked-charcoal/50">What we avoid</p>
          </div>
        </div>
      </div>

      {/* Document cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GROWTH_DOCS.map((doc) => (
          <Link
            key={doc.number}
            href={doc.href}
            className="card p-5 space-y-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{doc.icon}</span>
              <div>
                <p className="text-[10px] text-smoked-charcoal/40 font-bold uppercase">Document {doc.number}</p>
                <p className="font-display text-lg text-desert-night leading-tight">{doc.title}</p>
              </div>
            </div>
            <p className="text-sm text-smoked-charcoal/70">{doc.description}</p>
            <p className="text-xs text-copper-clay font-bold">Open →</p>
          </Link>
        ))}
      </div>

      {/* Back to portal */}
      <div className="pt-4">
        <Link href="/portal/lobby" className="btn btn-ghost btn-sm">← Back to Lobby</Link>
      </div>
    </div>
  );
}
