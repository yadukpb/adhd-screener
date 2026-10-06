import type { FlankerTrial, FlankerSummary } from "../types";
import { mean } from "../scoring/stats";
import { type Rng, shuffle, randInt } from "./rng";
import type { GoDirection } from "./stopSignal";

/**
 * Eriksen Flanker task: a row of 5 arrows, respond to the CENTER arrow's
 * direction only, ignoring the 4 flanking arrows. On congruent trials the
 * flankers point the same way as the center ("<<<<<"); on incongruent
 * trials they point the opposite way ("<< >< <<"). The slowdown/error
 * increase on incongruent trials ("interference effect") is a standard
 * measure of selective-attention / conflict-resolution ability -- see
 * mullane2009flanker.
 */

export const FLANKER_RESPONSE_WINDOW_MS = 1200;
export const FLANKER_INCONGRUENT_RATIO = 0.5;

export interface FlankerPlanItem {
  direction: GoDirection;
  congruent: boolean;
}

export function generateFlankerPlan(rng: Rng, totalTrials = 60, incongruentRatio = FLANKER_INCONGRUENT_RATIO): FlankerPlanItem[] {
  const nIncongruent = Math.round(totalTrials * incongruentRatio);
  const nCongruent = totalTrials - nIncongruent;
  const flags = shuffle(rng, [...Array(nIncongruent).fill(true), ...Array(nCongruent).fill(false)]); // true = incongruent
  return flags.map((incongruent) => ({
    direction: randInt(rng, 0, 1) === 0 ? "left" : "right",
    congruent: !incongruent,
  }));
}

export function summarizeFlanker(trials: FlankerTrial[]): FlankerSummary {
  const congruentTrials = trials.filter((t) => t.congruent);
  const incongruentTrials = trials.filter((t) => !t.congruent);
  if (congruentTrials.length === 0 || incongruentTrials.length === 0) {
    throw new RangeError("flanker summary requires at least one congruent and one incongruent trial");
  }

  const correctRts = (ts: FlankerTrial[]) => ts.filter((t) => t.correct && t.rt !== null).map((t) => t.rt as number);
  const accuracy = (ts: FlankerTrial[]) => (ts.filter((t) => t.correct).length / ts.length) * 100;

  const congruentCorrectRts = correctRts(congruentTrials);
  const incongruentCorrectRts = correctRts(incongruentTrials);
  const congruentRt = congruentCorrectRts.length ? mean(congruentCorrectRts) : NaN;
  const incongruentRt = incongruentCorrectRts.length ? mean(incongruentCorrectRts) : NaN;

  return {
    congruentRt,
    incongruentRt,
    interferenceEffect: Number.isFinite(congruentRt) && Number.isFinite(incongruentRt) ? incongruentRt - congruentRt : NaN,
    congruentAccuracy: accuracy(congruentTrials),
    incongruentAccuracy: accuracy(incongruentTrials),
    overallAccuracy: accuracy(trials),
  };
}
