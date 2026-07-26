import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage, PosterImage } from "@/components/MascotImage";
import { WatchClipsGrid } from "@/components/public/WatchClipsGrid";
import { CONTENT_LANES } from "@/lib/crew-data";

export const metadata: Metadata = {
  title: "Watch AZ Off Script — Arizona Reaction Videos & Group Games",
  description:
    "Watch AZ Off Script clips featuring Arizona women, group games, hot takes, local humor, and off-script moments from across Arizona.",
  alternates: { canonical: "/watch" },
  openGraph: {
    title: "Watch AZ Off Script — Arizona Reaction Videos & Group Games",
    description:
      "Watch AZ Off Script clips featuring Arizona women, group games, hot takes, local humor, and off-script moments from across Arizona.",
    images: [{ url: "/assets/az-off-script-poster-sunglasses-share-desert.png", width: 1024, height: 1024, alt: "AZ Off Script Arizona reaction videos" }],
  },
};

export default function WatchPage() {
  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Watch", url: "/watch" }]} />
      <PublicNav />

      {/* Header with sunglasses poster */}
      <section className="relative pt-32 md:pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <PosterImage poster="shades" fill alt="AZ Off Script watch page" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <h1 className="font-display text-3xl md:text-6xl text-desert-night leading-tight">
            Watch AZ Off Script
          </h1>
          <p className="text-lg md:text-xl text-smoked-charcoal/80 mt-4 max-w-2xl">
            Start here. Hot takes, group games, Arizona moments, and clips that made the room react
            before anyone could act normal.
          </p>
        </div>
      </section>

      {/* Live clips grid (client component, fetches from Supabase) */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <WatchClipsGrid />
        </div>
      </section>

      {/* Content lane previews */}
      <section className="py-16 px-4 bg-desert-night">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-sandstone-cream mb-8">
            What you&apos;ll find here
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTENT_LANES.map((lane) => (
              <div key={lane.number} className="card p-5 bg-sandstone-cream">
                <h3 className="font-display text-lg text-desert-night">{lane.name}</h3>
                <p className="text-cactus-teal font-bold text-sm mt-1">{lane.tagline}</p>
                <p className="text-sm text-smoked-charcoal/70 mt-2">{lane.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="flex justify-center mb-6">
          <MascotImage pose="shades" size={100} />
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-desert-night">
          Want to be in the room?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link href="/join" className="btn btn-primary btn-lg">Be in the Room</Link>
          <Link href="/collabs" className="btn btn-secondary btn-lg">Work With Us</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
