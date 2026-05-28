"use client";

import { useState } from "react";
import type { VocabWord } from "@/types";
import LevelBadge from "@/components/LevelBadge";
import AudioButton from "@/components/AudioButton";

interface WordCardProps {
  word: VocabWord;
  onKnew: () => void;
  onDidntKnow: () => void;
  exampleSentence?: string;
  exampleTranslation?: string;
  loadingSentence?: boolean;
}

export default function WordCard({
  word,
  onKnew,
  onDidntKnow,
  exampleSentence,
  exampleTranslation,
  loadingSentence,
}: WordCardProps) {
  const [flipped, setFlipped] = useState(false);

  function handleFlip() {
    if (!flipped) setFlipped(true);
  }

  function handleKnew() {
    setFlipped(false);
    onKnew();
  }

  function handleDidntKnow() {
    setFlipped(false);
    onDidntKnow();
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Carte flip 3D */}
      <div
        className="card-flip-container w-full aspect-[3/2] cursor-pointer select-none"
        onClick={handleFlip}
        role="button"
        aria-label={flipped ? "Masquer la traduction" : "Voir la traduction"}
      >
        <div className={`card-flip ${flipped ? "flipped" : ""}`}>
          {/* Face avant — mot anglais */}
          <div className="card-face card-front flex flex-col items-center justify-center gap-3 rounded-2xl bg-white shadow-xl p-8 border-2 border-primary/20">
            <span className="text-6xl">{word.emoji}</span>
            <h2 className="font-display text-5xl font-bold text-gray-800">{word.word}</h2>
            <p className="text-gray-400 text-sm font-mono">/{word.phonetic}/</p>
            <div className="flex items-center gap-3 mt-2">
              <LevelBadge level={word.level} size="sm" />
              <span className="text-xs text-gray-400 italic">{word.category}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Appuie pour voir la traduction</p>
          </div>

          {/* Face arrière — traduction */}
          <div className="card-face card-back flex flex-col items-center justify-center gap-3 rounded-2xl bg-primary shadow-xl p-8">
            <span className="text-6xl">{word.emoji}</span>
            <h2 className="font-display text-4xl font-bold text-white">{word.translation}</h2>
            <p className="text-white/70 text-sm font-mono">/{word.phonetic}/</p>
          </div>
        </div>
      </div>

      {/* Audio */}
      <div className="flex items-center gap-3">
        <AudioButton word={word.word} size="lg" />
        <span className="text-sm text-gray-500">Écouter la prononciation</span>
      </div>

      {/* Phrase exemple */}
      {flipped && (
        <div className="w-full bg-accent/20 rounded-xl p-4 border border-accent/40">
          {loadingSentence ? (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="animate-spin">⏳</span>
              <span className="text-sm">Génération d&apos;un exemple...</span>
            </div>
          ) : exampleSentence ? (
            <>
              <p
                className="text-gray-800 font-semibold text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: exampleSentence.replace(
                    /\*\*(.*?)\*\*/g,
                    `<strong class="text-primary">$1</strong>`
                  ),
                }}
              />
              {exampleTranslation && (
                <p className="text-gray-500 text-xs mt-1 italic">{exampleTranslation}</p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Boutons de réponse */}
      {flipped && (
        <div className="flex gap-4 w-full">
          <button
            onClick={handleDidntKnow}
            className="flex-1 btn-answer bg-secondary/10 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-bold py-4 rounded-2xl transition-all duration-200 text-lg"
          >
            ❌ Pas encore
          </button>
          <button
            onClick={handleKnew}
            className="flex-1 btn-answer bg-success/10 border-2 border-success text-success hover:bg-success hover:text-white font-bold py-4 rounded-2xl transition-all duration-200 text-lg"
          >
            ✅ Je savais !
          </button>
        </div>
      )}
    </div>
  );
}
