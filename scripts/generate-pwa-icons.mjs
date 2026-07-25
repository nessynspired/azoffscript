// Generate PWA icons from the peace-sign mascot transparent PNG.
// Creates: icon-192, icon-512, icon-maskable-512, apple-touch-icon, favicon
import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "..", "public", "assets", "mascot-peace-sign-transparent.png");
const dest = resolve(__dirname, "..", "public", "icons");

if (!existsSync(src)) {
  console.error("Source mascot not found:", src);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });

const BG = "#1A1F2C"; // desert-night background for solid icons

async function makeIcon(size, name, maskable = false) {
  const padding = maskable ? Math.round(size * 0.2) : Math.round(size * 0.1);
  const inner = size - padding * 2;
  await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding, bottom: padding, left: padding, right: padding,
      background: { r: 0x1A, g: 0x1F, b: 0x2C, alpha: 1 },
    })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeAppleIcon(size, name) {
  // Apple touch icon: solid background, no transparency, square
  await sharp(src)
    .resize(Math.round(size * 0.7), Math.round(size * 0.7), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten({ background: BG })
    .resize(size, size, { fit: "contain", background: BG })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeFavicon() {
  // Favicon: 32x32 with transparent background
  await sharp(src)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(dest, "favicon-32.png"));
  console.log("  ✓ favicon-32.png (32x32)");

  // Also a 16x16
  await sharp(src)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(dest, "favicon-16.png"));
  console.log("  ✓ favicon-16.png (16x16)");
}

async function main() {
  console.log("Generating PWA icons from peace-sign mascot...");
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeIcon(512, "icon-maskable-512.png", true);
  await makeAppleIcon(180, "apple-touch-icon.png");
  await makeFavicon();
  console.log("\nDone. Icons in public/icons/");
}

main().catch((e) => { console.error(e); process.exit(1); });
