/**
 * TRHUE Hair Care — official logo.
 *
 * This is a faithful vector reproduction of the supplied brand logo
 * (heart, TRHUE wordmark, hairdryer, scissors, "Home of Pretty Hair
 * Care Collection", "Beauty. Care. Confidence.").
 *
 * To use the original raster artwork instead: drop the supplied file in
 * at `public/trhue-logo.png` and set USE_IMAGE to true below — every
 * placement on the site (navbar, hero, footer, watermark) updates at once.
 */
const USE_IMAGE = false;

export default function Logo({ className = '', title = 'TRHUE Hair Care' }) {
  if (USE_IMAGE) {
    return (
      <img
        src="/trhue-logo.png"
        alt={title}
        className={className}
        draggable="false"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 1200 1000"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="trhuePink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2f0" />
          <stop offset="0.18" stopColor="#ff8fc4" />
          <stop offset="0.5" stopColor="#ff2e88" />
          <stop offset="0.82" stopColor="#d6126a" />
          <stop offset="1" stopColor="#9c0b4c" />
        </linearGradient>
        <linearGradient id="trhueScript" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9ccb" />
          <stop offset="0.55" stopColor="#ff2e88" />
          <stop offset="1" stopColor="#c01060" />
        </linearGradient>
        <linearGradient id="trhueSilver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#e6e9f0" />
          <stop offset="0.6" stopColor="#aab0bd" />
          <stop offset="0.8" stopColor="#eef0f5" />
          <stop offset="1" stopColor="#9aa0ad" />
        </linearGradient>
        <linearGradient id="trhueDryer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a2030" />
          <stop offset="0.4" stopColor="#150b12" />
          <stop offset="0.7" stopColor="#2a1320" />
          <stop offset="1" stopColor="#0a0508" />
        </linearGradient>
        <linearGradient id="trhueDryerRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fc4" />
          <stop offset="0.5" stopColor="#ff2e88" />
          <stop offset="1" stopColor="#9c0b4c" />
        </linearGradient>
        <filter id="trhueGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Silver glitter heart */}
      <g filter="url(#trhueGlow)">
        <path
          d="M540 250
             C 505 150, 380 110, 300 165
             C 205 230, 195 350, 245 445
             C 295 540, 400 640, 520 720"
          fill="none"
          stroke="url(#trhueSilver)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M520 720
             C 600 615, 612 470, 600 360
             C 590 265, 575 175, 545 95
             C 532 62, 512 58, 500 78"
          fill="none"
          stroke="url(#trhueSilver)"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </g>

      {/* Sparkles */}
      <g fill="#ffffff">
        <path d="M312 132 l9 28 28 9 -28 9 -9 28 -9 -28 -28 -9 28 -9z" opacity="0.95" />
        <path d="M236 232 l6 19 19 6 -19 6 -6 19 -6 -19 -19 -6 19 -6z" opacity="0.8" />
        <path d="M214 360 l5 15 15 5 -15 5 -5 15 -5 -15 -15 -5 15 -5z" opacity="0.65" />
        <path d="M520 96 l5 16 16 5 -16 5 -5 16 -5 -16 -16 -5 16 -5z" opacity="0.85" />
      </g>

      {/* Scissors */}
      <g
        stroke="url(#trhuePink)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        filter="url(#trhueGlow)"
      >
        <circle cx="690" cy="150" r="34" />
        <circle cx="770" cy="150" r="34" />
        <path d="M712 178 L850 320" />
        <path d="M748 178 L880 300" />
        <path d="M820 250 L905 210" strokeWidth="10" />
      </g>

      {/* Hairdryer */}
      <g filter="url(#trhueGlow)">
        <g transform="rotate(28 950 430)">
          <rect
            x="820"
            y="350"
            width="280"
            height="150"
            rx="75"
            fill="url(#trhueDryer)"
            stroke="url(#trhueDryerRim)"
            strokeWidth="9"
          />
          <ellipse
            cx="826"
            cy="425"
            rx="22"
            ry="74"
            fill="#120810"
            stroke="url(#trhueDryerRim)"
            strokeWidth="8"
          />
          <ellipse cx="826" cy="425" rx="9" ry="48" fill="url(#trhueDryerRim)" opacity="0.7" />
          <path
            d="M870 470 Q905 600 980 610 L1010 560 Q955 545 940 470 Z"
            fill="url(#trhueDryer)"
            stroke="url(#trhueDryerRim)"
            strokeWidth="8"
          />
          <rect x="900" y="370" width="150" height="16" rx="8" fill="#ff8fc4" opacity="0.55" />
        </g>
      </g>

      {/* TRHUE wordmark */}
      <text
        x="600"
        y="500"
        textAnchor="middle"
        fontFamily="'Playfair Display', serif"
        fontWeight="800"
        fontSize="210"
        letterSpacing="6"
        fill="url(#trhuePink)"
        filter="url(#trhueGlow)"
      >
        TRHUE
      </text>

      {/* Hair Care script */}
      <text
        x="600"
        y="650"
        textAnchor="middle"
        fontFamily="'Great Vibes', cursive"
        fontSize="170"
        fill="url(#trhueScript)"
        filter="url(#trhueGlow)"
      >
        Hair Care
      </text>

      {/* HOME OF divider */}
      <g>
        <line x1="280" y1="715" x2="490" y2="715" stroke="#ff2e88" strokeWidth="3" />
        <line x1="710" y1="715" x2="920" y2="715" stroke="#ff2e88" strokeWidth="3" />
        <text
          x="600"
          y="728"
          textAnchor="middle"
          fontFamily="Outfit, sans-serif"
          fontWeight="600"
          fontSize="38"
          letterSpacing="14"
          fill="#ffffff"
        >
          HOME OF
        </text>
      </g>

      {/* Pretty Hair Care script */}
      <text
        x="600"
        y="838"
        textAnchor="middle"
        fontFamily="'Great Vibes', cursive"
        fontSize="130"
        fill="url(#trhueScript)"
        filter="url(#trhueGlow)"
      >
        Pretty Hair Care
      </text>

      {/* COLLECTION */}
      <text
        x="600"
        y="892"
        textAnchor="middle"
        fontFamily="Outfit, sans-serif"
        fontWeight="500"
        fontSize="36"
        letterSpacing="20"
        fill="#ffffff"
      >
        COLLECTION
      </text>

      <line x1="300" y1="922" x2="900" y2="922" stroke="#ff2e88" strokeWidth="2.5" />

      {/* Beauty. Care. Confidence. */}
      <text
        x="600"
        y="968"
        textAnchor="middle"
        fontFamily="Outfit, sans-serif"
        fontWeight="500"
        fontSize="34"
        letterSpacing="10"
        fill="#eef0f5"
      >
        BEAUTY<tspan fill="#ff2e88">.</tspan> CARE<tspan fill="#ff2e88">.</tspan> CONFIDENCE<tspan fill="#ff2e88">.</tspan>
      </text>
    </svg>
  );
}
