/**
 * Generate PWA icons + favicons from the official AZ Off Script logo.
 *
 * Source: public/assets/logos/azoffscriptlogo.png (1024x1536, transparent)
 * Content is cropped to its artwork bounds, enlarged to fill the square, and
 * placed on an opaque brand-cream background so home screens do not shrink it as
 * transparent foreground artwork.
 *
 * Creates:
 *  - icon-192.png, icon-512.png, icon-576.png, icon-1536.png
 *  - icon-maskable-512.png, icon-maskable-1536.png
 *  - apple-touch-icon.png (180x180), apple-touch-icon-540.png
 *  - favicon-16.png, favicon-32.png, favicon-48.png, favicon-96.png
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

const BG = { r: 0xf2, g: 0xe8, b: 0xd8, alpha: 1 };

// Trim the transparent source and place the artwork on a full opaque canvas.
async function makeIcon(size, name, maskable = false) {
  const padding = Math.round(size * (maskable ? 0.08 : 0.025));
  const inner = size - padding * 2;
  const artwork = await sharp(logoSrc)
    .extract({ left: 69, top: 277, width: 887, height: 729 })
    .resize(inner, inner, { fit: "contain", background: BG })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: artwork, gravity: "center" }])
    .flatten({ background: BG })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeFavicon(size, name) {
  await makeIcon(size, name);
}

async function main() {
  console.log("Generating PWA icons + favicons from official logo...\n");
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeIcon(576, "icon-576.png");
  await makeIcon(1536, "icon-1536.png");
  await makeIcon(512, "icon-maskable-512.png", true);
  await makeIcon(1536, "icon-maskable-1536.png", true);
  await makeIcon(180, "apple-touch-icon.png");
  await makeIcon(540, "apple-touch-icon-540.png");
  await makeFavicon(16, "favicon-16.png");
  await makeFavicon(32, "favicon-32.png");
  await makeFavicon(48, "favicon-48.png");
  await makeFavicon(96, "favicon-96.png");
  console.log("\nDone. Icons in public/icons/");
}

main().catch((e) => { console.error(e); process.exit(1); });
