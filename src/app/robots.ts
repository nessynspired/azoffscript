import type { MetadataRoute } from "next";

const SITE_URL = "https://azoffscript.com"; // update after deploy

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers to access public pages
        userAgent: "*",
        allow: ["/", "/watch", "/crew", "/collabs", "/join", "/about", "/arizona-reaction-videos"],
        // Block portal and API routes from indexing
        disallow: ["/portal", "/api", "/_next"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
