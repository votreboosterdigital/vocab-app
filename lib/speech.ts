export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakWord(word: string, lang: "en-US" | "fr-FR" = "en-US"): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  // Sélectionne la meilleure voix locale disponible pour la langue
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.lang === lang && v.localService);
  const fallback = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
  if (preferred) utterance.voice = preferred;
  else if (fallback) utterance.voice = fallback;
  window.speechSynthesis.speak(utterance);
}
