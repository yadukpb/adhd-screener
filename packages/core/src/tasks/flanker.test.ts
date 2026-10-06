import { describe, it, expect } from "vitest";
import { mulberry32 } from "./rng";
import { generateFlankerPlan, summarizeFlanker } from "./flanker";
import type { FlankerTrial } from "../types";

describe("generateFlankerPlan", () => {
  it("produces the requested number of trials with the right incongruent ratio", () => {
    const plan = generateFlankerPlan(mulberry32(1), 60, 0.5);
    expect(plan.length).toBe(60);
    expect(plan.filter((p) => !p.congruent).length).toBe(30);
  });
});

describe("summarizeFlanker", () => {
  it("rejects a trial set missing either condition", () => {
    const allCongruent: FlankerTrial[] = [{ congruent: true, correct: true, rt: 400 }];
    expect(() => summarizeFlanker(allCongruent)).toThrow(RangeError);
  });

  it("computes a positive interference effect when incongruent trials are slower", () => {
    const trials: FlankerTrial[] = [
      ...Array.from({ length: 10 }, () => ({ congruent: true, correct: true, rt: 400 })),
      ...Array.from({ length: 10 }, () => ({ congruent: false, correct: true, rt: 450 })),
    ];
    const s = summarizeFlanker(trials);
    expect(s.congruentRt).toBeCloseTo(400, 5);
    expect(s.incongruentRt).toBeCloseTo(450, 5);
    expect(s.interferenceEffect).toBeCloseTo(50, 5);
    expect(s.congruentAccuracy).toBe(100);
    expect(s.incongruentAccuracy).toBe(100);
  });

  it("only averages RT from correct trials, and counts errors/omissions against accuracy", () => {
    const trials: FlankerTrial[] = [
      { congruent: true, correct: true, rt: 400 },
      { congruent: true, correct: false, rt: 380 }, // wrong response -- excluded from RT, counts against accuracy
      { congruent: false, correct: true, rt: 500 },
      { congruent: false, correct: false, rt: null }, // omission
    ];
    const s = summarizeFlanker(trials);
    expect(s.congruentRt).toBeCloseTo(400, 5);
    expect(s.incongruentRt).toBeCloseTo(500, 5);
    expect(s.congruentAccuracy).toBe(50);
    expect(s.incongruentAccuracy).toBe(50);
    expect(s.overallAccuracy).toBe(50);
  });

  it("returns NaN for RT fields when a condition has no correct responses", () => {
    const trials: FlankerTrial[] = [
      { congruent: true, correct: false, rt: null },
      { congruent: false, correct: true, rt: 420 },
    ];
    const s = summarizeFlanker(trials);
    expect(Number.isNaN(s.congruentRt)).toBe(true);
    expect(Number.isNaN(s.interferenceEffect)).toBe(true);
  });
});
