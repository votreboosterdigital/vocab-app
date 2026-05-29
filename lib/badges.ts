import type { UserProfile, UserProgress } from "@/types";
import { getProgress } from "@/lib/progress";
import { WORDS } from "@/lib/words";

export type BadgeColor = "gold" | "blue" | "red" | "green";

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: BadgeColor;
  check: (progress: UserProgress) => boolean;
}

export interface UnlockedBadge {
  id: string;
  unlockedAt: number;
}

const BADGES_KEY = (profile: UserProfile) => `vocabapp_badges_${profile}`;

export const BADGES: Badge[] = [
  {
    id: "tea-time",
    emoji: "🫖",
    name: "Tea Time",
    description: "Première session terminée",
    color: "green",
    check: (p) => p.sessions.length >= 1,
  },
  {
    id: "the-queen",
    emoji: "👑",
    name: "The Queen",
    description: "100 mots maîtrisés",
    color: "gold",
    check: (p) =>
      Object.values(p.learnedWords).filter((w) => w.mastered).length >= 100,
  },
  {
    id: "bus-rider",
    emoji: "🚌",
    name: "Bus Rider",
    description: "7 jours de streak",
    color: "red",
    check: (p) => p.currentStreak >= 7,
  },
  {
    id: "ring-ring",
    emoji: "☎️",
    name: "Ring Ring",
    description: "Tous les mots B1 vus",
    color: "blue",
    check: (p) =>
      WORDS.filter((w) => w.level === "B1").every((w) => !!p.learnedWords[w.id]),
  },
  {
    id: "west-end",
    emoji: "🎭",
    name: "West End",
    description: "Score parfait 10/10 en quiz",
    color: "gold",
    check: (p) =>
      p.sessions.some(
        (s) => s.mode === "quiz" && s.score === 10 && s.wordsReviewed.length === 10
      ),
  },
  {
    id: "magic-word",
    emoji: "🪄",
    name: "Magic Word",
    description: "Les 3 modes joués au moins une fois",
    color: "blue",
    check: (p) => {
      const m = p.modesPlayed ?? [];
      return (
        m.includes("flashcard") && m.includes("quiz") && m.includes("fill")
      );
    },
  },
  {
    id: "top-hat",
    emoji: "🎩",
    name: "Top Hat",
    description: "Tous les mots C1 vus",
    color: "blue",
    check: (p) =>
      WORDS.filter((w) => w.level === "C1").every((w) => !!p.learnedWords[w.id]),
  },
  {
    id: "tower-guard",
    emoji: "🦁",
    name: "Tower Guard",
    description: "500 mots maîtrisés",
    color: "gold",
    check: (p) =>
      Object.values(p.learnedWords).filter((w) => w.mastered).length >= 500,
  },
  {
    id: "big-ben",
    emoji: "🏰",
    name: "Big Ben",
    description: "30 jours de streak",
    color: "blue",
    check: (p) => p.currentStreak >= 30,
  },
  {
    id: "rainy-day",
    emoji: "🌧️",
    name: "Rainy Day",
    description: "50 sessions jouées",
    color: "blue",
    check: (p) => p.sessions.length >= 50,
  },
];

export function getUnlockedBadges(profile: UserProfile): UnlockedBadge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BADGES_KEY(profile));
    return raw ? (JSON.parse(raw) as UnlockedBadge[]) : [];
  } catch {
    return [];
  }
}

function saveUnlockedBadges(profile: UserProfile, badges: UnlockedBadge[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BADGES_KEY(profile), JSON.stringify(badges));
}

export function checkAndUnlockBadges(profile: UserProfile): Badge[] {
  const progress = getProgress(profile);
  const unlocked = getUnlockedBadges(profile);
  const unlockedIds = new Set(unlocked.map((b) => b.id));

  const newlyUnlocked: Badge[] = [];

  for (const badge of BADGES) {
    if (!unlockedIds.has(badge.id) && badge.check(progress)) {
      newlyUnlocked.push(badge);
      unlocked.push({ id: badge.id, unlockedAt: Date.now() });
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlockedBadges(profile, unlocked);
  }

  return newlyUnlocked;
}
