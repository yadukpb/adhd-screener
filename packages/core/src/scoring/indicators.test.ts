import { describe, it, expect } from "vitest";
import { computeIndicators } from "./indicators";
import type { Session } from "../types";

describe("computeIndicators", () => {
  it("returns nothing for an empty session", () => {
    const session: Session = { asrs: null, wurs: null };
    expect(computeIndicators(session)).toEqual([]);
  });

  it("flags ASRS elevated only when >=4 threshold items are met", () => {
    const positive: Session = { asrs: [2, 2, 3, 3, 0, 0], wurs: null };
    const negative: Session = { asrs: [0, 0, 0, 0, 0, 0], wurs: null };
    expect(computeIndicators(positive).find((i) => i.key === "asrs")?.level).toBe("elevated");
    expect(computeIndicators(negative).find((i) => i.key === "asrs")?.level).toBe("typical");
  });

  it("produces 5 CPT indicators with typical level for norm-matching performance", () => {
    const session: Session = {
      asrs: null,
      wurs: null,
      cpt: { nGo: 64, nNoGo: 16, omissionPct: 3, commissionPct: 12, meanRt: 420, rtSd: 90, tau: 70, dPrime: 3.2 },
    };
    const inds = computeIndicators(session).filter((i) => i.key.startsWith("cpt-"));
    expect(inds).toHaveLength(5);
    for (const i of inds) expect(i.level).toBe("typical");
  });

  it("flags CPT commission errors as elevated when far above norm", () => {
    const session: Session = {
      asrs: null,
      wurs: null,
      cpt: { nGo: 64, nNoGo: 16, omissionPct: 3, commissionPct: 40, meanRt: 420, rtSd: 90, tau: 70, dPrime: 3.2 },
    };
    const ind = computeIndicators(session).find((i) => i.key === "cpt-commission");
    expect(ind?.level).toBe("elevated");
    expect(ind?.z).toBeGreaterThan(2);
  });

  it("does not flag elevated for performing much better than norm (one-sided banding)", () => {
    const session: Session = {
      asrs: null,
      wurs: null,
      cpt: { nGo: 64, nNoGo: 16, omissionPct: 0, commissionPct: 0, meanRt: 420, rtSd: 20, tau: 10, dPrime: 4.5 },
    };
    const inds = computeIndicators(session).filter((i) => i.key.startsWith("cpt-"));
    for (const i of inds) expect(i.level).toBe("typical");
  });

  it("reports an invalid-but-present stop-signal indicator when staircase didn't converge", () => {
    const session: Session = {
      asrs: null,
      wurs: null,
      stop: { valid: false, ssrt: NaN, pRespondGivenStop: 0.95, meanGoRt: 400, meanSsd: 200 },
    };
    const ind = computeIndicators(session).find((i) => i.key === "stop-ssrt");
    expect(ind).toBeDefined();
    expect(ind?.valueText).toMatch(/invalid/);
    expect(ind?.z).toBeNull();
  });

  it("includes an n-back indicator when nback data is present", () => {
    const session: Session = {
      asrs: null,
      wurs: null,
      nback: { hits: 12, misses: 3, falseAlarms: 2, correctRejections: 30, dPrime: 2.1 },
    };
    const ind = computeIndicators(session).find((i) => i.key === "nback-dprime");
    expect(ind).toBeDefined();
    expect(ind?.regions).toContain("pfc");
  });
});
