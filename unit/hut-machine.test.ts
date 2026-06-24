import { describe, it, expect } from "vitest";
import {
  initHutState,
  hutReducer,
  hutResult,
  type EngineQuestion,
  type HutState,
} from "@/lib/engine/hut-machine";

function q(id: string, ...distractorIds: string[]): EngineQuestion {
  return {
    id,
    prompt: id,
    reveal: `This one is ${id}.`,
    correct: { id, label: id, emoji: "x" },
    distractors: distractorIds.map((d) => ({ id: d, label: d, emoji: "y" })),
  };
}

function start(questions: EngineQuestion[], choiceCount = 3): HutState {
  // No rng → deterministic (correct-first) options, ready for stepping.
  return hutReducer(initHutState({ questions, choiceCount, skill: "listen", themeId: "weather" }), {
    type: "prepare",
  });
}

// Resolve the current question by missing `misses` times then tapping correct.
function resolve(state: HutState, misses: number): HutState {
  const correctId = state.prepared[state.index]!.correct.id;
  const wrong = state.options.find((o) => o.id !== correctId)!.id;
  let s = state;
  for (let i = 0; i < misses; i++) s = hutReducer(s, { type: "select", choiceId: wrong });
  s = hutReducer(s, { type: "select", choiceId: correctId });
  return hutReducer(s, { type: "advance" });
}

describe("hut machine", () => {
  it("starts not-ready and becomes ready after prepare", () => {
    const init = initHutState({ questions: [q("a", "b")], choiceCount: 2, skill: "listen", themeId: "weather" });
    expect(init.ready).toBe(false);
    expect(hutReducer(init, { type: "prepare" }).ready).toBe(true);
  });

  it("counts a first-try correct tap as mastery-positive", () => {
    let s = start([q("sunny", "rainy", "cloudy")]);
    s = hutReducer(s, { type: "select", choiceId: "sunny" });
    expect(s.phase).toBe("feedback");
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0]!.firstTryCorrect).toBe(true);
  });

  it("1st miss dims the tapped choice without revealing", () => {
    let s = start([q("sunny", "rainy", "cloudy")]);
    s = hutReducer(s, { type: "select", choiceId: "rainy" });
    expect(s.misses).toBe(1);
    expect(s.phase).toBe("answering");
    expect(s.choiceState["rainy"]).toBe("dimmed");
    expect(s.choiceState["sunny"]).toBeUndefined();
  });

  it("2nd miss reveals the correct answer and narrates", () => {
    let s = start([q("sunny", "rainy", "cloudy")]);
    s = hutReducer(s, { type: "select", choiceId: "rainy" });
    s = hutReducer(s, { type: "select", choiceId: "cloudy" });
    expect(s.phase).toBe("revealed");
    expect(s.choiceState["sunny"]).toBe("revealed");
  });

  it("a post-scaffold correct tap completes the round but does NOT count", () => {
    let s = start([q("sunny", "rainy", "cloudy")]);
    s = hutReducer(s, { type: "select", choiceId: "rainy" });
    s = hutReducer(s, { type: "select", choiceId: "cloudy" });
    // Wrong taps are ignored once revealed; only the correct advances.
    s = hutReducer(s, { type: "select", choiceId: "rainy" });
    expect(s.phase).toBe("revealed");
    s = hutReducer(s, { type: "select", choiceId: "sunny" });
    expect(s.phase).toBe("feedback");
    expect(s.attempts[0]!.firstTryCorrect).toBe(false);
    expect(s.attempts[0]!.hintsUsed).toBe(2);
  });

  it("completes after the last question and reports mastery from first-try only", () => {
    let s = start([q("a", "b", "c"), q("b", "a", "c"), q("c", "a", "b")]);
    s = resolve(s, 0); // a: first try
    s = resolve(s, 0); // b: first try
    // c: miss twice then correct → not first try
    const correctId = s.prepared[s.index]!.correct.id;
    s = hutReducer(s, { type: "select", choiceId: s.options.find((o) => o.id !== correctId)!.id });
    s = hutReducer(s, { type: "select", choiceId: s.options.find((o) => o.id !== correctId)!.id });
    s = hutReducer(s, { type: "select", choiceId: correctId });
    s = hutReducer(s, { type: "advance" });
    expect(s.phase).toBe("complete");
    const r = hutResult(s);
    expect(r.attempts).toHaveLength(3);
    expect(r.accuracy).toBeCloseTo(2 / 3);
    expect(r.mastered).toBe(false); // 0.67 < 0.8
  });

  it("eases to 2 choices after 3 non-first-try questions in a row", () => {
    let s = start([q("a", "b", "c"), q("b", "a", "c"), q("c", "a", "b"), q("a", "b", "c")], 3);
    s = resolve(s, 2); // miss twice each → non-first-try
    s = resolve(s, 2);
    s = resolve(s, 2); // consecutiveMisses now 3
    expect(s.index).toBe(3);
    expect(s.options).toHaveLength(2); // eased
  });
});
