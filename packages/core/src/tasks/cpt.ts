import type { CptTrial, CptSummary } from "../types";
import { mean, sd, dPrime, exGaussian } from "../scoring/stats";
import { type Rng, shuffle, randInt } from "./rng";

/**
 * Go/No-Go Continuous Performance Task. Letters appear one at a time; the
 * subject responds (any key / tap) to every letter except the designated
 * no-go letter, which must be withheld. ~20% no-go rate and letter-based
 * stimuli follow the classic Conners CPT / X-CPT design pattern, chosen
 * because no-go trials need to be frequent enough to be unpredictable but
 * rare enough that withholding is effortful (see huangpollock2012).
 */

export const CPT_LETTERS = ["B", "C", "D", "F", "G", "H", "J", "K"] as const;
export const CPT_NOGO_LETTER = "X";
export const CPT_STIMULUS_MS = 300;
export const CPT_ISI_MS = [1000, 1400, 1800] as const; // jittered inter-stimulus interval

export interface CptPlanItem {
  letter: string;
  nogo: boolean;
  isiMs: number;
}

/** Builds the fixed stimulus plan up front so timing in the UI runner never has to branch on randomness mid-task. */
export function generateCptPlan(rng: Rng, totalTrials = 80, noGoRatio = 0.2): CptPlanItem[] {
  const nNoGo = Math.round(totalTrials * noGoRatio);
  const nGo = totalTrials - nNoGo;
  const flags = shuffle(rng, [...Array(nNoGo).fill(true), ...Array(nGo).fill(false)]);
  return flags.map((nogo) => ({
    letter: nogo ? CPT_NOGO_LETTER : CPT_LETTERS[randInt(rng, 0, CPT_LETTERS.length - 1)],
    nogo,
    isiMs: CPT_ISI_MS[randInt(rng, 0, CPT_ISI_MS.length - 1)],
  }));
}

export function summarizeCpt(trials: CptTrial[]): CptSummary {
  const goTrials = trials.filter((t) => !t.nogo);
  const noGoTrials = trials.filter((t) => t.nogo);
  if (goTrials.length === 0) throw new RangeError("CPT summary requires at least one go trial");

  const goRts = goTrials.map((t) => t.rt).filter((rt): rt is number => rt !== null);
  const omissions = goTrials.length - goRts.length;
  const commissions = noGoTrials.filter((t) => t.rt !== null).length;

  const omissionPct = (omissions / goTrials.length) * 100;
  const commissionPct = noGoTrials.length ? (commissions / noGoTrials.length) * 100 : 0;
  const meanRt = goRts.length ? mean(goRts) : NaN;
  const rtSd = goRts.length >= 2 ? sd(goRts) : NaN;
  const tau = goRts.length >= 2 ? exGaussian(goRts).tau : NaN;
  const d = dPrime(goRts.length, goTrials.length, commissions, noGoTrials.length);

  return {
    nGo: goTrials.length,
    nNoGo: noGoTrials.length,
    omissionPct,
    commissionPct,
    meanRt,
    rtSd,
    tau,
    dPrime: d,
  };
}
