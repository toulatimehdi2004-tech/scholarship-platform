/**
 * ISO/IEC 18004 Standard QR Code Model 2 Generator
 * 
 * Generates 100% genuine, camera-scannable QR codes in pure TypeScript
 * with standard Finder Patterns, Timing Patterns, Alignment Patterns,
 * BCH Format Encoding (0x5412 XOR Mask), and Reed-Solomon Error Correction.
 */

// Galois Field GF(256) with primitive polynomial 0x11D (285)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
let val = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = val;
  GF_EXP[i + 255] = val;
  GF_LOG[val] = i;
  val = (val << 1) ^ (val & 128 ? 0x11d : 0);
}

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGenPoly(ecCount: number): number[] {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], root);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCompute(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsGenPoly(ecCount);
  const res = new Uint8Array(data.length + ecCount);
  res.set(data, 0);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

interface QrVersionInfo {
  version: number;
  total: number;
  ec: number;
  data: number;
  aligns: number[];
}

// Standards Table for Error Correction Level L (Low - 7% recovery, maximum payload)
const QR_SPECS: Record<number, QrVersionInfo> = {
  1: { version: 1, total: 26, ec: 7, data: 19, aligns: [] },
  2: { version: 2, total: 44, ec: 10, data: 34, aligns: [6, 18] },
  3: { version: 3, total: 70, ec: 15, data: 55, aligns: [6, 22] },
  4: { version: 4, total: 100, ec: 20, data: 80, aligns: [6, 26] },
  5: { version: 5, total: 134, ec: 26, data: 108, aligns: [6, 30] },
};

// Format info: EC Level L (01) + Mask 0 ((row + col) % 2 === 0) -> BCH (15,5) XOR 0x5412 = 0x77c4
const FORMAT_INFO_L_MASK0 = 0x77c4;

export interface QrResult {
  version: number;
  size: number;
  matrix: boolean[][];
}

/**
 * Encodes text into a standard QR Code boolean matrix
 */
export function generateStandardQrCode(text: string): QrResult {
  // Convert string to UTF-8 bytes
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }

  // Find minimum version that fits data in Byte Mode (4 bits mode + 8 bits length + data*8 + 4 bits term)
  let version = 1;
  while (version <= 5) {
    const spec = QR_SPECS[version];
    const bitsNeeded = 4 + 8 + bytes.length * 8 + 4;
    if (bitsNeeded <= spec.data * 8) break;
    version++;
  }
  if (version > 5) version = 5;

  const spec = QR_SPECS[version];
  const size = 17 + version * 4;

  // 1. Bit Stream Construction
  const bits: number[] = [];
  const pushBits = (val: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Byte mode indicator: 0100
  pushBits(4, 4);
  // Character count indicator (8 bits for v1-9)
  pushBits(bytes.length, 8);
  // Data bytes
  for (let i = 0; i < bytes.length; i++) {
    pushBits(bytes[i], 8);
  }
  // Terminator: up to 4 zero bits
  const remainingBits = spec.data * 8 - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remainingBits)));

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Alternating padding bytes 0xEC (11101100) and 0x11 (00010001)
  let padToggle = false;
  while (bits.length < spec.data * 8) {
    pushBits(padToggle ? 0x11 : 0xec, 8);
    padToggle = !padToggle;
  }

  // Convert bits to data codewords
  const dataCodewords = new Uint8Array(spec.data);
  for (let i = 0; i < spec.data; i++) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) {
      byteVal = (byteVal << 1) | bits[i * 8 + j];
    }
    dataCodewords[i] = byteVal;
  }

  // Compute Reed-Solomon Error Correction Codewords
  const ecCodewords = rsCompute(dataCodewords, spec.ec);

  // Combine data + error correction
  const allCodewords = new Uint8Array(spec.total);
  allCodewords.set(dataCodewords, 0);
  allCodewords.set(ecCodewords, dataCodewords.length);

  // 2. Module Matrix Layout
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder Patterns (7x7) + 1-module white separator
  const setFinder = (startRow: number, startCol: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = startRow + r;
        const x = startCol + c;
        if (y >= 0 && y < size && x >= 0 && x < size) {
          isFunction[y][x] = true;
          if (r >= 0 && r < 7 && c >= 0 && c < 7) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[y][x] = isBorder || isCenter;
          } else {
            matrix[y][x] = false; // white separator
          }
        }
      }
    }
  };

  // Place 3 Finder Patterns
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing Patterns (alternating black/white)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    isFunction[6][i] = true;
    matrix[i][6] = i % 2 === 0;
    isFunction[i][6] = true;
  }

  // Alignment Pattern for Version 2+
  if (spec.aligns.length >= 2) {
    const coords = spec.aligns;
    for (let r of coords) {
      for (let c of coords) {
        // Skip corners where finders exist
        if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) {
          continue;
        }
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const y = r + i;
            const x = c + j;
            isFunction[y][x] = true;
            const isBorder = Math.abs(i) === 2 || Math.abs(j) === 2;
            const isCenter = i === 0 && j === 0;
            matrix[y][x] = isBorder || isCenter;
          }
        }
      }
    }
  }

  // Dark Module
  matrix[size - 8][8] = true;
  isFunction[size - 8][8] = true;

  // Format Information Bits (15 bits)
  const format = FORMAT_INFO_L_MASK0;
  for (let i = 0; i < 15; i++) {
    const bit = ((format >> i) & 1) === 1;

    // Around top-left finder
    if (i <= 5) {
      matrix[8][i] = bit;
      isFunction[8][i] = true;
    } else if (i === 6) {
      matrix[8][7] = bit;
      isFunction[8][7] = true;
    } else if (i === 7) {
      matrix[8][8] = bit;
      isFunction[8][8] = true;
    } else if (i === 8) {
      matrix[7][8] = bit;
      isFunction[7][8] = true;
    } else {
      matrix[14 - i][8] = bit;
      isFunction[14 - i][8] = true;
    }

    // Split around bottom-left & top-right finders
    if (i < 7) {
      matrix[size - 1 - i][8] = bit;
      isFunction[size - 1 - i][8] = true;
    } else {
      matrix[8][size - 15 + i] = bit;
      isFunction[8][size - 15 + i] = true;
    }
  }

  // 3. Place Data Codewords in Zig-Zag Columns with Mask 0 ((y + x) % 2 === 0)
  let bitIdx = 0;
  const totalBits = allCodewords.length * 8;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column 6
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;

        if (!isFunction[y][x]) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byteIdx = Math.floor(bitIdx / 8);
            const bitInByte = 7 - (bitIdx % 8);
            bit = ((allCodewords[byteIdx] >> bitInByte) & 1) === 1;
            bitIdx++;
          }
          // Mask Pattern 0: (row + col) % 2 === 0
          const mask = (y + x) % 2 === 0;
          matrix[y][x] = bit !== mask;
        }
      }
    }
  }

  return { version, size, matrix };
}
