import type { WordLevel } from "@/types";

interface LevelBadgeProps {
  level: WordLevel;
  size?: "sm" | "md";
}

const LEVEL_CONFIG: Record<WordLevel, { label: string; classes: string }> = {
  A1: { label: "A1", classes: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  A2: { label: "A2", classes: "bg-green-100 text-green-700 border-green-300" },
  B1: { label: "B1", classes: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  B2: { label: "B2", classes: "bg-orange-100 text-orange-700 border-orange-300" },
  C1: { label: "C1", classes: "bg-purple-100 text-purple-700 border-purple-300" },
};

export default function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const { label, classes } = LEVEL_CONFIG[level];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${classes} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
