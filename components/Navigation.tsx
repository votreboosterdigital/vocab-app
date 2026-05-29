"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UserProfile } from "@/types";
import { getXP } from "@/lib/progress";
import { isMuted, toggleMute } from "@/lib/sound";

interface NavigationProps {
  showBack?: boolean;
  title?: string;
  profile?: UserProfile | null;
  streak?: number;
}

export default function Navigation({
  showBack = true,
  title,
  profile,
  streak,
}: NavigationProps) {
  const [xp, setXp] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (profile) setXp(getXP(profile));
    setMuted(isMuted());
  }, [profile]);

  function handleToggleMute() {
    const next = toggleMute();
    setMuted(next);
  }

  return (
    <nav className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-60" />
      {showBack && (
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 active:scale-95 transition-all"
        >
          ← Accueil
        </Link>
      )}
      {title && (
        <h1 className="font-display text-xl font-semibold text-gray-800 flex-1 text-center">
          {title}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        {profile && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-amber-700">{xp} XP</span>
          </div>
        )}
        {streak != null && streak > 0 && (
          <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold text-red-600">{streak}</span>
          </div>
        )}
        <button
          onClick={handleToggleMute}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
          aria-label={muted ? "Activer le son" : "Couper le son"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </nav>
  );
}
