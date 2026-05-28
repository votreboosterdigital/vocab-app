import type { WordLevel } from "@/types";

interface LevelBadgeProps {
  level: WordLevel;
  size?: "sm" | "md";
}

const LEVEL_CONFIG: Record<WordLevel, { label: string; classes: string }> = {
  1: { label: "Niveau 1", classes: "bg-green-100 text-green-700 border-green-300" },
  2: { label: "Niveau 2", classes: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  3: { label: "Niveau 3", classes: "bg-purple-100 text-purple-700 border-purple-300" },
};

export default function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const { label, classes } = LEVEL_CONFIG[level];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${classes} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
