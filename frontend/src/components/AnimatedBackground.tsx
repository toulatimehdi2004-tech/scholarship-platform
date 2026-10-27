"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const bgImage = `${basePath}/images/china-night-pagoda.jpeg`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* High-Resolution Chinese Pagoda & River Skyline Night Background (Image 2) */}
      <img
        src={bgImage}
        alt="ScholarChina Night Pagoda River Landscape"
        className="w-full h-full object-cover object-bottom brightness-[0.92] contrast-[1.08] fixed inset-0 pointer-events-none transition-all duration-700"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.src.includes("china-night-pagoda.jpeg")) {
            target.src = `${basePath}/china-night-pagoda.jpeg`;
          } else {
            target.src = "/images/china-night-pagoda.jpeg";
          }
        }}
      />

      {/* Atmospheric Overlays ensuring content, tables, and glass cards remain high-contrast and readable */}
      <div className="fixed inset-0 bg-[#030712]/55 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#030712]/75 via-[#030712]/20 to-[#030712]/80 pointer-events-none" />

      {/* Dynamic Cursor Spotlight */}
      <div
        className="fixed inset-0 transition-opacity duration-500 hidden md:block pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.08), transparent 70%)`,
        }}
      />

      {/* Floating Animated Aurora Orbs */}
      <div className="orb orb-1 -top-48 -left-48 pointer-events-none opacity-25" />
      <div className="orb orb-2 top-[20%] -right-48 pointer-events-none opacity-25" />
      <div className="orb orb-3 top-[65%] -left-32 pointer-events-none opacity-25" />
      <div className="orb orb-4 -bottom-36 right-[25%] pointer-events-none opacity-25" />

      {/* Animated Subtle Floating Particle Dots */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan/40 animate-pulse"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              top: `${(i * 19) % 95}%`,
              left: `${(i * 29) % 95}%`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
