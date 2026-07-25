import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-desert-night border-t border-copper-clay/30 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* SEO paragraph — plain but powerful for search */}
        <p className="text-sandstone-cream/50 text-sm leading-relaxed max-w-4xl mb-8">
          AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes, group
          games, local humor, quick trend remixes, and short-form social content for TikTok,
          Instagram Reels, Facebook, and YouTube Shorts. Built to grow across Arizona, AZ Off
          Script is centered on real reactions, group chemistry, local personality, and off-script
          moments people want to share.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logos/logo-white.png" alt="AZ Off Script" className="h-7 w-auto" />
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/watch" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Watch</Link>
            <Link href="/crew" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Crew</Link>
            <Link href="/collabs" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Collabs</Link>
            <Link href="/join" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Join</Link>
            <Link href="/about" className="text-sandstone-cream/60 hover:text-sunburst-yellow">About</Link>
            <Link href="/login" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Portal Login</Link>
          </nav>

          <p className="text-sandstone-cream/40 text-sm">
            © {new Date().getFullYear()} AZ Off Script. Arizona, our way.
          </p>
        </div>
      </div>
    </footer>
  );
}
