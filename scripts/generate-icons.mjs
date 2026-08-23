/**
 * Generates the PWA PNG icon set (no image dependencies).
 *   node scripts/generate-icons.mjs
 *
 * Produces in public/icons/:
 *   icon-192.png, icon-512.png          → standard icons
 *   maskable-192.png, maskable-512.png  → full-bleed maskable icons
 *   apple-touch-icon.png                → 180×180 iOS icon
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'public/icons');
const BRAND = [37, 99, 235]; // #2563eb
const WHITE = [255, 255, 255];

/* ---------------- minimal PNG encoder ---------------- */

const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (none)
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------- tiny rasteriser ---------------- */

class Canvas {
  constructor(size) {
    this.size = size;
    this.data = Buffer.alloc(size * size * 4); // transparent black
  }

  blend(x, y, [r, g, b], alpha) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size || alpha <= 0) return;
    const i = (y * this.size + x) * 4;
    const prevAlpha = this.data[i + 3] / 255;
    const outAlpha = Math.min(1, alpha + prevAlpha * (1 - alpha));
    this.data[i] = Math.round(
      (r * alpha + this.data[i] * prevAlpha * (1 - alpha)) / outAlpha,
    );
    this.data[i + 1] = Math.round(
      (g * alpha + this.data[i + 1] * prevAlpha * (1 - alpha)) / outAlpha,
    );
    this.data[i + 2] = Math.round(
      (b * alpha + this.data[i + 2] * prevAlpha * (1 - alpha)) / outAlpha,
    );
    this.data[i + 3] = Math.round(outAlpha * 255);
  }
}

/** Anti-aliased rounded rectangle via signed-distance coverage. */
function fillRoundedRect(canvas, cx, cy, w, h, radius, color) {
  const halfW = w / 2;
  const halfH = h / 2;
  for (let y = 0; y < canvas.size; y++) {
    for (let x = 0; x < canvas.size; x++) {
      const dx = Math.abs(x + 0.5 - cx) - (halfW - radius);
      const dy = Math.abs(y + 0.5 - cy) - (halfH - radius);
      const outsideX = Math.max(dx, 0);
      const outsideY = Math.max(dy, 0);
      const dist =
        Math.hypot(outsideX, outsideY) + Math.min(Math.max(dx, dy), 0) - radius;
      const coverage = Math.min(1, Math.max(0, 0.5 - dist));
      canvas.blend(x, y, color, coverage);
    }
  }
}

/** Anti-aliased vertical stem (rounded). */
function fillStem(canvas, x0, y0, w, h, radius, color) {
  fillRoundedRect(canvas, x0 + w / 2, y0 + h / 2, w, h, radius, color);
}

/** Anti-aliased triangle via three half-plane tests. */
function fillTriangle(canvas, ax, ay, bx, by, cx, cy, color) {
  // Ensure consistent winding so the inside test is stable.
  const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const sign = area > 0 ? 1 : -1;
  const edge = (px, py, x1, y1, x2, y2) =>
    sign * ((px - x1) * (y2 - y1) - (py - y1) * (x2 - x1));

  const minX = Math.floor(Math.min(ax, bx, cx));
  const maxX = Math.ceil(Math.max(ax, bx, cx));
  const minY = Math.floor(Math.min(ay, by, cy));
  const maxY = Math.ceil(Math.max(ay, by, cy));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const dist = Math.max(
        edge(px, py, ax, ay, bx, by),
        edge(px, py, bx, by, cx, cy),
        edge(px, py, cx, cy, ax, ay),
      );
      const coverage = Math.min(1, Math.max(0, 0.75 - dist));
      canvas.blend(x, y, color, coverage);
    }
  }
}

/* ---------------- glyph (mirrors public/icons/icon.svg) ---------------- */

const GLYPH = {
  upHead: [
    [170, 118],
    [238, 240],
    [102, 240],
  ],
  upStem: { x: 146, y: 232, w: 48, h: 146 },
  downHead: [
    [342, 394],
    [274, 272],
    [410, 272],
  ],
  downStem: { x: 318, y: 134, w: 48, h: 146 },
};

function drawGlyph(canvas, scale) {
  fillTriangle(canvas, ...GLYPH.upHead.map(([x, y]) => [x * scale, y * scale]), WHITE);
  fillStem(
    canvas,
    GLYPH.upStem.x * scale,
    GLYPH.upStem.y * scale,
    GLYPH.upStem.w * scale,
    GLYPH.upStem.h * scale,
    12 * scale,
    WHITE,
  );

  fillTriangle(canvas, ...GLYPH.downHead.map(([x, y]) => [x * scale, y * scale]), WHITE);
  fillStem(
    canvas,
    GLYPH.downStem.x * scale,
    GLYPH.downStem.y * scale,
    GLYPH.downStem.w * scale,
    GLYPH.downStem.h * scale,
    12 * scale,
    WHITE,
  );
}

function renderIcon(size, { maskable = false } = {}) {
  const canvas = new Canvas(size);
  if (maskable) {
    // Full-bleed background — the OS applies its own mask.
    fillRoundedRect(canvas, size / 2, size / 2, size, size, 0, BRAND);
  } else {
    fillRoundedRect(canvas, size / 2, size / 2, size, size, size * 0.22, BRAND);
  }
  drawGlyph(canvas, size / 512);
  return encodePng(size, canvas.data);
}

/* ---------------- write files ---------------- */

mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  ['icon-192.png', renderIcon(192)],
  ['icon-512.png', renderIcon(512)],
  ['maskable-192.png', renderIcon(192, { maskable: true })],
  ['maskable-512.png', renderIcon(512, { maskable: true })],
  ['apple-touch-icon.png', renderIcon(180)],
];

for (const [name, buffer] of outputs) {
  writeFileSync(path.join(OUT_DIR, name), buffer);
  console.log(`OK public/icons/${name} (${buffer.length} bytes)`);
}

console.log('Icons generated.');
