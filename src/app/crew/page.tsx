import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrganizationSchema, BreadcrumbSchema } from "@/components/public/StructuredData";
import { PosterImage, MascotImage } from "@/components/MascotImage";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Meet the AZ Off Script Crew",
  description:
    "Meet the crew behind AZ Off Script, a women-led Arizona creator crew built around real reactions, personality, and group chemistry.",
  alternates: { canonical: "/crew" },
  openGraph: {
    title: "Meet the AZ Off Script Crew",
    description:
      "Meet the crew behind AZ Off Script, a women-led Arizona creator crew built around real reactions, personality, and group chemistry.",
    images: [{ url: "/assets/az-off-script-poster-peace-sign-desert.png", width: 1024, height: 1024, alt: "AZ Off Script crew" }],
  },
};

export const dynamic = "force-dynamic";

interface PublicCrewMember {
  id: string;
  name: string;
  nickname: string | null;
  public_bio: string | null;
  slug: string | null;
  display_order: number;
  first_wave: boolean;
  photo_url: string | null;
  card_image: string | null;
  gear_image: string | null;
  favorite_content: string[] | null;
}

async function getPublicCrew(): Promise<{ crew: PublicCrewMember[]; crewNames: string }> {
  try {
    const supabase = await createClient();

    const [crewRes, settingsRes] = await Promise.all([
      supabase
        .from("members")
        .select("id, name, nickname, public_bio, slug, display_order, first_wave, photo_url, card_image, gear_image, favorite_content")
        .eq("public_visible", true),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "crew_sort_mode")
        .single(),
    ]);

    const sortMode = settingsRes.data?.value ?? "manual";
    let crew = (crewRes.data ?? []) as PublicCrewMember[];

    if (sortMode === "manual") {
      crew = [...crew].sort((a, b) => a.display_order - b.display_order);
    } else if (sortMode === "alpha") {
      crew = [...crew].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      crew = [...crew].sort((a, b) => a.display_order - b.display_order);
    }

    const names = crew.map((m) => m.name);
    const crewNames = names.length > 0
      ? names.length === 1
        ? `${names[0]} is the AZ Off Script room — a mix of real reactions, hot takes, calm energy, funny timing, and Arizona personality.`
        : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]} are the AZ Off Script room — a mix of real reactions, hot takes, calm energy, funny timing, and Arizona personality.`
      : "";

    return { crew, crewNames };
  } catch {
    return { crew: [], crewNames: "" };
  }
}

export default async function CrewPage() {
  const { crew, crewNames } = await getPublicCrew();

  return (
    <div className="min-h-screen bg-sandstone-cream">
      <OrganizationSchema />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Crew", url: "/crew" }]} />
      <PublicNav />

      {/* Header with peace poster */}
      <section className="relative pt-32 md:pt-24 pb-12 overflow-hidden bg-desert-night">
        <div className="absolute inset-0 opacity-25">
          <PosterImage poster="peace" fill alt="AZ Off Script crew poster" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <h1 className="font-display text-3xl md:text-6xl text-sandstone-cream leading-tight">
            Meet the Crew
          </h1>
          <p className="text-lg md:text-xl text-sandstone-cream/80 mt-4 max-w-2xl">
            The AZ Off Script crew is a women-led Arizona creator room — different personalities,
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
          {crew.length === 0 ? (
            <div className="card p-10 text-center">
              <MascotImage pose="peace" size={120} className="inline-block" />
              <p className="font-display text-2xl text-desert-night mt-4">The room is coming together.</p>
              <p className="text-smoked-charcoal/70 mt-2">Crew profiles will appear here soon.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {crew.map((member, i) => (
                  <div
                    key={member.id}
                    className={`card p-6 ${i % 3 === 0 ? "sticker" : i % 3 === 1 ? "sticker-right" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-full bg-copper-clay/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {member.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display text-2xl text-copper-clay">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-display text-2xl text-desert-night leading-none">{member.name}</h2>
                        <p className="text-cactus-teal font-bold text-sm mt-1">{member.nickname ?? ""}</p>
                      </div>
                    </div>
                    <p className="text-sm text-smoked-charcoal/80 mt-4">{member.public_bio ?? ""}</p>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {(member.favorite_content ?? []).map((tag) => (
                        <span key={tag} className="chip chip-cream !text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {crewNames && (
                <div className="text-center mt-10 max-w-2xl mx-auto space-y-2">
                  <p className="text-smoked-charcoal/70">{crewNames}</p>
                  <p className="text-smoked-charcoal/60">They are the room, not the limit of what AZ Off Script can become.</p>
                </div>
              )}
            </>
          )}
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
