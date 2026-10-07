"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Cursor Spotlight */}
      <div
        className="fixed inset-0 transition-opacity duration-500 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(5, 150, 105, 0.1), transparent 70%)`,
        }}
      />

      {/* Floating Animated Aurora Orbs */}
      <div className="orb orb-1 -top-48 -left-48" />
      <div className="orb orb-2 top-[20%] -right-48" />
      <div className="orb orb-3 top-[65%] -left-32" />
      <div className="orb orb-4 -bottom-36 right-[25%]" />

      {/* Animated Subtle Floating Particle Dots */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan/30 animate-pulse"
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
