import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage } from "@/components/MascotImage";
import { JoinForm } from "@/components/public/JoinForm";

export const metadata: Metadata = {
  title: "Join AZ Off Script — Arizona Creator Interest Form",
  description:
    "Interested in joining AZ Off Script? Tell us your vibe, content comfort level, availability, and how you could fit the room.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Join AZ Off Script — Arizona Creator Interest Form",
    description:
      "Interested in joining AZ Off Script? Tell us your vibe, content comfort level, availability, and how you could fit the room.",
  },
};

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Join", url: "/join" }]} />
      <PublicNav />

      <section className="pt-32 md:pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="chip chip-copper mb-6">Join the Crew</span>
          <h1 className="font-display text-4xl md:text-6xl text-desert-night leading-tight">
            Think you fit<br />the room?
          </h1>
          <p className="text-xl text-smoked-charcoal/80 mt-6 max-w-2xl mx-auto leading-relaxed">
            AZ Off Script is building slowly and intentionally. We are not looking for everybody.
            We are looking for people who bring something real to the room — funny, quiet, blunt,
            polished, chaotic, calm, stylish, thoughtful, or completely unexpected.
          </p>
          <p className="text-base text-smoked-charcoal/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Right now, we are growing the women-led First Wave, but AZ Off Script may expand into
            future waves, couples, mixed groups, local features, and other Arizona creator lanes.
          </p>
          <p className="text-base text-smoked-charcoal/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Tell us your vibe. We&apos;ll reach out if there&apos;s a fit for this wave or a future one.
          </p>
          <div className="flex justify-center mt-8">
            <MascotImage pose="peace" size={100} />
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-desert-night">Tell us your vibe.</h2>
          </div>
          <JoinForm />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
