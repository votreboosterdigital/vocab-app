import type { VocabWord, WordLevel } from "@/types";
import wordsData from "@/data/words.json";

export const WORDS: VocabWord[] = (wordsData as VocabWord[]).map((w) => ({
  ...w,
  phonetic: w.phonetic.replace(/^\/|\/$/g, ""),
}));

export const VALID_LEVELS: WordLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export function getWordsByLevel(level: WordLevel | "all"): VocabWord[] {
  if (level === "all") return WORDS;
  return WORDS.filter((w) => w.level === level);
}

export function getWordById(id: string): VocabWord | undefined {
  return WORDS.find((w) => w.id === id);
}

export function getRandomWords(count: number, exclude?: string[]): VocabWord[] {
  const pool = exclude ? WORDS.filter((w) => !exclude.includes(w.id)) : WORDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getDistractors(word: VocabWord, count = 3): VocabWord[] {
  const sameLevel = WORDS.filter((w) => w.level === word.level && w.id !== word.id);
  const sameCategory = sameLevel.filter((w) => w.category === word.category);
  const pool = sameCategory.length >= count ? sameCategory : sameLevel;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}
