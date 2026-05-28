interface ScoreDisplayProps {
  score: number;
  total: number;
}

export default function ScoreDisplay({ score, total }: ScoreDisplayProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color = pct >= 80 ? "text-success" : pct >= 50 ? "text-yellow-500" : "text-secondary";
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600">Score :</span>
      <span className={`text-xl font-bold font-display ${color}`}>
        {score} / {total}
      </span>
      {total > 0 && (
        <span className="text-sm text-gray-500">({pct}%)</span>
      )}
    </div>
  );
}
