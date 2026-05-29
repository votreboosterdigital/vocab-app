interface ScoreDisplayProps {
  score: number;
  total: number;
}

export default function ScoreDisplay({ score, total }: ScoreDisplayProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const style =
    total === 0
      ? "bg-gray-100 text-gray-400"
      : pct >= 80
      ? "bg-emerald-100 text-emerald-700"
      : pct >= 50
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";
  const icon = total === 0 ? "🎯" : pct >= 80 ? "⭐" : pct >= 50 ? "👍" : "💪";

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${style}`}>
      <span>{icon}</span>
      <span className="tabular-nums">{score}</span>
      {total > 0 && <span className="opacity-60 font-normal">/ {total}</span>}
    </div>
  );
}
