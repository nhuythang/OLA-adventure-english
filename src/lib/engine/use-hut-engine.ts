"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  hutReducer,
  initHutState,
  hutResult,
  type EngineQuestion,
  type HutResult,
} from "@/lib/engine/hut-machine";
import { speak } from "@/lib/speech";
import { unlockAudio, playCorrect, playTryAgain } from "@/lib/sounds";
import type { Skill } from "@/lib/types";

interface Args {
  questions: EngineQuestion[];
  choiceCount: number;
  skill: Skill;
  themeId: string;
  onComplete?: (result: HutResult) => void;
}

// Delay after a correct tap so the green flash + chime register before advancing.
const ADVANCE_MS = 950;

export function useHutEngine({ questions, choiceCount, skill, themeId, onComplete }: Args) {
  const [state, dispatch] = useReducer(hutReducer, { questions, choiceCount, skill, themeId }, initHutState);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  const lastMisses = useRef(0);

  // Shuffle on the client after mount — never during SSR (hydration safety).
  useEffect(() => {
    dispatch({ type: "prepare", rng: Math.random });
  }, []);

  const current = state.prepared[state.index];
  const prompt = current?.prompt ?? "";

  // Auto-play the prompt when a new question is shown (behavior rule 2).
  useEffect(() => {
    lastMisses.current = 0;
    if (state.ready && state.phase === "answering" && current) {
      speak(current.prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ready, state.index]);

  // React to misses: replay on the 1st, narrate the reveal on the 2nd.
  useEffect(() => {
    if (state.misses === lastMisses.current) return;
    lastMisses.current = state.misses;
    if (!current) return;
    if (state.misses === 1) {
      speak(current.prompt);
    } else if (state.misses >= 2) {
      playTryAgain();
      speak(current.reveal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.misses]);

  // Chime + advance after a correct tap; fire onComplete at the end.
  useEffect(() => {
    if (state.phase === "feedback") {
      playCorrect();
      const t = setTimeout(() => dispatch({ type: "advance" }), ADVANCE_MS);
      return () => clearTimeout(t);
    }
    if (state.phase === "complete") {
      onCompleteRef.current?.(hutResult(state));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.index]);

  return {
    ready: state.ready,
    options: state.options,
    choiceState: state.choiceState,
    correctId: current?.correct.id ?? "",
    index: state.index,
    total: state.prepared.length,
    phase: state.phase,
    prompt,
    result: state.phase === "complete" ? hutResult(state) : null,
    select: (choiceId: string) => {
      unlockAudio();
      dispatch({ type: "select", choiceId });
    },
    replay: () => {
      unlockAudio();
      if (prompt) speak(prompt);
    },
    restart: () => dispatch({ type: "restart", rng: Math.random }),
  };
}
