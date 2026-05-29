"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import LondonSkyline from "@/components/LondonSkyline";
import { getProgress, getMasteredCount, getWordsSeenCount } from "@/lib/progress";
import { WORDS, VALID_LEVELS } from "@/lib/words";
import type { UserProfile, WordLevel } from "@/types";

const PROFILES: { value: UserProfile; emoji: string; label: string }[] = [
  { value: "papa",       emoji: "👨", label: "Papa"       },
  { value: "Eya",        emoji: "👧", label: "Eya"        },
  { value: "Ma khadija", emoji: "👩", label: "Ma Khadija" },
  { value: "Maman",      emoji: "👩‍🦱", label: "Maman"      },
];

const LEVEL_COLORS: Record<WordLevel, { bar: string; text: string; bg: string }> = {
  A1: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50"  },
  A2: { bar: "bg-green-500",   text: "text-green-700",   bg: "bg-green-50"    },
  B1: { bar: "bg-yellow-500",  text: "text-yellow-700",  bg: "bg-yellow-50"   },
  B2: { bar: "bg-orange-500",  text: "text-orange-700",  bg: "bg-orange-50"   },
  C1: { bar: "bg-purple-500",  text: "text-purple-700",  bg: "bg-purple-50"   },
};

const RANK_STYLES = [
  { medal: "🥇", bg: "from-amber-400 to-yellow-500",  ring: "ring-amber-300",  size: "text-4xl" },
  { medal: "🥈", bg: "from-slate-400 to-gray-500",    ring: "ring-slate-300",  size: "text-3xl" },
  { medal: "🥉", bg: "from-orange-400 to-amber-600",  ring: "ring-orange-300", size: "text-3xl" },
  { medal: "4️⃣", bg: "from-gray-300 to-gray-400",     ring: "ring-gray-200",   size: "text-2xl" },
];

interface ProfileStats {
  profile: UserProfile;
  emoji: string;
  label: string;
  mastered: number;
  wordsSeen: number;
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
      const wordsSeen = getWordsSeenCount(value);
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

      return { profile: value, emoji, label, mastered, wordsSeen, streak, accuracy, levelProgress, sessionsCount: progress.sessions.length };
    });

    computed.sort((a, b) => b.mastered - a.mastered);
    setStats(computed);
  }, []);

  return (
    <>
      <Navigation title="📊 Classement" />
      <main className="min-h-screen bg-app-bg pb-10">

        {/* ── Hero classement ────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#1a1a3e] to-[#2B3A8C] px-4 pt-8 pb-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <h2 className="font-display text-3xl font-bold text-white relative">🏆 Classement famille</h2>
          <p className="text-blue-200 text-sm mt-1 relative">Qui apprend le plus ?</p>
        </div>
        <LondonSkyline height={130} />

        <div className="px-4 max-w-lg mx-auto -mt-6">

          {/* ── Podium top 3 ──────────────────────────────────────── */}
          <section className="mb-6 animate-slide-up">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white">
              {stats.map((s, i) => {
                const rank = RANK_STYLES[i] ?? RANK_STYLES[3];
                const isFirst = i === 0;
                return (
                  <div
                    key={s.profile}
                    className={`
                      flex items-center gap-4 px-5 py-4
                      ${i < stats.length - 1 ? "border-b border-gray-100" : ""}
                      ${isFirst ? "bg-gradient-to-r from-amber-50 to-yellow-50" : ""}
                    `}
                  >
                    {/* Rang */}
                    <div className={`
                      w-11 h-11 rounded-2xl flex items-center justify-center shrink-0
                      bg-gradient-to-br ${rank.bg} shadow-md
                    `}>
                      <span className={rank.size}>{rank.medal}</span>
                    </div>

                    {/* Avatar */}
                    <span className={`text-3xl ${isFirst ? "animate-float" : ""}`}>{s.emoji}</span>

                    {/* Nom + sessions */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-display font-bold ${isFirst ? "text-amber-700 text-lg" : "text-gray-800"}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {s.sessionsCount} session{s.sessionsCount !== 1 ? "s" : ""}
                        {s.accuracy !== null ? ` · ${s.accuracy}% précision` : ""}
                      </p>
                    </div>

                    {/* Streak */}
                    {s.streak > 0 && (
                      <div className="text-center shrink-0">
                        <p className="font-display font-bold text-orange-500 text-base">
                          {s.streak} <span className={s.streak >= 3 ? "inline-block animate-streak-fire" : ""}>🔥</span>
                        </p>
                        <p className="text-xs text-gray-400">jours</p>
                      </div>
                    )}

                    {/* Score mots vus */}
                    <div className="text-right shrink-0">
                      <p className={`font-display font-bold text-2xl ${isFirst ? "text-amber-600" : "text-[#2B3A8C]"}`}>
                        {s.wordsSeen}
                      </p>
                      <p className="text-xs text-gray-400">mots vus</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Détail par joueur ──────────────────────────────────── */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Progression détaillée
            </p>
            <div className="flex flex-col gap-4">
              {stats.map((s, i) => {
                const rank = RANK_STYLES[i] ?? RANK_STYLES[3];
                return (
                  <div
                    key={s.profile}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* En-tête joueur */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${rank.bg} shadow`}>
                        <span className="text-xl">{rank.medal}</span>
                      </div>
                      <span className="text-3xl">{s.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-gray-800 text-lg leading-tight">{s.label}</h3>
                        <p className="text-xs text-gray-400">Rang {i + 1}</p>
                      </div>
                      {s.accuracy !== null && (
                        <div className="text-right">
                          <p className="font-bold text-success text-xl">{s.accuracy}%</p>
                          <p className="text-xs text-gray-400">précision</p>
                        </div>
                      )}
                    </div>

                    {/* Stats 4 colonnes */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-100">
                        <p className="font-display font-bold text-blue-600 text-xl">{s.wordsSeen}</p>
                        <p className="text-xs text-gray-500 mt-0.5">vus</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-[#2B3A8C]/10 rounded-xl p-3 text-center border border-[#2B3A8C]/10">
                        <p className="font-display font-bold text-[#2B3A8C] text-xl">{s.mastered}</p>
                        <p className="text-xs text-gray-500 mt-0.5">maîtrisés</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-3 text-center border border-orange-200">
                        <p className="font-display font-bold text-orange-500 text-xl">
                          {s.streak > 0 ? s.streak : "–"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.streak > 0 ? "🔥 jours" : "streak"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="font-display font-bold text-gray-600 text-xl">{s.sessionsCount}</p>
                        <p className="text-xs text-gray-500 mt-0.5">sessions</p>
                      </div>
                    </div>

                    {/* Barres de niveau */}
                    <div className="space-y-2">
                      {VALID_LEVELS.map((level) => {
                        const { mastered, total } = s.levelProgress[level];
                        const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
                        const c = LEVEL_COLORS[level];
                        return (
                          <div key={level} className="flex items-center gap-3">
                            <span className={`text-xs font-bold w-6 ${c.text}`}>{level}</span>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-14 text-right tabular-nums">
                              {mastered}/{total}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-6">
            <Link
              href="/badges"
              className="btn-answer flex items-center gap-3 py-4 px-5 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-bold hover:border-amber-400/60 hover:text-amber-600 transition-all shadow-sm"
            >
              <span className="text-2xl">🏅</span>
              <span className="font-display text-lg flex-1">Collection de badges</span>
              <span className="text-gray-300 text-xl">›</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
