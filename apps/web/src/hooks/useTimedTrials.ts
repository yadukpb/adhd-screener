import { useEffect, useRef, useState } from "react";

/**
 * React port of the engine originally built for the vanilla-DOM version of
 * this app: runs a fixed plan of timed trials, listens for keyboard
 * responses, and reports results trial-by-trial. Rendering is left entirely
 * to the caller via `phase`/`trial` state -- this hook only owns timing.
 */
export interface TimedTrialsConfig<Plan> {
  plan: Plan[];
  /** Total window (ms) for trial i, from onset to moving on. */
  durationMs: (trial: Plan, index: number) => number;
  /** Keys this task listens for, e.g. [" "] or ["ArrowLeft", "ArrowRight"]. */
  keys: string[];
  /** Optional second render phase mid-trial (e.g. CPT blanking the letter, stop-signal's red cue). */
  midTrial?: { delayMs: (trial: Plan, index: number) => number };
  onTrialEnd: (trial: Plan, index: number, responded: boolean, rt: number | null, key: string | null) => void;
  onAllDone: () => void;
  /** Flip to false to pause before the plan starts (e.g. waiting on an instructions screen). */
  active: boolean;
}

export interface TimedTrialsState<Plan> {
  index: number;
  trial: Plan | null;
  /** "primary" until midTrial fires (if configured), then "secondary". Resets every trial. */
  phase: "primary" | "secondary";
  done: boolean;
}

export function useTimedTrials<Plan>(cfg: TimedTrialsConfig<Plan>): TimedTrialsState<Plan> {
  const [state, setState] = useState<TimedTrialsState<Plan>>({ index: 0, trial: null, phase: "primary", done: false });
  // Config changes (new closures) every render in a typical caller, so keep
  // a ref to the latest config and only start the loop once per `active`
  // flip rather than re-running the whole trial machine on every render.
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  useEffect(() => {
    if (!cfg.active) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function runTrial(index: number) {
      if (cancelled) return;
      const plan = cfgRef.current.plan;
      if (index >= plan.length) {
        setState((s) => ({ ...s, done: true }));
        cfgRef.current.onAllDone();
        return;
      }
      const trial = plan[index];
      const onsetAt = performance.now();
      let responded = false;
      let rt: number | null = null;
      let respondedKey: string | null = null;

      const onKey = (e: KeyboardEvent) => {
        if (!cfgRef.current.keys.includes(e.key)) return;
        // Space/ArrowUp/ArrowDown scroll the page and ArrowLeft/Right can
        // scroll horizontally by default -- without this, every response
        // yanks the viewport out from under the task (confirmed live: a
        // single unprevented Space press scrolled the page >500px).
        e.preventDefault();
        if (responded) return;
        responded = true;
        rt = performance.now() - onsetAt;
        respondedKey = e.key;
      };
      window.addEventListener("keydown", onKey);

      setState({ index, trial, phase: "primary", done: false });

      if (cfgRef.current.midTrial) {
        const t = setTimeout(() => {
          if (!cancelled) setState((s) => ({ ...s, phase: "secondary" }));
        }, cfgRef.current.midTrial.delayMs(trial, index));
        timers.push(t);
      }

      const duration = cfgRef.current.durationMs(trial, index);
      const endTimer = setTimeout(() => {
        window.removeEventListener("keydown", onKey);
        if (cancelled) return;
        cfgRef.current.onTrialEnd(trial, index, responded, rt, respondedKey);
        runTrial(index + 1);
      }, duration);
      timers.push(endTimer);
    }

    runTrial(0);

    return () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.active]);

  return state;
}
