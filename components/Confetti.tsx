const COLORS = ["#6C63FF", "#FF6B6B", "#FFD93D", "#6BCB77", "#FF9F43", "#48DBFB", "#FF6B9D"];

export default function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[i % COLORS.length],
    delay: `${Math.random() * 1.4}s`,
    size: `${7 + Math.random() * 8}px`,
    duration: `${1.4 + Math.random() * 0.8}s`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}
