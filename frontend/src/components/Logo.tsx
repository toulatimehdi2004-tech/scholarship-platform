export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ChinaScholar logo"
    >
      <defs>
        <linearGradient id="cs-seal-bg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f04438" />
          <stop offset="1" stopColor="#8f1d1d" />
        </linearGradient>
        <linearGradient id="cs-seal-gold" x1="18" y1="16" x2="46" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="15" fill="url(#cs-seal-bg)" />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        stroke="url(#cs-seal-gold)"
        strokeWidth="2"
        opacity="0.9"
      />
      <rect x="15" y="15" width="34" height="34" rx="7" fill="url(#cs-seal-gold)" />
      <text
        x="32"
        y="42.5"
        textAnchor="middle"
        fontFamily="'Noto Serif SC','Songti SC','SimSun',serif"
        fontWeight="900"
        fontSize="26"
        fill="#8f1d1d"
      >
        学
      </text>
    </svg>
  );
}
