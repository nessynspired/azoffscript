/**
 * Generate AZ Off Script logo PNGs from SVG.
 * Creates:
 *  - logo-white.png       (white text, transparent bg — for dark backgrounds)
 *  - logo-black.png       (black text, transparent bg — for light backgrounds)
 *  - logo-white-on-black.png (white text on solid black — poster style)
 *  - logo-black-on-white.png (black text on solid white — poster style)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "assets", "logos");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Wordmark SVG builder
// "AZ" in sunburst-yellow, "Off Script" in the chosen text color
// Compact, horizontal lockup
function wordmarkSVG({ textColor, bgColor, includeBg }) {
  const W = 1200;
  const H = 400;
  const padding = 40;
  // Use bold display-style font stack; sharp will rasterize via librsvg
  const fontStack = "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  const bgRect = includeBg
    ? `<rect width="${W}" height="${H}" fill="${bgColor}" />`
    : "";

  // "AZ" big in yellow, "Off Script" beside it in text color
  // Layout: AZ (left, large) | Off Script (right, slightly smaller, two words stacked or inline)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bgRect}
  <g font-family="${fontStack}" font-weight="900">
    <text x="${padding}" y="${H / 2 + 30}" font-size="220" fill="#f5b800" letter-spacing="-8">AZ</text>
    <text x="${padding + 260}" y="${H / 2 + 30}" font-size="180" fill="${textColor}" letter-spacing="-4">Off Script</text>
  </g>
</svg>`;
}

// Stacked version: AZ on top, OFF SCRIPT on bottom (square-ish for avatars)
function stackedSVG({ textColor, bgColor, includeBg, azColor }) {
  const W = 800;
  const H = 800;
  const fontStack = "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const bgRect = includeBg
    ? `<rect width="${W}" height="${H}" fill="${bgColor}" />`
    : "";
  const az = azColor ?? "#f5b800";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bgRect}
  <g font-family="${fontStack}" font-weight="900" text-anchor="middle">
    <text x="${W / 2}" y="${H / 2 - 20}" font-size="200" fill="${az}" letter-spacing="-6">AZ</text>
    <text x="${W / 2}" y="${H / 2 + 180}" font-size="130" fill="${textColor}" letter-spacing="-2">Off Script</text>
  </g>
</svg>`;
}

async function render(name, svg, opts = {}) {
  const outPath = path.join(OUT_DIR, name);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
  console.log("✓", name);
}

(async () => {
  // Horizontal lockups
  await render("logo-white.png", wordmarkSVG({ textColor: "#ffffff", includeBg: false }));
  await render("logo-black.png", wordmarkSVG({ textColor: "#1a1a1a", includeBg: false }));
  await render("logo-white-on-black.png", wordmarkSVG({ textColor: "#f2e8d8", bgColor: "#0d1b2a", includeBg: true }));
  await render("logo-black-on-white.png", wordmarkSVG({ textColor: "#0d1b2a", bgColor: "#f2e8d8", includeBg: true }));

  // Stacked (square) lockups — good for avatars / profile pics / PWA icons
  // Transparent versions (for placing on any background)
  await render("logo-stacked-white.png", stackedSVG({ textColor: "#ffffff", includeBg: false }));
  await render("logo-stacked-black.png", stackedSVG({ textColor: "#1a1a1a", includeBg: false }));
  // Brand-colored versions (desert-night bg, sunburst-yellow AZ, sandstone-cream text)
  await render("logo-stacked-white-on-black.png", stackedSVG({ textColor: "#f2e8d8", bgColor: "#0d1b2a", includeBg: true, azColor: "#ffd23f" }));
  await render("logo-stacked-black-on-white.png", stackedSVG({ textColor: "#0d1b2a", bgColor: "#f2e8d8", includeBg: true, azColor: "#c96a3a" }));
  // Extra: desert-night with copper-clay AZ (warm variant)
  await render("logo-stacked-desert-night.png", stackedSVG({ textColor: "#f2e8d8", bgColor: "#0d1b2a", includeBg: true, azColor: "#c96a3a" }));

  console.log("\nAll logos generated in:", OUT_DIR);
})();
