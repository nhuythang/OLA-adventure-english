// Browser Text-to-Speech wrapper. Client-only; every function no-ops on the
// server and degrades silently when speech is unavailable.
//
// Chrome on macOS has severe issues with synth.cancel() — calling it (even on
// an empty queue) can permanently break the engine for the session. So we NEVER
// call cancel(); utterances finish naturally. Prompts are 1–6 words, so the
// queue is rarely noticeable. (Carried from the lla project.)

// Child content is English; parent/teacher prompts are Vietnamese.
export type Lang = "en-US" | "vi-VN";

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const synth = getSynth();
  if (!synth) return undefined;
  const voices = synth.getVoices();
  if (voices.length === 0) return undefined;
  const prefix = lang.startsWith("vi") ? "vi" : "en";
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  );
}

// --- User-gesture gate (browsers block speech before a first interaction) ---
let activated = false;

function onFirstGesture(): void {
  if (activated) return;
  activated = true;
  document.removeEventListener("pointerdown", onFirstGesture, true);
  document.removeEventListener("touchstart", onFirstGesture, true);
}

if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", onFirstGesture, true);
  document.addEventListener("touchstart", onFirstGesture, true);
}

// --- Public API ---

export interface SpeakOptions {
  /** Default 0.85 — a touch slower than natural so young learners catch words. */
  rate?: number;
  /** Fires on natural end OR error, so callers that advance after speech never hang. */
  onEnd?: () => void;
}

export function speak(
  text: string,
  lang: Lang = "en-US",
  opts?: SpeakOptions,
): void {
  const synth = getSynth();
  if (!synth || !text || !activated) {
    // Speech unavailable / not yet gesture-activated: still honor onEnd so a
    // caller waiting to advance doesn't stall.
    opts?.onEnd?.();
    return;
  }

  // resume() is a no-op when not paused, but can unstick a frozen Chrome engine.
  synth.resume();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voice = pickVoice(lang);
  if (voice) u.voice = voice;
  u.rate = opts?.rate ?? 0.85;
  u.pitch = 1.05;
  u.volume = 1;
  if (opts?.onEnd) {
    u.onend = () => opts.onEnd?.();
    u.onerror = () => opts.onEnd?.();
  }
  synth.speak(u);
}

export function isSpeechAvailable(): boolean {
  return getSynth() !== null;
}
