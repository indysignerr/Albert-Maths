/** Social preview card. Drawn as vector so it stays sharp and stays on-brand. */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sphere" x1="18%" y1="12%" x2="82%" y2="88%">
      <stop offset="0%" stop-color="#2EAEE0"/>
      <stop offset="55%" stop-color="#74BEEA"/>
      <stop offset="100%" stop-color="#CFE8F7"/>
    </linearGradient>
    <radialGradient id="glow" cx="18%" cy="12%" r="70%">
      <stop offset="0%" stop-color="#2EAEE0" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#202448" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#202448"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <circle cx="128" cy="96" r="30" fill="url(#sphere)"/>
  <circle cx="93" cy="96" r="9" fill="#FFFFFF"/>
  <text x="176" y="108" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF" letter-spacing="1">ALBERT</text>
  <text x="322" y="108" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="200" fill="#FFFFFF" letter-spacing="7">MATHS</text>

  <text x="92" y="300" font-family="Helvetica, Arial, sans-serif" font-size="82" font-weight="200" fill="#FFFFFF">Find out <tspan fill="#74BEEA">where</tspan></text>
  <text x="92" y="392" font-family="Helvetica, Arial, sans-serif" font-size="82" font-weight="200" fill="#FFFFFF">you got it wrong.</text>

  <text x="92" y="486" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#A6D8F2">Hints before answers. Always.</text>
  <text x="92" y="556" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#8FA0C4">Paris · Milan · Madrid · Geneva · Marseille</text>
</svg>`;

await writeFile("public/og.png", await sharp(Buffer.from(svg)).png().toBuffer());
console.log("  og.png  1200x630");
