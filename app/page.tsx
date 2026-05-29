"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { UserProfile, WordLevel } from "@/types";
import { getProgress, getMasteredCount, updateStreak, setSessionProfile, getXP } from "@/lib/progress";
import { WORDS } from "@/lib/words";
import LondonSkyline from "@/components/LondonSkyline";

function UnionJackMini({ size = 24 }: { size?: number }) {
  const h = Math.round((size * 2) / 3);
  return (
    <svg viewBox="0 0 30 20" width={size} height={h} xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 2 }}>
      <rect width="30" height="20" fill="#012169" />
      <line x1="0" y1="0" x2="30" y2="20" stroke="white" strokeWidth="4" />
      <line x1="30" y1="0" x2="0" y2="20" stroke="white" strokeWidth="4" />
      <line x1="0" y1="0" x2="30" y2="20" stroke="#C8102E" strokeWidth="2.2" />
      <line x1="30" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2.2" />
      <line x1="15" y1="0" x2="15" y2="20" stroke="white" strokeWidth="5.5" />
      <line x1="0" y1="10" x2="30" y2="10" stroke="white" strokeWidth="5.5" />
      <line x1="15" y1="0" x2="15" y2="20" stroke="#C8102E" strokeWidth="3" />
      <line x1="0" y1="10" x2="30" y2="10" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

const PROFILE_STYLES: Record<UserProfile, { gradient: string; emoji: string; ring: string; textDark?: boolean }> = {
  papa:         { gradient: "from-[#2B3A8C] to-[#1a2a6e]",  emoji: "👨",  ring: "ring-[#2B3A8C]"   },
  Eya:          { gradient: "from-[#C8102E] to-[#8b0a1e]",  emoji: "👧",  ring: "ring-[#C8102E]"   },
  "Ma khadija": { gradient: "from-[#f59e0b] to-[#d97706]",  emoji: "👩",  ring: "ring-amber-400", textDark: true },
  Maman:        { gradient: "from-emerald-500 to-emerald-700", emoji: "👩‍🦱", ring: "ring-emerald-400" },
};

const MODES = [
  {
    href: "/flashcards",
    emoji: "🃏",
    title: "Flashcards",
    desc: "Apprends un mot à la fois",
    gradient: "from-[#2B3A8C] to-[#1a2a6e]",
    shadow: "shadow-blue-400/40",
  },
  {
    href: "/quiz",
    emoji: "🎯",
    title: "Quiz",
    desc: "4 choix, trouve la bonne réponse",
    gradient: "from-[#C8102E] to-[#8b0a1e]",
    shadow: "shadow-red-400/40",
  },
  {
    href: "/fill",
    emoji: "✏️",
    title: "Complète la phrase",
    desc: "Trouve le mot manquant dans une phrase",
    gradient: "from-[#f59e0b] to-[#d97706]",
    shadow: "shadow-amber-400/40",
  },
] as const;

const LEVELS: { value: WordLevel | "all"; label: string; idle: string; active: string }[] = [
  { value: "A1",  label: "A1",   idle: "bg-white text-emerald-600 border-emerald-200", active: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200" },
  { value: "A2",  label: "A2",   idle: "bg-white text-green-600 border-green-200",     active: "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"     },
  { value: "B1",  label: "B1",   idle: "bg-white text-yellow-600 border-yellow-200",   active: "bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-200"   },
  { value: "B2",  label: "B2",   idle: "bg-white text-orange-600 border-orange-200",   active: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"   },
  { value: "C1",  label: "C1",   idle: "bg-white text-purple-600 border-purple-200",   active: "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200"   },
  { value: "all", label: "Tout", idle: "bg-white text-[#2B3A8C] border-[#2B3A8C]/30",  active: "bg-[#2B3A8C] text-white border-[#2B3A8C] shadow-md shadow-[#2B3A8C]/30"  },
];

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<WordLevel | "all">("all");
  const [mastered, setMastered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("vocabapp_profile") as UserProfile | null;
    if (stored) {
      setProfile(stored);
      setMastered(getMasteredCount(stored));
      setStreak(updateStreak(stored));
      setXp(getXP(stored));
    }
  }, []);

  function handleSelectProfile(p: UserProfile) {
    setProfile(p);
    setSessionProfile(p);
    sessionStorage.setItem("vocabapp_level", selectedLevel);
    setMastered(getMasteredCount(p));
    setStreak(updateStreak(p));
    setXp(getXP(p));
  }

  function handleLevelChange(level: WordLevel | "all") {
    setSelectedLevel(level);
    sessionStorage.setItem("vocabapp_level", level);
  }

  const progress = profile ? getProgress(profile) : null;
  const lastSession = progress?.sessions.at(-1);

  return (
    <main className="min-h-screen bg-[#F5F7FF] pb-10">

      {/* ── Sticky header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UnionJackMini size={28} />
          <span className="font-display text-xl font-bold text-[#1a1a3e]">WordQuest</span>
        </div>
        <div className="flex items-center gap-2">
          {profile && (
            <>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <span className="text-xs">⭐</span>
                <span className="text-xs font-bold text-amber-700">{xp} XP</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                  <span className="text-xs">🔥</span>
                  <span className="text-xs font-bold text-red-600">{streak}</span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* ── London Skyline hero ──────────────────────────────── */}
      <LondonSkyline height={148} animated />

      <div className="px-4 max-w-lg mx-auto mt-2">

        {/* ── Title ────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl font-bold text-[#1a1a3e]">
            Apprends l&apos;anglais 🇬🇧
          </h1>
          <p className="text-gray-500 text-sm mt-1">Choisis ton profil et commence !</p>
        </motion.div>

        {/* ── Profils ──────────────────────────────────────────── */}
        <motion.section
          className="mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
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
                        ? `bg-gradient-to-br ${s.gradient} ${s.textDark ? "text-stone-800" : "text-white"} shadow-xl ring-4 ${s.ring} ring-offset-2 scale-105`
                        : "bg-gray-50 text-gray-600 border-2 border-gray-100 hover:border-gray-200 hover:shadow-md"
                      }
                    `}
                  >
                    <span className="text-4xl leading-none">{s.emoji}</span>
                    <span>{p === "papa" ? "Papa" : p === "Maman" ? "Maman" : p}</span>
                    {isActive && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs shadow-md text-[#2B3A8C] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── Stats ────────────────────────────────────────────── */}
        {profile && (
          <motion.section
            className="mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-[#2B3A8C]/10 rounded-2xl p-4 text-center border border-[#2B3A8C]/15 shadow-sm">
                <p className="font-display text-3xl font-bold text-[#2B3A8C]">{mastered}</p>
                <p className="text-xs font-bold text-[#2B3A8C]/60 mt-0.5">maîtrisés</p>
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
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-4 text-center border border-amber-200 shadow-sm">
                <p className="font-display text-3xl font-bold text-amber-600">
                  {lastSession ? `${lastSession.score}/${lastSession.wordsReviewed.length}` : "—"}
                </p>
                <p className="text-xs font-bold text-amber-600/70 mt-0.5">dernier score</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Niveau ───────────────────────────────────────────── */}
        <motion.section
          className="mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
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
        </motion.section>

        {/* ── Modes ────────────────────────────────────────────── */}
        <motion.section
          className="mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
        >
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
        </motion.section>

        {/* ── Dashboard + Badges ───────────────────────────────── */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link
            href="/dashboard"
            className="btn-answer flex-1 flex items-center gap-3 py-4 px-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-bold hover:border-[#2B3A8C]/40 hover:text-[#2B3A8C] transition-all shadow-sm"
          >
            <span className="text-xl">📊</span>
            <span className="font-display text-base flex-1">Stats</span>
            <span className="text-gray-300 text-lg">›</span>
          </Link>
          <Link
            href="/badges"
            className="btn-answer flex-1 flex items-center gap-3 py-4 px-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-bold hover:border-amber-400/60 hover:text-amber-600 transition-all shadow-sm"
          >
            <span className="text-xl">🏅</span>
            <span className="font-display text-base flex-1">Badges</span>
            <span className="text-gray-300 text-lg">›</span>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
