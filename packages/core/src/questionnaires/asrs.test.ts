import { describe, it, expect } from "vitest";
import { asrsItems, scoreAsrs } from "./asrs";

describe("scoreAsrs", () => {
  it("rejects wrong-length input", () => {
    expect(() => scoreAsrs([1, 2, 3])).toThrow(RangeError);
  });

  it("rejects out-of-range responses", () => {
    const bad = new Array(asrsItems.length).fill(0);
    bad[0] = 5;
    expect(() => scoreAsrs(bad)).toThrow(RangeError);
  });

  it("is negative when nothing meets threshold", () => {
    const r = scoreAsrs(new Array(asrsItems.length).fill(0));
    expect(r.metCount).toBe(0);
    expect(r.screenPositive).toBe(false);
    expect(r.total).toBe(0);
  });

  it("is positive at exactly 4 of 6 items meeting threshold", () => {
    // thresholds are [2,2,3,3,3,3]; hit the first four, miss the last two
    const r = scoreAsrs([2, 2, 3, 3, 0, 0]);
    expect(r.metCount).toBe(4);
    expect(r.screenPositive).toBe(true);
  });

  it("is negative at 3 of 6 items meeting threshold", () => {
    const r = scoreAsrs([2, 2, 3, 0, 0, 0]);
    expect(r.metCount).toBe(3);
    expect(r.screenPositive).toBe(false);
  });

  it("sums raw total independent of the threshold call", () => {
    const r = scoreAsrs([4, 4, 4, 4, 4, 4]);
    expect(r.total).toBe(24);
    expect(r.screenPositive).toBe(true);
  });
});
