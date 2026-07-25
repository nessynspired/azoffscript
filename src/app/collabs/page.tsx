import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage } from "@/components/MascotImage";
import { CollabForm } from "@/components/public/CollabForm";

export const metadata: Metadata = {
  title: "Work With AZ Off Script — Arizona Creator Collabs",
  description:
    "Partner with AZ Off Script for local Arizona creator content, reaction videos, sponsored clips, event coverage, and social media collaborations.",
  alternates: { canonical: "/collabs" },
  openGraph: {
    title: "Work With AZ Off Script — Arizona Creator Collabs",
    description:
      "Partner with AZ Off Script for local Arizona creator content, reaction videos, sponsored clips, event coverage, and social media collaborations.",
  },
};

const COLLAB_TYPES = [
  {
    title: "Local Arizona Spots",
    description: "Restaurants, coffee shops, boutiques, salons, family places, events, pop-ups.",
    icon: "main" as const,
  },
  {
    title: "Products the Room Can React To",
    description: "Taste tests, try-ons, games, gift boxes, mom-life products, beauty, lifestyle, local finds.",
    icon: "shades" as const,
  },
  {
    title: "Sponsored Content",
    description: "Short-form clips, group reactions, challenge videos, event coverage, product moments.",
    icon: "main" as const,
  },
  {
    title: "Community Features",
    description: "Local stories, Arizona businesses, hidden gems, 'Arizona tried it' segments.",
    icon: "peace" as const,
  },
];

export default function CollabsPage() {
  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Collabs", url: "/collabs" }]} />
      <PublicNav />

      {/* Header */}
      <section className="pt-32 md:pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="chip chip-teal mb-6">Collabs & Brands</span>
          <h1 className="font-display text-4xl md:text-6xl text-desert-night leading-tight">
            Put your brand<br />in the room.
          </h1>
          <p className="text-xl text-smoked-charcoal/80 mt-6 max-w-2xl mx-auto leading-relaxed">
            AZ Off Script creates short-form content with real reactions, local Arizona energy, and
            group chemistry. For local businesses, events, products, and brands, that means your
            offer does not have to feel like an ad. It can become part of a conversation people
            actually want to watch.
          </p>
        </div>
      </section>

      {/* Good-fit collabs */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl text-desert-night mb-6 text-center">
            Good-fit collabs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {COLLAB_TYPES.map((type) => (
              <div key={type.title} className="card p-6 flex items-start gap-4">
                <MascotImage pose={type.icon} size={60} className="shrink-0" />
                <div>
                  <h3 className="font-display text-xl text-desert-night">{type.title}</h3>
                  <p className="text-sm text-smoked-charcoal/70 mt-2">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclosure note */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-5 bg-copper-deep/10 border border-copper-clay/30">
            <p className="text-sm text-desert-night">
              <strong>Sponsored content will always be clearly disclosed.</strong> If money, free
              products, affiliate codes, or other brand relationships are involved, that relationship
              needs to be obvious to viewers.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-desert-night">
              Bring it to the room.
            </h2>
            <p className="text-smoked-charcoal/70 mt-2">Tell us about your brand or business.</p>
          </div>
          <CollabForm />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
