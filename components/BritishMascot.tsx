export default function BritishMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 168"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-jacket" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D63031" />
          <stop offset="100%" stopColor="#9B1C1C" />
        </linearGradient>
        <linearGradient id="bm-hat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#080808" />
        </linearGradient>
        <radialGradient id="bm-skin" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="100%" stopColor="#FFBB73" />
        </radialGradient>
      </defs>

      {/* ── BUSBY HAT ── */}
      <rect x="21" y="5" width="58" height="48" rx="10" fill="url(#bm-hat)" />
      <ellipse cx="50" cy="5" rx="29" ry="8" fill="#383838" />
      <ellipse cx="50" cy="53" rx="32" ry="8.5" fill="#050505" />

      {/* Hat badge — Union Jack */}
      <rect x="39" y="21" width="22" height="15" rx="2.5" fill="#012169" />
      <line x1="39" y1="21" x2="61" y2="36" stroke="white" strokeWidth="3" />
      <line x1="61" y1="21" x2="39" y2="36" stroke="white" strokeWidth="3" />
      <line x1="39" y1="21" x2="61" y2="36" stroke="#C8102E" strokeWidth="1.5" />
      <line x1="61" y1="21" x2="39" y2="36" stroke="#C8102E" strokeWidth="1.5" />
      <line x1="39" y1="28.5" x2="61" y2="28.5" stroke="white" strokeWidth="3.5" />
      <line x1="50" y1="21" x2="50" y2="36" stroke="white" strokeWidth="3.5" />
      <line x1="39" y1="28.5" x2="61" y2="28.5" stroke="#C8102E" strokeWidth="1.8" />
      <line x1="50" y1="21" x2="50" y2="36" stroke="#C8102E" strokeWidth="1.8" />
      <rect x="39" y="21" width="22" height="15" rx="2.5" fill="none" stroke="#FFD700" strokeWidth="1.5" />

      {/* Chin strap */}
      <path d="M 28 53 C 23 63 23 70 29 76" stroke="#D4AA00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 72 53 C 77 63 77 70 71 76" stroke="#D4AA00" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* ── HEAD ── */}
      <circle cx="50" cy="75" r="24" fill="url(#bm-skin)" />

      {/* Rosy cheeks */}
      <circle cx="36" cy="81" r="8.5" fill="#FF8A80" opacity="0.38" />
      <circle cx="64" cy="81" r="8.5" fill="#FF8A80" opacity="0.38" />

      {/* Eyes — white */}
      <circle cx="42" cy="71" r="8" fill="white" />
      <circle cx="58" cy="71" r="8" fill="white" />
      {/* Iris */}
      <circle cx="43" cy="72" r="5" fill="#1a0a00" />
      <circle cx="59" cy="72" r="5" fill="#1a0a00" />
      {/* Shine */}
      <circle cx="45" cy="70" r="2" fill="white" />
      <circle cx="61" cy="70" r="2" fill="white" />
      {/* Mini shine */}
      <circle cx="41" cy="74.5" r="1" fill="white" opacity="0.5" />
      <circle cx="57" cy="74.5" r="1" fill="white" opacity="0.5" />

      {/* Eyebrows */}
      <path d="M 36 64 Q 42 60.5 48 64" stroke="#7B4A20" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 52 64 Q 58 60.5 64 64" stroke="#7B4A20" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="50" cy="79" rx="2.5" ry="2" fill="#E8A070" />

      {/* Big friendly smile */}
      <path d="M 41 84 Q 50 93 59 84" stroke="#B06040" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Teeth hint */}
      <path d="M 43 85.5 Q 50 90 57 85.5" fill="white" opacity="0.6" />

      {/* ── JACKET BODY ── */}
      <path
        d="M 28 93 Q 18 99 16 117 L 16 134 Q 16 144 30 144 L 70 144 Q 84 144 84 134 L 84 117 Q 82 99 72 93 Q 62 89 50 89 Q 38 89 28 93 Z"
        fill="url(#bm-jacket)"
      />

      {/* Blue collar */}
      <path d="M 38 90 L 50 101 L 62 90" fill="#1B3D8F" />
      {/* White shirt peek */}
      <path d="M 44 91.5 L 50 98 L 56 91.5" fill="white" opacity="0.7" />

      {/* Gold epaulettes */}
      <ellipse cx="19" cy="101" rx="10" ry="5.5" fill="#FFD700" />
      <ellipse cx="81" cy="101" rx="10" ry="5.5" fill="#FFD700" />
      <line x1="10" y1="101" x2="28" y2="101" stroke="#B8900A" strokeWidth="1" opacity="0.5" />
      <line x1="72" y1="101" x2="90" y2="101" stroke="#B8900A" strokeWidth="1" opacity="0.5" />
      <ellipse cx="19" cy="101" rx="10" ry="5.5" fill="none" stroke="#B8900A" strokeWidth="0.8" />
      <ellipse cx="81" cy="101" rx="10" ry="5.5" fill="none" stroke="#B8900A" strokeWidth="0.8" />

      {/* Buttons */}
      <circle cx="50" cy="108" r="3.2" fill="#FFD700" />
      <circle cx="50" cy="108" r="3.2" fill="none" stroke="#B8900A" strokeWidth="0.7" />
      <circle cx="50" cy="119" r="3.2" fill="#FFD700" />
      <circle cx="50" cy="119" r="3.2" fill="none" stroke="#B8900A" strokeWidth="0.7" />
      <circle cx="50" cy="130" r="3.2" fill="#FFD700" />
      <circle cx="50" cy="130" r="3.2" fill="none" stroke="#B8900A" strokeWidth="0.7" />

      {/* Belt */}
      <rect x="16" y="135" width="68" height="9" rx="4.5" fill="#FFD700" />
      <rect x="44" y="136" width="12" height="7" rx="2.5" fill="#B8900A" />
      <rect x="46" y="137.5" width="8" height="4" rx="1.5" fill="#FFE85C" opacity="0.55" />

      {/* ── ARMS ── */}
      {/* Left arm */}
      <path d="M 19 106 Q 9 119 7 134 Q 6 140 11 143" stroke="#B01A1A" strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="142" r="9.5" fill="url(#bm-skin)" />

      {/* Right arm */}
      <path d="M 81 106 Q 91 119 93 134 Q 94 140 89 143" stroke="#B01A1A" strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="142" r="9.5" fill="url(#bm-skin)" />

      {/* ── LEGS ── */}
      <rect x="30" y="142" width="18" height="22" rx="9" fill="#1B3D8F" />
      <rect x="52" y="142" width="18" height="22" rx="9" fill="#1B3D8F" />

      {/* ── SHOES ── */}
      <ellipse cx="39" cy="164" rx="14" ry="6.5" fill="#111" />
      <ellipse cx="61" cy="164" rx="14" ry="6.5" fill="#111" />
      {/* Shoe shine */}
      <ellipse cx="35.5" cy="162" rx="5.5" ry="2.5" fill="#3a3a3a" opacity="0.4" />
      <ellipse cx="57.5" cy="162" rx="5.5" ry="2.5" fill="#3a3a3a" opacity="0.4" />
    </svg>
  );
}
