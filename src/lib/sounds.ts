// Game sound effects via the Web Audio API. Client-only; no-ops on the server
// and when audio is unavailable.
//
// Why Web Audio and not <audio> tags (CLAUDE.md "native feel"): scheduled
// oscillator notes fire with sub-millisecond latency, so the chime lands with
// the tap. Tones are SYNTHESIZED here — no asset files to load or decode, which
// also keeps the app offline-ready and dependency-free.
//
// iOS Safari starts an AudioContext suspended; it must be created/resumed inside
// a user gesture. We unlock on the first pointerdown/touch.

type AudioCtxCtor = new () => AudioContext;

function getCtor(): AudioCtxCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioCtxCtor;
    webkitAudioContext?: AudioCtxCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

let ctx: AudioContext | null = null;

// Create/resume the context inside a user gesture (iOS requirement).
export function unlockAudio(): void {
  const Ctor = getCtor();
  if (!Ctor) return;
  if (!ctx) {
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

if (typeof document !== "undefined") {
  const handler = () => unlockAudio();
  document.addEventListener("pointerdown", handler, { once: true, capture: true });
  document.addEventListener("touchstart", handler, { once: true, capture: true });
}

// One enveloped sine note. `start` is an offset in seconds from "now".
function tone(freq: number, start: number, dur: number, peak = 0.18): void {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Correct answer — bright two-note rise.
export function playCorrect(): void {
  if (!ctx) return;
  tone(660, 0, 0.12);
  tone(880, 0.09, 0.18);
}

// Gentle "try again" on a 2nd miss — soft, low, non-punishing. No harsh buzzer.
export function playTryAgain(): void {
  if (!ctx) return;
  tone(392, 0, 0.16, 0.12);
  tone(330, 0.12, 0.22, 0.12);
}

// Milestone celebration — a little rising arpeggio.
export function playReward(): void {
  if (!ctx) return;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.28));
}

export function isSoundAvailable(): boolean {
  return getCtor() !== null;
}
