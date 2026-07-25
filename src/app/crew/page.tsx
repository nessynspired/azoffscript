import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { PosterImage, MascotImage } from "@/components/MascotImage";
import { CREW, CREW_NAMES_SHORT } from "@/lib/crew-data";

export const metadata: Metadata = {
  title: "Meet the AZ Off Script First Wave",
  description:
    "Meet the First Wave behind AZ Off Script, a women-led Arizona creator crew built around real reactions, personality, and group chemistry.",
  alternates: { canonical: "/crew" },
  openGraph: {
    title: "Meet the AZ Off Script First Wave",
    description:
      "Meet the First Wave behind AZ Off Script, a women-led Arizona creator crew built around real reactions, personality, and group chemistry.",
    images: [{ url: "/assets/az-off-script-poster-peace-sign-desert.png", width: 1024, height: 1024, alt: "AZ Off Script First Wave crew" }],
  },
};

export default function CrewPage() {
  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Crew", url: "/crew" }]} />
      <PublicNav />

      {/* Header with peace poster */}
      <section className="relative pt-32 md:pt-24 pb-12 overflow-hidden bg-desert-night">
        <div className="absolute inset-0 opacity-25">
          <PosterImage poster="peace" fill alt="AZ Off Script First Wave crew poster" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <span className="chip chip-yellow mb-4">First Wave</span>
          <h1 className="font-display text-3xl md:text-6xl text-sandstone-cream leading-tight">
            Meet the First Wave
          </h1>
          <p className="text-lg md:text-xl text-sandstone-cream/80 mt-4 max-w-2xl">
            The First Wave is the original women-led AZ Off Script room — different personalities,
            different timing, same brand. Some bring the hot take. Some bring the calm. Some catch
            the face everyone else missed. That&apos;s the point.
          </p>
          <p className="text-base text-sandstone-cream/60 mt-3 max-w-2xl">
            This is not a cast trying to act perfect. It&apos;s a room full of real reactions,
            Arizona energy, group games, quick prompts, and off-script moments.
          </p>
        </div>
      </section>

      {/* Crew cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CREW.map((member, i) => (
              <div
                key={member.slug}
                className={`card p-6 ${i % 3 === 0 ? "sticker" : i % 3 === 1 ? "sticker-right" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-copper-clay/20 flex items-center justify-center shrink-0">
                    <span className="font-display text-2xl text-copper-clay">
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl text-desert-night leading-none">{member.name}</h2>
                    <p className="text-cactus-teal font-bold text-sm mt-1">{member.title}</p>
                  </div>
                </div>
                <p className="text-sm text-smoked-charcoal/80 mt-4">{member.description}</p>
                <div className="flex flex-wrap gap-1 mt-4">
                  {member.tags.map((tag) => (
                    <span key={tag} className="chip chip-cream !text-[10px]">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-smoked-charcoal/60 mt-10 max-w-2xl mx-auto">
            {CREW_NAMES_SHORT}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center bg-desert-night">
        <div className="flex justify-center mb-6">
          <MascotImage pose="peace" size={100} />
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-sandstone-cream">
          Want to join the room?
        </h2>
        <p className="text-sandstone-cream/70 mt-3 max-w-xl mx-auto">
          We&apos;re building slowly and intentionally. If you have presence, timing, and energy
          that makes a room better, tell us your vibe.
        </p>
        <Link href="/join" className="btn btn-primary btn-lg mt-6">Think You Fit the Room?</Link>
      </section>

      <PublicFooter />
    </div>
  );
}
