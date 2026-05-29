"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { VocabWord, UserProfile, GenerateQuizResponse, WordLevel } from "@/types";
import { getDistractors, WORDS, VALID_LEVELS } from "@/lib/words";
import { getWordsToReview, markWord, addSession } from "@/lib/progress";
import Navigation from "@/components/Navigation";
import ProgressBar from "@/components/ProgressBar";
import ScoreDisplay from "@/components/ScoreDisplay";
import AudioButton from "@/components/AudioButton";
import LevelBadge from "@/components/LevelBadge";
import Confetti from "@/components/Confetti";

const SESSION_SIZE = 10;

/* Couleurs Kahoot pour chaque choix */
const CHOICE_STYLES = [
  { base: "bg-[#E21B3C]", letter: "A", shape: "▲" },
  { base: "bg-[#1368CE]", letter: "B", shape: "●" },
  { base: "bg-[#D89E00]", letter: "C", shape: "◆" },
  { base: "bg-[#26890C]", letter: "D", shape: "■" },
] as const;

interface Choice {
  word: string;
  translation: string;
  isCorrect: boolean;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const profileParam = searchParams.get("profile") as UserProfile | null;
  const profile: UserProfile =
    profileParam ??
    (typeof window !== "undefined" ? (sessionStorage.getItem("vocabapp_profile") as UserProfile) : "papa") ??
    "papa";
  const levelParam =
    searchParams.get("level") ??
    (typeof window !== "undefined" ? sessionStorage.getItem("vocabapp_level") : "all") ??
    "all";
  const level = (VALID_LEVELS.includes(levelParam as WordLevel) ? (levelParam as WordLevel) : "all") as WordLevel | "all";

  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [wrongWords, setWrongWords] = useState<VocabWord[]>([]);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);

  useEffect(() => {
    setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
  }, [profile, level]);

  const currentWord = words[currentIndex];

  const buildChoices = useCallback(async (word: VocabWord) => {
    setLoadingChoices(true);
    setSelected(null);
    setFeedback(null);
    setWaitingNext(false);
    try {
      const localDistractors = getDistractors(word, 3);
      let distractorWords = localDistractors.map((d) => d.word);

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.word, allWords: WORDS.map((w) => w.word), count: 3 }),
      });
      const data = (await res.json()) as GenerateQuizResponse;
      if (data.distractors?.length >= 3) distractorWords = data.distractors.slice(0, 3);

      const distractorChoices: Choice[] = distractorWords.map((w) => {
        const found = WORDS.find((vw) => vw.word === w);
        return { word: w, translation: found?.translation ?? w, isCorrect: false };
      });

      setChoices(
        [{ word: word.word, translation: word.translation, isCorrect: true }, ...distractorChoices]
          .sort(() => Math.random() - 0.5)
      );
    } catch {
      const fallback = getDistractors(word, 3);
      setChoices(
        [{ word: word.word, translation: word.translation, isCorrect: true },
          ...fallback.map((d) => ({ word: d.word, translation: d.translation, isCorrect: false }))]
          .sort(() => Math.random() - 0.5)
      );
    } finally {
      setLoadingChoices(false);
    }
  }, []);

  useEffect(() => {
    if (currentWord) buildChoices(currentWord);
  }, [currentWord, buildChoices]);

  function handleChoice(choice: Choice) {
    if (selected || !currentWord) return;
    setSelected(choice.word);
    const correct = choice.isCorrect;
    setFeedback(correct ? "correct" : "wrong");
    markWord(profile, currentWord.id, correct);

    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    const newReviewed = [...reviewedIds, currentWord.id];
    setReviewedIds(newReviewed);
    if (!correct) setWrongWords((ww) => [...ww, currentWord]);

    if (correct) {
      setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          addSession(profile, { mode: "quiz", score: newScore, wordsReviewed: newReviewed });
          setDone(true);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1200);
    } else {
      setWaitingNext(true);
    }
  }

  function handleNext() {
    setWaitingNext(false);
    if (currentIndex + 1 >= words.length) {
      addSession(profile, { mode: "quiz", score, wordsReviewed: reviewedIds });
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function restart(reviewWrong = false) {
    const nextWords =
      reviewWrong && wrongWords.length > 0
        ? wrongWords
        : getWordsToReview(profile, level).slice(0, SESSION_SIZE);
    setWords(nextWords);
    setCurrentIndex(0);
    setScore(0);
    setReviewedIds([]);
    setWrongWords([]);
    setDone(false);
    setSelected(null);
    setFeedback(null);
  }

  /* ── Écran résultat ──────────────────────────────────────────── */
  if (done) {
    const pct = words.length > 0 ? Math.round((score / words.length) * 100) : 0;
    const isPerfect = pct === 100;
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-8 max-w-lg mx-auto text-center">
        {isPerfect && <Confetti />}

        <div className="animate-bounce-in">
          <span className="text-8xl block">
            {isPerfect ? "🏆" : pct >= 70 ? "🌟" : "💪"}
          </span>
        </div>

        <div>
          <h2 className="font-display text-4xl font-bold text-primary">
            {isPerfect ? "Parfait !" : pct >= 70 ? "Bravo !" : "Courage !"}
          </h2>
          <p className="text-gray-500 mt-1">{score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {words.length}</p>
        </div>

        {/* Score visuel */}
        <div className={`w-full py-5 rounded-2xl font-display text-5xl font-bold text-white shadow-lg ${
          isPerfect ? "bg-gradient-to-r from-amber-400 to-yellow-500"
          : pct >= 70 ? "bg-gradient-to-r from-emerald-400 to-green-500"
          : "bg-gradient-to-r from-primary to-violet-600"
        }`}>
          {pct}%
        </div>

        {wrongWords.length > 0 && (
          <div className="w-full bg-red-50 rounded-2xl p-4 border-2 border-red-100 text-left">
            <p className="font-bold text-red-500 mb-3 text-sm uppercase tracking-wide">📚 À revoir</p>
            <div className="flex flex-wrap gap-2">
              {wrongWords.map((w) => (
                <span key={w.id} className="bg-white px-3 py-1.5 rounded-full text-sm font-bold text-gray-700 border border-gray-200 shadow-sm">
                  {w.emoji} {w.word} — {w.translation}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {wrongWords.length > 0 && (
            <button
              onClick={() => restart(true)}
              className="btn-answer w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-200"
            >
              🔁 Rejouer les erreurs ({wrongWords.length})
            </button>
          )}
          <button
            onClick={() => restart(false)}
            className="btn-answer w-full py-4 bg-gradient-to-r from-primary to-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30"
          >
            🔄 Nouvelle session
          </button>
          <button
            onClick={() => router.push("/")}
            className="btn-answer w-full py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-lg hover:border-primary/30"
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading ────────────────────────────────────────────────── */
  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-semibold">Chargement…</p>
      </div>
    );
  }

  /* ── Question ───────────────────────────────────────────────── */
  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">

      {/* Barre de progression */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <ProgressBar current={currentIndex} total={words.length} />
        </div>
        <ScoreDisplay score={score} total={currentIndex} />
      </div>

      {/* Carte mot */}
      <div className="relative bg-white rounded-3xl shadow-lg border-2 border-primary/10 overflow-hidden p-6 flex flex-col items-center gap-3">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-violet-400 to-secondary" />
        <div className="flex items-center gap-3">
          <LevelBadge level={currentWord.level} size="sm" />
          <span className="text-xs text-gray-400 italic">{currentWord.category}</span>
        </div>
        {currentWord.emoji && (
          <span className="text-7xl animate-float">{currentWord.emoji}</span>
        )}
        <h2 className="font-display text-5xl font-bold text-gray-800">{currentWord.word}</h2>
        <div className="flex items-center gap-3">
          <AudioButton word={currentWord.word} size="md" />
          {currentWord.phonetic && (
            <p className="text-gray-400 text-sm font-mono">{currentWord.phonetic}</p>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-400">Quelle est la traduction ?</p>
      </div>

      {/* Choix Kahoot */}
      {loadingChoices ? (
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice, i) => {
            const style = CHOICE_STYLES[i];
            const isSelected = selected === choice.word;
            const showCorrect = !!selected && choice.isCorrect;
            const showWrong = isSelected && !choice.isCorrect;
            const dimmed = !!selected && !isSelected && !choice.isCorrect;
            return (
              <button
                key={choice.word}
                onClick={() => handleChoice(choice)}
                disabled={!!selected}
                className={`
                  btn-answer flex flex-col items-center gap-2
                  py-6 px-3 rounded-2xl font-bold text-white
                  shadow-md transition-all duration-200 disabled:cursor-default
                  ${showCorrect
                    ? "bg-success shadow-green-300 ring-4 ring-white ring-offset-1 animate-bounce-in"
                    : showWrong
                    ? "bg-secondary shadow-red-300 animate-shake"
                    : dimmed
                    ? `${style.base} opacity-35 grayscale`
                    : style.base
                  }
                `}
              >
                <span className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center font-display text-lg font-bold shrink-0">
                  {style.letter}
                </span>
                <span className="text-sm leading-snug text-center">{choice.translation}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`
            text-center text-base font-bold py-3 px-4 rounded-2xl animate-slide-up
            ${feedback === "correct"
              ? "bg-success/15 text-green-700 border-2 border-success/30"
              : "bg-red-50 text-red-600 border-2 border-red-200"
            }
          `}
        >
          {feedback === "correct"
            ? "✅ Excellent ! C'est la bonne réponse !"
            : `❌ La bonne réponse était : ${currentWord.translation}`}
        </div>
      )}

      {waitingNext && (
        <button
          onClick={handleNext}
          className="btn-answer w-full py-4 bg-gradient-to-r from-primary to-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 animate-slide-up"
        >
          Suivant →
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <>
      <Navigation title="🎯 Quiz" />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        }
      >
        <QuizContent />
      </Suspense>
    </>
  );
}
