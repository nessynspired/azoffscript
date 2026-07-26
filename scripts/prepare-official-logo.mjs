/**
 * Prepare the official AZ Off Script logo for use in the nav, footer, etc.
 *
 * Source: public/assets/logos/azoffscriptlogo.png (1024x1536, transparent)
 * Content bounds: x=69-955 (886px), y=277-1005 (728px)
 *
 * Creates a tightly-cropped version with minimal padding, suitable for
 * placing in the nav bar (transparent background, works on dark backgrounds).
 */
import sharp from "sharp";
import path from "path";

const SRC = path.join(process.cwd(), "public", "assets", "logos", "azoffscriptlogo.png");
const OUT_DIR = path.join(process.cwd(), "public", "assets", "logos");

(async () => {
  console.log("Preparing official AZ Off Script logo...\n");

  // Scan for actual content bounds (non-transparent pixels)
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      if (data[i + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`Content bounds: x=${minX}-${maxX} (w=${maxX - minX}), y=${minY}-${maxY} (h=${maxY - minY})`);

  const pad = 12;
  const cropLeft = Math.max(0, minX - pad);
  const cropTop = Math.max(0, minY - pad);
  const cropWidth = (maxX - minX) + pad * 2;
  const cropHeight = (maxY - minY) + pad * 2;

  // Tight crop — the official logo, just with transparent borders removed
  await sharp(SRC)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, "logo-official.png"));
  console.log(`✓ logo-official.png (${cropWidth}x${cropHeight}) — tight crop, transparent`);

  console.log("\nDone. Use /assets/logos/logo-official.png in the nav.");
})();
