"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { SceneBackground } from "@/components/motion/SceneBackground";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Marquee } from "@/components/motion/Marquee";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { useScrollReveal } from "@/components/motion/useScrollReveal";
import { PosterImage, MascotImage } from "@/components/MascotImage";
import { CONTENT_LANES, HERO_BADGES } from "@/lib/crew-data";

export interface PublicCrewMember {
  id: string;
  name: string;
  nickname: string | null;
  public_bio: string | null;
  slug: string | null;
  display_order: number;
  first_wave: boolean;
  photo_url: string | null;
  card_image: string | null;
  gear_image: string | null;
  favorite_content: string[] | null;
}

interface ImmersiveHomeProps {
  crew?: PublicCrewMember[];
  crewNames?: string;
}

/* Content lane card colors (cycle through brand palette) */
const LANE_COLORS = [
  "var(--color-heat-orange)",
  "var(--color-cactus-teal)",
  "var(--color-copper-clay)",
  "var(--color-sunburst-yellow)",
  "var(--color-copper-deep)",
  "var(--color-teal-deep)",
];

/* Coming-soon video cards */
const COMING_SOON = [
  {
    format: "Red Flag or Real Life?",
    hook: "Would you call this a red flag or just grown people being tired?",
    status: "Coming Soon",
    platform: "TikTok",
  },
  {
    format: "Group Chat Court",
    hook: "The group chat was divided, so we brought it to the room.",
    status: "In the Room",
    platform: "Instagram Reels",
  },
  {
    format: "Dry Heat Hot Takes",
    hook: "Arizona hot takes nobody asked for but everybody has.",
    status: "Loading",
    platform: "TikTok",
  },
  {
    format: "Who's Most Likely To",
    hook: "Point to the person most likely to start drama and leave.",
    status: "First Wave",
    platform: "YouTube Shorts",
  },
];

/* Collab interactive cards */
const COLLAB_TYPES = [
  { title: "Taste It", desc: "Food, drinks, snacks, local restaurants.", icon: "main" as const },
  { title: "Try It", desc: "Products, beauty, lifestyle, home, mom-life finds.", icon: "shades" as const },
  { title: "Pull Up", desc: "Events, pop-ups, markets, local spots.", icon: "peace" as const },
  { title: "Debate It", desc: "Questions, games, products, scenarios.", icon: "main" as const },
];

export function ImmersiveHome({ crew = [], crewNames = "" }: ImmersiveHomeProps = {}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const vibeRef = useScrollReveal<HTMLDivElement>();
  const lanesRef = useScrollReveal<HTMLDivElement>();
  const clipsRef = useScrollReveal<HTMLDivElement>();
  const crewRef = useScrollReveal<HTMLDivElement>();
  const whyRef = useScrollReveal<HTMLDivElement>();
  const collabRef = useScrollReveal<HTMLDivElement>();

  // Hero entrance animation on load
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = heroRef.current;
    if (!hero) return;
    // Trigger kinetic type + staggered reveals after mount
    const timer = setTimeout(() => hero.classList.add("kinetic-ready"), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-sandstone-cream overflow-x-hidden">
      <CustomCursor />
      <SceneBackground />
      <PublicNav />

      {/* ===== 1. CINEMATIC HERO — clean, readable, one focal point ===== */}
      <section
        ref={heroRef}
        data-scene="dark"
        className="relative min-h-[100svh] flex items-center bg-desert-night overflow-hidden"
      >
        {/* Subtle texture — just a faint radial glow, no image */}
        <div className="absolute inset-0 opacity-30" style={{
          background: "radial-gradient(ellipse at 70% 40%, rgba(255, 210, 63, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(201, 106, 58, 0.06) 0%, transparent 50%)"
        }} />

        {/* Rotating sun behind mascot */}
        <div className="absolute right-[15%] top-[22%] w-[440px] h-[440px] opacity-20 hidden md:block">
          <div className="w-full h-full rounded-full tex-sunburst sun-rotate" />
        </div>

        {/* Oversized mascot — moved left so it doesn't sit behind the stickers */}
        <div className="absolute right-[10%] -bottom-20 z-10 hidden md:block opacity-90">
          <ParallaxLayer speed={0.15}>
            <MascotImage pose="main" size={460} />
          </ParallaxLayer>
        </div>

        {/* Floating sticker badges */}
        <div className="absolute top-28 right-8 z-20 hidden lg:flex flex-col gap-4">
          {HERO_BADGES.slice(0, 3).map((badge, i) => (
            <span
              key={badge}
              className={`chip ${i === 0 ? "chip-yellow" : i === 1 ? "chip-copper" : "chip-teal"} text-sm float-sticker float-sticker-delay-${i}`}
              style={{ ["--tilt" as string]: `${i % 2 === 0 ? -4 : 5}deg`, transform: `rotate(${i % 2 === 0 ? -4 : 5}deg)` }}
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="absolute bottom-40 left-6 z-20 hidden lg:flex flex-col gap-4">
          {HERO_BADGES.slice(3).map((badge, i) => (
            <span
              key={badge}
              className={`chip ${i === 0 ? "chip-dark" : "chip-yellow"} text-sm float-sticker float-sticker-delay-${i + 1}`}
              style={{ ["--tilt" as string]: `${i % 2 === 0 ? 4 : -5}deg`, transform: `rotate(${i % 2 === 0 ? 4 : -5}deg)` }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Hero text — kinetic line-by-line reveal */}
        <div className="relative z-30 max-w-6xl mx-auto px-4 w-full pt-20">
          <div className="max-w-2xl">
            <span className="chip chip-yellow mb-6 inline-block">Arizona, Our Way.</span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] text-sandstone-cream leading-[0.85]">
              <span className="kinetic-line"><span className="kinetic-line-inner">The group chat</span></span>
              <span className="kinetic-line"><span className="kinetic-line-inner text-sunburst-yellow">got a camera.</span></span>
            </h1>
            <p className="text-sandstone-cream/90 text-lg md:text-xl mt-6 max-w-xl leading-relaxed">
              Real reactions, hot takes, group games, and local Arizona moments from the room that
              can&apos;t stay scripted.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <MagneticButton>
                <Link href="/watch" className="btn btn-primary btn-lg glow-pulse" data-cursor="watch">
                  Watch the Vibe
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/login" className="btn btn-secondary btn-lg" data-cursor="enter">
                  Enter the Room
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ===== 2. THE VIBE — poster reveals here, then gets covered ===== */}
      <section ref={vibeRef} data-scene="cream" className="relative py-24 md:py-32 px-4 reveal overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 md:gap-16 items-center">
            {/* Left: poster in a rounded frame — you see it as you scroll, then it passes */}
            <div className="poster-mask relative aspect-square order-2 md:order-1">
              <PosterImage poster="primary" fill alt="AZ Off Script Arizona creator crew desert poster" />
            </div>

            {/* Right: headline + copy */}
            <div className="order-1 md:order-2">
              <h2 className="font-display text-4xl md:text-6xl text-desert-night leading-[0.85]">
                This isn&apos;t<br />a content page.<br />
                <span className="text-heat-orange">It&apos;s a room</span><br />with opinions.
              </h2>
              <p className="text-xl text-smoked-charcoal/80 leading-relaxed mt-6">
                AZ Off Script is where Arizona reactions, group games, local humor, and hot takes
                turn into clips people actually send to their friends.
              </p>
              <p className="text-lg text-smoked-charcoal/70 leading-relaxed mt-4">
                The best moment is usually the one nobody planned — the face, the pause, the
                side-eye, the answer that makes the whole room react.
              </p>
              <div className="mt-6 float-sticker inline-block">
                <MascotImage pose="main" size={80} />
              </div>
            </div>
          </div>

          {/* Three offset cards below */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="card p-5 sticker">
              <h3 className="font-display text-lg text-desert-night">The Face Says It First</h3>
              <p className="text-sm text-smoked-charcoal/70 mt-2">
                The reaction before the answer is half the content.
              </p>
            </div>
            <div className="card p-5 mt-6 sm:mt-0 sticker-right">
              <h3 className="font-display text-lg text-desert-night">Arizona Makes It Funnier</h3>
              <p className="text-sm text-smoked-charcoal/70 mt-2">
                Dry heat, long drives, Arizona errands, local chaos, and things only AZ
                people understand.
              </p>
            </div>
            <div className="card p-5 sticker">
              <h3 className="font-display text-lg text-desert-night">The Room Decides</h3>
              <p className="text-sm text-smoked-charcoal/70 mt-2">
                One question. Different personalities. Somebody is always confidently wrong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. CONTENT LANES — horizontal show-format carousel ===== */}
      <section ref={lanesRef} data-scene="dark" className="py-24 md:py-32 overflow-hidden reveal">
        <div className="max-w-6xl mx-auto px-4 mb-10">
          <h2 className="font-display text-4xl md:text-6xl text-sandstone-cream leading-tight">
            What we&apos;re dropping
          </h2>
          <p className="text-sandstone-cream/70 text-lg mt-3 max-w-xl">
            Not random clips. Repeatable formats built for search, sharing, and arguments in the
            comments.
          </p>
        </div>

        {/* Horizontal scroll carousel */}
        <div className="h-scroll no-scrollbar flex gap-5 px-4 pb-6 snap-x">
          {CONTENT_LANES.map((lane, i) => (
            <div
              key={lane.number}
              className="lane-card h-scroll-item card p-6 bg-sandstone-cream shrink-0 w-[300px] md:w-[340px] relative"
              data-cursor="open"
            >
              {/* Color strip */}
              <div
                className="absolute top-0 left-0 right-0 h-2 rounded-t-[20px]"
                style={{ background: LANE_COLORS[i % LANE_COLORS.length] }}
              />
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="font-display text-4xl text-copper-clay/30">{lane.number}</span>
                <MascotImage pose={(["main", "shades", "peace"] as const)[i % 3]} size={50} />
              </div>
              <h3 className="font-display text-2xl text-desert-night leading-tight">{lane.name}</h3>
              <p className="text-cactus-teal font-bold text-sm mt-2">{lane.tagline}</p>
              <p className="text-sm text-smoked-charcoal/70 mt-3">{lane.description}</p>

              {/* Fake comment bubble */}
              <div className="mt-4 p-3 bg-desert-night/5 rounded-xl">
                <p className="text-xs text-desert-night/60 italic">
                  &ldquo;{lane.examples[0]}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="chip chip-dark !text-[10px]">
                  {i < 3 ? "First Wave" : "Coming Soon"}
                </span>
                <span className="text-xs font-bold text-heat-orange">Watch this lane →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="max-w-6xl mx-auto px-4 mt-2">
          <p className="text-sandstone-cream/40 text-sm">← scroll to see all formats →</p>
        </div>
      </section>

      {/* ===== 4. LATEST FROM THE ROOM — coming-soon video wall ===== */}
      <section ref={clipsRef} data-scene="cream" className="py-24 md:py-32 px-4 reveal">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-6xl text-desert-night leading-tight">
            The first clips<br />are loading.
          </h2>
          <p className="text-lg text-smoked-charcoal/70 mt-4 max-w-xl">
            The First Wave is filming soon. Until then, the questions are getting messy, the room is
            getting built, and the cactus is judging quietly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {COMING_SOON.map((clip, i) => (
              <div
                key={i}
                className={`card overflow-hidden ${i % 2 === 0 ? "sticker" : "sticker-right"}`}
                data-cursor="watch"
              >
                {/* Fake video frame */}
                <div className="aspect-[9/16] bg-gradient-to-br from-desert-night to-night-deep relative flex items-end p-4">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <MascotImage pose={(["shades", "peace", "main"] as const)[i % 3]} size={80} />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="chip chip-yellow !text-[10px]">{clip.format}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`chip !text-[10px] ${clip.status === "Coming Soon" ? "chip-copper" : clip.status === "In the Room" ? "chip-teal" : clip.status === "Loading" ? "chip-dark" : "chip-yellow"}`}>
                      {clip.status}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sandstone-cream text-sm font-bold leading-tight">
                      &ldquo;{clip.hook}&rdquo;
                    </p>
                    <p className="text-sandstone-cream/50 text-xs mt-2">{clip.platform}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. MEET THE FIRST WAVE — cast-card reveal ===== */}
      <section ref={crewRef} data-scene="dark" className="py-24 md:py-32 relative overflow-hidden reveal">
        <div className="absolute inset-0 opacity-15">
          <PosterImage poster="peace" fill alt="AZ Off Script First Wave cast poster" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="mb-12">
            <span className="chip chip-yellow mb-4">First Wave</span>
            <h2 className="font-display text-4xl md:text-6xl text-sandstone-cream leading-tight">
              Meet the First Wave.
            </h2>
            <p className="text-sandstone-cream/70 text-lg mt-3 max-w-xl">
              Different personalities. Same room. No script needed.
            </p>
          </div>

          {/* Cast cards — collectible card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crew.map((member, i) => (
              <div
                key={member.id}
                className="cast-card card bg-sandstone-cream"
                data-cursor="meet"
              >
                {/* Color stripe */}
                <div
                  className="h-3"
                  style={{ background: LANE_COLORS[i % LANE_COLORS.length] }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-3xl text-desert-night leading-none">
                        {member.name}
                      </h3>
                      <p className="text-cactus-teal font-bold text-sm mt-2">{member.nickname ?? ""}</p>
                    </div>
                    {member.first_wave && <span className="chip chip-yellow !text-[9px]">First Wave</span>}
                  </div>

                  <p className="text-sm text-smoked-charcoal/70 mt-4">{member.public_bio ?? member.nickname ?? ""}</p>

                  <div className="flex flex-wrap gap-1 mt-4">
                    {(member.favorite_content ?? []).slice(0, 3).map((tag) => (
                      <span key={tag} className="chip chip-cream !text-[10px]">{tag}</span>
                    ))}
                  </div>

                  {/* Off-script quote */}
                  <p className="font-script text-lg text-copper-clay mt-4">
                    &ldquo;{["Somebody had to say it.", "The room needed this.", "Watch the face.", "That's the moment.", "I said what I said.", "Fresh energy, real answers."][i % 6]}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>

          {crewNames && (
            <div className="text-center mt-10 max-w-2xl mx-auto space-y-2">
              <p className="text-sandstone-cream/60 text-sm">
                {crewNames}
              </p>
              <p className="text-sandstone-cream/50 text-sm">
                They are the First Wave, not the limit of what AZ Off Script can become.
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <MagneticButton>
              <Link href="/crew" className="btn btn-secondary btn-lg" data-cursor="meet">
                Meet the Full Crew
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ===== 6. WHY PEOPLE WATCH — kinetic marquee + cards ===== */}
      <section ref={whyRef} data-scene="cream" className="py-24 md:py-32 overflow-hidden reveal">
        {/* Kinetic marquee band */}
        <Marquee
          items={["that's me", "send this to her", "who's wrong?", "only in Arizona", "I would've made that face too"]}
          className="mb-16"
        />

        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl text-desert-night leading-tight">
            People don&apos;t share perfect.<br />
            <span className="text-heat-orange">They share recognition.</span>
          </h2>
          <p className="text-xl text-smoked-charcoal/80 mt-6 max-w-2xl mx-auto leading-relaxed">
            A clip works when people recognize themselves in it — the answer they would have given,
            the face they would have made, the friend they need to tag, the local joke only Arizona
            understands.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Taggable", desc: "Send this to the friend who would vote wrong with confidence." },
              { title: "Debatable", desc: "Everybody gets a side." },
              { title: "Local", desc: "Arizona people recognize the heat, the drive, the attitude, and the chaos." },
              { title: "Repeatable", desc: "Formats people can come back for." },
            ].map((card, i) => (
              <div key={card.title} className={`card p-5 ${i % 2 === 0 ? "sticker" : ""}`}>
                <h3 className="font-display text-xl text-desert-night">{card.title}</h3>
                <p className="text-sm text-smoked-charcoal/70 mt-2">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. COLLABS — "Put your brand in the room" ===== */}
      <section ref={collabRef} data-scene="dark" className="py-24 md:py-32 px-4 reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="chip chip-teal mb-6">Collabs & Brands</span>
            <h2 className="font-display text-4xl md:text-6xl text-sandstone-cream leading-tight">
              Put your brand<br />in the room.
            </h2>
            <p className="text-xl text-sandstone-cream/80 mt-6 max-w-2xl mx-auto leading-relaxed">
              Local business? Product? Event? Food spot? Boutique? Beauty service? If the room can
              react to it, try it, debate it, taste it, rate it, or turn it into a moment — it
              belongs here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COLLAB_TYPES.map((type, i) => (
              <div
                key={type.title}
                className={`card p-6 bg-sandstone-cream ${i % 2 === 0 ? "sticker" : "sticker-right"}`}
                data-cursor="pitch"
              >
                <MascotImage pose={type.icon} size={60} />
                <h3 className="font-display text-xl text-desert-night mt-3">{type.title}</h3>
                <p className="text-sm text-smoked-charcoal/70 mt-2">{type.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sandstone-cream/60 text-lg mb-6">
              Bring the product. We&apos;ll bring the reactions.
            </p>
            <MagneticButton>
              <Link href="/collabs" className="btn btn-primary btn-lg glow-pulse" data-cursor="pitch">
                Pitch a Collab
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ===== 8. FOOTER — "No script. Just Arizona." ===== */}
      <section data-scene="dark" className="bg-desert-night border-t border-copper-clay/30 py-16 px-4 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 opacity-10">
          <MascotImage pose="peace" size={250} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl text-sandstone-cream leading-[0.85] mb-8">
            No script.<br />
            <span className="text-sunburst-yellow">Just Arizona.</span>
          </h2>

          <p className="text-sandstone-cream/50 text-sm leading-relaxed max-w-4xl mb-10">
            AZ Off Script is an Arizona-based creator brand making reaction videos, hot takes,
            group games, local humor, quick trend remixes, and short-form social content for
            TikTok, Instagram Reels, Facebook, and YouTube Shorts. Built to grow across Arizona,
            AZ Off Script is centered on real reactions, group chemistry, local personality, and
            off-script moments people want to share.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logos/logo-official.png" alt="AZ Off Script" className="h-10 w-auto" />
            </div>
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/watch" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Watch</Link>
              <Link href="/crew" className="text-sandstone-cream/60 hover:text-sunburst-yellow">The Room</Link>
              <Link href="/collabs" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Collabs</Link>
              <Link href="/join" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Join</Link>
              <Link href="/about" className="text-sandstone-cream/60 hover:text-sunburst-yellow">About</Link>
              <Link href="/arizona-reaction-videos" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Arizona Reaction Videos</Link>
              <Link href="/login" className="text-sandstone-cream/60 hover:text-sunburst-yellow">Enter the Room</Link>
            </nav>
            <p className="text-sandstone-cream/40 text-sm">
              © {new Date().getFullYear()} AZ Off Script. Arizona, our way.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
