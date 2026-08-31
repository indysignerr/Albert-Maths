/**
 * Builds the favicon set from the Albert mark, drawn as vector rather than
 * downscaled from the PNG logo: at 16px a resampled photo of the wordmark turns
 * to mush, while the sphere-and-dot silhouette stays readable.
 *
 *   node scripts/generate-favicon.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const NAVY = "#202448";
const OUT = "public";

/** The mark on its navy field — matches the square logo Albert School uses. */
const markSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="s" x1="18%" y1="12%" x2="82%" y2="88%">
      <stop offset="0%" stop-color="#2EAEE0"/>
      <stop offset="55%" stop-color="#74BEEA"/>
      <stop offset="100%" stop-color="#CFE8F7"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="12" fill="${NAVY}"/>
  <circle cx="37" cy="32" r="19" fill="url(#s)"/>
  <circle cx="16" cy="32" r="5.5" fill="#FFFFFF"/>
</svg>`;

const png = (size) =>
  sharp(Buffer.from(markSvg(size))).resize(size, size).png().toBuffer();

const sizes = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["og-mark.png", 600],
];

await mkdir(OUT, { recursive: true });

for (const [name, size] of sizes) {
  await writeFile(`${OUT}/${name}`, await png(size));
  console.log(`  ${name}  ${size}x${size}`);
}

// .ico: 32x32 is enough for every browser that still reads one.
await writeFile(`${OUT}/favicon.ico`, await png(32));
console.log("  favicon.ico  32x32");

await writeFile(
  `${OUT}/site.webmanifest`,
  JSON.stringify(
    {
      name: "Albert Maths",
      short_name: "Albert Maths",
      description: "Understand your mistakes, not just the answer.",
      start_url: "/app/",
      display: "standalone",
      background_color: NAVY,
      theme_color: NAVY,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log("  site.webmanifest");
