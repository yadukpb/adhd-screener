import { describe, it, expect } from "vitest";
import { mulberry32 } from "./rng";
import { generateStopPlan, summarizeStop, SsdStaircase, STOP_INITIAL_SSD_MS, STOP_STEP_MS, STOP_MIN_SSD_MS, STOP_MAX_SSD_MS } from "./stopSignal";
import type { StopTrial } from "../types";

describe("generateStopPlan", () => {
  it("produces the requested number of trials with the right stop ratio", () => {
    const plan = generateStopPlan(mulberry32(1), 64, 0.25);
    expect(plan.length).toBe(64);
    expect(plan.filter((p) => p.stop).length).toBe(16);
  });
});

describe("SsdStaircase", () => {
  it("raises SSD after a successful stop and lowers it after a failed stop", () => {
    const s = new SsdStaircase();
    expect(s.current()).toBe(STOP_INITIAL_SSD_MS);
    expect(s.next(true)).toBe(STOP_INITIAL_SSD_MS + STOP_STEP_MS);
    expect(s.next(false)).toBe(STOP_INITIAL_SSD_MS);
  });

  it("clamps to the configured bounds", () => {
    const s = new SsdStaircase(STOP_MAX_SSD_MS);
    expect(s.next(true)).toBe(STOP_MAX_SSD_MS);
    const low = new SsdStaircase(STOP_MIN_SSD_MS);
    expect(low.next(false)).toBe(STOP_MIN_SSD_MS);
  });
});

describe("summarizeStop", () => {
  it("rejects a trial set with no go trials", () => {
    expect(() => summarizeStop([{ stop: true, ssd: 200, rt: null }], 1000)).toThrow(RangeError);
  });

  it("marks the estimate invalid when stopping probability is out of the 25-75% band", () => {
    const trials: StopTrial[] = [
      { stop: false, ssd: null, rt: 400 },
      { stop: false, ssd: null, rt: 410 },
      ...Array.from({ length: 16 }, () => ({ stop: true, ssd: 200, rt: null })), // always stops successfully
    ];
    const s = summarizeStop(trials, 1000);
    expect(s.pRespondGivenStop).toBe(0);
    expect(s.valid).toBe(false);
  });

  it("marks the estimate valid when stopping probability is near 50%", () => {
    const goTrials: StopTrial[] = Array.from({ length: 10 }, () => ({ stop: false, ssd: null, rt: 400 }));
    const stopTrials: StopTrial[] = [
      ...Array.from({ length: 8 }, () => ({ stop: true, ssd: 200, rt: null as number | null })),
      ...Array.from({ length: 8 }, () => ({ stop: true, ssd: 200, rt: 450 as number | null })),
    ];
    const s = summarizeStop([...goTrials, ...stopTrials], 1000);
    expect(s.pRespondGivenStop).toBeCloseTo(0.5, 5);
    expect(s.valid).toBe(true);
    expect(Number.isFinite(s.ssrt)).toBe(true);
  });
});
