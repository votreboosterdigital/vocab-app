"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { getProgress, getMasteredCount } from "@/lib/progress";
import { WORDS, VALID_LEVELS } from "@/lib/words";
import type { UserProfile, WordLevel } from "@/types";

const PROFILES: { value: UserProfile; emoji: string; label: string }[] = [
  { value: "papa", emoji: "👨", label: "Papa" },
  { value: "Eya", emoji: "👧", label: "Eya" },
  { value: "Ma khadija", emoji: "👩", label: "Ma khadija" },
  { value: "Maman", emoji: "👩‍🦱", label: "Maman" },
];

const LEVEL_COLORS: Record<WordLevel, string> = {
  A1: "bg-emerald-500",
  A2: "bg-green-500",
  B1: "bg-yellow-500",
  B2: "bg-orange-500",
  C1: "bg-purple-500",
};

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣"];

interface ProfileStats {
  profile: UserProfile;
  emoji: string;
  label: string;
  mastered: number;
  streak: number;
  accuracy: number | null;
  levelProgress: Record<WordLevel, { mastered: number; total: number }>;
  sessionsCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ProfileStats[]>([]);

  useEffect(() => {
    const computed = PROFILES.map(({ value, emoji, label }) => {
      const progress = getProgress(value);
      const mastered = getMasteredCount(value);
      const streak = progress.currentStreak;

      const recent = progress.sessions.slice(-5);
      const totalAnswered = recent.reduce((sum, s) => sum + s.wordsReviewed.length, 0);
      const totalCorrect = recent.reduce((sum, s) => sum + s.score, 0);
      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

      const levelProgress = Object.fromEntries(
        VALID_LEVELS.map((level) => {
          const total = WORDS.filter((w) => w.level === level).length;
          const masteredCount = WORDS.filter(
            (w) => w.level === level && progress.learnedWords[w.id]?.mastered
          ).length;
          return [level, { mastered: masteredCount, total }];
        })
      ) as Record<WordLevel, { mastered: number; total: number }>;

      return {
        profile: value,
        emoji,
        label,
        mastered,
        streak,
        accuracy,
        levelProgress,
        sessionsCount: progress.sessions.length,
      };
    });

    computed.sort((a, b) => b.mastered - a.mastered);
    setStats(computed);
  }, []);

  return (
    <>
      <Navigation title="📊 Tableau de bord" />
      <main className="min-h-screen bg-app-bg px-4 py-6 max-w-lg mx-auto">
        {/* Classement */}
        <section className="mb-6 animate-slide-up">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Classement
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {stats.map((s, i) => (
              <div
                key={s.profile}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < stats.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-2xl w-8 text-center">{MEDALS[i]}</span>
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-400">
                    {s.sessionsCount} session{s.sessionsCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary text-xl">{s.mastered}</p>
                  <p className="text-xs text-gray-400">mots</p>
                </div>
                {s.streak > 0 && (
                  <div className="text-right min-w-[3rem]">
                    <p className="font-display font-bold text-secondary">{s.streak} 🔥</p>
                    <p className="text-xs text-gray-400">jours</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cards par joueur */}
        <section>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Détail par joueur
          </p>
          <div className="flex flex-col gap-4">
            {stats.map((s, i) => (
              <div
                key={s.profile}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{s.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-gray-800 text-lg">{s.label}</h3>
                    <p className="text-xs text-gray-400">
                      {MEDALS[i]} Rang {i + 1}
                    </p>
                  </div>
                  {s.accuracy !== null && (
                    <div className="text-right">
                      <p className="font-bold text-success text-lg">{s.accuracy}%</p>
                      <p className="text-xs text-gray-400">précision</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-primary/5 rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-primary text-xl">{s.mastered}</p>
                    <p className="text-xs text-gray-500">maîtrisés</p>
                  </div>
                  <div className="bg-secondary/5 rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-secondary text-xl">
                      {s.streak} 🔥
                    </p>
                    <p className="text-xs text-gray-500">jours</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-gray-600 text-xl">
                      {s.sessionsCount}
                    </p>
                    <p className="text-xs text-gray-500">sessions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {VALID_LEVELS.map((level) => {
                    const { mastered, total } = s.levelProgress[level];
                    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 w-6">{level}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${LEVEL_COLORS[level]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-16 text-right">
                          {mastered}/{total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
