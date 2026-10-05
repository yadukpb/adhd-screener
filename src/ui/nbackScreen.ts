import type { NbackTrial } from "../types";
import { el, mount, button } from "./dom";
import { runTrialLoop } from "./trialLoop";
import { generateNbackPlan, NBACK_N, NBACK_STIMULUS_MS, NBACK_ISI_MS, type NbackPlanItem } from "../tasks/nback";
import { mulberry32 } from "../tasks/rng";

export function runNbackScreen(root: HTMLElement, onComplete: (trials: NbackTrial[]) => void): void {
  const instructions = el("section", { class: "screen" }, [
    el("h2", {}, ["Task 3 of 3: 2-Back Memory"]),
    el("p", {}, [
      `Letters will appear one at a time. Press SPACE whenever the current letter is the SAME as the letter shown ${NBACK_N} positions earlier.`,
    ]),
    el("p", {}, ["Do nothing for every other letter. This takes about 2 minutes."]),
    button("Start", start),
  ]);
  mount(root, instructions);

  function start() {
    const plan = generateNbackPlan(mulberry32(Date.now()), 50, NBACK_N, 0.3);
    const trials: NbackTrial[] = [];
    const stimulusBox = el("div", { class: "stimulus-box" }, ["+"]);
    const screen = el("section", { class: "screen task-screen" }, [el("div", { class: "progress" }, ["2-Back Memory"]), stimulusBox]);
    mount(root, screen);

    runTrialLoop<NbackPlanItem>({
      plan,
      keys: [" "],
      durationMs: () => NBACK_STIMULUS_MS + NBACK_ISI_MS,
      render: (t) => {
        stimulusBox.textContent = t.letter;
      },
      midTrial: {
        delayMs: () => NBACK_STIMULUS_MS,
        render: () => {
          stimulusBox.textContent = "+";
        },
      },
      onTrialEnd: (t, _i, responded) => {
        trials.push({ target: t.isTarget, responded });
      },
      onAllDone: () => onComplete(trials),
    });
  }
}
