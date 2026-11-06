import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height) {
  // RGBA buffer: width * 4 per row, plus 1 filter byte per row
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height, 0);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = y * rowBytes + 1 + x * 4;
    if (a === 255) {
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
      rawData[offset + 3] = 255;
    } else {
      const alpha = a / 255;
      const invAlpha = 1 - alpha;
      rawData[offset] = Math.round(r * alpha + rawData[offset] * invAlpha);
      rawData[offset + 1] = Math.round(g * alpha + rawData[offset + 1] * invAlpha);
      rawData[offset + 2] = Math.round(b * alpha + rawData[offset + 2] * invAlpha);
      rawData[offset + 3] = Math.min(255, Math.round(a + rawData[offset + 3] * invAlpha));
    }
  }

  function fillRect(rx, ry, rw, rh, r, g, b, a = 255) {
    const x0 = Math.max(0, rx);
    const x1 = Math.min(width, rx + rw);
    const y0 = Math.max(0, ry);
    const y1 = Math.min(height, ry + rh);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        setPixel(x, y, r, g, b, a);
      }
    }
  }

  function fillRoundedRect(rx, ry, rw, rh, radius, r, g, b, a = 255) {
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        let inside = true;
        // Check 4 corners
        if (x < rx + radius && y < ry + radius) {
          const dx = x - (rx + radius);
          const dy = y - (ry + radius);
          if (dx * dx + dy * dy > radius * radius) inside = false;
        } else if (x >= rx + rw - radius && y < ry + radius) {
          const dx = x - (rx + rw - radius - 1);
          const dy = y - (ry + radius);
          if (dx * dx + dy * dy > radius * radius) inside = false;
        } else if (x < rx + radius && y >= ry + rh - radius) {
          const dx = x - (rx + radius);
          const dy = y - (ry + rh - radius - 1);
          if (dx * dx + dy * dy > radius * radius) inside = false;
        } else if (x >= rx + rw - radius && y >= ry + rh - radius) {
          const dx = x - (rx + rw - radius - 1);
          const dy = y - (ry + rh - radius - 1);
          if (dx * dx + dy * dy > radius * radius) inside = false;
        }
        if (inside) setPixel(x, y, r, g, b, a);
      }
    }
  }

  // Draw 8x8 bitmap font for letters
  // Minimal font map for: R e s u m I Q A P o w d y z J b F t E n g O T k x c C L D
  const FONT = {
    ' ': [0,0,0,0,0,0,0,0],
    '-': [0,0,0,0x3c,0,0,0,0],
    ':': [0,0x18,0x18,0,0x18,0x18,0,0],
    '.': [0,0,0,0,0,0x18,0x18,0],
    '[': [0x1c,0x18,0x18,0x18,0x18,0x18,0x1c,0],
    ']': [0x38,0x18,0x18,0x18,0x18,0x18,0x38,0],
    '|': [0x18,0x18,0x18,0x18,0x18,0x18,0x18,0],
    '/': [0x02,0x06,0x0c,0x18,0x30,0x60,0x40,0],
    '0': [0x3c,0x66,0x6e,0x76,0x66,0x66,0x3c,0],
    '1': [0x18,0x38,0x18,0x18,0x18,0x18,0x3c,0],
    '2': [0x3c,0x66,0x06,0x1c,0x30,0x60,0x7e,0],
    '3': [0x3c,0x66,0x06,0x1c,0x06,0x66,0x3c,0],
    '4': [0x0c,0x1c,0x34,0x64,0x7e,0x04,0x0e,0],
    '5': [0x7e,0x60,0x7c,0x06,0x06,0x66,0x3c,0],
    '6': [0x1c,0x30,0x60,0x7c,0x66,0x66,0x3c,0],
    '7': [0x7e,0x06,0x0c,0x18,0x30,0x30,0x30,0],
    '8': [0x3c,0x66,0x66,0x3c,0x66,0x66,0x3c,0],
    '9': [0x3c,0x66,0x66,0x3e,0x06,0x0c,0x38,0],
    'A': [0x18,0x3c,0x66,0x7e,0x66,0x66,0x66,0],
    'B': [0x7c,0x66,0x66,0x7c,0x66,0x66,0x7c,0],
    'C': [0x3c,0x66,0x60,0x60,0x60,0x66,0x3c,0],
    'D': [0x78,0x6c,0x66,0x66,0x66,0x6c,0x78,0],
    'E': [0x7e,0x60,0x60,0x7c,0x60,0x60,0x7e,0],
    'F': [0x7e,0x60,0x60,0x7c,0x60,0x60,0x60,0],
    'G': [0x3c,0x66,0x60,0x6e,0x66,0x66,0x3e,0],
    'H': [0x66,0x66,0x66,0x7e,0x66,0x66,0x66,0],
    'I': [0x3c,0x18,0x18,0x18,0x18,0x18,0x3c,0],
    'J': [0x0e,0x06,0x06,0x06,0x66,0x66,0x3c,0],
    'K': [0x66,0x6c,0x78,0x70,0x78,0x6c,0x66,0],
    'L': [0x60,0x60,0x60,0x60,0x60,0x60,0x7e,0],
    'M': [0x63,0x77,0x7f,0x6b,0x63,0x63,0x63,0],
    'N': [0x66,0x76,0x7e,0x7e,0x6e,0x66,0x66,0],
    'O': [0x3c,0x66,0x66,0x66,0x66,0x66,0x3c,0],
    'P': [0x7c,0x66,0x66,0x7c,0x60,0x60,0x60,0],
    'Q': [0x3c,0x66,0x66,0x66,0x6e,0x3c,0x0e,0],
    'R': [0x7c,0x66,0x66,0x7c,0x78,0x6c,0x66,0],
    'S': [0x3c,0x66,0x60,0x3c,0x06,0x66,0x3c,0],
    'T': [0x7e,0x18,0x18,0x18,0x18,0x18,0x18,0],
    'U': [0x66,0x66,0x66,0x66,0x66,0x66,0x3c,0],
    'V': [0x66,0x66,0x66,0x66,0x66,0x3c,0x18,0],
    'W': [0x63,0x63,0x63,0x6b,0x7f,0x77,0x63,0],
    'X': [0x66,0x66,0x3c,0x18,0x3c,0x66,0x66,0],
    'Y': [0x66,0x66,0x66,0x3c,0x18,0x18,0x18,0],
    'Z': [0x7e,0x06,0x0c,0x18,0x30,0x60,0x7e,0],
    'a': [0,0,0x3c,0x06,0x3e,0x66,0x3e,0],
    'b': [0x60,0x60,0x7c,0x66,0x66,0x66,0x7c,0],
    'c': [0,0,0x3c,0x66,0x60,0x66,0x3c,0],
    'd': [0x06,0x06,0x3e,0x66,0x66,0x66,0x3e,0],
    'e': [0,0,0x3c,0x66,0x7e,0x60,0x3c,0],
    'f': [0x1c,0x30,0x7c,0x30,0x30,0x30,0x30,0],
    'g': [0,0,0x3e,0x66,0x66,0x3e,0x06,0x3c],
    'h': [0x60,0x60,0x7c,0x66,0x66,0x66,0x66,0],
    'i': [0x18,0,0x38,0x18,0x18,0x18,0x3c,0],
    'j': [0x0c,0,0x1c,0x0c,0x0c,0x0c,0x4c,0x38],
    'k': [0x60,0x60,0x66,0x6c,0x78,0x6c,0x66,0],
    'l': [0x38,0x18,0x18,0x18,0x18,0x18,0x3c,0],
    'm': [0,0,0x76,0x7f,0x6b,0x6b,0x63,0],
    'n': [0,0,0x7c,0x66,0x66,0x66,0x66,0],
    'o': [0,0,0x3c,0x66,0x66,0x66,0x3c,0],
    'p': [0,0,0x7c,0x66,0x66,0x7c,0x60,0x60],
    'q': [0,0,0x3e,0x66,0x66,0x3e,0x06,0x06],
    'r': [0,0,0x6c,0x76,0x60,0x60,0x60,0],
    's': [0,0,0x3e,0x60,0x3c,0x06,0x7c,0],
    't': [0x18,0x18,0x7e,0x18,0x18,0x18,0x1c,0],
    'u': [0,0,0x66,0x66,0x66,0x66,0x3e,0],
    'v': [0,0,0x66,0x66,0x66,0x3c,0x18,0],
    'w': [0,0,0x63,0x6b,0x6b,0x7f,0x36,0],
    'x': [0,0,0x66,0x3c,0x18,0x3c,0x66,0],
    'y': [0,0,0x66,0x66,0x66,0x3e,0x06,0x3c],
    'z': [0,0,0x7e,0x0c,0x18,0x30,0x7e,0],
    '&': [0x30,0x48,0x30,0x6c,0x46,0x46,0x3b,0]
  };

  function drawText(text, startX, startY, scale, r, g, b, a = 255) {
    let curX = startX;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const glyph = FONT[ch] || FONT[' '];
      for (let row = 0; row < 8; row++) {
        const rowByte = glyph[row] || 0;
        for (let col = 0; col < 8; col++) {
          if ((rowByte >> (7 - col)) & 1) {
            fillRect(curX + col * scale, startY + row * scale, scale, scale, r, g, b, a);
          }
        }
      }
      curX += 8 * scale;
    }
  }

  return { width, height, setPixel, fillRect, fillRoundedRect, drawText, rawData, rowBytes };
}

function buildPNGFile(img) {
  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(img.width, 0);
  ihdrData.writeUInt32BE(img.height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type 6: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  function makeChunk(typeStr, dataBuf) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const toCrc = Buffer.concat([typeBuf, dataBuf]);
    const crcVal = zlib.crc32(toCrc);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(dataBuf.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Compress raw image data with zlib
  const compressedData = zlib.deflateSync(img.rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

export function generateOGImage(outPath) {
  const W = 1200;
  const H = 630;
  const img = createPNG(W, H);

  // 1. Dark Gradient Background (slate-950 #020617 to #0b1120)
  for (let y = 0; y < H; y++) {
    const factor = y / H;
    const r = Math.round(2 + factor * 10);
    const g = Math.round(6 + factor * 12);
    const b = Math.round(23 + factor * 20);
    img.fillRect(0, y, W, 1, r, g, b);
  }

  // 2. Subtle grid pattern
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      img.setPixel(x, y, 30, 41, 59, 100);
    }
  }

  // 3. Central Card Container (slate-900 border, slate-900/90 background)
  // Outer glowing card
  img.fillRoundedRect(80, 50, 1040, 530, 24, 30, 41, 59, 255);
  img.fillRoundedRect(82, 52, 1036, 526, 22, 15, 23, 42, 255);

  // Emerald Top Accent Bar
  img.fillRoundedRect(82, 52, 1036, 6, 3, 16, 185, 129, 255);

  // 4. Logo Icon Card (Emerald bar chart icon)
  img.fillRoundedRect(140, 110, 88, 88, 20, 30, 41, 59, 255);
  img.fillRoundedRect(142, 112, 84, 84, 18, 2, 6, 23, 255);

  // 3 vertical bars inside icon
  // Left bar (h=32)
  img.fillRoundedRect(158, 148, 10, 32, 3, 16, 185, 129, 255);
  // Middle bar (h=52)
  img.fillRoundedRect(178, 128, 10, 52, 3, 16, 185, 129, 255);
  // Right bar (h=42)
  img.fillRoundedRect(198, 138, 10, 42, 3, 16, 185, 129, 255);

  // 5. Brand Name: ResumeIQ
  // Big bold text: Scale 8 = 64px tall glyphs
  img.drawText("ResumeIQ", 260, 122, 8, 255, 255, 255);

  // Terminal Tag: [ AI_ENGINE_v2.0 ]
  img.fillRoundedRect(720, 130, 220, 40, 8, 16, 185, 129, 35);
  img.drawText("[ AUDIT_ENGINE ]", 735, 140, 2, 52, 211, 153);

  // 6. Subheading & Tagline
  img.drawText("AI-Powered Resume Analyzer & Job Fit Evaluation Engine", 140, 240, 3, 203, 213, 225);
  img.drawText("Objective ATS structural scoring, critical token matching, and", 140, 280, 2, 148, 163, 184);
  img.drawText("actionable bullet rewrites powered by Google Gemini.", 140, 305, 2, 148, 163, 184);

  // 7. Three Feature Pills at the Bottom
  // Pill 1: ATS Scoring
  img.fillRoundedRect(140, 370, 270, 80, 12, 30, 41, 59, 255);
  img.fillRoundedRect(142, 372, 266, 76, 10, 15, 23, 42, 255);
  img.drawText("ATS AUDIT SCORE", 160, 390, 2, 52, 211, 153);
  img.drawText("Verified 0-100 Benchmark", 160, 418, 2, 226, 232, 240);

  // Pill 2: Keyword Tokenizer
  img.fillRoundedRect(440, 370, 290, 80, 12, 30, 41, 59, 255);
  img.fillRoundedRect(442, 372, 286, 76, 10, 15, 23, 42, 255);
  img.drawText("TOKEN EXTRACTION", 460, 390, 2, 56, 189, 248);
  img.drawText("Matched & Missing Skills", 460, 418, 2, 226, 232, 240);

  // Pill 3: Bullet Rewriter
  img.fillRoundedRect(760, 370, 280, 80, 12, 30, 41, 59, 255);
  img.fillRoundedRect(762, 372, 276, 76, 10, 15, 23, 42, 255);
  img.drawText("ACTIONABLE REWRITES", 780, 390, 2, 167, 139, 250);
  img.drawText("Recruiter-Ready Impact", 780, 418, 2, 226, 232, 240);

  // 8. Footer metadata line
  img.drawText("resumeiq-jade.vercel.app  |  Zero Uninvented Numbers  |  Human Privacy First", 140, 500, 2, 100, 116, 139);

  // Write file
  const pngBuffer = buildPNGFile(img);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Generated ${outPath} (${pngBuffer.length} bytes, ${W}x${H})`);
}

// Run if called directly
const destPath = process.argv[2] || 'public/og-preview.png';
generateOGImage(destPath);

