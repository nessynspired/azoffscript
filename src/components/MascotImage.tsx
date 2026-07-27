import type { CSSProperties } from "react";

/**
 * Real branded mascot assets (transparent PNGs) from the AZ Off Script brand pack.
 * Use this for all portal UI, empty states, approval screens, overlays.
 *
 * Per the asset placement guide:
 *  - "main"     (primary purse)    → Lobby, login, Run Sheet, Ground Rules, empty states
 *  - "shades"   (sunglasses/share) → Drop a Clip success, Ready to Post, Greenlight, Money Side
 *  - "peace"    (peace sign)       → Crew, My Wave Kit, Spark Board, welcome moments
 *
 * For large branded hero sections use the poster assets via <PosterImage /> instead.
 */

export type MascotAsset = "main" | "shades" | "peace";

const ASSET_PATH: Record<MascotAsset, string> = {
  main: "/assets/mascot-primary-purse-transparent.png",
  shades: "/assets/mascot-sunglasses-share-transparent.png",
  peace: "/assets/mascot-peace-sign-transparent.png",
};

interface MascotImageProps {
  pose: MascotAsset;
  size?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  priority?: boolean;
}

export function MascotImage({
  pose,
  size = 160,
  className,
  style,
  alt,
  priority = false,
}: MascotImageProps) {
  const altText = alt ?? `AZ Off Script cactus mascot, ${pose} pose`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASSET_PATH[pose]}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", ...style }}
      alt={altText}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
    />
  );
}

/**
 * Poster assets (full desert background scenes) for big branded moments.
 *
 *  - "primary"  → Public homepage hero, portal Lobby hero, My Wave Kit header
 *  - "shades"   → Ready to Post page, Greenlit approval area, public Watch section
 *  - "peace"    → Crew page, Crew section, member welcome/kits
 */
export type PosterAsset = "primary" | "shades" | "peace";

const POSTER_PATH: Record<PosterAsset, string> = {
  primary: "/assets/az-off-script-poster-primary-cactus-purse-desert.png",
  shades: "/assets/az-off-script-poster-sunglasses-share-desert.png",
  peace: "/assets/az-off-script-poster-peace-sign-desert.png",
};

interface PosterImageProps {
  poster: PosterAsset;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  priority?: boolean;
  fill?: boolean;
}

export function PosterImage({
  poster,
  className,
  style,
  alt,
  priority = false,
  fill = false,
}: PosterImageProps) {
  const altText = alt ?? `AZ Off Script brand poster, ${poster}`;
  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={POSTER_PATH[poster]}
        alt={altText}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={POSTER_PATH[poster]}
      alt={altText}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
      className={className}
      style={style}
    />
  );
}
