"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import LondonSkyline from "@/components/LondonSkyline";
import { BADGES, getUnlockedBadges } from "@/lib/badges";
import type { UnlockedBadge } from "@/lib/badges";
import { getSessionProfile } from "@/lib/progress";

const COLOR_STYLES: Record<string, { ring: string; bg: string; text: string }> = {
  gold:  { ring: "ring-amber-400",   bg: "bg-amber-50",  text: "text-amber-700"  },
  blue:  { ring: "ring-[#2B3A8C]",   bg: "bg-blue-50",   text: "text-[#2B3A8C]"  },
  red:   { ring: "ring-[#C8102E]",   bg: "bg-red-50",    text: "text-[#C8102E]"  },
  green: { ring: "ring-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
};

export default function BadgesPage() {
  const [unlocked, setUnlocked] = useState<UnlockedBadge[]>([]);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  useEffect(() => {
    const profile = getSessionProfile();
    if (profile) {
      setUnlocked(getUnlockedBadges(profile));
    }
  }, []);

  const unlockedIds = new Set(unlocked.map((b) => b.id));

  return (
    <>
      <Navigation title="🏅 Badges British" />
      <main className="min-h-screen bg-[#F5F7FF] pb-10">
        <LondonSkyline height={130} />

        <div className="px-4 max-w-lg mx-auto mt-4">

          {/* Progress bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#1a1a3e] text-sm">Collection de badges</span>
              <span className="font-bold text-[#2B3A8C] text-sm">{unlocked.length} / {BADGES.length}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((unlocked.length / BADGES.length) * 100)}%`,
                  background: "linear-gradient(90deg, #2B3A8C, #f59e0b)",
                }}
              />
            </div>
          </div>

          {/* Badge grid */}
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const isUnlocked = unlockedIds.has(badge.id);
              const unlockedData = unlocked.find((u) => u.id === badge.id);
              const styles = COLOR_STYLES[badge.color] ?? COLOR_STYLES.blue;
              const isTooltip = tooltipId === badge.id;

              return (
                <div key={badge.id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => setTooltipId(isTooltip ? null : badge.id)}
                    className={`
                      w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1
                      border-2 transition-all duration-200
                      ${isUnlocked
                        ? `${styles.bg} ${styles.ring} ring-2 shadow-md hover:scale-105`
                        : "bg-gray-100 border-gray-200 grayscale opacity-40"
                      }
                    `}
                  >
                    <span className="text-3xl">{badge.emoji}</span>
                    <span className={`text-xs font-bold leading-tight text-center px-1 ${isUnlocked ? styles.text : "text-gray-400"}`}>
                      {badge.name}
                    </span>
                  </button>

                  {/* Tooltip */}
                  {isTooltip && (
                    <div className="absolute bottom-full mb-2 z-10 w-40 bg-[#1a1a3e] text-white text-xs rounded-xl p-3 shadow-xl left-1/2 -translate-x-1/2">
                      <p className="font-bold mb-1">{badge.name}</p>
                      <p className="text-white/80">{badge.description}</p>
                      {unlockedData && (
                        <p className="text-white/50 mt-1 text-xs">
                          {new Date(unlockedData.unlockedAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {!isUnlocked && <p className="text-white/40 mt-1">🔒 Verrouillé</p>}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1a3e]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </>
  );
}
