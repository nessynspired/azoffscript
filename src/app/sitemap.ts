import type { MetadataRoute } from "next";

const SITE_URL = "https://azoffscript.com"; // update after deploy

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/watch", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/crew", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/collabs", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/join", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/arizona-reaction-videos", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/login", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return staticPages.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
