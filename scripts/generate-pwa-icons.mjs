// Generate PWA icons from the AZ Off Script stacked logo (white on black).
// Creates: icon-192, icon-512, icon-maskable-512, apple-touch-icon, favicon
import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "..", "public", "assets", "logos", "logo-stacked-white-on-black.png");
const dest = resolve(__dirname, "..", "public", "icons");

if (!existsSync(src)) {
  console.error("Source logo not found:", src);
  console.error("Run `node scripts/generate-logos.mjs` first.");
  process.exit(1);
}
mkdirSync(dest, { recursive: true });

const BG = "#0a1f3d"; // deep blue (matches the animated intro background)

async function makeIcon(size, name, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  await sharp(src)
    .resize(size, size, { fit: "contain", background: BG })
    .extend({
      top: padding, bottom: padding, left: padding, right: padding,
      background: BG,
    })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeAppleIcon(size, name) {
  // Apple touch icon: solid background, no transparency, square
  await sharp(src)
    .resize(size, size, { fit: "contain", background: BG })
    .flatten({ background: BG })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeFavicon() {
  // Favicon: 32x32 with the logo on blue
  await sharp(src)
    .resize(32, 32, { fit: "contain", background: BG })
    .png()
    .toFile(resolve(dest, "favicon-32.png"));
  console.log("  ✓ favicon-32.png (32x32)");

  // 16x16
  await sharp(src)
    .resize(16, 16, { fit: "contain", background: BG })
    .png()
    .toFile(resolve(dest, "favicon-16.png"));
  console.log("  ✓ favicon-16.png (16x16)");
}

async function main() {
  console.log("Generating PWA icons from AZ Off Script stacked logo...");
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeIcon(512, "icon-maskable-512.png", true);
  await makeAppleIcon(180, "apple-touch-icon.png");
  await makeFavicon();
  console.log("\nDone. Icons in public/icons/");
}

main().catch((e) => { console.error(e); process.exit(1); });
