import type { StopTrial, StopSummary } from "../types";
import { mean, ssrtIntegration } from "../scoring/stats";
import { type Rng, shuffle, randInt } from "./rng";

/**
 * Stop-signal task: respond to a go stimulus (direction arrow) as fast as
 * possible; on a minority of trials a stop signal appears after a variable
 * delay (SSD) and the response must be withheld. SSD is tracked with a
 * 1-up-1-down staircase (+/- step) so it converges near the ~50% successful-
 * stop point, which is what the integration-method SSRT estimate requires
 * for validity -- see verbruggen2019 consensus guide.
 */

export type GoDirection = "left" | "right";

export const STOP_INITIAL_SSD_MS = 250;
export const STOP_STEP_MS = 50;
export const STOP_MIN_SSD_MS = 50;
export const STOP_MAX_SSD_MS = 900;
export const STOP_SIGNAL_RATIO = 0.25;

export interface StopPlanItem {
  direction: GoDirection;
  stop: boolean;
}

export function generateStopPlan(rng: Rng, totalTrials = 64, stopRatio = STOP_SIGNAL_RATIO): StopPlanItem[] {
  const nStop = Math.round(totalTrials * stopRatio);
  const nGo = totalTrials - nStop;
  const flags = shuffle(rng, [...Array(nStop).fill(true), ...Array(nGo).fill(false)]);
  return flags.map((stop) => ({
    direction: randInt(rng, 0, 1) === 0 ? "left" : "right",
    stop,
  }));
}

/**
 * Tracks the SSD staircase across a live run. Call `next()` after each stop
 * trial resolves to get the SSD for the following stop trial: successful
 * inhibition raises the delay (harder to stop next time), a failed stop
 * lowers it (easier next time).
 */
export class SsdStaircase {
  private ssd: number;
  constructor(initial = STOP_INITIAL_SSD_MS) {
    this.ssd = initial;
  }
  current(): number {
    return this.ssd;
  }
  next(stoppedSuccessfully: boolean): number {
    this.ssd += stoppedSuccessfully ? STOP_STEP_MS : -STOP_STEP_MS;
    this.ssd = Math.min(STOP_MAX_SSD_MS, Math.max(STOP_MIN_SSD_MS, this.ssd));
    return this.ssd;
  }
}

/**
 * maxRt should be the slowest go RT observed (or the go-trial deadline) --
 * the integration method replaces go omissions with this ceiling rather than
 * dropping them, per verbruggen2019.
 */
export function summarizeStop(trials: StopTrial[], maxRt: number): StopSummary {
  const goTrials = trials.filter((t) => !t.stop);
  const stopTrials = trials.filter((t) => t.stop);
  if (goTrials.length === 0) throw new RangeError("stop-signal summary requires at least one go trial");

  const goRts = goTrials.map((t) => t.rt);
  const observedGoRts = goRts.filter((rt): rt is number => rt !== null);
  const meanGoRt = observedGoRts.length ? mean(observedGoRts) : NaN;

  const ssds = stopTrials.map((t) => t.ssd).filter((s): s is number => s !== null);
  const meanSsd = ssds.length ? mean(ssds) : NaN;

  const responded = stopTrials.filter((t) => t.rt !== null).length;
  const pRespondGivenStop = stopTrials.length ? responded / stopTrials.length : NaN;

  const ssrt = stopTrials.length ? ssrtIntegration(goRts, maxRt, ssds, pRespondGivenStop) : NaN;

  // Per the consensus guide, an estimate is only trustworthy when the
  // staircase actually converged near 50% stopping (not everyone always
  // stopping, not everyone never stopping) and there were enough stop trials.
  const valid = stopTrials.length >= 16 && pRespondGivenStop >= 0.25 && pRespondGivenStop <= 0.75;

  return { valid, ssrt, pRespondGivenStop, meanGoRt, meanSsd };
}
