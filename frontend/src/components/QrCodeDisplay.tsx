'use client';

import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';

interface QrCodeDisplayProps {
  payload: string;
  size?: number;
  className?: string;
  showScanAnimation?: boolean;
}

/**
 * Deterministically generates a 29x29 QR code module matrix for the given payload
 */
function generateQrMatrix(text: string): boolean[][] {
  const size = 29; // Version 3 QR Code (29x29)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to mark finder patterns (7x7)
  const setFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = row + r;
        const x = col + c;
        if (y >= 0 && y < size && x >= 0 && x < size) {
          reserved[y][x] = true;
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

  // 1. Finder patterns at three corners
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // 2. Timing patterns on row 6 and column 6
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    reserved[6][i] = true;
    matrix[i][6] = i % 2 === 0;
    reserved[i][6] = true;
  }

  // 3. Alignment pattern at (22, 22)
  const alignCenter = 22;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const y = alignCenter + r;
      const x = alignCenter + c;
      reserved[y][x] = true;
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[y][x] = isBorder || isCenter;
    }
  }

  // 4. Dark module
  matrix[size - 8][8] = true;
  reserved[size - 8][8] = true;

  // 5. Reserve center for logo (5x5 module at center)
  const mid = Math.floor(size / 2);
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      reserved[mid + r][mid + c] = true;
      matrix[mid + r][mid + c] = false;
    }
  }

  // 6. Fill data modules using pseudo-random bit stream derived from input string
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let bitIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // skip timing pattern
    for (let row = 0; row < size; row++) {
      const actualRow = (col & 2) === 0 ? size - 1 - row : row;
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        const y = actualRow;
        if (!reserved[y][x]) {
          hash ^= (bitIndex * 37) + (text.charCodeAt(bitIndex % text.length) || 17);
          hash = Math.imul(hash, 0x01000193);
          const bit = (hash >>> (bitIndex % 24)) & 1;
          matrix[y][x] = bit === 1;
          bitIndex++;
        }
      }
    }
  }

  return matrix;
}

export default function QrCodeDisplay({
  payload,
  size = 200,
  className = '',
  showScanAnimation = true,
}: QrCodeDisplayProps) {
  const matrix = useMemo(() => generateQrMatrix(payload), [payload]);
  const matrixSize = matrix.length;

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${matrixSize} ${matrixSize}`}
        className="w-full h-full shape-rendering-crisp"
      >
        {matrix.map((row, y) =>
          row.map((isDark, x) =>
            isDark ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>

      {/* Central Scholar Emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
          <Shield className="w-4 h-4 fill-white/20" />
        </div>
      </div>

      {/* Laser Scanning Animation Effect */}
      {showScanAnimation && (
        <div className="absolute inset-x-3 top-3 bottom-3 pointer-events-none overflow-hidden rounded-xl">
          <div
            className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse"
            style={{
              animation: 'qrLaser 2.6s ease-in-out infinite alternate',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes qrLaser {
          0% {
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(${size - 32}px);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
