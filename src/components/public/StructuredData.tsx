/**
 * JSON-LD structured data components for SEO.
 * These render as <script type="application/ld+json"> tags that search engines parse.
 */

const SITE_URL = "https://azoffscript.com"; // update after deploy

interface StructuredDataProps {
  data: Record<string, unknown>;
}

function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization schema — goes on every page */
export function OrganizationSchema() {
  return (
    <StructuredData
      data={{
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "AZ Off Script",
        description:
          "AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group games, local humor, quick trend remixes, and short-form social content.",
        url: SITE_URL,
        logo: `${SITE_URL}/assets/az-off-script-poster-primary-cactus-purse-desert.png`,
        sameAs: [
          "https://www.tiktok.com/@azoffscript",
          "https://www.instagram.com/azoffscript",
          "https://www.facebook.com/azoffscript",
          "https://www.youtube.com/@azoffscript",
        ],
        areaServed: "Arizona, United States",
        knowsAbout: [
          "reaction videos",
          "group games",
          "hot takes",
          "Arizona humor",
          "short-form content",
          "TikTok content",
        ],
        founder: {
          "@type": "Person",
          name: "Vanessa",
        },
      }}
    />
  );
}

/** WebSite schema — goes on the homepage */
export function WebSiteSchema() {
  return (
    <StructuredData
      data={{
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "AZ Off Script",
        description: "Arizona, Our Way. An Arizona-based creator brand.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/watch?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** BreadcrumbList schema — goes on subpages */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <StructuredData
      data={{
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.url}`,
        })),
      }}
    />
  );
}

/** VideoObject schema — goes on video pages */
export function VideoSchema({
  title,
  description,
  thumbnailUrl,
  uploadDate,
  embedUrl,
}: {
  title: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  embedUrl?: string;
}) {
  return (
    <StructuredData
      data={{
        "@type": "VideoObject",
        name: title,
        description,
        thumbnailUrl: thumbnailUrl ? `${SITE_URL}${thumbnailUrl}` : undefined,
        uploadDate,
        embedUrl,
        contentUrl: `${SITE_URL}/watch`,
      }}
    />
  );
}
