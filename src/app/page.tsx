import type { Metadata } from "next";
import { ImmersiveHome } from "@/components/ImmersiveHome";
import { OrganizationSchema, WebSiteSchema } from "@/components/public/StructuredData";

export const metadata: Metadata = {
  title: "AZ Off Script — Arizona Creator Brand & Reaction Videos",
  description:
    "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content. The First Wave is the first women-led room. Arizona, our way.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AZ Off Script — Arizona Creator Brand & Reaction Videos",
    description:
      "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content. The First Wave is the first women-led room. Arizona, our way.",
    images: [{ url: "/assets/az-off-script-poster-primary-cactus-purse-desert.png", width: 1024, height: 1024, alt: "AZ Off Script Arizona creator brand poster" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZ Off Script — Arizona Creator Brand",
    description: "Arizona, our way. Reaction videos, hot takes, group games, and local Arizona moments.",
    images: ["/assets/az-off-script-poster-primary-cactus-purse-desert.png"],
  },
};

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <ImmersiveHome />
    </>
  );
}
