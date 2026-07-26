/**
 * Generate combined AZ Off Script logos: mascot character + wordmark.
 *
 * Layout: [mascot] [AZ Off Script text]
 * The mascot is a tall portrait (1024x1536) — we crop the top portion
 * (head + upper body) and place it beside the wordmark.
 *
 * Creates:
 *  - logo-combined-white.png       (mascot + white text, transparent bg — dark backgrounds)
 *  - logo-combined-black.png       (mascot + black text, transparent bg — light backgrounds)
 *  - logo-combined-white-on-dark.png  (mascot + cream text on desert-night)
 *  - logo-combined-black-on-light.png (mascot + dark text on sandstone-cream)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "assets", "logos");
const MASCOT_SRC = path.join(process.cwd(), "public", "assets", "mascot-primary-purse-transparent.png");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Wordmark SVG — just the text part (mascot gets composited on the left)
function wordmarkSVG({ textColor, azColor }) {
  const W = 900;
  const H = 400;
  const fontStack = "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <g font-family="${fontStack}" font-weight="900">
    <text x="0" y="${H / 2 + 30}" font-size="200" fill="${azColor}" letter-spacing="-8">AZ</text>
    <text x="240" y="${H / 2 + 30}" font-size="160" fill="${textColor}" letter-spacing="-4">Off Script</text>
  </g>
</svg>`;
}

async function makeCombinedLogo(name, { textColor, azColor, bgColor, includeBg }) {
  const LOGO_H = 400;

  // 1. Prepare mascot: crop a tight center column from the top portion
  //    (just the character, not the transparent space around it), then
  //    resize to logo height. The mascot is 1024x1536 — the character
  //    occupies roughly the center 620px of the width.
  const mascotTopCrop = 1024;
  const cropLeft = 200;  // skip transparent left margin
  const cropWidth = 624; // tight crop around the character
  const mascot = await sharp(MASCOT_SRC)
    .extract({ left: cropLeft, top: 0, width: cropWidth, height: mascotTopCrop })
    .resize({ height: LOGO_H, fit: "inside" });

  // 2. Render the wordmark text as a PNG
  const wordmark = await sharp(Buffer.from(wordmarkSVG({ textColor, azColor })))
    .resize({ height: LOGO_H, fit: "inside" });

  // 3. Get trimmed dimensions
  const mascotMeta = await mascot.metadata();
  const wordMeta = await wordmark.metadata();
  const mascotW = mascotMeta.width;
  const wordW = wordMeta.width;
  const gap = 12; // tight gap between character and wordmark
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

  console.log("✓", name, `(${totalW}x${totalH})`);
}

(async () => {
  console.log("Generating combined mascot + wordmark logos...\n");

  // Transparent — for placing on any background
  await makeCombinedLogo("logo-combined-white.png", {
    textColor: "#ffffff",
    azColor: "#f5b800",
    includeBg: false,
  });
  await makeCombinedLogo("logo-combined-black.png", {
    textColor: "#1a1a1a",
    azColor: "#c96a3a",
    includeBg: false,
  });

  // Solid background versions
  await makeCombinedLogo("logo-combined-white-on-dark.png", {
    textColor: "#f2e8d8",
    azColor: "#ffd23f",
    bgColor: "#0d1b2a",
    includeBg: true,
  });
  await makeCombinedLogo("logo-combined-black-on-light.png", {
    textColor: "#0d1b2a",
    azColor: "#c96a3a",
    bgColor: "#f2e8d8",
    includeBg: true,
  });

  console.log("\nDone. Combined logos in:", OUT_DIR);
})();
