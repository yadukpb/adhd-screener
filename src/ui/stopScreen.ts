import type { StopTrial } from "../types";
import { el, mount, button } from "./dom";
import { runTrialLoop } from "./trialLoop";
import { generateStopPlan, SsdStaircase, type StopPlanItem, type GoDirection } from "../tasks/stopSignal";
import { mulberry32 } from "../tasks/rng";

const TRIAL_WINDOW_MS = 1200;
const ARROW: Record<GoDirection, string> = { left: "←", right: "→" };
const KEY_TO_DIR: Record<string, GoDirection> = { ArrowLeft: "left", ArrowRight: "right" };

export function runStopScreen(root: HTMLElement, onComplete: (trials: StopTrial[], maxRt: number) => void): void {
  const instructions = el("section", { class: "screen" }, [
    el("h2", {}, ["Task 2 of 3: Go / Stop"]),
    el("p", {}, ["Press the LEFT or RIGHT arrow key to match the direction shown, as fast as you can."]),
    el("p", {}, ["On some trials the arrow will turn red after it appears -- when that happens, try NOT to press anything."]),
    el("p", {}, ["This takes about 2 minutes."]),
    button("Start", start),
  ]);
  mount(root, instructions);

  function start() {
    const plan = generateStopPlan(mulberry32(Date.now()), 64, 0.25);
    const staircase = new SsdStaircase();
    const trials: StopTrial[] = [];
    let maxRt = 0;
    // Set during each trial's render and read back when that same trial
    // ends -- safe because runTrialLoop processes trials strictly in
    // sequence, never overlapping.
    let ssdForThisTrial: number | null = null;

    const stimulusBox = el("div", { class: "stimulus-box arrow" }, [""]);
    const screen = el("section", { class: "screen task-screen" }, [el("div", { class: "progress" }, ["Go / Stop"]), stimulusBox]);
    mount(root, screen);

    runTrialLoop<StopPlanItem>({
      plan,
      keys: ["ArrowLeft", "ArrowRight"],
      durationMs: () => TRIAL_WINDOW_MS,
      render: (t) => {
        stimulusBox.textContent = ARROW[t.direction];
        stimulusBox.classList.remove("stop-cue");
        ssdForThisTrial = t.stop ? staircase.current() : null;
      },
      midTrial: {
        // Go trials get a no-op reveal timed to the trial's own end (harmless);
        // stop trials get the red stop cue at the staircase's current delay.
        delayMs: (t) => (t.stop ? staircase.current() : TRIAL_WINDOW_MS),
        render: (t) => {
          if (t.stop) stimulusBox.classList.add("stop-cue");
        },
      },
      onTrialEnd: (t, _i, responded, rt, key) => {
        if (!t.stop) {
          const correctDir = key ? KEY_TO_DIR[key] === t.direction : false;
          const keptRt = responded && correctDir ? rt : null;
          if (keptRt !== null) maxRt = Math.max(maxRt, keptRt);
          trials.push({ stop: false, ssd: null, rt: keptRt });
        } else {
          const stoppedSuccessfully = !responded;
          staircase.next(stoppedSuccessfully);
          trials.push({ stop: true, ssd: ssdForThisTrial, rt: responded ? rt : null });
        }
      },
      onAllDone: () => onComplete(trials, maxRt || TRIAL_WINDOW_MS),
    });
  }
}
