import type { Metadata } from "next";
import { ImmersiveHome } from "@/components/ImmersiveHome";
import { OrganizationSchema, WebSiteSchema } from "@/components/public/StructuredData";

export const metadata: Metadata = {
  title: "AZ Off Script — Arizona Creator Crew & Reaction Videos",
  description:
    "AZ Off Script is a women-led Arizona creator crew making reaction videos, hot takes, group games, and local Arizona moments. Arizona, our way.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AZ Off Script — Arizona Creator Crew & Reaction Videos",
    description:
      "AZ Off Script is a women-led Arizona creator crew making reaction videos, hot takes, group games, and local Arizona moments. Arizona, our way.",
    images: [{ url: "/assets/az-off-script-poster-primary-cactus-purse-desert.png", width: 1024, height: 1024, alt: "AZ Off Script Arizona creator crew brand poster" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZ Off Script — Arizona Creator Crew",
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
