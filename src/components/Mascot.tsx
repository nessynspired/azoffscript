import type { CSSProperties } from "react";

/**
 * AZ Off Script cactus mascot — inline SVG, no external assets needed.
 * Per DESIGNSPEC.MD §8: muted cactus teal body (#3B917D), visible lashes,
 * expressive attitude, Sonoran/Arizona feel, not overly childish.
 *
 * Poses (DESIGNSPEC §8 mascot pose system):
 *  - "main"     : purse pose — Lobby hero, welcome
 *  - "shades"   : sunglasses — approvals, ready-to-post, success
 *  - "peace"    : peace sign — crew, community, My Wave Kit
 *  - "cap"      : casual cap — Run Sheet, planning, calendar
 *  - "sassy"    : side-eye — hot takes, comments, "needs review"
 *  - "sun"      : cactus + sun combo — brand moments, empty states
 */

export type MascotPose =
  | "main"
  | "shades"
  | "peace"
  | "cap"
  | "sassy"
  | "sun";

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const TEAL = "#3B917D";
const TEAL_DARK = "#2A6B5B";
const CREAM = "#F2E8D8";
const NIGHT = "#0D1B2A";
const YELLOW = "#FFD23F";
const COPPER = "#C96A3A";

export function Mascot({
  pose = "main",
  size = 160,
  className,
  style,
}: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={style}
      role="img"
      aria-label={`AZ Off Script cactus mascot, ${pose} pose`}
    >
      {/* sunburst behind for sun pose */}
      {pose === "sun" && (
        <g>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="98"
              y="8"
              width="4"
              height="22"
              fill={YELLOW}
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="34" fill={YELLOW} opacity="0.25" />
        </g>
      )}

      {/* pot */}
      <path
        d="M70 165 L130 165 L122 195 L78 195 Z"
        fill={COPPER}
        stroke={NIGHT}
        strokeWidth="2"
      />
      <ellipse cx="100" cy="165" rx="30" ry="6" fill={TEAL_DARK} stroke={NIGHT} strokeWidth="2" />

      {/* cactus body — main column + two arms */}
      <rect x="88" y="60" width="24" height="105" rx="12" fill={TEAL} stroke={NIGHT} strokeWidth="2" />
      <rect x="64" y="95" width="20" height="48" rx="10" fill={TEAL} stroke={NIGHT} strokeWidth="2" />
      <rect x="64" y="88" width="20" height="14" rx="7" fill={TEAL} stroke={NIGHT} strokeWidth="2" />
      <rect x="116" y="85" width="20" height="55" rx="10" fill={TEAL} stroke={NIGHT} strokeWidth="2" />
      <rect x="116" y="78" width="20" height="14" rx="7" fill={TEAL} stroke={NIGHT} strokeWidth="2" />

      {/* spines */}
      {[
        [100, 75], [100, 95], [100, 115], [100, 135], [100, 155],
        [74, 105], [74, 125], [126, 95], [126, 115], [126, 135],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1={x - 3} y1={y} x2={x + 3} y2={y} stroke={CREAM} strokeWidth="1.2" />
          <line x1={x} y1={y - 3} x2={x} y2={y + 3} stroke={CREAM} strokeWidth="1.2" />
        </g>
      ))}

      {/* face */}
      {pose === "shades" ? (
        // sunglasses
        <g>
          <rect x="86" y="72" width="14" height="9" rx="3" fill={NIGHT} />
          <rect x="100" y="72" width="14" height="9" rx="3" fill={NIGHT} />
          <line x1="100" y1="76" x2="100" y2="76" stroke={NIGHT} strokeWidth="2" />
          <rect x="84" y="74" width="32" height="2" fill={NIGHT} />
          <ellipse cx="91" cy="76" rx="3" ry="2" fill={YELLOW} opacity="0.6" />
          <ellipse cx="109" cy="76" rx="3" ry="2" fill={YELLOW} opacity="0.6" />
        </g>
      ) : pose === "sassy" ? (
        // side-eye: one eye normal, one looking sideways
        <g>
          <ellipse cx="93" cy="75" rx="3" ry="4" fill={NIGHT} />
          <ellipse cx="107" cy="76" rx="2.5" ry="3.5" fill={NIGHT} />
          {/* lashes */}
          <line x1="90" y1="71" x2="89" y2="69" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="93" y1="70" x2="93" y2="68" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="96" y1="71" x2="97" y2="69" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="104" y1="72" x2="103" y2="70" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="107" y1="72" x2="107" y2="70" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="110" y1="72" x2="111" y2="70" stroke={NIGHT} strokeWidth="1.5" />
          {/* smirk */}
          <path d="M94 86 Q102 90 110 85" stroke={NIGHT} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        // normal eyes with lashes
        <g>
          <ellipse cx="93" cy="75" rx="3" ry="4" fill={NIGHT} />
          <ellipse cx="107" cy="75" rx="3" ry="4" fill={NIGHT} />
          <circle cx="94" cy="74" r="1" fill={CREAM} />
          <circle cx="108" cy="74" r="1" fill={CREAM} />
          {/* lashes */}
          <line x1="90" y1="71" x2="89" y2="69" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="93" y1="70" x2="93" y2="68" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="96" y1="71" x2="97" y2="69" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="104" y1="71" x2="103" y2="69" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="107" y1="70" x2="107" y2="68" stroke={NIGHT} strokeWidth="1.5" />
          <line x1="110" y1="71" x2="111" y2="69" stroke={NIGHT} strokeWidth="1.5" />
          {/* smile */}
          <path d="M93 85 Q100 90 107 85" stroke={NIGHT} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* pose-specific accessories */}
      {pose === "cap" && (
        <g>
          <path d="M82 64 Q100 50 118 64 L118 68 L82 68 Z" fill={COPPER} stroke={NIGHT} strokeWidth="2" />
          <path d="M82 66 Q100 56 118 66" stroke={NIGHT} strokeWidth="1.5" fill="none" />
          <ellipse cx="100" cy="64" rx="18" ry="3" fill={COPPER} stroke={NIGHT} strokeWidth="2" />
          <rect x="96" y="58" width="8" height="5" rx="1" fill={YELLOW} />
        </g>
      )}

      {pose === "peace" && (
        <g>
          {/* peace sign hand on right arm */}
          <circle cx="126" cy="82" r="9" fill={TEAL} stroke={NIGHT} strokeWidth="2" />
          <line x1="126" y1="74" x2="126" y2="90" stroke={NIGHT} strokeWidth="1.5" />
          <path d="M126 78 L122 84 M126 78 L130 84" stroke={NIGHT} strokeWidth="1.5" fill="none" />
        </g>
      )}

      {pose === "main" && (
        <g>
          {/* purse hanging on left arm */}
          <rect x="58" y="110" width="14" height="12" rx="2" fill={COPPER} stroke={NIGHT} strokeWidth="2" />
          <path d="M60 110 Q65 100 70 110" stroke={NIGHT} strokeWidth="2" fill="none" />
        </g>
      )}

      {pose === "shades" && (
        // little sparkle for cool moment
        <g>
          <path d="M150 50 L153 56 L159 59 L153 62 L150 68 L147 62 L141 59 L147 56 Z" fill={YELLOW} />
        </g>
      )}
    </svg>
  );
}
