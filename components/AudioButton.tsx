"use client";

import { useState } from "react";
import { speakWord, isSpeechSupported } from "@/lib/speech";

interface AudioButtonProps {
  word: string;
  lang?: "en-US" | "fr-FR";
  size?: "sm" | "md" | "lg";
}

export default function AudioButton({ word, lang = "en-US", size = "md" }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const sizeClasses = {
    sm: "h-9 w-9 text-base",
    md: "h-12 w-12 text-xl",
    lg: "h-16 w-16 text-3xl",
  }[size];

  if (!isSpeechSupported()) return null;

  function handleClick() {
    if (speaking) return;
    setSpeaking(true);
    speakWord(word, lang);
    // Réinitialise l'état après la durée estimée (100ms/lettre min 600ms)
    const duration = Math.max(600, word.length * 100);
    setTimeout(() => setSpeaking(false), duration);
  }

  return (
    <button
      onClick={handleClick}
      disabled={speaking}
      aria-label={`Écouter la prononciation de ${word}`}
      className={`
        inline-flex items-center justify-center rounded-full
        bg-primary text-white shadow-md
        transition-all duration-200 ease-out
        hover:scale-110 hover:shadow-lg
        active:scale-95
        disabled:opacity-70
        ${sizeClasses}
        ${speaking ? "animate-pulse" : ""}
      `}
    >
      {speaking ? "🔊" : "🔊"}
    </button>
  );
}
