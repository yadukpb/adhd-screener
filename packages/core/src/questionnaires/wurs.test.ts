import { describe, it, expect } from "vitest";
import { wursItems, scoreWurs, WURS_CUTOFF } from "./wurs";

describe("scoreWurs", () => {
  it("rejects wrong-length input", () => {
    expect(() => scoreWurs([1, 2, 3])).toThrow(RangeError);
  });

  it("rejects out-of-range responses", () => {
    const bad = new Array(wursItems.length).fill(0);
    bad[0] = -1;
    expect(() => scoreWurs(bad)).toThrow(RangeError);
  });

  it("sums to zero and screens negative when all items are 0", () => {
    const r = scoreWurs(new Array(wursItems.length).fill(0));
    expect(r.total).toBe(0);
    expect(r.screenPositive).toBe(false);
  });

  it("screens negative just below the cutoff", () => {
    // 25 items; want a sum of cutoff - 1
    const responses = new Array(wursItems.length).fill(1); // sum 25
    const extra = WURS_CUTOFF - 1 - 25;
    for (let i = 0; i < extra; i++) responses[i] += 1;
    const r = scoreWurs(responses);
    expect(r.total).toBe(WURS_CUTOFF - 1);
    expect(r.screenPositive).toBe(false);
  });

  it("screens positive exactly at the cutoff", () => {
    const responses = new Array(wursItems.length).fill(1);
    const extra = WURS_CUTOFF - 25;
    for (let i = 0; i < extra; i++) responses[i] += 1;
    const r = scoreWurs(responses);
    expect(r.total).toBe(WURS_CUTOFF);
    expect(r.screenPositive).toBe(true);
  });

  it("maxes out at 100", () => {
    const r = scoreWurs(new Array(wursItems.length).fill(4));
    expect(r.total).toBe(100);
    expect(r.screenPositive).toBe(true);
  });
});
