"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { UserProfile, WordLevel } from "@/types";
import { getProgress, getMasteredCount, updateStreak, setSessionProfile } from "@/lib/progress";
import { WORDS } from "@/lib/words";

const PROFILE_STYLES: Record<UserProfile, { gradient: string; emoji: string; ring: string }> = {
  "papa":       { gradient: "from-blue-500 to-violet-600",  emoji: "👨", ring: "ring-blue-400"   },
  "Eya":        { gradient: "from-pink-400 to-rose-500",    emoji: "👧", ring: "ring-pink-400"   },
  "Ma khadija": { gradient: "from-teal-400 to-cyan-500",    emoji: "👩", ring: "ring-teal-400"   },
  "Maman":      { gradient: "from-orange-400 to-amber-500", emoji: "👩‍🦱", ring: "ring-orange-400" },
};

const MODES = [
  {
    href: "/flashcards",
    emoji: "🃏",
    title: "Flashcards",
    desc: "Apprends un mot à la fois",
    gradient: "from-violet-500 to-purple-700",
    shadow: "shadow-violet-300/60",
  },
  {
    href: "/quiz",
    emoji: "🎯",
    title: "Quiz",
    desc: "4 choix, trouve la bonne réponse",
    gradient: "from-rose-500 to-red-600",
    shadow: "shadow-rose-300/60",
  },
  {
    href: "/fill",
    emoji: "✏️",
    title: "Complète la phrase",
    desc: "Trouve le mot manquant dans une phrase",
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-300/60",
  },
] as const;

const LEVELS: { value: WordLevel | "all"; label: string; idle: string; active: string }[] = [
  { value: "A1",  label: "A1",   idle: "bg-white text-emerald-600 border-emerald-200", active: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200" },
  { value: "A2",  label: "A2",   idle: "bg-white text-green-600 border-green-200",     active: "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"     },
  { value: "B1",  label: "B1",   idle: "bg-white text-yellow-600 border-yellow-200",   active: "bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-200"   },
  { value: "B2",  label: "B2",   idle: "bg-white text-orange-600 border-orange-200",   active: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"   },
  { value: "C1",  label: "C1",   idle: "bg-white text-purple-600 border-purple-200",   active: "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200"   },
  { value: "all", label: "Tout", idle: "bg-white text-primary border-primary/30",      active: "bg-primary text-white border-primary shadow-md shadow-primary/30"         },
];

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<WordLevel | "all">("all");
  const [mastered, setMastered] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("vocabapp_profile") as UserProfile | null;
    if (stored) {
      setProfile(stored);
      setMastered(getMasteredCount(stored));
      setStreak(updateStreak(stored));
    }
  }, []);

  function handleSelectProfile(p: UserProfile) {
    setProfile(p);
    setSessionProfile(p);
    sessionStorage.setItem("vocabapp_level", selectedLevel);
    setMastered(getMasteredCount(p));
    setStreak(updateStreak(p));
  }

  function handleLevelChange(level: WordLevel | "all") {
    setSelectedLevel(level);
    sessionStorage.setItem("vocabapp_level", level);
  }

  const progress = profile ? getProgress(profile) : null;
  const lastSession = progress?.sessions.at(-1);

  return (
    <main className="min-h-screen bg-app-bg pb-10">

      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 px-4 pt-12 pb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="animate-float inline-block text-6xl mb-3">🚀</div>
          <h1 className="font-display text-5xl font-bold text-white drop-shadow-md">WordQuest</h1>
          <p className="text-violet-200 text-base font-semibold mt-1">
            Apprends l&apos;anglais en famille !
          </p>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto -mt-5">

        {/* ── Sélecteur de profil ──────────────────────────────── */}
        <section className="mb-5 animate-slide-up">
          <div className="bg-white rounded-3xl shadow-xl p-5">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              👤 Qui joue ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PROFILE_STYLES) as UserProfile[]).map((p) => {
                const s = PROFILE_STYLES[p];
                const isActive = profile === p;
                return (
                  <button
                    key={p}
                    onClick={() => handleSelectProfile(p)}
                    className={`
                      relative flex flex-col items-center gap-2 py-5 px-3 rounded-2xl
                      font-display text-lg font-bold transition-all duration-200
                      hover:scale-105 active:scale-95
                      ${isActive
                        ? `bg-gradient-to-br ${s.gradient} text-white shadow-xl ring-4 ${s.ring} ring-offset-2 scale-105`
                        : "bg-gray-50 text-gray-600 border-2 border-gray-100 hover:border-gray-200 hover:shadow-md"
                      }
                    `}
                  >
                    <span className="text-4xl leading-none">{s.emoji}</span>
                    <span>{p === "papa" ? "Papa" : p === "Maman" ? "Maman" : p}</span>
                    {isActive && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs shadow-md text-primary font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Stats ───────────────────────────────────────────────── */}
        {profile && (
          <section className="mb-5 animate-bounce-in">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-violet-50 to-primary/10 rounded-2xl p-4 text-center border border-primary/15 shadow-sm">
                <p className="font-display text-3xl font-bold text-primary">{mastered}</p>
                <p className="text-xs font-bold text-primary/60 mt-0.5">maîtrisés</p>
                <p className="text-xs text-gray-400">/ {WORDS.length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-4 text-center border border-orange-200 shadow-sm">
                <p className="font-display text-3xl font-bold text-orange-500">
                  {streak > 0 ? streak : "–"}
                </p>
                <p className="text-xs font-bold text-orange-500/70 mt-0.5">
                  {streak > 0
                    ? <span className="inline-block animate-streak-fire">🔥 jours</span>
                    : "🔥 streak"
                  }
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-4 text-center border border-emerald-200 shadow-sm">
                <p className="font-display text-3xl font-bold text-emerald-600">
                  {lastSession ? `${lastSession.score}/${lastSession.wordsReviewed.length}` : "—"}
                </p>
                <p className="text-xs font-bold text-emerald-600/70 mt-0.5">dernier score</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Sélecteur de niveau ──────────────────────────────── */}
        <section className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            📊 Niveau
          </p>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => handleLevelChange(lvl.value)}
                className={`
                  px-4 py-2 rounded-full border-2 font-bold text-sm
                  transition-all duration-150 active:scale-95
                  ${selectedLevel === lvl.value ? lvl.active : lvl.idle}
                `}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Modes ───────────────────────────────────────────────── */}
        <section className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            🎮 Choisir un mode
          </p>
          <div className="flex flex-col gap-3">
            {MODES.map((mode, i) => {
              const href = profile
                ? `${mode.href}?profile=${profile}&level=${selectedLevel}`
                : mode.href;
              return (
                <Link
                  key={mode.href}
                  href={href}
                  onClick={() => {
                    if (!profile) return;
                    sessionStorage.setItem("vocabapp_level", selectedLevel);
                  }}
                  className={`
                    btn-answer flex items-center gap-4 p-5 rounded-2xl
                    bg-gradient-to-br ${mode.gradient}
                    shadow-lg ${mode.shadow}
                    ${!profile ? "opacity-50 pointer-events-none grayscale" : ""}
                  `}
                  style={{ animationDelay: `${i * 80}ms` }}
                  aria-disabled={!profile}
                >
                  <span className="text-5xl shrink-0 drop-shadow">{mode.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-2xl font-bold text-white leading-tight">{mode.title}</h3>
                    <p className="text-white/75 text-sm mt-0.5 truncate">{mode.desc}</p>
                  </div>
                  <span className="text-white/60 text-2xl font-bold shrink-0">›</span>
                </Link>
              );
            })}
          </div>
          {!profile && (
            <p className="text-center text-sm text-gray-400 mt-4 animate-pulse-scale">
              ↑ Sélectionne un profil pour commencer
            </p>
          )}
        </section>

        {/* ── Dashboard ─────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="btn-answer flex items-center gap-3 py-4 px-5 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-bold hover:border-primary/40 hover:text-primary transition-all shadow-sm"
        >
          <span className="text-2xl">📊</span>
          <span className="font-display text-lg flex-1">Classement &amp; Stats</span>
          <span className="text-gray-300 text-xl">›</span>
        </Link>

      </div>
    </main>
  );
}
