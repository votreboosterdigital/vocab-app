"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { UserProfile, WordLevel } from "@/types";
import { getProgress, getMasteredCount, updateStreak, setSessionProfile } from "@/lib/progress";
import { WORDS } from "@/lib/words";

const MODES = [
  { href: "/flashcards", emoji: "🃏", title: "Flashcards",           desc: "Apprends un mot à la fois",      color: "from-primary/20 to-primary/5",   border: "border-primary/30" },
  { href: "/quiz",       emoji: "🎯", title: "Quiz",                 desc: "4 choix, trouve la bonne réponse", color: "from-secondary/20 to-secondary/5", border: "border-secondary/30" },
  { href: "/fill",       emoji: "✏️", title: "Complète la phrase",   desc: "Trouve le mot manquant",          color: "from-accent/30 to-accent/10",     border: "border-accent/40"   },
] as const;

const LEVELS: { value: WordLevel | "all"; label: string; color: string }[] = [
  { value: "A1",  label: "A1",  color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { value: "A2",  label: "A2",  color: "bg-green-100 text-green-700 border-green-300" },
  { value: "B1",  label: "B1",  color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "B2",  label: "B2",  color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "C1",  label: "C1",  color: "bg-purple-100 text-purple-700 border-purple-300" },
  { value: "all", label: "Tout",color: "bg-primary/10 text-primary border-primary/30" },
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
    <main className="min-h-screen bg-app-bg px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="text-center mb-8 animate-slide-up">
        <h1 className="font-display text-5xl font-bold text-primary mb-1">WordQuest 🚀</h1>
        <p className="text-gray-500 text-lg">Apprends l&apos;anglais avec papa !</p>
      </header>

      {/* Sélecteur de profil */}
      <section className="mb-8">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Qui joue ?
        </p>
        <div className="flex gap-4 justify-center">
          {(["papa", "Eya"] as UserProfile[]).map((p) => (
            <button
              key={p}
              onClick={() => handleSelectProfile(p)}
              className={`
                flex-1 py-5 rounded-2xl border-2 font-display text-2xl font-bold
                transition-all duration-200 ease-out
                hover:scale-105 hover:shadow-md active:scale-95
                ${profile === p
                  ? "bg-primary text-white border-primary shadow-lg scale-105"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
                }
              `}
            >
              {p === "papa" ? "👨 Papa" : "👧 Eya"}
            </button>
          ))}
        </div>
      </section>

      {/* Stats globales */}
      {profile && (
        <section className="mb-8 animate-bounce-in">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-around">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-primary">{mastered}</p>
              <p className="text-xs text-gray-500 mt-0.5">mots maîtrisés</p>
              <p className="text-xs text-gray-400">sur {WORDS.length}</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-secondary">
                {streak} 🔥
              </p>
              <p className="text-xs text-gray-500 mt-0.5">jours de suite</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-success">
                {lastSession ? `${lastSession.score}/${lastSession.wordsReviewed.length}` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">dernier score</p>
            </div>
          </div>
        </section>
      )}

      {/* Sélecteur de niveau */}
      <section className="mb-6">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Niveau
        </p>
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => handleLevelChange(lvl.value)}
              className={`
                px-4 py-2 rounded-full border-2 font-bold text-sm
                transition-all duration-150
                ${selectedLevel === lvl.value
                  ? lvl.color + " shadow-sm scale-105"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }
              `}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </section>

      {/* Cards de modes */}
      <section>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Choisir un mode
        </p>
        <div className="flex flex-col gap-4">
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
                  flex items-center gap-5 p-5 rounded-2xl border-2 bg-gradient-to-r
                  ${mode.color} ${mode.border}
                  transition-all duration-200 ease-out
                  hover:scale-[1.02] hover:shadow-md active:scale-100
                  ${!profile ? "opacity-50 pointer-events-none" : ""}
                `}
                style={{ animationDelay: `${i * 80}ms` }}
                aria-disabled={!profile}
              >
                <span className="text-5xl shrink-0">{mode.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-800">{mode.title}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{mode.desc}</p>
                </div>
                <span className="ml-auto text-gray-400 text-xl">→</span>
              </Link>
            );
          })}
        </div>
        {!profile && (
          <p className="text-center text-sm text-gray-400 mt-4 italic">
            ← Sélectionne un profil pour commencer
          </p>
        )}
      </section>
    </main>
  );
}
