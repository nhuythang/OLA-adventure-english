// Pure round state machine — the heart of the engine (CLAUDE.md rules 1–9).
// Kept free of React and browser APIs so it can be unit-tested directly; the
// useHutEngine hook wraps it with audio/timer side effects.
//
// Flow per question: one target, options shuffled once (stable across retries),
// correct answer in a random slot. 1st miss dims the tapped choice (scaffold,
// no reveal); 2nd miss reveals + flags narration; only a first-try-correct tap
// counts toward mastery. After 3 non-first-try questions in a row, difficulty
// eases (fewer choices) for subsequent questions.

import type { Attempt, ChoiceState, Skill } from "@/lib/types";
import { buildChoices, type Rng } from "./choices";
import { firstTryAccuracy, meetsMastery } from "./scoring";

export interface Choice {
  id: string;
  label: string;
  emoji: string;
}

export interface EngineQuestion {
  id: string;
  /** Spoken prompt (auto-played on mount, replayed on the 1st miss). */
  prompt: string;
  /** Spoken on the 2nd-miss reveal, e.g. "This one is sunny." */
  reveal: string;
  correct: Choice;
  distractors: Choice[];
}

interface Prepared extends EngineQuestion {
  full: Choice[];
  eased: Choice[];
}

export type HutPhase = "answering" | "feedback" | "revealed" | "complete";

export interface HutState {
  prepared: Prepared[];
  choiceCount: number;
  skill: Skill;
  themeId: string;
  /** False until options are shuffled on the client (avoids SSR mismatch). */
  ready: boolean;
  index: number;
  options: Choice[];
  choiceState: Record<string, ChoiceState>;
  misses: number;
  consecutiveMisses: number;
  phase: HutPhase;
  attempts: Attempt[];
}

export type HutAction =
  | { type: "prepare"; rng?: Rng }
  | { type: "select"; choiceId: string }
  | { type: "advance" }
  | { type: "restart"; rng?: Rng };

export interface InitArgs {
  questions: EngineQuestion[];
  choiceCount: number;
  skill: Skill;
  themeId: string;
}

// Deterministic ordering for the initial (server) render: correct first.
function deterministic(q: EngineQuestion, count: number): Choice[] {
  return [q.correct, ...q.distractors].slice(0, Math.max(1, count));
}

export function initHutState(args: InitArgs): HutState {
  const { questions, choiceCount, skill, themeId } = args;
  const prepared: Prepared[] = questions.map((q) => ({
    ...q,
    full: deterministic(q, choiceCount),
    eased: deterministic(q, 2),
  }));
  return {
    prepared,
    choiceCount,
    skill,
    themeId,
    ready: false,
    index: 0,
    options: prepared[0]?.full ?? [],
    choiceState: {},
    misses: 0,
    consecutiveMisses: 0,
    phase: "answering",
    attempts: [],
  };
}

// Re-derive options with a real RNG (client-only) — correct answer to a random
// slot, distractors varied. Stable thereafter (we don't reshuffle on retries).
function shuffleAll(state: HutState, rng: Rng): Prepared[] {
  return state.prepared.map((q) => ({
    ...q,
    full: buildChoices(q.correct, q.distractors, state.choiceCount, rng),
    eased: buildChoices(q.correct, q.distractors, 2, rng),
  }));
}

export function hutReducer(state: HutState, action: HutAction): HutState {
  switch (action.type) {
    case "prepare": {
      const prepared = action.rng ? shuffleAll(state, action.rng) : state.prepared;
      return {
        ...state,
        prepared,
        ready: true,
        options: prepared[state.index]?.full ?? state.options,
      };
    }

    case "restart": {
      const base = initHutState({
        questions: state.prepared,
        choiceCount: state.choiceCount,
        skill: state.skill,
        themeId: state.themeId,
      });
      const prepared = action.rng ? shuffleAll(base, action.rng) : base.prepared;
      return { ...base, ready: true, prepared, options: prepared[0]?.full ?? [] };
    }

    case "select": {
      if (state.phase === "complete" || state.phase === "feedback") return state;
      const q = state.prepared[state.index];
      if (!q) return state;
      const correctId = q.correct.id;

      if (action.choiceId === correctId) {
        const firstTry = state.misses === 0;
        const attempt: Attempt = {
          skill: state.skill,
          themeId: state.themeId,
          firstTryCorrect: firstTry,
          hintsUsed: Math.min(state.misses, 2),
        };
        return {
          ...state,
          choiceState: { ...state.choiceState, [correctId]: "correct" },
          phase: "feedback",
          attempts: [...state.attempts, attempt],
          consecutiveMisses: firstTry ? 0 : state.consecutiveMisses + 1,
        };
      }

      // Wrong tap. After the reveal, only the correct choice is tappable.
      if (state.phase === "revealed") return state;
      const misses = state.misses + 1;
      if (misses === 1) {
        return {
          ...state,
          misses,
          choiceState: { ...state.choiceState, [action.choiceId]: "dimmed" },
        };
      }
      return {
        ...state,
        misses,
        phase: "revealed",
        choiceState: {
          ...state.choiceState,
          [action.choiceId]: "dimmed",
          [correctId]: "revealed",
        },
      };
    }

    case "advance": {
      if (state.phase !== "feedback") return state;
      const next = state.index + 1;
      const q = state.prepared[next];
      if (!q) return { ...state, phase: "complete" };
      const eased = state.consecutiveMisses >= 3;
      return {
        ...state,
        index: next,
        options: eased ? q.eased : q.full,
        choiceState: {},
        misses: 0,
        phase: "answering",
      };
    }

    default:
      return state;
  }
}

export interface HutResult {
  attempts: Attempt[];
  accuracy: number;
  mastered: boolean;
}

export function hutResult(state: HutState): HutResult {
  return {
    attempts: state.attempts,
    accuracy: firstTryAccuracy(state.attempts),
    mastered: meetsMastery(state.attempts),
  };
}
