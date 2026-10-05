import { describe, it, expect } from "vitest";
import { mulberry32 } from "./rng";
import { generateCptPlan, summarizeCpt, CPT_NOGO_LETTER } from "./cpt";
import type { CptTrial } from "../types";

describe("generateCptPlan", () => {
  it("produces the requested number of trials with the right no-go ratio", () => {
    const plan = generateCptPlan(mulberry32(1), 80, 0.2);
    expect(plan.length).toBe(80);
    expect(plan.filter((p) => p.nogo).length).toBe(16);
    for (const p of plan) {
      expect(p.nogo).toBe(p.letter === CPT_NOGO_LETTER);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = generateCptPlan(mulberry32(42), 40, 0.2);
    const b = generateCptPlan(mulberry32(42), 40, 0.2);
    expect(a).toEqual(b);
  });
});

describe("summarizeCpt", () => {
  it("rejects a trial set with no go trials", () => {
    expect(() => summarizeCpt([{ nogo: true, rt: null }])).toThrow(RangeError);
  });

  it("scores a perfect performer with zero omissions/commissions", () => {
    const trials: CptTrial[] = [
      { nogo: false, rt: 400 },
      { nogo: false, rt: 420 },
      { nogo: false, rt: 410 },
      { nogo: true, rt: null },
    ];
    const s = summarizeCpt(trials);
    expect(s.nGo).toBe(3);
    expect(s.nNoGo).toBe(1);
    expect(s.omissionPct).toBe(0);
    expect(s.commissionPct).toBe(0);
    expect(s.meanRt).toBeCloseTo(410, 5);
  });

  it("counts a missed go trial as an omission and a responded no-go as a commission", () => {
    const trials: CptTrial[] = [
      { nogo: false, rt: 400 },
      { nogo: false, rt: null }, // omission
      { nogo: true, rt: 350 }, // commission
      { nogo: true, rt: null }, // correct withhold
    ];
    const s = summarizeCpt(trials);
    expect(s.omissionPct).toBeCloseTo(50, 5);
    expect(s.commissionPct).toBeCloseTo(50, 5);
  });
});
