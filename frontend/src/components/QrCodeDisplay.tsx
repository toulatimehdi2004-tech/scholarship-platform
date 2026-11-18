'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { generateStandardQrCode } from '@/lib/qrCodeGenerator';

interface QrCodeDisplayProps {
  payload: string;
  size?: number;
  className?: string;
  showScanAnimation?: boolean;
}

export default function QrCodeDisplay({
  payload,
  size = 210,
  className = '',
  showScanAnimation = true,
}: QrCodeDisplayProps) {
  const [svgHtml, setSvgHtml] = useState<string>('');

  // 1. Generate official ISO-compliant QR Code SVG string via qrcode library
  useEffect(() => {
    let isMounted = true;
    if (payload) {
      QRCode.toString(
        payload,
        {
          type: 'svg',
          margin: 3,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (err, svg) => {
          if (!err && svg && isMounted) {
            setSvgHtml(svg);
          }
        }
      );
    }
    return () => {
      isMounted = false;
    };
  }, [payload]);

  // 2. Synchronous fallback using pure TypeScript standard generator
  const fallbackQr = useMemo(() => {
    try {
      return generateStandardQrCode(payload);
    } catch {
      return generateStandardQrCode('https://toulatimehdi2004-tech.github.io/scholarship-platform/');
    }
  }, [payload]);

  const matrix = fallbackQr.matrix;
  const matrixSize = matrix.length;
  const quietZone = 4;
  const viewBoxSize = matrixSize + quietZone * 2;

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2.5 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700/80 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Real, Camera-Scannable QR Code */}
      {svgHtml ? (
        <div
          className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full shape-rendering-crisp"
          style={{ shapeRendering: 'crispEdges' }}
        >
          <rect x={0} y={0} width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
          {matrix.map((row, y) =>
            row.map((isDark, x) =>
              isDark ? (
                <rect
                  key={`${x}-${y}`}
                  x={x + quietZone}
                  y={y + quietZone}
                  width={1}
                  height={1}
                  fill="#000000"
                />
              ) : null
            )
          )}
        </svg>
      )}

      {/* Cyber Corner Target Indicators */}
      <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-500 rounded-tl pointer-events-none" />
      <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-500 rounded-tr pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-500 rounded-bl pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-500 rounded-br pointer-events-none" />

      {/* Glowing Scanline Animation Effect */}
      {showScanAnimation && (
        <div className="absolute inset-2 pointer-events-none overflow-hidden rounded-xl">
          <div
            className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.9)] opacity-70"
            style={{
              animation: 'qrLaser 2.4s ease-in-out infinite alternate',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes qrLaser {
          0% {
            transform: translateY(0px);
            opacity: 0.2;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(${size - 24}px);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
