import Link from "next/link";

const NAV_LINKS = [
  { href: "/watch", label: "Watch" },
  { href: "/crew", label: "Crew" },
  { href: "/collabs", label: "Collabs" },
  { href: "/join", label: "Join" },
  { href: "/about", label: "About" },
];

export function PublicNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-desert-night/95 backdrop-blur border-b border-copper-clay/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl text-sunburst-yellow tracking-tight">AZ</span>
          <span className="font-display text-2xl text-sandstone-cream tracking-tight">Off Script</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-full text-sm font-extrabold uppercase tracking-wide text-sandstone-cream/80 hover:text-sunburst-yellow hover:bg-white/5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/login" className="btn btn-primary btn-sm">
          Enter the Room
        </Link>
      </div>

      {/* Mobile nav — horizontal scroll */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide text-sandstone-cream/70 hover:text-sunburst-yellow whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
