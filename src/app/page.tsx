import type { Metadata } from "next";
import { ImmersiveHome, type PublicCrewMember } from "@/components/ImmersiveHome";
import { RoomEntrySplash } from "@/components/RoomEntrySplash";
import { OrganizationSchema, WebSiteSchema } from "@/components/public/StructuredData";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AZ Off Script — Arizona Creator Brand & Reaction Videos",
  description:
    "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content. Arizona, our way.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AZ Off Script — Arizona Creator Brand & Reaction Videos",
    description:
      "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content. Arizona, our way.",
    images: [{ url: "/assets/az-off-script-poster-primary-cactus-purse-desert.png", width: 1024, height: 1024, alt: "AZ Off Script Arizona creator brand poster" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZ Off Script — Arizona Creator Brand",
    description: "Arizona, our way. Reaction videos, hot takes, group games, and local Arizona moments.",
    images: ["/assets/az-off-script-poster-primary-cactus-purse-desert.png"],
  },
};

// Dynamic — crew data comes from the database
export const dynamic = "force-dynamic";

async function getPublicCrew(): Promise<{ crew: PublicCrewMember[]; crewNames: string }> {
  try {
    const supabase = await createClient();

    const [crewRes, settingsRes] = await Promise.all([
      supabase
        .from("members")
        .select("id, name, nickname, public_bio, slug, display_order, first_wave, photo_url, card_image, gear_image, favorite_content")
        .eq("public_visible", true)
        .eq("archived", false),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "crew_sort_mode")
        .single(),
    ]);

    const sortMode = settingsRes.data?.value ?? "first_wave_first";
    let crew = (crewRes.data ?? []) as PublicCrewMember[];

    if (sortMode === "manual") {
      crew = [...crew].sort((a, b) => a.display_order - b.display_order);
    } else if (sortMode === "alpha") {
      crew = [...crew].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      crew = [...crew].sort((a, b) => {
        if (a.first_wave && !b.first_wave) return -1;
        if (!a.first_wave && b.first_wave) return 1;
        if (a.first_wave && b.first_wave) return a.display_order - b.display_order;
        return a.name.localeCompare(b.name);
      });
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

export default async function HomePage() {
  const { crew, crewNames } = await getPublicCrew();

  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <RoomEntrySplash />
      <ImmersiveHome crew={crew} crewNames={crewNames} />
    </>
  );
}
