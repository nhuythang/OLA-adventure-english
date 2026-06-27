// Generates the PWA icon PNGs from an inline SVG (coral background + gold star —
// stickers are the reward currency, spec §6). Run once after changing the art:
//
//   node scripts/generate-icons.mjs
//
// Outputs (committed): src/app/apple-icon.png (180, iOS home screen) and
// public/icons/{icon-192,icon-512,icon-512-maskable}.png (web manifest). The
// matching favicon is the hand-written src/app/icon.svg. Brand tokens mirror
// globals.css: coral #FF6B5E, gold #FFC53D, cream #FFF7ED.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Five-point star path centred in a `size` box at `scale` (fraction of half-size).
function starPath(size, scale) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = (size / 2) * scale;
  const inner = outer * 0.42;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (-90 + i * 36) * (Math.PI / 180);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// `radius` rounds the background corners (0 = full-bleed square for maskable/iOS).
function svg(size, { radius, starScale }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#FF6B5E"/>
  <polygon points="${starPath(size, starScale)}" fill="#FFC53D" stroke="#FFF7ED" stroke-width="${size * 0.02}" stroke-linejoin="round"/>
</svg>`;
}

async function render(svgString, size, outPath) {
  mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svgString)).resize(size, size).png().toFile(outPath);
  console.log("wrote", path.relative(root, outPath));
}

const rounded = { radius: 96, starScale: 0.72 };
const square = { radius: 0, starScale: 0.72 };
const maskable = { radius: 0, starScale: 0.55 }; // star inside the maskable safe zone

await render(svg(512, rounded), 192, path.join(root, "public/icons/icon-192.png"));
await render(svg(512, rounded), 512, path.join(root, "public/icons/icon-512.png"));
await render(svg(512, maskable), 512, path.join(root, "public/icons/icon-512-maskable.png"));
await render(svg(180, square), 180, path.join(root, "src/app/apple-icon.png"));
