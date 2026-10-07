"use client";

export default function Logo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const src = `${basePath}/moroccan-scholar-logo-transparent.png`;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="Moroccan Scholar Emblem"
        width={size}
        height={size}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(5,150,105,0.4)] transition-transform duration-300 group-hover:scale-105"
        loading="eager"
      />
    </div>
  );
}
