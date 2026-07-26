import type { Metadata } from "next";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { MascotImage } from "@/components/MascotImage";
import { JoinForm } from "@/components/public/JoinForm";

export const metadata: Metadata = {
  title: "AZ Off Script — Round 2 Drop Form",
  description:
    "Round 2 is opening. We pick the prompt, you send your version, we see how the room feels together. Tell us your vibe.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "AZ Off Script — Round 2 Drop Form",
    description:
      "Round 2 is opening. We pick the prompt, you send your version, we see how the room feels together. Tell us your vibe.",
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
          <span className="chip chip-copper mb-6">Round 2 is opening</span>
          <h1 className="font-display text-3xl md:text-6xl text-desert-night leading-tight">
            Think your vibe<br />fits the room?
          </h1>
          <p className="text-xl text-smoked-charcoal/80 mt-6 max-w-2xl mx-auto leading-relaxed">
            AZ Off Script started with a simple idea: women getting together, making quick videos,
            laughing, trying trends, reacting to random prompts, doing funny skits, talking mom-life,
            and creating without overthinking everything.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            Now we&apos;re building that same energy under AZ Off Script.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            Round 1 already started, and Round 2 is opening.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            We&apos;re keeping the room small on purpose because too many people and nobody knows
            who&apos;s who.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed font-bold">
            For Round 2, we&apos;ll start simple:
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-2 max-w-2xl mx-auto leading-relaxed">
            We pick the prompt.<br />
            You send your version.<br />
            We see how the room feels together.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            You do not have to be an influencer.<br />
            You do not have to be loud.<br />
            You do not have to be perfect.
          </p>
          <p className="text-base text-smoked-charcoal/80 mt-4 max-w-2xl mx-auto leading-relaxed">
            You just have to be real, fun, respectful, and willing to show up.
          </p>
          <p className="text-lg text-copper-deep font-bold mt-6 max-w-2xl mx-auto leading-relaxed">
            Tell us your vibe below.
          </p>
          <div className="flex justify-center mt-8">
            <MascotImage pose="peace" size={100} />
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-desert-night">Round 2 Drop Form</h2>
          </div>
          <JoinForm />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
