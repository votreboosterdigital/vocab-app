export type SoundEvent =
  | "correct"
  | "wrong"
  | "badge"
  | "streak"
  | "perfect"
  | "session-complete";

const PHRASES: Record<SoundEvent, string[]> = {
  correct: ["Brilliant!", "Cheers!", "Smashing!", "Well done!"],
  wrong: [
    "Oh blimey!",
    "Crikey!",
    "Never mind, old chap!",
    "Have another go!",
  ],
  badge: [
    "Congratulations, old chap!",
    "Absolutely splendid!",
    "By Jove, well done!",
  ],
  streak: ["Keep calm and carry on!", "Jolly good streak!"],
  perfect: [
    "Absolutely smashing!",
    "Top of the class!",
    "Full marks, old bean!",
  ],
  "session-complete": [
    "That's all for today, cheerio!",
    "Well played, toodle-pip!",
  ],
};

const MUTE_KEY = "vocabapp_sound_muted";

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(MUTE_KEY) === "true";
}

export function toggleMute(): boolean {
  if (typeof window === "undefined") return true;
  const next = !isMuted();
  localStorage.setItem(MUTE_KEY, String(next));
  return next;
}

export function preloadVoices(): void {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}

export function playSound(event: SoundEvent): void {
  if (typeof window === "undefined") return;
  if (isMuted()) return;
  if (!("speechSynthesis" in window)) return;

  const phrases = PHRASES[event];
  const text = phrases[Math.floor(Math.random() * phrases.length)];

  const voices = window.speechSynthesis.getVoices();
  const britishVoice =
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;

  const utterance = new SpeechSynthesisUtterance(text);
  if (britishVoice) utterance.voice = britishVoice;
  utterance.pitch = 1.1;
  utterance.rate = 0.88;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
