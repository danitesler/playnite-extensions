// Original Reverie masks. Node standard library only; no game art or other theme assets.
// Run: node src/themes/Reverie/art/generate-fx.mjs [absolute scratch contact-sheet.png]
// RGB is always white; the alpha channel carries the entire effect for brush recoloring.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'src/Images/fx');
mkdirSync(out, { recursive: true });
const clamp = x => Math.max(0, Math.min(1, x));
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(type, data) {
  const name = Buffer.from(type), bytes = Buffer.concat([name, data]);
  let crc = 0xffffffff;
  for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  const head = Buffer.alloc(4), tail = Buffer.alloc(4);
  head.writeUInt32BE(data.length); tail.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([head, bytes, tail]);
}
function png(width, height, rgba) {
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 6;
  const scan = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) rgba.copy(scan, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(scan, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const masks = [];
function mask(name, width, height, alpha) {
  const rgba = Buffer.alloc(width * height * 4, 255);
  let nonzero = 0, high = 0, max = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const a = Math.round(255 * clamp(alpha(x + .5, y + .5)));
    rgba[(y * width + x) * 4 + 3] = a;
    nonzero += a > 0; high += a >= 77; max = Math.max(max, a);
  }
  const bytes = png(width, height, rgba);
  writeFileSync(resolve(out, name + '.png'), bytes);
  masks.push({ name, width, height, rgba });
  console.log(`${name}: ${width}x${height}, white RGB, alpha max=${max}, nonzero=${nonzero}, alpha>=0.3=${high}, sha256=${createHash('sha256').update(bytes).digest('hex')}`);
}

// Two smooth radial falloffs give the bloom a bright center and a broad, quiet shoulder.
mask('bloom', 128, 128, (x, y) => {
  const r2 = (x - 64) ** 2 + (y - 64) ** 2;
  const edge = clamp((64 - Math.sqrt(r2)) / 12);
  return (.72 * Math.exp(-r2 / (2 * 13 ** 2)) + .28 * Math.exp(-r2 / (2 * 27 ** 2))) * edge ** 2;
});

// Asymmetric hand-drawn orbital seed: three different loops, not a game symbol.
const paths = [
  [122, 127, 76, 38, -.48, .4],
  [128, 124, 69, 43, .75, 1.3],
  [126, 128, 34, 78, .15, 2.2],
].map(([cx, cy, rx, ry, angle, phase]) => Array.from({ length: 161 }, (_, i) => {
  const t = i / 160 * Math.PI * 2;
  const wobble = 1 + .028 * Math.sin(t * 3 + phase) + .018 * Math.cos(t * 5 + phase);
  const x = Math.cos(t) * rx * wobble, y = Math.sin(t) * ry * wobble;
  return [cx + x * Math.cos(angle) - y * Math.sin(angle), cy + x * Math.sin(angle) + y * Math.cos(angle)];
}));
const segments = paths.flatMap(points => points.slice(1).map((p, i) => [points[i], p]));
function distanceToSegment(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy));
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}
mask('orbit', 256, 256, (x, y) => {
  let d = Infinity;
  for (const [a, b] of segments) d = Math.min(d, distanceToSegment(x, y, a, b));
  // 3.8px raster line becomes 1.5px at 100px display; halo ~12px at that size.
  const line = clamp(1.9 - d), halo = .25 * Math.exp(-d * d / (2 * 10 ** 2));
  const seed = clamp(6.5 - Math.hypot(x - 129, y - 125));
  const bead = clamp(5 - Math.hypot(x - 193, y - 79));
  return Math.max(seed, bead, line + halo);
});

// Seeded cloud lobes, feathered to zero on all edges; intended for sparse chrome only.
let seed = 0x52455645;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
const clouds = Array.from({ length: 36 }, () => [random() * 512, 65 + random() * 130, 18 + random() * 65, 12 + random() * 30, .08 + random() * .2]);
mask('haze', 512, 256, (x, y) => {
  let a = 0;
  for (const [cx, cy, sx, sy, weight] of clouds) a += weight * Math.exp(-.5 * (((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
  const edge = Math.sin(Math.PI * x / 512) ** 1.5 * Math.sin(Math.PI * y / 256) ** 2;
  return clamp(a * .62) * edge;
});

// A bolder derivative of the same original mark, suitable for an orange add-on tile.
const pathData = paths.map(points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z').join(' ');
writeFileSync(resolve(root, 'art/logo.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="28 28 200 200"><path d="${pathData}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="129" cy="125" r="10" fill="#fff"/><circle cx="193" cy="79" r="8" fill="#fff"/></svg>\n`);

if (process.argv[2]) {
  const target = resolve(process.argv[2]);
  if (target.startsWith(root)) throw new Error('Contact sheet is disposable: pass a scratch path outside the theme.');
  const width = 1024, height = 352, rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) { rgba[i * 4] = 18; rgba[i * 4 + 1] = 1; rgba[i * 4 + 2] = 46; rgba[i * 4 + 3] = 255; }
  const placements = [[masks[0], 32, 96, [255,226,154]], [masks[1], 176, 32, [255,113,219]], [masks[2], 448, 80, [99,229,242]]];
  for (const [m, ox, oy, color] of placements) for (let y = 0; y < m.height && oy + y < height; y++) for (let x = 0; x < m.width && ox + x < width; x++) {
    const a = m.rgba[(y * m.width + x) * 4 + 3] / 255, i = ((oy + y) * width + ox + x) * 4;
    for (let c = 0; c < 3; c++) rgba[i + c] = Math.round(rgba[i + c] * (1 - a) + color[c] * a);
  }
  mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, png(width, height, rgba));
  console.log(`Contact sheet: ${target}`);
}
