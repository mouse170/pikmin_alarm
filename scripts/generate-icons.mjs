import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawPixel) {
  // RGBA buffer with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    // CRC32 calculation
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  // PNG header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[i] = c;
}

// Draw mushroom pattern
function mushroomShader(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outer circle (dark background)
  if (dist > w * 0.46) {
    return [0, 0, 0, 0];
  }

  // Cap: upper hemisphere
  const capCy = cy - h * 0.05;
  const cdx = (x - cx) / (w * 0.35);
  const cdy = (y - capCy) / (h * 0.28);
  if (cdx * cdx + cdy * cdy <= 1.0 && y <= cy + h * 0.06) {
    // Check for spots
    const spot1 = Math.sqrt(Math.pow(x - (cx - w * 0.15), 2) + Math.pow(y - (cy - h * 0.12), 2));
    const spot2 = Math.sqrt(Math.pow(x - (cx + w * 0.15), 2) + Math.pow(y - (cy - h * 0.12), 2));
    const spot3 = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - (cy - h * 0.18), 2));
    if (spot1 < w * 0.06 || spot2 < w * 0.06 || spot3 < w * 0.07) {
      return [255, 255, 255, 255];
    }
    return [239, 68, 68, 255]; // Red cap
  }

  // Stem: lower body
  if (Math.abs(x - cx) <= w * 0.14 && y > cy - h * 0.02 && y < cy + h * 0.32) {
    // Eyes
    if (Math.abs(y - (cy + h * 0.12)) < h * 0.03 && (Math.abs(x - (cx - w * 0.05)) < w * 0.02 || Math.abs(x - (cx + w * 0.05)) < w * 0.02)) {
      return [30, 41, 59, 255];
    }
    return [248, 250, 252, 255]; // White stem
  }

  // Dark background glow
  return [15, 23, 42, 240];
}

const png192 = createPNG(192, 192, mushroomShader);
fs.writeFileSync('public/mushroom-192.png', png192);

const png512 = createPNG(512, 512, mushroomShader);
fs.writeFileSync('public/mushroom-512.png', png512);

console.log('PNG icons created successfully.');
