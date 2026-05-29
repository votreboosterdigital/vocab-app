"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { VocabWord, UserProfile, GenerateFillResponse, WordLevel } from "@/types";
import { getWordsToReview, markWord, addSession } from "@/lib/progress";
import { getDistractors, VALID_LEVELS } from "@/lib/words";
import Navigation from "@/components/Navigation";
import ProgressBar from "@/components/ProgressBar";
import ScoreDisplay from "@/components/ScoreDisplay";
import AudioButton from "@/components/AudioButton";
import LevelBadge from "@/components/LevelBadge";
import Confetti from "@/components/Confetti";

const SESSION_SIZE = 8;

/* Couleurs pour les 3 boutons de complétion */
const FILL_STYLES = [
  { base: "bg-[#E21B3C]", letter: "A" },
  { base: "bg-[#1368CE]", letter: "B" },
  { base: "bg-[#26890C]", letter: "C" },
] as const;

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
  const level = (VALID_LEVELS.includes(levelParam as WordLevel) ? (levelParam as WordLevel) : "all") as WordLevel | "all";

  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<FillQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);

  useEffect(() => {
    setWords(getWordsToReview(profile, level).slice(0, SESSION_SIZE));
  }, [profile, level]);

  const currentWord = words[currentIndex];

  const fetchQuestion = useCallback(async (word: VocabWord) => {
    setLoading(true);
    setSelected(null);
    setFeedback(null);
    setWaitingNext(false);
    setQuestion(null);
    try {
      const distractors = getDistractors(word, 2).map((d) => d.word);
      const res = await fetch("/api/generate-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.word, level: word.level, distractors }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as GenerateFillResponse & { answer: string; translation: string };
      setQuestion({ word, sentence: data.sentence, translation: data.translation, choices: data.choices, answer: data.answer });
    } catch (err) {
      console.error("[fill] fetchQuestion error:", err);
      const distractors = getDistractors(word, 2).map((d) => d.word);
      const templates: Array<[string, string]> = [
        [`The _____ is here.`,          `Le _____ est ici.`],
        [`I really like the _____.`,    `J'aime beaucoup le _____.`],
        [`She has a _____.`,            `Elle a un _____.`],
        [`We can see the _____.`,       `On peut voir le _____.`],
        [`The _____ is beautiful.`,     `Le _____ est beau.`],
        [`My _____ is great.`,          `Mon _____ est super.`],
        [`Look at the _____.`,          `Regarde le _____.`],
        [`The _____ is very useful.`,   `Le _____ est très utile.`],
        [`I have a _____.`,             `J'ai un _____.`],
        [`The _____ is very nice.`,     `Le _____ est très sympa.`],
        [`They found a _____.`,         `Ils ont trouvé un _____.`],
        [`The _____ is quite small.`,   `Le _____ est assez petit.`],
      ];
      /* Même mot → même template (déterministe via dernier char de l'id) */
      const idx = word.id.charCodeAt(word.id.length - 1) % templates.length;
      const [sentence, translation] = templates[idx];
      setQuestion({
        word,
        sentence,
        translation,
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

    if (correct) {
      setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          addSession(profile, { mode: "fill", score: newScore, wordsReviewed: newReviewed });
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
      addSession(profile, { mode: "fill", score, wordsReviewed: reviewedIds });
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
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

  /* ── Écran résultat ──────────────────────────────────────────── */
  if (done) {
    const pct = words.length > 0 ? Math.round((score / words.length) * 100) : 0;
    const isPerfect = pct === 100;
    return (
      <div className="flex flex-col items-center gap-5 px-4 py-8 max-w-lg mx-auto text-center">
        {isPerfect && <Confetti />}

        <span className="text-8xl animate-bounce-in block">
          {isPerfect ? "🏆" : pct >= 70 ? "🌟" : "💪"}
        </span>

        <div>
          <h2 className="font-display text-4xl font-bold text-primary">
            {isPerfect ? "Incroyable !" : pct >= 70 ? "Bien joué !" : "Continue !"}
          </h2>
          <p className="text-gray-500 mt-1">{score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {words.length}</p>
        </div>

        <div className={`w-full py-5 rounded-2xl font-display text-5xl font-bold text-white shadow-lg ${
          isPerfect ? "bg-gradient-to-r from-amber-400 to-yellow-500"
          : pct >= 70 ? "bg-gradient-to-r from-emerald-400 to-green-500"
          : "bg-gradient-to-r from-primary to-violet-600"
        }`}>
          {pct}%
        </div>

        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={restart}
            className="btn-answer w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-200"
          >
            🔄 Rejouer
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
  if (!currentWord || loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-semibold">Claude génère une phrase…</p>
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

      {/* Mot cible */}
      <div className="relative bg-white rounded-3xl shadow-lg border-2 border-amber-200 overflow-hidden p-5 flex flex-col items-center gap-3">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
        <div className="flex items-center gap-2">
          <LevelBadge level={question.word.level} size="sm" />
          <span className="text-xs text-gray-400">{question.word.category}</span>
        </div>
        {question.word.emoji && (
          <span className="text-6xl animate-float">{question.word.emoji}</span>
        )}
        <h2 className="font-display text-3xl font-bold text-gray-800 text-center">
          {question.word.translation}
        </h2>
        <div className="flex items-center justify-center">
          <AudioButton word={question.word.word} size="sm" />
        </div>
      </div>

      {/* Phrase à compléter */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">✏️ Complète la phrase</p>
        <p className="text-xl font-bold text-gray-800 leading-relaxed text-center">
          {question.sentence.replace("_____", "______")}
        </p>
        {selected && (
          <p className="text-sm text-gray-500 italic text-center mt-2 animate-slide-up">
            {question.translation.replace("_____", question.word.translation)}
          </p>
        )}
      </div>

      {/* Choix */}
      <div className="grid grid-cols-3 gap-3">
        {question.choices.map((choice, i) => {
          const style = FILL_STYLES[i] ?? FILL_STYLES[0];
          const isSelected = selected === choice;
          const isCorrect = choice === question.answer;
          const showCorrect = !!selected && isCorrect;
          const showWrong = isSelected && !isCorrect;
          const dimmed = !!selected && !isSelected && !isCorrect;
          return (
            <button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={!!selected}
              className={`
                btn-answer flex flex-col items-center gap-2
                py-6 px-2 rounded-2xl font-bold text-white
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
              <span className="w-7 h-7 rounded-md bg-white/25 flex items-center justify-center font-display text-sm font-bold">
                {style.letter}
              </span>
              <span className="text-sm leading-snug text-center break-words w-full px-1">{choice}</span>
            </button>
          );
        })}
      </div>

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
            ? `✅ "${question.answer}" — ${question.word.translation} !`
            : `❌ La réponse était : ${question.answer}`}
        </div>
      )}

      {waitingNext && (
        <button
          onClick={handleNext}
          className="btn-answer w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-200 animate-slide-up"
        >
          Suivant →
        </button>
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
          </div>
        }
      >
        <FillContent />
      </Suspense>
    </>
  );
}
