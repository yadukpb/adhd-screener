import type { Level } from "../types";

/**
 * Normative reference points for the three objective tasks.
 *
 * IMPORTANT HONESTY NOTE: this app implements its own browser versions of a
 * CPT, a stop-signal task, and an n-back task -- it is NOT running a
 * commercially normed instrument (e.g. Conners CPT-3, TOVA, IVA-2), which
 * would have item-for-item published normative tables. The mu/sigma values
 * below are representative "typical adult, neutral task parameters" estimates
 * synthesized from the *pattern* of findings in the meta-analyses cited in
 * data/references.ts (effect sizes, direction, and rough magnitude), not a
 * literal lookup from a specific normed table. They are good enough to rank
 * "typical / mild / elevated" for a self-screening aid, not to assign a
 * percentile. This gap is stated explicitly in the UI disclaimer -- see
 * ui/report.ts -- rather than hidden behind a confident-looking number.
 */

export interface NormEntry {
  mu: number;
  sigma: number;
  /** "high" = larger raw value is more ADHD-associated; "low" = smaller is. */
  worseDirection: "high" | "low";
  refs: string[];
}

export const cptNorms: Record<"omissionPct" | "commissionPct" | "rtSd" | "tau" | "dPrime", NormEntry> = {
  omissionPct: { mu: 3, sigma: 4, worseDirection: "high", refs: ["huangpollock2012", "volkow2009"] },
  commissionPct: { mu: 12, sigma: 8, worseDirection: "high", refs: ["huangpollock2012", "bush2005"] },
  rtSd: { mu: 90, sigma: 35, worseDirection: "high", refs: ["huangpollock2012", "castellanos2008", "valera2007"] },
  tau: { mu: 70, sigma: 30, worseDirection: "high", refs: ["castellanos2008", "cortese2012"] },
  dPrime: { mu: 3.2, sigma: 0.8, worseDirection: "low", refs: ["huangpollock2012", "cortese2012"] },
};

export const stopNorms: Record<"ssrt", NormEntry> = {
  ssrt: { mu: 220, sigma: 45, worseDirection: "high", refs: ["lijffijt2005", "aron2004", "verbruggen2019"] },
};

export const nbackNorms: Record<"dPrime", NormEntry> = {
  dPrime: { mu: 2.0, sigma: 0.7, worseDirection: "low", refs: ["kofler2013", "shaw2007"] },
};

/** Orients a raw z so that positive always means "more ADHD-associated", regardless of worseDirection. */
export function orientedZ(z: number, worseDirection: "high" | "low"): number {
  return worseDirection === "high" ? z : -z;
}

/**
 * Bands an ALREADY-ORIENTED z (positive = more ADHD-associated) into a
 * level. Deliberately one-sided: performing much *better* than the norm
 * (a large negative oriented z) is "typical", not "elevated" -- this is a
 * screener for excess difficulty, not for deviation in either direction.
 * 1-2 SD / >2 SD is a standard-deviation-band convention for flagging, not a
 * diagnostic cutoff (see faraone2021consensus).
 */
export function levelFromOrientedZ(z: number): Level {
  if (z >= 2) return "elevated";
  if (z >= 1) return "mild";
  return "typical";
}
