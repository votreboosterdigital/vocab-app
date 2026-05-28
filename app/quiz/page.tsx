"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { VocabWord, UserProfile, GenerateQuizResponse } from "@/types";
import { getWordsToReview, markWord, addSession } from "@/lib/progress";
import { getDistractors, WORDS } from "@/lib/words";
import Navigation from "@/components/Navigation";
import ProgressBar from "@/components/ProgressBar";
import ScoreDisplay from "@/components/ScoreDisplay";
import AudioButton from "@/components/AudioButton";
import LevelBadge from "@/components/LevelBadge";

const SESSION_SIZE = 10;

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
  const level = (levelParam === "1" ? 1 : levelParam === "2" ? 2 : levelParam === "3" ? 3 : "all") as 1 | 2 | 3 | "all";

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

  useEffect(() => {
    setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
  }, [profile, level]);

  const currentWord = words[currentIndex];

  const buildChoices = useCallback(
    async (word: VocabWord) => {
      setLoadingChoices(true);
      setSelected(null);
      setFeedback(null);
      try {
        const localDistractors = getDistractors(word, 3);
        let distractorWords = localDistractors.map((d) => d.word);

        // Essaie d'enrichir avec Claude
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: word.word,
            allWords: WORDS.map((w) => w.word),
            count: 3,
          }),
        });
        const data = (await res.json()) as GenerateQuizResponse;
        if (data.distractors?.length >= 3) {
          distractorWords = data.distractors.slice(0, 3);
        }

        const distractorChoices: Choice[] = distractorWords.map((w) => {
          const found = WORDS.find((vw) => vw.word === w);
          return { word: w, translation: found?.translation ?? w, isCorrect: false };
        });

        const allChoices: Choice[] = [
          { word: word.word, translation: word.translation, isCorrect: true },
          ...distractorChoices,
        ].sort(() => Math.random() - 0.5);

        setChoices(allChoices);
      } catch {
        const fallback = getDistractors(word, 3);
        setChoices(
          [
            { word: word.word, translation: word.translation, isCorrect: true },
            ...fallback.map((d) => ({ word: d.word, translation: d.translation, isCorrect: false })),
          ].sort(() => Math.random() - 0.5)
        );
      } finally {
        setLoadingChoices(false);
      }
    },
    []
  );

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

    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        addSession(profile, { mode: "quiz", score: newScore, wordsReviewed: newReviewed });
        setDone(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1200);
  }

  function restart(reviewWrong = false) {
    const nextWords = reviewWrong && wrongWords.length > 0 ? wrongWords : getWordsToReview(profile, level).slice(0, SESSION_SIZE);
    setWords(nextWords);
    setCurrentIndex(0);
    setScore(0);
    setReviewedIds([]);
    setWrongWords([]);
    setDone(false);
    setSelected(null);
    setFeedback(null);
  }

  if (done) {
    const pct = words.length > 0 ? Math.round((score / words.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8 max-w-lg mx-auto text-center">
        <span className="text-7xl animate-bounce-in">{pct === 100 ? "🏆" : pct >= 70 ? "🌟" : "💪"}</span>
        <h2 className="font-display text-4xl font-bold text-primary">
          {pct === 100 ? "Parfait !" : pct >= 70 ? "Bravo !" : "Courage !"}
        </h2>
        <ScoreDisplay score={score} total={words.length} />

        {wrongWords.length > 0 && (
          <div className="w-full bg-secondary/10 rounded-2xl p-4 border border-secondary/20">
            <p className="font-semibold text-secondary mb-3">Mots à revoir 📚</p>
            <div className="flex flex-wrap gap-2 justify-center">
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
              className="w-full py-3 bg-secondary text-white rounded-2xl font-bold text-lg hover:opacity-90 transition hover:scale-105"
            >
              🔁 Rejouer les erreurs ({wrongWords.length})
            </button>
          )}
          <button
            onClick={() => restart(false)}
            className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-lg hover:opacity-90 transition hover:scale-105"
          >
            🔄 Nouvelle session
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-primary/30 transition"
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-4xl animate-spin">⏳</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <ProgressBar current={currentIndex} total={words.length} />
        <ScoreDisplay score={score} total={currentIndex} />
      </div>

      {/* Carte mot */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4 border-2 border-primary/10">
        <div className="flex items-center gap-3">
          <LevelBadge level={currentWord.level} size="sm" />
          <span className="text-xs text-gray-400 italic">{currentWord.category}</span>
        </div>
        <span className="text-7xl">{currentWord.emoji}</span>
        <h2 className="font-display text-5xl font-bold text-gray-800">{currentWord.word}</h2>
        <div className="flex items-center gap-3">
          <AudioButton word={currentWord.word} size="md" />
          <p className="text-gray-400 text-sm font-mono">/{currentWord.phonetic}/</p>
        </div>
        <p className="text-gray-500 text-sm">Quelle est la traduction ?</p>
      </div>

      {/* Choix */}
      {loadingChoices ? (
        <div className="flex justify-center py-8">
          <span className="text-3xl animate-spin">⏳</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice) => {
            const isSelected = selected === choice.word;
            const showCorrect = selected && choice.isCorrect;
            const showWrong = isSelected && !choice.isCorrect;
            return (
              <button
                key={choice.word}
                onClick={() => handleChoice(choice)}
                disabled={!!selected}
                className={`
                  py-5 px-3 rounded-2xl border-2 font-bold text-base transition-all duration-200
                  hover:scale-105 active:scale-100 disabled:cursor-default
                  ${showCorrect
                    ? "bg-success border-success text-white animate-bounce-in"
                    : showWrong
                    ? "bg-secondary border-secondary text-white animate-shake"
                    : selected
                    ? "opacity-50 bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white border-gray-200 text-gray-700 hover:border-primary/40 hover:shadow-md"
                  }
                `}
              >
                <span className="block text-lg">{choice.translation}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-center text-lg font-bold py-3 rounded-xl animate-slide-up ${
            feedback === "correct"
              ? "bg-success/10 text-success"
              : "bg-secondary/10 text-secondary"
          }`}
        >
          {feedback === "correct"
            ? "✅ Excellent ! Tu avais raison !"
            : `❌ La bonne réponse était : ${currentWord.translation}`}
        </div>
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
          <div className="flex justify-center items-center min-h-[60vh]">
            <span className="text-4xl">⏳</span>
          </div>
        }
      >
        <QuizContent />
      </Suspense>
    </>
  );
}
