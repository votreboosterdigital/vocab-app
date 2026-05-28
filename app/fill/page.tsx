"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { VocabWord, UserProfile, GenerateFillResponse } from "@/types";
import { getWordsToReview, markWord, addSession } from "@/lib/progress";
import { getDistractors } from "@/lib/words";
import Navigation from "@/components/Navigation";
import ProgressBar from "@/components/ProgressBar";
import ScoreDisplay from "@/components/ScoreDisplay";
import AudioButton from "@/components/AudioButton";
import LevelBadge from "@/components/LevelBadge";

const SESSION_SIZE = 8;

interface FillQuestion {
  word: VocabWord;
  sentence: string;
  translation: string;
  choices: string[];
  answer: string;
}

function FillContent() {
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
  const [question, setQuestion] = useState<FillQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
  }, [profile, level]);

  const currentWord = words[currentIndex];

  const fetchQuestion = useCallback(async (word: VocabWord) => {
    setLoading(true);
    setSelected(null);
    setFeedback(null);
    setQuestion(null);
    try {
      const distractors = getDistractors(word, 2).map((d) => d.word);
      const res = await fetch("/api/generate-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.word, level: word.level, distractors }),
      });
      const data = (await res.json()) as GenerateFillResponse & { answer: string; translation: string };
      setQuestion({
        word,
        sentence: data.sentence,
        translation: data.translation,
        choices: data.choices,
        answer: data.answer,
      });
    } catch {
      const distractors = getDistractors(word, 2).map((d) => d.word);
      setQuestion({
        word,
        sentence: `The _____ is very nice.`,
        translation: "Le _____ est très sympa.",
        choices: [word.word, ...distractors].sort(() => Math.random() - 0.5),
        answer: word.word,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentWord) fetchQuestion(currentWord);
  }, [currentWord, fetchQuestion]);

  function handleChoice(choice: string) {
    if (selected || !question) return;
    setSelected(choice);
    const correct = choice === question.answer;
    setFeedback(correct ? "correct" : "wrong");
    markWord(profile, question.word.id, correct);

    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    const newReviewed = [...reviewedIds, question.word.id];
    setReviewedIds(newReviewed);

    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        addSession(profile, { mode: "fill", score: newScore, wordsReviewed: newReviewed });
        setDone(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1500);
  }

  function restart() {
    setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
    setCurrentIndex(0);
    setScore(0);
    setReviewedIds([]);
    setDone(false);
    setSelected(null);
    setFeedback(null);
    setQuestion(null);
  }

  if (done) {
    const pct = words.length > 0 ? Math.round((score / words.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8 max-w-lg mx-auto text-center">
        <span className="text-7xl animate-bounce-in">{pct === 100 ? "🏆" : pct >= 70 ? "🌟" : "💪"}</span>
        <h2 className="font-display text-4xl font-bold text-primary">
          {pct === 100 ? "Incroyable !" : pct >= 70 ? "Bien joué !" : "Continue !"}
        </h2>
        <ScoreDisplay score={score} total={words.length} />
        <div className="flex gap-3 mt-2">
          <button onClick={restart} className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-lg hover:opacity-90 transition hover:scale-105">
            🔄 Rejouer
          </button>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-primary/30 transition">
            🏠 Accueil
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord || loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-4xl animate-spin">⏳</span>
        <p className="text-gray-500 text-sm">Claude génère une phrase...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <ProgressBar current={currentIndex} total={words.length} />
        </div>
        <ScoreDisplay score={score} total={currentIndex} />
      </div>

      {/* Mot cible */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-accent/40 p-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <LevelBadge level={question.word.level} size="sm" />
          <span className="text-xs text-gray-400">{question.word.category}</span>
        </div>
        <span className="text-6xl">{question.word.emoji}</span>
        <h2 className="font-display text-3xl font-bold text-gray-800 text-center">
          {question.word.translation}
        </h2>
        <div className="flex items-center justify-center">
          <AudioButton word={question.word.word} size="sm" />
        </div>
      </div>

      {/* Phrase à compléter */}
      <div className="bg-primary/5 rounded-2xl p-5 border-2 border-primary/20">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Complète la phrase ✏️</p>
        <p className="text-xl font-bold text-gray-800 leading-relaxed text-center">
          {question.sentence.replace("_____", "______")}
        </p>
        {selected && (
          <p className="text-sm text-gray-500 italic text-center mt-2">
            {question.translation.replace("_____", `"${question.answer}"`)}
          </p>
        )}
      </div>

      {/* Choix */}
      <div className="grid grid-cols-3 gap-3">
        {question.choices.map((choice) => {
          const isSelected = selected === choice;
          const isCorrect = choice === question.answer;
          const showCorrect = selected && isCorrect;
          const showWrong = isSelected && !isCorrect;
          return (
            <button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={!!selected}
              className={`
                py-5 rounded-2xl border-2 font-bold text-base transition-all duration-200
                hover:scale-105 active:scale-100 disabled:cursor-default
                ${showCorrect
                  ? "bg-success border-success text-white animate-bounce-in"
                  : showWrong
                  ? "bg-secondary border-secondary text-white animate-shake"
                  : selected
                  ? "opacity-40 bg-gray-50 border-gray-200 text-gray-400"
                  : "bg-white border-gray-200 text-gray-700 hover:border-primary/40 hover:shadow-md"
                }
              `}
            >
              {choice}
            </button>
          );
        })}
      </div>

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
            ? `✅ "${question.answer}" — ${question.word.translation} !`
            : `❌ La réponse était : ${question.answer}`}
        </div>
      )}
    </div>
  );
}

export default function FillPage() {
  return (
    <>
      <Navigation title="✏️ Complète la phrase" />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <span className="text-4xl">⏳</span>
          </div>
        }
      >
        <FillContent />
      </Suspense>
    </>
  );
}
