import { describe, it, expect } from "vitest";
import { speak, isSpeechAvailable } from "@/lib/speech";
import {
  unlockAudio,
  playCorrect,
  playTryAgain,
  playReward,
  isSoundAvailable,
} from "@/lib/sounds";

// These run in the node (server-like) environment, so the browser audio APIs
// are absent. The contract is: every entry point degrades silently — no throws.
describe("speech SSR/unavailable guards", () => {
  it("reports unavailable and never throws", () => {
    expect(isSpeechAvailable()).toBe(false);
    expect(() => speak("hello")).not.toThrow();
  });

  it("still fires onEnd when speech is unavailable, so callers don't hang", () => {
    let ended = false;
    speak("hello", "en-US", { onEnd: () => (ended = true) });
    expect(ended).toBe(true);
  });
});

describe("sounds SSR/unavailable guards", () => {
  it("reports unavailable and never throws", () => {
    expect(isSoundAvailable()).toBe(false);
    expect(() => {
      unlockAudio();
      playCorrect();
      playTryAgain();
      playReward();
    }).not.toThrow();
  });
});
