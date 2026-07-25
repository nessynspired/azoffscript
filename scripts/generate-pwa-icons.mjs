// Generate PWA icons from a close-up of the AZ Off Script cactus mascot.
// The mascot is a tall portrait image (1024x1536) — we crop the top square
// to show the character's face/body close-up, which is recognizable at the
// tiny sizes of favicons and phone home screen icons.
//
// Creates: icon-192, icon-512, icon-maskable-512, apple-touch-icon, favicon
import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mascotSrc = resolve(__dirname, "..", "public", "assets", "mascot-primary-purse-transparent.png");
const dest = resolve(__dirname, "..", "public", "icons");

if (!existsSync(mascotSrc)) {
  console.error("Mascot not found:", mascotSrc);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });

const BG = "#0d1b2a"; // desert-night (brand color)

// Crop a square close-up from the top-center of the mascot.
// Mascot is 1024x1536 — we take the top 1024x1024 to focus on the character.
async function mascotCloseUp(size) {
  const meta = await sharp(mascotSrc).metadata();
  const w = meta.width;
  const h = meta.height;
  // Crop square from top-center (character's face/body area)
  const cropSize = Math.min(w, h);
  const left = Math.round((w - cropSize) / 2);
  const top = 0; // start from top to get the head/face
  return sharp(mascotSrc)
    .extract({ left, top, width: cropSize, height: cropSize })
    .resize(size, size, { fit: "contain", background: { r: 0x0d, g: 0x1b, b: 0x2a, alpha: 1 } });
}

async function makeIcon(size, name, maskable = false) {
  // For maskable icons, add padding so the safe zone keeps the character visible
  const padding = maskable ? Math.round(size * 0.1) : Math.round(size * 0.05);
  const inner = size - padding * 2;
  const pipeline = await mascotCloseUp(inner);
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
  // Apple touch icon: solid background, no transparency, square
  const pipeline = await mascotCloseUp(size);
  await pipeline
    .flatten({ background: BG })
    .png()
    .toFile(resolve(dest, name));
  console.log(`  ✓ ${name} (${size}x${size})`);
}

async function makeFavicon() {
  // Favicon: 32x32 close-up of the mascot
  const p32 = await mascotCloseUp(32);
  await p32.flatten({ background: BG }).png().toFile(resolve(dest, "favicon-32.png"));
  console.log("  ✓ favicon-32.png (32x32)");

  // 16x16
  const p16 = await mascotCloseUp(16);
  await p16.flatten({ background: BG }).png().toFile(resolve(dest, "favicon-16.png"));
  console.log("  ✓ favicon-16.png (16x16)");
}

async function main() {
  console.log("Generating PWA icons from mascot close-up (primary pose)...");
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeIcon(512, "icon-maskable-512.png", true);
  await makeAppleIcon(180, "apple-touch-icon.png");
  await makeFavicon();
  console.log("\nDone. Icons in public/icons/");
  console.log("\nThe mascot character is now the app icon — recognizable at");
  console.log("small sizes like favicons and phone home screen icons.");
}

main().catch((e) => { console.error(e); process.exit(1); });
