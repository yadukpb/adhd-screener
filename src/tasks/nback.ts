import type { NbackTrial, NbackSummary } from "../types";
import { dPrime } from "../scoring/stats";
import { type Rng, randInt, pick } from "./rng";

/**
 * Working-memory n-back: a letter appears every trial; respond when the
 * current letter matches the one N positions back. 2-back is the standard
 * difficulty for a general-population screener (kofler2013) -- 1-back floors
 * too easily, 3-back is hard enough to swamp group differences with general
 * difficulty.
 */

export const NBACK_LETTERS = ["A", "E", "G", "K", "M", "R", "T", "X"] as const;
export const NBACK_N = 2;
export const NBACK_TARGET_RATIO = 0.3;
export const NBACK_STIMULUS_MS = 500;
export const NBACK_ISI_MS = 2000;

export interface NbackPlanItem {
  letter: string;
  isTarget: boolean;
}

/**
 * Builds a sequence where ~targetRatio of eligible trials (index >= n) are
 * constructed as true n-back matches; the first n trials can never be
 * targets by definition and are flagged isTarget: false.
 */
export function generateNbackPlan(rng: Rng, totalTrials = 50, n = NBACK_N, targetRatio = NBACK_TARGET_RATIO): NbackPlanItem[] {
  const letters: string[] = [];
  const plan: NbackPlanItem[] = [];
  for (let i = 0; i < totalTrials; i++) {
    if (i < n) {
      const letter = pick(rng, NBACK_LETTERS);
      letters.push(letter);
      plan.push({ letter, isTarget: false });
      continue;
    }
    const makeTarget = rng() < targetRatio;
    let letter: string;
    if (makeTarget) {
      letter = letters[i - n];
    } else {
      // pick any letter that does NOT accidentally match n-back, so the
      // non-target rate isn't silently inflated with "lucky" matches.
      do {
        letter = NBACK_LETTERS[randInt(rng, 0, NBACK_LETTERS.length - 1)];
      } while (letter === letters[i - n]);
    }
    letters.push(letter);
    plan.push({ letter, isTarget: makeTarget });
  }
  return plan;
}

export function summarizeNback(trials: NbackTrial[]): NbackSummary {
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let correctRejections = 0;
  for (const t of trials) {
    if (t.target && t.responded) hits++;
    else if (t.target && !t.responded) misses++;
    else if (!t.target && t.responded) falseAlarms++;
    else correctRejections++;
  }
  const nSignal = hits + misses;
  const nNoise = falseAlarms + correctRejections;
  const d = dPrime(hits, nSignal, falseAlarms, nNoise);
  return { hits, misses, falseAlarms, correctRejections, dPrime: d };
}
