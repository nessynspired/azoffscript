import Link from "next/link";
import { MascotImage } from "@/components/MascotImage";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sandstone-cream flex flex-col items-center justify-center px-4 text-center">
      <MascotImage pose="shades" size={160} priority />
      <h1 className="font-display text-6xl md:text-8xl text-desert-night mt-6 leading-none">
        404
      </h1>
      <p className="font-display text-2xl md:text-3xl text-desert-night mt-4">
        This page went off script.
      </p>
      <p className="text-smoked-charcoal/70 mt-3 max-w-md">
        Either it never existed, or it said something the room wasn&apos;t ready for.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link href="/" className="btn btn-primary btn-lg">Back to Home</Link>
        <Link href="/watch" className="btn btn-secondary btn-lg">Watch the Vibe</Link>
      </div>
    </div>
  );
}
