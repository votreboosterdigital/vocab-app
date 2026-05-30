"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { VocabWord, UserProfile, GenerateSentenceResponse, WordLevel } from "@/types";
import { VALID_LEVELS } from "@/lib/words";
import { getWordsToReview, markWord, addSession, addXP, markModePlayed, hydrateFromCloud } from "@/lib/progress";
import { checkAndUnlockBadges } from "@/lib/badges";
import type { Badge } from "@/lib/badges";
import { playSound, preloadVoices } from "@/lib/sound";
import Navigation from "@/components/Navigation";
import WordCard from "@/components/WordCard";
import ProgressBar from "@/components/ProgressBar";
import BadgeUnlock from "@/components/BadgeUnlock";
import Confetti from "@/components/Confetti";

const SESSION_SIZE = 10;

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const profileParam = searchParams.get("profile") as UserProfile | null;
  const profile: UserProfile = profileParam ?? (typeof window !== "undefined" ? (sessionStorage.getItem("vocabapp_profile") as UserProfile) : "papa") ?? "papa";
  const levelParam = searchParams.get("level") ?? (typeof window !== "undefined" ? sessionStorage.getItem("vocabapp_level") : "all") ?? "all";
  const level = (VALID_LEVELS.includes(levelParam as WordLevel) ? (levelParam as WordLevel) : "all") as WordLevel | "all";

  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [sentence, setSentence] = useState<string | undefined>();
  const [sentenceTranslation, setSentenceTranslation] = useState<string | undefined>();
  const [loadingSentence, setLoadingSentence] = useState(false);
  const [done, setDone] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    preloadVoices();
  }, []);

  useEffect(() => {
    hydrateFromCloud(profile).finally(() => {
      setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
    });
  }, [profile, level]);

  const currentWord = words[currentIndex];

  const fetchSentence = useCallback(
    async (word: VocabWord) => {
      setLoadingSentence(true);
      setSentence(undefined);
      setSentenceTranslation(undefined);
      try {
        const res = await fetch("/api/generate-sentence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: word.word, level: word.level, userProfile: profile }),
        });
        const data = (await res.json()) as GenerateSentenceResponse;
        setSentence(data.sentence);
        setSentenceTranslation(data.translation);
      } catch {
        setSentence(`I love **${word.word}**!`);
        setSentenceTranslation("J'adore ce mot !");
      } finally {
        setLoadingSentence(false);
      }
    },
    [profile]
  );

  useEffect(() => {
    if (currentWord) fetchSentence(currentWord);
  }, [currentWord, fetchSentence]);

  function advance(knew: boolean) {
    if (!currentWord) return;
    markWord(profile, currentWord.id, knew);
    const newScore = knew ? score + 1 : score;
    if (knew) {
      setScore(newScore);
      addXP(profile, 10);
      playSound("correct");
    } else {
      playSound("wrong");
    }
    const newReviewed = [...reviewedIds, currentWord.id];
    setReviewedIds(newReviewed);

    if (currentIndex + 1 >= words.length) {
      addSession(profile, { mode: "flashcard", score: newScore, wordsReviewed: newReviewed });
      markModePlayed(profile, "flashcard");
      playSound("session-complete");
      const newlyUnlocked = checkAndUnlockBadges(profile);
      if (newlyUnlocked.length > 0) setNewBadge(newlyUnlocked[0]);
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSentence(undefined);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setScore(0);
    setReviewedIds([]);
    setDone(false);
    setSentence(undefined);
    setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
  }

  if (done) {
    const pct = words.length > 0 ? Math.round((score / words.length) * 100) : 0;
    const perfect = pct === 100;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
        <BadgeUnlock badge={newBadge} onDismiss={() => setNewBadge(null)} />
        {perfect && <Confetti />}
        <span className="text-7xl animate-bounce-in">{perfect ? "🏆" : pct >= 70 ? "🌟" : "💪"}</span>
        <h2 className="font-display text-4xl font-bold text-[#2B3A8C]">
          {perfect ? "Parfait !" : pct >= 70 ? "Bravo !" : "Continue !"}
        </h2>
        <p className="text-2xl font-bold text-gray-700">{score} / {words.length} mots connus</p>
        {pct < 100 && (
          <p className="text-gray-500 text-sm">Tu peux rejouer pour améliorer ton score !</p>
        )}
        <div className="flex gap-3 mt-2">
          <button
            onClick={restart}
            className="px-6 py-3 bg-[#2B3A8C] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
          >
            🔄 Rejouer
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-primary/30 transition-all"
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-[#2B3A8C]/30 border-t-[#2B3A8C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
      <ProgressBar current={currentIndex} total={words.length} label="Progression" />
      <WordCard
        word={currentWord}
        onKnew={() => advance(true)}
        onDidntKnow={() => advance(false)}
        exampleSentence={sentence}
        exampleTranslation={sentenceTranslation}
        loadingSentence={loadingSentence}
      />
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <>
      <Navigation title="🃏 Flashcards" />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-12 h-12 border-4 border-[#2B3A8C]/30 border-t-[#2B3A8C] rounded-full animate-spin" />
          </div>
        }
      >
        <FlashcardsContent />
      </Suspense>
    </>
  );
}
