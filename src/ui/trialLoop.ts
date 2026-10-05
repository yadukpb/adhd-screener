/**
 * Shared timed-trial engine used by all three objective tasks. Each task
 * differs only in what it renders per trial and how it turns
 * (responded, rt, key) into its own trial record -- the timing/keyboard
 * plumbing (the part that's easy to get subtly wrong) lives here once.
 */

export interface TrialLoopConfig<Plan> {
  plan: Plan[];
  /** Total window (ms) for trial i, from stimulus onset to moving on. */
  durationMs: (trial: Plan, index: number) => number;
  /** Keys this task listens for, e.g. [" "] or ["ArrowLeft", "ArrowRight"]. */
  keys: string[];
  /** Called once at the start of each trial to draw the stimulus. */
  render: (trial: Plan, index: number) => void;
  /**
   * Called mid-trial if the task needs a second render pass (e.g. the
   * stop-signal task revealing its stop cue after the SSD). Optional.
   */
  midTrial?: { delayMs: (trial: Plan, index: number) => number; render: (trial: Plan, index: number) => void };
  /** Called when the trial's window closes. responded/rt/key reflect the first accepted keypress, if any. */
  onTrialEnd: (trial: Plan, index: number, responded: boolean, rt: number | null, key: string | null) => void;
  onAllDone: () => void;
}

export function runTrialLoop<Plan>(cfg: TrialLoopConfig<Plan>): { stop: () => void } {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  function runTrial(index: number) {
    if (cancelled) return;
    if (index >= cfg.plan.length) {
      cfg.onAllDone();
      return;
    }
    const trial = cfg.plan[index];
    const onsetAt = performance.now();
    let responded = false;
    let rt: number | null = null;
    let respondedKey: string | null = null;

    const onKey = (e: KeyboardEvent) => {
      if (!cfg.keys.includes(e.key) || responded) return;
      responded = true;
      rt = performance.now() - onsetAt;
      respondedKey = e.key;
    };
    window.addEventListener("keydown", onKey);

    cfg.render(trial, index);

    if (cfg.midTrial) {
      const t = setTimeout(() => {
        if (!cancelled) cfg.midTrial!.render(trial, index);
      }, cfg.midTrial.delayMs(trial, index));
      timers.push(t);
    }

    const duration = cfg.durationMs(trial, index);
    const endTimer = setTimeout(() => {
      window.removeEventListener("keydown", onKey);
      if (cancelled) return;
      cfg.onTrialEnd(trial, index, responded, rt, respondedKey);
      runTrial(index + 1);
    }, duration);
    timers.push(endTimer);
  }

  runTrial(0);

  return {
    stop: () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
    },
  };
}
