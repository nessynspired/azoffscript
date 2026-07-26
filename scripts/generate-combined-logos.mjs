/**
 * Generate combined AZ Off Script logos: mascot character + wordmark.
 *
 * Layout: [mascot] [AZ Off Script text]
 *   - "AZ" in Anton (condensed bold display font), sunburst-yellow
 *   - "Off Script" in Permanent Marker (handwritten cursive), in text color
 *
 * Fonts are embedded as base64 in the SVG so sharp/librsvg can render them.
 *
 * Creates:
 *  - logo-combined-white.png       (mascot + white "Off Script", transparent — dark bg)
 *  - logo-combined-black.png       (mascot + dark "Off Script", transparent — light bg)
 *  - logo-combined-white-on-dark.png  (on desert-night bg)
 *  - logo-combined-black-on-light.png (on sandstone-cream bg)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "assets", "logos");
const MASCOT_SRC = path.join(process.cwd(), "public", "assets", "mascot-primary-purse-transparent.png");
const ANTON_TTF = path.join(process.cwd(), "public", "assets", "fonts", "Anton-Regular.ttf");
const MARKER_TTF = path.join(process.cwd(), "public", "assets", "fonts", "PermanentMarker-Regular.ttf");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Embed fonts as base64 data URIs so librsvg can use them
const antonB64 = fs.readFileSync(ANTON_TTF).toString("base64");
const markerB64 = fs.readFileSync(MARKER_TTF).toString("base64");

// Wordmark SVG with embedded fonts.
// "AZ" in Anton (condensed, bold), "Off Script" in Permanent Marker (cursive).
// The cursive font needs more room for descenders/ascenders (p, t, f).
function wordmarkSVG({ textColor, azColor }) {
  const W = 1000;
  const H = 400;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @font-face {
        font-family: 'Anton';
        src: url(data:font/ttf;base64,${antonB64}) format('truetype');
      }
      @font-face {
        font-family: 'PermanentMarker';
        src: url(data:font/ttf;base64,${markerB64}) format('truetype');
      }
    </style>
  </defs>
  <text x="0" y="${H / 2 + 55}" font-family="Anton" font-size="210" fill="${azColor}" letter-spacing="2">AZ</text>
  <text x="210" y="${H / 2 + 45}" font-family="PermanentMarker" font-size="170" fill="${textColor}">Off Script</text>
</svg>`;
}

async function makeCombinedLogo(name, { textColor, azColor, bgColor, includeBg }) {
  const LOGO_H = 400;

  // 1. Crop the mascot tightly around the character's actual pixels.
  //    Character bounds (from alpha scan of 1024x1536 source):
  //      x: 272-810 (538px wide), y: 47-1160 (1113px tall)
  //    We take the top portion (head + upper body) for the logo.
  const pad = 8;
  const cropLeft = 272 - pad;          // 264
  const cropTop = 47 - pad;            // 39
  const cropWidth = 538 + pad * 2;     // 554
  const cropHeight = 700 + pad * 2;    // 716
  const croppedW = cropWidth;          // 554
  const croppedH = cropHeight;         // 716

  // Resize to logo height, preserving aspect ratio (explicit width)
  const mascotW = Math.round(LOGO_H * croppedW / croppedH); // ~310
  const mascot = await sharp(MASCOT_SRC)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(mascotW, LOGO_H, { fit: "fill" });

  // 2. Render the wordmark text as a PNG (with embedded fonts)
  const wordmark = await sharp(Buffer.from(wordmarkSVG({ textColor, azColor })))
    .resize({ height: LOGO_H, fit: "inside" });

  // 3. Get dimensions
  const wordMeta = await wordmark.metadata();
  const wordW = wordMeta.width;
  const gap = 8; // tight gap between character and wordmark
  const totalW = mascotW + gap + wordW;
  const totalH = LOGO_H;

  // 4. Create background (or transparent)
  const bgOpts = includeBg
    ? { background: { r: parseInt(bgColor.slice(1, 3), 16), g: parseInt(bgColor.slice(3, 5), 16), b: parseInt(bgColor.slice(5, 7), 16), alpha: 1 } }
    : { background: { r: 0, g: 0, b: 0, alpha: 0 } };

  // 5. Composite: background + mascot + wordmark
  const base = sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: bgOpts.background,
    },
  });

  const mascotBuffer = await mascot.png().toBuffer();
  const wordBuffer = await wordmark.png().toBuffer();

  await base
    .composite([
      { input: mascotBuffer, left: 0, top: 0 },
      { input: wordBuffer, left: mascotW + gap, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, name));

  console.log("✓", name, `(${totalW}x${totalH}) — mascot:${mascotW}px word:${wordW}px gap:${gap}px`);
}

(async () => {
  console.log("Generating combined mascot + wordmark logos (with brand fonts)...\n");

  // Transparent — for placing on any background
  // "AZ" in sunburst-yellow, "Off Script" in white/black
  await makeCombinedLogo("logo-combined-white.png", {
    textColor: "#ffffff",
    azColor: "#ffd23f",
    includeBg: false,
  });
  await makeCombinedLogo("logo-combined-black.png", {
    textColor: "#0d1b2a",
    azColor: "#c96a3a",
    includeBg: false,
  });

  // Solid background versions
  await makeCombinedLogo("logo-combined-white-on-dark.png", {
    textColor: "#f2e8d8",     // sandstone-cream
    azColor: "#ffd23f",       // sunburst-yellow
    bgColor: "#0d1b2a",       // desert-night
    includeBg: true,
  });
  await makeCombinedLogo("logo-combined-black-on-light.png", {
    textColor: "#0d1b2a",     // desert-night
    azColor: "#c96a3a",       // copper-clay
    bgColor: "#f2e8d8",       // sandstone-cream
    includeBg: true,
  });

  console.log("\nDone. Combined logos in:", OUT_DIR);
})();
