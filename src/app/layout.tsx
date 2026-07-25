import type { Metadata, Viewport } from "next";
import { Anton, Nunito, Permanent_Marker } from "next/font/google";
import "./globals.css";

const display = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sans = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const script = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://azoffscript.com"),
  title: "AZ Off Script — The Off Script Room",
  description:
    "A creator clubhouse for Arizona's funniest, realest, most off-script voices. Drop clips, share ideas, greenlight final cuts.",
  manifest: "/manifest.json",
  applicationName: "Off Script",
  appleWebApp: {
    capable: true,
    title: "Off Script",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icons/favicon-32.png"],
  },
  openGraph: {
    title: "AZ Off Script — The Off Script Room",
    description: "Arizona, our way. A creator clubhouse for the funniest, realest voices.",
    type: "website",
    images: [{ url: "/assets/az-off-script-poster-primary-cactus-purse-desert.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZ Off Script",
    description: "Arizona, our way.",
    images: ["/assets/az-off-script-poster-primary-cactus-purse-desert.png"],
  },
};

// This is an auth-gated app — nothing should be statically prerendered.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0a1f3d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${script.variable} h-full antialiased`}
    >
      <head>
        {/* PWA: prevent scaling/zoom issues on iOS, enable full-screen mode */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Off Script" />
        {/* Favicon */}
        <link rel="icon" href="/icons/favicon-32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#f2e8d8" }}>
        {children}
        {/* Service worker registration — enables offline + install-to-home-screen */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && location.protocol === 'https:') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then((reg) => {
                    // When a new SW takes over, reload the page so fresh CSS/JS is used
                    reg.addEventListener('controllerchange', () => {
                      window.location.reload();
                    });
                  }).catch(() => {});
                  // Also reload if an existing SW gets a new controller
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
