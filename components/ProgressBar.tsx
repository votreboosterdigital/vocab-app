interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const useDots = total > 0 && total <= 12;

  if (useDots) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i < current
                ? "bg-[#2B3A8C] w-5 shadow-sm shadow-[#2B3A8C]/40"
                : "bg-gray-200 w-2.5"
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-gray-400 tabular-nums">
          {current}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-1">
          <span>{label}</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out progress-bar-animated"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
