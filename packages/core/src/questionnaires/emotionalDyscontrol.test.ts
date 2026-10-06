import { describe, it, expect } from "vitest";
import { emotionalDyscontrolItems, scoreEmotionalDyscontrol } from "./emotionalDyscontrol";

describe("scoreEmotionalDyscontrol", () => {
  it("rejects wrong-length input", () => {
    expect(() => scoreEmotionalDyscontrol([1, 2, 3])).toThrow(RangeError);
  });

  it("rejects out-of-range responses", () => {
    const bad = new Array(emotionalDyscontrolItems.length).fill(0);
    bad[0] = 5;
    expect(() => scoreEmotionalDyscontrol(bad)).toThrow(RangeError);
  });

  it("is negative when nothing meets threshold", () => {
    const r = scoreEmotionalDyscontrol([0, 0, 0, 0]);
    expect(r.metCount).toBe(0);
    expect(r.screenPositive).toBe(false);
    expect(r.total).toBe(0);
  });

  it("is positive at 3 of 4 items meeting the Often+ threshold", () => {
    const r = scoreEmotionalDyscontrol([3, 3, 3, 0]);
    expect(r.metCount).toBe(3);
    expect(r.screenPositive).toBe(true);
  });

  it("is negative at 2 of 4 items meeting threshold", () => {
    const r = scoreEmotionalDyscontrol([3, 3, 0, 0]);
    expect(r.metCount).toBe(2);
    expect(r.screenPositive).toBe(false);
  });

  it("sums raw total independent of the threshold call", () => {
    const r = scoreEmotionalDyscontrol([4, 4, 4, 4]);
    expect(r.total).toBe(16);
    expect(r.screenPositive).toBe(true);
  });
});
