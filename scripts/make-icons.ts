/**
 * Icons are generated rather than checked in as binaries so the design lives in
 * source. Run with `npm run make-icons` after changing it.
 */

import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

type Rgb = [number, number, number];

const BG: Rgb = [26, 34, 56];
const FG: Rgb = [240, 244, 255];

function crc32(buf: Buffer): number {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crcBuf]);
}

function png(size: number, pixel: (x: number, y: number) => Rgb): Buffer {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let i = 0;
  for (let y = 0; y < size; y++) {
    raw[i++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y);
      raw[i++] = r;
      raw[i++] = g;
      raw[i++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A note head with a stem, drawn in normalized [0,1] coordinates. */
function glyph(u: number, v: number): boolean {
  const headX = 0.42;
  const headY = 0.68;
  const rx = 0.19;
  const ry = 0.14;
  const dx = (u - headX) / rx;
  const dy = (v - headY) / ry;
  const head = dx * dx + dy * dy <= 1;
  const stem = u >= 0.57 && u <= 0.63 && v >= 0.26 && v <= 0.68;
  const flag =
    v >= 0.26 && v <= 0.36 && u >= 0.57 && u <= 0.63 + (v - 0.26) * 1.6;
  return head || stem || flag;
}

function draw(size: number, inset: number): Buffer {
  return png(size, (x, y) => {
    const u = (x + 0.5) / size;
    const v = (y + 0.5) / size;
    const s = (t: number) => (t - inset) / (1 - 2 * inset);
    return glyph(s(u), s(v)) ? FG : BG;
  });
}

writeFileSync("public/icon-192.png", draw(192, 0.08));
writeFileSync("public/icon-512.png", draw(512, 0.08));
// Maskable icons must survive a circular crop, so the glyph is inset further.
writeFileSync("public/icon-maskable-512.png", draw(512, 0.2));
writeFileSync("public/apple-touch-icon.png", draw(180, 0.08));
