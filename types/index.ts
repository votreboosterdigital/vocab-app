export type WordLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  level: WordLevel;
  category: string;
  emoji: string;
  phonetic: string;
}

export type UserProfile = "papa" | "Eya";

export interface WordProgress {
  wordId: string;
  correctCount: number;
  lastSeen: string;
  mastered: boolean;
}

export interface GameSession {
  date: string;
  mode: "flashcard" | "quiz" | "fill";
  score: number;
  wordsReviewed: string[];
}

export interface UserProgress {
  profile: UserProfile;
  learnedWords: Record<string, WordProgress>;
  sessions: GameSession[];
  currentStreak: number;
  lastPlayDate: string;
}

export interface GenerateSentenceResponse {
  sentence: string;
  translation: string;
}

export interface GenerateQuizResponse {
  distractors: string[];
}

export interface GenerateFillResponse {
  sentence: string;
  choices: string[];
}
