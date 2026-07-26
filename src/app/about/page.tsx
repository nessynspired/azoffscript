import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage, PosterImage } from "@/components/MascotImage";

export const metadata: Metadata = {
  title: "About AZ Off Script — Arizona, Our Way",
  description:
    "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content for TikTok, Instagram Reels, Facebook, and YouTube Shorts. Built to grow across Arizona, AZ Off Script is centered on real reactions, group chemistry, local personality, and off-script moments people want to share.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About AZ Off Script — Arizona, Our Way",
    description:
      "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content for TikTok, Instagram Reels, Facebook, and YouTube Shorts. Built to grow across Arizona, AZ Off Script is centered on real reactions, group chemistry, local personality, and off-script moments people want to share.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "About", url: "/about" }]} />
      <PublicNav />

      <section className="pt-32 md:pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-6xl text-desert-night leading-tight">
            About AZ Off Script
          </h1>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card p-6">
            <p className="text-lg text-desert-night leading-relaxed">
              AZ Off Script started with a simple idea: Arizona has personality, and the best
              content does not always come from one person talking alone. Sometimes it comes from
              the room.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-lg text-desert-night leading-relaxed">
              AZ Off Script is an Arizona creator brand built around real reactions, group games,
              hot takes, local humor, quick trend remixes, and off-script moments.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-lg text-desert-night leading-relaxed">
              The First Wave is our first women-led creator room — the group that showed up first,
              shaped the vibe, and helped turn the idea into something real. Different
              personalities, different timing, same room.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-lg text-desert-night leading-relaxed">
              As AZ Off Script grows, the brand may expand into more Arizona voices, more
              backgrounds, more cities, more formats, and future waves — including women, couples,
              mixed groups, local features, and other creator lanes.
            </p>
          </div>

          <div className="card p-6 bg-copper-clay/10 border-l-4 border-copper-clay">
            <p className="font-display text-2xl text-desert-night leading-tight">
              The group chat got a camera — and nobody is reading from a script.
            </p>
            <p className="font-display text-2xl text-desert-night leading-tight mt-2">
              Different people. Same room. Arizona, our way.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-lg text-desert-night leading-relaxed">
              The goal is to create content people recognize themselves in — the kind of clip you
              send to a friend because somebody finally said it out loud. Not about one type of
              person, but about what happens when different Arizona personalities get the same
              prompt and nobody answers the same way.
            </p>
          </div>

          <div className="flex justify-center py-6">
            <MascotImage pose="main" size={120} />
          </div>
        </div>
      </section>

      {/* Brand values */}
      <section className="py-12 px-4 bg-desert-night">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-sandstone-cream text-center mb-8">
            What we believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 bg-sandstone-cream">
              <p className="font-display text-lg text-desert-night">The best moment is usually the one nobody planned.</p>
            </div>
            <div className="card p-5 bg-sandstone-cream">
              <p className="font-display text-lg text-desert-night">If it makes the room react, it belongs here.</p>
            </div>
            <div className="card p-5 bg-sandstone-cream">
              <p className="font-display text-lg text-desert-night">Arizona born. Arizona real.</p>
            </div>
            <div className="card p-5 bg-sandstone-cream">
              <p className="font-display text-lg text-desert-night">We catch the moment before everyone acts normal again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-desert-night">
          Ready to get off script?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link href="/watch" className="btn btn-primary btn-lg">Watch the Vibe</Link>
          <Link href="/join" className="btn btn-secondary btn-lg">Be in the Room</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
