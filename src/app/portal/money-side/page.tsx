"use client";

import { MascotImage } from "@/components/MascotImage";

export default function MoneySidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">The Money Side</h1>
        <p className="text-smoked-charcoal/70 mt-2 text-lg">Payouts, splits, and who-owes-who.</p>
      </div>

      {/* Locked panel */}
      <div className="card-dark p-10 text-center relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-20">
          <MascotImage pose="shades" size={180} />
        </div>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="inline-block mb-4">
            <MascotImage pose="shades" size={120} />
          </div>
          <span className="chip chip-yellow mb-4">Coming Later</span>
          <h2 className="font-display text-3xl text-sandstone-cream leading-none">
            We&apos;re building this next.
          </h2>
          <p className="text-sandstone-cream/80 mt-3 text-lg">
            Once the clips are flowing and the crew is posting, this is where you&apos;ll see:
          </p>
          <ul className="text-left text-sandstone-cream/70 mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-sunburst-yellow">→</span> Revenue splits per clip
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sunburst-yellow">→</span> Who&apos;s owed what
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sunburst-yellow">→</span> Brand deal tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-sunburst-yellow">→</span> Payout history
            </li>
          </ul>
          <p className="text-sandstone-cream/60 mt-6 text-sm">
            For now, focus on dropping clips and getting them greenlit. The money follows the content.
          </p>
        </div>
      </div>
    </div>
  );
}
