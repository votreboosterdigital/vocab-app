import type { UserProfile, UserProgress, WordProgress, GameSession, WordLevel } from "@/types";
import { WORDS, getWordsByLevel } from "@/lib/words";
import type { VocabWord } from "@/types";

const STORAGE_PREFIX = "vocabapp_";

function storageKey(profile: UserProfile): string {
  return `${STORAGE_PREFIX}${profile}`;
}

function defaultProgress(profile: UserProfile): UserProgress {
  return {
    profile,
    learnedWords: {},
    sessions: [],
    currentStreak: 0,
    lastPlayDate: "",
  };
}

export function getProgress(profile: UserProfile): UserProgress {
  if (typeof window === "undefined") return defaultProgress(profile);
  try {
    const raw = localStorage.getItem(storageKey(profile));
    if (!raw) return defaultProgress(profile);
    return JSON.parse(raw) as UserProgress;
  } catch {
    return defaultProgress(profile);
  }
}

function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(progress.profile), JSON.stringify(progress));
}

export function markWord(profile: UserProfile, wordId: string, correct: boolean): void {
  const progress = getProgress(profile);
  const existing = progress.learnedWords[wordId] ?? {
    wordId,
    correctCount: 0,
    lastSeen: new Date().toISOString(),
    mastered: false,
  };
  const updated: WordProgress = {
    ...existing,
    correctCount: correct ? existing.correctCount + 1 : Math.max(0, existing.correctCount - 1),
    lastSeen: new Date().toISOString(),
    mastered: correct ? existing.correctCount + 1 >= 3 : false,
  };
  progress.learnedWords[wordId] = updated;
  saveProgress(progress);
}

export function getMasteredCount(profile: UserProfile): number {
  const progress = getProgress(profile);
  return Object.values(progress.learnedWords).filter((w) => w.mastered).length;
}

export function getWordsToReview(
  profile: UserProfile,
  level?: WordLevel | "all"
): VocabWord[] {
  const progress = getProgress(profile);
  const pool = level ? getWordsByLevel(level) : WORDS;
  const unmastered = pool.filter(
    (w) => !progress.learnedWords[w.id]?.mastered
  );
  if (unmastered.length > 0) return unmastered.sort(() => Math.random() - 0.5);
  // Si tout est maîtrisé, revoir tout depuis le début
  return pool.sort(() => Math.random() - 0.5);
}

export function updateStreak(profile: UserProfile): number {
  const progress = getProgress(profile);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (progress.lastPlayDate === today) {
    return progress.currentStreak;
  }

  const newStreak =
    progress.lastPlayDate === yesterday ? progress.currentStreak + 1 : 1;

  progress.currentStreak = newStreak;
  progress.lastPlayDate = today;
  saveProgress(progress);
  return newStreak;
}

export function addSession(profile: UserProfile, session: Omit<GameSession, "date">): void {
  const progress = getProgress(profile);
  progress.sessions.push({ ...session, date: new Date().toISOString() });
  // Garde les 50 dernières sessions seulement
  if (progress.sessions.length > 50) {
    progress.sessions = progress.sessions.slice(-50);
  }
  saveProgress(progress);
}

export function getSessionProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  return (sessionStorage.getItem("vocabapp_profile") as UserProfile) ?? null;
}

export function setSessionProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("vocabapp_profile", profile);
}
