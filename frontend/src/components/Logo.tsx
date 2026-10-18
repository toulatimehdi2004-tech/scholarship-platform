"use client";

export default function Logo({
  size = 36,
  className = "",
  showText = false,
}: {
  size?: number;
  className?: string;
  showText?: boolean;
}) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const src = `${basePath}/scholar-china-logo.png`;

  return (
    <div className={`relative inline-flex items-center gap-2.5 flex-shrink-0 select-none ${className}`}>
      <div
        className="relative inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden shadow-lg shadow-blue-500/25 border border-blue-400/30"
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt="ScholarChina Emblem"
          width={size}
          height={size}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-white flex items-center">
          <span>Scholar</span>
          <span className="text-blue-400">China</span>
        </span>
      )}
    </div>
  );
}
