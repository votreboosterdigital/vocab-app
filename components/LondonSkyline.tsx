interface LondonSkylineProps {
  height?: number;
  className?: string;
  animated?: boolean;
}

export default function LondonSkyline({
  height = 150,
  className = "",
  animated = true,
}: LondonSkylineProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {/* Full-width SVG skyline — preserveAspectRatio="none" étire horizontalement (OK pour des bâtiments) */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 130"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dce8ff" />
            <stop offset="70%" stopColor="#eef3ff" />
            <stop offset="100%" stopColor="#e8f0ff" />
          </linearGradient>
          <linearGradient id="thames" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b0d4f0" />
            <stop offset="100%" stopColor="#7ab8e8" />
          </linearGradient>
        </defs>

        {/* Ciel */}
        <rect width="800" height="130" fill="url(#sky)" />

        {/* ── IMMEUBLES DE FOND (bleu clair, pleine largeur) ── */}
        <rect x="0"   y="76" width="22" height="34" fill="#ccd8ea" />
        <rect x="24"  y="66" width="16" height="44" fill="#c2ceea" />
        <rect x="42"  y="74" width="26" height="36" fill="#c8d4ec" />
        <rect x="70"  y="63" width="14" height="47" fill="#bfcde8" />
        <rect x="86"  y="72" width="20" height="38" fill="#c4d0ea" />
        <rect x="148" y="70" width="18" height="40" fill="#c8d4ec" />
        <rect x="168" y="62" width="14" height="48" fill="#c2ceea" />
        <rect x="184" y="68" width="24" height="42" fill="#ccd8ea" />
        <rect x="210" y="58" width="16" height="52" fill="#bfcde8" />
        <rect x="228" y="66" width="14" height="44" fill="#c8d4ec" />
        <rect x="244" y="72" width="20" height="38" fill="#c2ceea" />
        <rect x="266" y="63" width="16" height="47" fill="#c8d4ec" />
        <rect x="284" y="70" width="18" height="40" fill="#bfcde8" />
        <rect x="338" y="64" width="16" height="46" fill="#c8d4ec" />
        <rect x="356" y="56" width="12" height="54" fill="#c2ceea" />
        <rect x="370" y="68" width="22" height="42" fill="#ccd8ea" />
        <rect x="394" y="61" width="14" height="49" fill="#bfcde8" />
        <rect x="410" y="70" width="18" height="40" fill="#c8d4ec" />
        <rect x="478" y="65" width="16" height="45" fill="#c8d4ec" />
        <rect x="496" y="57" width="14" height="53" fill="#c2ceea" />
        <rect x="512" y="69" width="20" height="41" fill="#ccd8ea" />
        <rect x="534" y="61" width="14" height="49" fill="#bfcde8" />
        <rect x="550" y="68" width="18" height="42" fill="#c8d4ec" />
        <rect x="630" y="68" width="18" height="42" fill="#c8d4ec" />
        <rect x="650" y="60" width="14" height="50" fill="#c2ceea" />
        <rect x="666" y="72" width="20" height="38" fill="#ccd8ea" />
        <rect x="688" y="62" width="16" height="48" fill="#bfcde8" />
        <rect x="706" y="70" width="22" height="40" fill="#c8d4ec" />
        <rect x="742" y="63" width="14" height="47" fill="#c2ceea" />
        <rect x="758" y="72" width="18" height="38" fill="#ccd8ea" />
        <rect x="778" y="62" width="22" height="48" fill="#bfcde8" />

        {/* ── PARLEMENT / WESTMINSTER (gauche) ── */}
        <rect x="0"  y="83" width="100" height="27" fill="#4a6fa5" />
        {/* Créneaux */}
        <rect x="2"  y="76" width="8"  height="8"  fill="#4a6fa5" />
        <rect x="14" y="72" width="8"  height="12" fill="#3d5c8a" />
        <rect x="26" y="77" width="7"  height="7"  fill="#4a6fa5" />
        <rect x="37" y="73" width="7"  height="11" fill="#4a6fa5" />
        <rect x="48" y="70" width="8"  height="14" fill="#3d5c8a" />
        <rect x="60" y="75" width="7"  height="9"  fill="#4a6fa5" />
        <rect x="71" y="71" width="7"  height="13" fill="#4a6fa5" />
        <rect x="82" y="68" width="8"  height="16" fill="#3d5c8a" />
        {/* Tour Victoria (gauche, haute) */}
        <rect x="0"  y="46" width="18" height="64" fill="#3d5c8a" />
        {/* Tour droite haute */}
        <rect x="88" y="50" width="12" height="60" fill="#3d5c8a" />

        {/* ── BIG BEN ── */}
        <rect x="103" y="86" width="26" height="24" fill="#c49520" />
        <rect x="106" y="54" width="20" height="34" fill="#d4a843" />
        <rect x="104" y="46" width="24" height="10" fill="#c49520" />
        <circle cx="116" cy="40" r="10" fill="#f0d080" stroke="#8a6a20" strokeWidth="2" />
        <circle cx="116" cy="40" r="2.5" fill="#8a6a20" />
        <line x1="116" y1="40" x2="116" y2="32" stroke="#8a6a20" strokeWidth="1.5" />
        <line x1="116" y1="40" x2="123" y2="40" stroke="#8a6a20" strokeWidth="1.5" />
        <polygon points="116,18 111,46 121,46" fill="#c49520" />
        {/* Mât + Union Jack */}
        <line x1="121" y1="6" x2="121" y2="18" stroke="#555" strokeWidth="1.5" />
        <rect x="121" y="6" width="18" height="11" fill="#012169" />
        <line x1="121" y1="6"  x2="139" y2="17" stroke="white" strokeWidth="1.5" />
        <line x1="139" y1="6"  x2="121" y2="17" stroke="white" strokeWidth="1.5" />
        <line x1="121" y1="6"  x2="139" y2="17" stroke="#C8102E" strokeWidth="0.8" />
        <line x1="139" y1="6"  x2="121" y2="17" stroke="#C8102E" strokeWidth="0.8" />
        <line x1="130" y1="6"  x2="130" y2="17" stroke="white" strokeWidth="2.5" />
        <line x1="121" y1="11" x2="139" y2="11" stroke="white" strokeWidth="2.5" />
        <line x1="130" y1="6"  x2="130" y2="17" stroke="#C8102E" strokeWidth="1.5" />
        <line x1="121" y1="11" x2="139" y2="11" stroke="#C8102E" strokeWidth="1.5" />

        {/* ── IMMEUBLES CENTRE-GAUCHE ── */}
        <rect x="132" y="58" width="16" height="52" fill="#5a7aaa" />
        <rect x="150" y="66" width="12" height="44" fill="#4a6a9a" />
        <rect x="164" y="62" width="18" height="48" fill="#5a7aaa" />

        {/* ── THE SHARD (pyramide) ── */}
        <polygon points="310,18 295,110 325,110" fill="#7090c0" />
        <polygon points="310,18 295,110 310,110" fill="#80a0d0" />
        <line x1="310" y1="18" x2="302" y2="78" stroke="#9ab8e4" strokeWidth="0.8" opacity="0.7" />
        <line x1="310" y1="18" x2="318" y2="78" stroke="#9ab8e4" strokeWidth="0.8" opacity="0.7" />
        <line x1="303" y1="52" x2="317" y2="52" stroke="#9ab8e4" strokeWidth="0.8" opacity="0.7" />
        <line x1="300" y1="70" x2="320" y2="70" stroke="#9ab8e4" strokeWidth="0.8" opacity="0.7" />
        <line x1="297" y1="88" x2="323" y2="88" stroke="#9ab8e4" strokeWidth="0.8" opacity="0.7" />

        {/* ── IMMEUBLES MODERNES (centre) ── */}
        <rect x="330" y="54" width="18" height="56" fill="#5a8abf" />
        <rect x="350" y="62" width="16" height="48" fill="#4a7aaf" />
        <rect x="368" y="50" width="14" height="60" fill="#608ec0" />
        <rect x="384" y="60" width="18" height="50" fill="#5a7ab5" />
        {/* Fenêtres */}
        <rect x="334" y="58" width="5" height="4" fill="#a0c4e4" opacity="0.8" />
        <rect x="342" y="58" width="5" height="4" fill="#a0c4e4" opacity="0.8" />
        <rect x="334" y="66" width="5" height="4" fill="#a0c4e4" opacity="0.8" />
        <rect x="342" y="66" width="5" height="4" fill="#a0c4e4" opacity="0.8" />
        <rect x="334" y="74" width="5" height="4" fill="#a0c4e4" opacity="0.8" />
        <rect x="342" y="74" width="5" height="4" fill="#a0c4e4" opacity="0.8" />

        {/* ── THE GHERKIN (cornichon) ── */}
        <path d="M444,28 L432,110 L456,110 Z" fill="#7aaccc" />
        <path d="M444,28 L432,110 L444,110 Z" fill="#8abcdc" />
        <line x1="444" y1="28" x2="436" y2="80" stroke="#60a0c0" strokeWidth="0.8" opacity="0.6" />
        <line x1="444" y1="28" x2="452" y2="80" stroke="#60a0c0" strokeWidth="0.8" opacity="0.6" />
        <line x1="437" y1="56" x2="451" y2="56" stroke="#60a0c0" strokeWidth="0.8" opacity="0.6" />
        <line x1="435" y1="73" x2="453" y2="73" stroke="#60a0c0" strokeWidth="0.8" opacity="0.6" />
        <line x1="433" y1="88" x2="455" y2="88" stroke="#60a0c0" strokeWidth="0.8" opacity="0.6" />

        {/* ── CABINE TÉLÉPHONIQUE ROUGE ── */}
        <rect x="464" y="74" width="16" height="6"  fill="#a80e26" rx="2" />
        <rect x="464" y="79" width="16" height="31" fill="#C8102E" />
        <rect x="467" y="83" width="10" height="23" fill="#a8d8ea" />
        <line x1="472" y1="83" x2="472" y2="106" stroke="#C8102E" strokeWidth="1" />
        <line x1="467" y1="95" x2="477" y2="95" stroke="#C8102E" strokeWidth="1" />
        <rect x="463" y="109" width="18" height="3"  fill="#a80e26" />

        {/* ── ST PAUL'S CATHÉDRALE ── */}
        <rect x="500" y="98" width="70" height="12" fill="#4a6aa5" />
        <rect x="504" y="90" width="62" height="10" fill="#4a6aa5" />
        <rect x="508" y="73" width="54" height="19" fill="#4a6aa5" />
        <rect x="510" y="65" width="50" height="10" fill="#3a5a95" />
        {/* Colonnes */}
        <rect x="513" y="62" width="3" height="4" fill="#3a5a95" />
        <rect x="520" y="62" width="3" height="4" fill="#3a5a95" />
        <rect x="527" y="62" width="3" height="4" fill="#3a5a95" />
        <rect x="534" y="62" width="3" height="4" fill="#3a5a95" />
        <rect x="541" y="62" width="3" height="4" fill="#3a5a95" />
        <rect x="548" y="62" width="3" height="4" fill="#3a5a95" />
        {/* Tambour dôme */}
        <rect x="519" y="48" width="30" height="20" fill="#4a6aa5" />
        {/* Dôme */}
        <ellipse cx="534" cy="48" rx="23" ry="18" fill="#5a7ab5" />
        <ellipse cx="534" cy="48" rx="16" ry="12" fill="#6a8ac5" />
        {/* Lanterne + croix */}
        <rect x="531" y="24" width="6" height="16" fill="#4a6aa5" />
        <line x1="534" y1="16" x2="534" y2="24" stroke="#4a6aa5" strokeWidth="2" />
        <line x1="530" y1="19" x2="538" y2="19" stroke="#4a6aa5" strokeWidth="2" />

        {/* ── TOWER BRIDGE ── */}
        <rect x="622" y="97" width="118" height="13" fill="#3a4c8a" />
        {/* Tour gauche */}
        <rect x="626" y="58" width="22" height="52" fill="#4a5c9a" />
        <rect x="622" y="54" width="30" height="7"  fill="#3a4c8a" />
        <polygon points="637,34 624,54 650,54" fill="#4a5c9a" />
        {/* Tour droite */}
        <rect x="714" y="58" width="22" height="52" fill="#4a5c9a" />
        <rect x="710" y="54" width="30" height="7"  fill="#3a4c8a" />
        <polygon points="725,34 712,54 738,54" fill="#4a5c9a" />
        {/* Passerelle haute */}
        <rect x="648" y="66" width="66" height="6"  fill="#3a4c8a" />
        {/* Câbles */}
        <line x1="637" y1="54" x2="648" y2="85" stroke="#3a4c8a" strokeWidth="2" />
        <line x1="648" y1="85" x2="662" y2="72" stroke="#3a4c8a" strokeWidth="1.5" />
        <line x1="662" y1="72" x2="714" y2="76" stroke="#3a4c8a" strokeWidth="1.5" />
        <line x1="714" y1="76" x2="725" y2="54" stroke="#3a4c8a" strokeWidth="2" />
        {/* Fenêtres tours */}
        <rect x="630" y="63" width="5" height="5" fill="#8898d0" />
        <rect x="638" y="63" width="5" height="5" fill="#8898d0" />
        <rect x="630" y="72" width="5" height="5" fill="#8898d0" />
        <rect x="638" y="72" width="5" height="5" fill="#8898d0" />
        <rect x="718" y="63" width="5" height="5" fill="#8898d0" />
        <rect x="726" y="63" width="5" height="5" fill="#8898d0" />

        {/* ── IMMEUBLES DROITE ── */}
        <rect x="742" y="63" width="16" height="47" fill="#5a7aaa" />
        <rect x="760" y="70" width="14" height="40" fill="#4a6a9a" />
        <rect x="776" y="58" width="24" height="52" fill="#5a7aaa" />

        {/* ── TAMISE ── */}
        <rect x="0" y="108" width="800" height="22" fill="url(#thames)" />
        <path
          d="M0,112 Q100,108 200,112 Q300,116 400,112 Q500,108 600,112 Q700,116 800,112"
          fill="none"
          stroke="#90c4e4"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </svg>

      {/* Bus double-decker rouge animé — traverse de droite à gauche */}
      {animated && (
        <div
          className="animate-bus-ride"
          style={{ bottom: 14 }}
        >
          <div style={{ width: 52, display: "flex", flexDirection: "column" }}>
            {/* Étage supérieur */}
            <div
              style={{
                background: "#C8102E",
                height: 15,
                borderRadius: "4px 4px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "0 3px",
              }}
            >
              <div style={{ width: 11, height: 8, background: "#c8e4f4", borderRadius: 2 }} />
              <div style={{ width: 11, height: 8, background: "#c8e4f4", borderRadius: 2 }} />
              <div style={{ width: 11, height: 8, background: "#c8e4f4", borderRadius: 2 }} />
            </div>
            {/* Étage inférieur */}
            <div
              style={{
                background: "#a80e26",
                height: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "0 3px",
              }}
            >
              <div style={{ width: 11, height: 8, background: "#c8e4f4", borderRadius: 2 }} />
              <div style={{ width: 11, height: 8, background: "#c8e4f4", borderRadius: 2 }} />
              <div style={{ width: 11, height: 8, background: "#c8e4f4", borderRadius: 2 }} />
            </div>
            {/* Bandeau bas */}
            <div style={{ background: "#881020", height: 4 }} />
            {/* Roues */}
            <div style={{ display: "flex", justifyContent: "space-around", padding: "0 4px" }}>
              <div
                style={{
                  width: 13,
                  height: 13,
                  background: "#222",
                  borderRadius: "50%",
                  border: "2px solid #555",
                }}
              />
              <div
                style={{
                  width: 13,
                  height: 13,
                  background: "#222",
                  borderRadius: "50%",
                  border: "2px solid #555",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
