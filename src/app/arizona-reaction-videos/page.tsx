import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage } from "@/components/MascotImage";
import { CONTENT_LANES, CREW } from "@/lib/crew-data";
import { WatchClipsGrid } from "@/components/public/WatchClipsGrid";

export const metadata: Metadata = {
  title: "Arizona Reaction Videos & Group Games — AZ Off Script",
  description:
    "AZ Off Script creates Arizona reaction videos, group games, hot takes, and local short-form content featuring a women-led creator crew from Arizona.",
  alternates: { canonical: "/arizona-reaction-videos" },
  openGraph: {
    title: "Arizona Reaction Videos & Group Games — AZ Off Script",
    description:
      "AZ Off Script creates Arizona reaction videos, group games, hot takes, and local short-form content featuring a women-led creator crew from Arizona.",
  },
};

export default function ArizonaReactionVideosPage() {
  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Arizona Reaction Videos", url: "/arizona-reaction-videos" }]} />
      <PublicNav />

      <section className="pt-32 md:pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl text-desert-night leading-tight">
            Arizona Reaction Videos<br />& Group Games
          </h1>
          <p className="text-lg md:text-xl text-smoked-charcoal/80 mt-6 max-w-3xl leading-relaxed">
            AZ Off Script creates Arizona reaction videos, group games, hot takes, and local
            short-form content featuring a women-led creator crew from Arizona. Our clips
            are built around real reactions, funny questions, social debates, and off-script moments
            that feel like the group chat came to life.
          </p>
        </div>
      </section>

      {/* What are Arizona reaction videos? */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-4">
            What are Arizona reaction videos?
          </h2>
          <p className="text-lg text-smoked-charcoal/80 leading-relaxed">
            Arizona reaction videos are short-form clips where a group of people react to a
            question, situation, or prompt in real time. AZ Off Script&apos;s Arizona reaction
            videos feature women creators from Arizona debating dating red
            flags, playing group games, sharing hot takes about Arizona life, and catching the
            moments that happen before anyone can act normal again.
          </p>
        </div>
      </section>

      {/* Popular formats */}
      <section className="py-12 px-4 bg-desert-night">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-sandstone-cream mb-6">
            Popular AZ Off Script formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTENT_LANES.map((lane) => (
              <div key={lane.number} className="card p-5 bg-sandstone-cream">
                <h3 className="font-display text-lg text-desert-night">{lane.name}</h3>
                <p className="text-cactus-teal font-bold text-sm mt-1">{lane.tagline}</p>
                <p className="text-sm text-smoked-charcoal/70 mt-2">{lane.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {lane.searchPhrases.map((phrase) => (
                    <span key={phrase} className="chip chip-cream !text-[10px]">{phrase}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Watch latest clips */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-6">
            Watch latest clips
          </h2>
          <WatchClipsGrid />
        </div>
      </section>

      {/* Meet the First Wave */}
      <section className="py-12 px-4 bg-sandstone-cream/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-6">
            Meet the First Wave
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CREW.map((member) => (
              <div key={member.slug} className="card p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-copper-clay/20 flex items-center justify-center mx-auto">
                  <span className="font-display text-lg text-copper-clay">
                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <p className="font-bold text-desert-night text-sm mt-2">{member.name}</p>
                <p className="text-xs text-cactus-teal font-bold">{member.title}</p>
              </div>
            ))}
          </div>
          <Link href="/crew" className="btn btn-secondary mt-6">Meet the Full Crew</Link>
        </div>
      </section>

      {/* Work with us */}
      <section className="py-12 px-4 text-center">
        <div className="flex justify-center mb-4">
          <MascotImage pose="shades" size={80} />
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-desert-night">Work with us</h2>
        <p className="text-smoked-charcoal/70 mt-2 max-w-xl mx-auto">
          Local Arizona businesses, brands, and products — put your brand in the room.
        </p>
        <Link href="/collabs" className="btn btn-primary mt-6">Work With AZ Off Script</Link>
      </section>

      {/* Submit a local idea */}
      <section className="py-12 px-4 bg-desert-night text-center">
        <h2 className="font-display text-2xl md:text-3xl text-sandstone-cream">
          Submit a local idea
        </h2>
        <p className="text-sandstone-cream/70 mt-2 max-w-xl mx-auto">
          Got an Arizona hot take, a local moment, or a group game question? Drop it in the
          room.
        </p>
        <Link href="/join" className="btn btn-primary mt-6">Tell Us Your Vibe</Link>
      </section>

      <PublicFooter />
    </div>
  );
}
