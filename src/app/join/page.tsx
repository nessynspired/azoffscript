import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage } from "@/components/MascotImage";
import { JoinForm } from "@/components/public/JoinForm";

export const metadata: Metadata = {
  title: "Be in the Room — AZ Off Script Round 2 Interest Form",
  description:
    "Interested in joining AZ Off Script? Tell us your vibe, content comfort level, availability, and how you could fit the room.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Be in the Room — AZ Off Script Round 2 Interest Form",
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
          <span className="chip chip-copper mb-6">Be in the Room</span>
          <h1 className="font-display text-3xl md:text-6xl text-desert-night leading-tight">
            Think you fit<br />the room?
          </h1>
          <p className="text-xl text-smoked-charcoal/80 mt-6 max-w-2xl mx-auto leading-relaxed">
            AZ Off Script started as women wanting to get together, make quick videos, laugh, try
            trends, react to random prompts, do funny skits, talk mom-life, and create without
            overthinking everything.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            Now we&apos;re building that same energy under AZ Off Script.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            Round 1 already started, and Round 2 is opening slowly and intentionally.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            We are not trying to pack the room with everybody. Too many people and nobody knows
            who&apos;s who. We&apos;re keeping it small on purpose so the personalities actually
            stand out.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            We&apos;re looking for women who bring something real to the room — funny, quiet,
            blunt, polished, chaotic, calm, stylish, thoughtful, unexpected, or just naturally fun
            to watch.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            Some women may be featured on camera. Some may drop quick reaction clips. Some may join
            a filming day. Some may bring ideas or prompts. Some may be saved for a future round.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            You do not have to be an influencer. You do not have to be loud. You just have to be
            real, respectful, and actually want to have fun with it.
          </p>
          <p className="text-base text-smoked-charcoal/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Right now, AZ Off Script is focused on the women-led room. As the brand grows, it may
            expand into future waves, couples, mixed groups, local features, and other Arizona
            creator lanes.
          </p>
          <p className="text-base text-smoked-charcoal/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Tell us your vibe. We&apos;ll reach out if there&apos;s a fit for this round, a guest
            feature, or a future one.
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
