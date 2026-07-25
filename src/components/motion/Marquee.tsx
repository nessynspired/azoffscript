"use client";

/**
 * Marquee — horizontal scrolling text band.
 * Duplicates content for seamless loop. Respects reduced-motion (CSS stops animation).
 *
 * Usage:
 *   <Marquee items={["that's me", "send this to her", "who's wrong?"]} />
 *   <Marquee items={[...]} reverse speed="slow" />
 */
export function Marquee({
  items,
  reverse = false,
  className = "",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  // Duplicate items so the track can loop seamlessly
  const doubled = [...items, ...items];

  return (
    <div className={`marquee ${reverse ? "marquee-reverse" : ""} ${className}`}>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-display text-4xl md:text-6xl text-desert-night/15 whitespace-nowrap"
          >
            {item}
            <span className="text-heat-orange/40 mx-6">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
