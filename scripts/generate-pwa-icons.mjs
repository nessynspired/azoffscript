/**
 * Generate PWA icons + favicons from the official AZ Off Script logo.
 *
 * Source: public/assets/logos/azoffscriptlogo.png (1024x1536, transparent)
 * Content: x=69-955 (886px), y=277-1005 (728px), center=(512, 641)
 *
 * The logo is landscape (886x728) so for square icons we crop the largest
 * square centered on the logo's center, then flatten onto the brand
 * background color (desert-night) so there are no transparency artifacts.
 *
 * Creates:
 *  - icon-192.png, icon-512.png, icon-maskable-512.png
 *  - apple-touch-icon.png (180x180)
 *  - favicon-32.png, favicon-16.png
 */
import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logoSrc = resolve(__dirname, "..", "public", "assets", "logos", "azoffscriptlogo.png");
const dest = resolve(__dirname, "..", "public", "icons");

if (!existsSync(logoSrc)) {
  console.error("Logo not found:", logoSrc);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });

const BG = "#0d1b2a"; // desert-night (brand color)

// Crop the largest square centered on the logo content, then resize.
// Logo content: x=69-955, y=277-1005, center=(512, 641)
// Largest square that fits in content: 728x728, but we use a bit more
// to include some breathing room. Center on (512, 641).
async function logoSquare(size) {
  // Source is 1024x1536. Center of content is (512, 641).
  // Crop a square of side 760 centered there (fits within content + small pad).
  const cropSize = 760;
  const left = Math.max(0, 512 - Math.round(cropSize / 2));   // 132
  const top = Math.max(0, 641 - Math.round(cropSize / 2));    // 261
  return sharp(logoSrc)
    .extract({ left, top, width: cropSize, height: cropSize })
    .flatten({ background: { r: 0x0d, g: 0x1b, b: 0x2a, alpha: 1 } })
    .resize(size, size, { fit: "cover", position: "top" })
    .flatten({ background: { r: 0x0d, g: 0x1b, b: 0x2a, alpha: 1 } });
}

async function makeIcon(size, name, maskable = false) {
  // For maskable icons, add padding so the safe zone keeps the logo visible
  const padding = maskable ? Math.round(size * 0.1) : Math.round(size * 0.05);
  const inner = size - padding * 2;
  const pipeline = await logoSquare(inner);
  await pipeline
    .extend({
      top: padding, bottom: padding, left: padding, right: padding,
      background: { r: 0x0d, g: 0x1b, b: 0x2a, alpha: 1 },
    })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeAppleIcon(size, name) {
  const pipeline = await logoSquare(size);
  await pipeline
    .flatten({ background: BG })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeFavicon() {
  const p32 = await logoSquare(32);
  await p32.flatten({ background: BG }).png().toFile(resolve(dest, "favicon-32.png"));
  console.log("  ✓ favicon-32.png (32x32)");

  const p16 = await logoSquare(16);
  await p16.flatten({ background: BG }).png().toFile(resolve(dest, "favicon-16.png"));
  console.log("  ✓ favicon-16.png (16x16)");
}

async function main() {
  console.log("Generating PWA icons + favicons from official logo...\n");
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeIcon(512, "icon-maskable-512.png", true);
  await makeAppleIcon(180, "apple-touch-icon.png");
  await makeFavicon();
  console.log("\nDone. Icons in public/icons/");
}

main().catch((e) => { console.error(e); process.exit(1); });
