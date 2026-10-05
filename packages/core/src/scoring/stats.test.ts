import { describe, expect, it } from "vitest";
import { dPrime, exGaussian, mean, normInv, sd, ssrtIntegration } from "./stats";

describe("stats", () => {
  it("mean/sd", () => {
    expect(mean([1, 2, 3])).toBe(2);
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
  it("normInv known values", () => {
    expect(normInv(0.5)).toBeCloseTo(0, 6);
    expect(normInv(0.975)).toBeCloseTo(1.959964, 4);
    expect(normInv(0.01)).toBeCloseTo(-2.326348, 4);
  });
  it("dPrime is 0 for chance and positive for skill", () => {
    expect(dPrime(50, 100, 50, 100)).toBeCloseTo(0, 6);
    expect(dPrime(90, 100, 10, 100)).toBeGreaterThan(2);
  });
  it("exGaussian recovers tau of a shifted exponential", () => {
    const n = 2000;
    const xs = Array.from({ length: n }, (_, i) => 300 - 200 * Math.log(1 - (i + 0.5) / n));
    const { tau, mu } = exGaussian(xs);
    expect(tau).toBeGreaterThan(170);
    expect(tau).toBeLessThan(230);
    expect(mu).toBeGreaterThan(270);
  });
  it("ssrt integration", () => {
    const rts = Array.from({ length: 100 }, (_, i) => (i + 1) * 10);
    expect(ssrtIntegration(rts, 1000, [150, 250], 0.5)).toBe(300);
  });
  it("ssrt treats omissions as max RT", () => {
    const rts: (number | null)[] = [...Array.from({ length: 50 }, (_, i) => (i + 1) * 10), ...Array(50).fill(null)];
    expect(ssrtIntegration(rts, 1000, [200], 0.9)).toBe(800);
  });
});
