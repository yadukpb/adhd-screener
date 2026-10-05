import { describe, it, expect } from "vitest";
import { mulberry32 } from "./rng";
import { generateNbackPlan, summarizeNback, NBACK_N } from "./nback";
import type { NbackTrial } from "../types";

describe("generateNbackPlan", () => {
  it("never flags the first n trials as targets", () => {
    const plan = generateNbackPlan(mulberry32(7), 50, NBACK_N, 0.3);
    for (let i = 0; i < NBACK_N; i++) expect(plan[i].isTarget).toBe(false);
  });

  it("every flagged target truly matches n positions back", () => {
    const plan = generateNbackPlan(mulberry32(7), 50, NBACK_N, 0.3);
    for (let i = NBACK_N; i < plan.length; i++) {
      if (plan[i].isTarget) expect(plan[i].letter).toBe(plan[i - NBACK_N].letter);
    }
  });

  it("non-targets never accidentally match n-back (no silent false negatives)", () => {
    const plan = generateNbackPlan(mulberry32(7), 50, NBACK_N, 0.3);
    for (let i = NBACK_N; i < plan.length; i++) {
      if (!plan[i].isTarget) expect(plan[i].letter).not.toBe(plan[i - NBACK_N].letter);
    }
  });

  it("produces roughly the requested target ratio among eligible trials", () => {
    const plan = generateNbackPlan(mulberry32(7), 2000, NBACK_N, 0.3);
    const eligible = plan.slice(NBACK_N);
    const targetRate = eligible.filter((p) => p.isTarget).length / eligible.length;
    expect(targetRate).toBeGreaterThan(0.25);
    expect(targetRate).toBeLessThan(0.35);
  });
});

describe("summarizeNback", () => {
  it("tallies hits/misses/falseAlarms/correctRejections correctly", () => {
    const trials: NbackTrial[] = [
      { target: true, responded: true }, // hit
      { target: true, responded: false }, // miss
      { target: false, responded: true }, // false alarm
      { target: false, responded: false }, // correct rejection
    ];
    const s = summarizeNback(trials);
    expect(s.hits).toBe(1);
    expect(s.misses).toBe(1);
    expect(s.falseAlarms).toBe(1);
    expect(s.correctRejections).toBe(1);
    expect(Number.isFinite(s.dPrime)).toBe(true);
  });

  it("gives a high d' to a perfect performer", () => {
    const trials: NbackTrial[] = [
      ...Array.from({ length: 10 }, () => ({ target: true, responded: true })),
      ...Array.from({ length: 20 }, () => ({ target: false, responded: false })),
    ];
    const s = summarizeNback(trials);
    expect(s.dPrime).toBeGreaterThan(2);
  });
});
