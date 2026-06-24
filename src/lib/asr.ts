// Speech recognition (ASR) wrapper for the Speak hut, Levels 2–3.
//
// ASR is BEST-EFFORT, never a gate (CLAUDE.md "iPad reality check"): it is
// unreliable on iOS Safari and on Vietnamese-accented young voices. The Speak
// hut always offers an "I said it" override and degrades to self-rate when this
// returns null. Nothing is recorded, stored, or transmitted — recognition runs
// on-device and we keep only the transcript string in memory to match against.

interface RecognitionResultAlt {
  transcript: string;
}
interface RecognitionEventLike {
  results: ArrayLike<ArrayLike<RecognitionResultAlt>>;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isAsrAvailable(): boolean {
  return getRecognitionCtor() !== null;
}

// Listen once and resolve with the best transcript, or null on error / silence
// / timeout / unavailability. ALWAYS resolves — the UI never blocks on this.
export function listenOnce(timeoutMs = 6000): Promise<string | null> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return Promise.resolve(null);

  return new Promise((resolve) => {
    let done = false;
    const finish = (value: string | null) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      try {
        rec.abort();
      } catch {
        // ignore — recognizer may already be stopped
      }
      resolve(value);
    };

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (e) => finish(e.results?.[0]?.[0]?.transcript ?? null);
    rec.onerror = () => finish(null);
    rec.onend = () => finish(null);

    const timer = window.setTimeout(() => finish(null), timeoutMs);
    try {
      rec.start();
    } catch {
      finish(null);
    }
  });
}

// ---- Matching (pure, unit-tested) ----

// Normalize for forgiving comparison: lowercase, strip diacritics & punctuation,
// collapse whitespace. Keeps letters/digits/spaces only.
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const del = (prev[j] ?? 0) + 1;
      const ins = (curr[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      curr[j] = Math.min(ins, del, sub);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n] ?? 0;
}

// Similarity in [0,1]; 1 = identical after normalization.
export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

// Deliberately generous for young, accented speakers: accept if the target is
// contained in the spoken phrase ("it's sunny" → "sunny"), if any word clears
// the per-word threshold, or if overall similarity clears `threshold`.
export function looseMatch(spoken: string, target: string, threshold = 0.6): boolean {
  const s = normalize(spoken);
  const t = normalize(target);
  if (!s || !t) return false;
  if (s === t || s.includes(t) || t.includes(s)) return true;

  const spokenWords = s.split(" ");
  const targetWords = t.split(" ");
  for (const tw of targetWords) {
    for (const sw of spokenWords) {
      if (similarity(sw, tw) >= 0.67) return true;
    }
  }
  return similarity(s, t) >= threshold;
}
