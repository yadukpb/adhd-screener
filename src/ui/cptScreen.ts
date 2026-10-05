import type { CptTrial } from "../types";
import { el, mount, button } from "./dom";
import { runTrialLoop } from "./trialLoop";
import { generateCptPlan, CPT_STIMULUS_MS, CPT_NOGO_LETTER, type CptPlanItem } from "../tasks/cpt";
import { mulberry32 } from "../tasks/rng";

export function runCptScreen(root: HTMLElement, onComplete: (trials: CptTrial[]) => void): void {
  const instructions = el("section", { class: "screen" }, [
    el("h2", {}, ["Task 1 of 3: Letter Monitoring"]),
    el("p", {}, [
      `Letters will appear one at a time. Press the SPACE bar for every letter EXCEPT the letter "${CPT_NOGO_LETTER}" -- when you see "${CPT_NOGO_LETTER}", do nothing.`,
    ]),
    el("p", {}, ["Respond as quickly and accurately as you can. This takes about 2 minutes."]),
    button("Start", start),
  ]);
  mount(root, instructions);

  function start() {
    const plan = generateCptPlan(mulberry32(Date.now()), 80, 0.2);
    const trials: CptTrial[] = [];
    const stimulusBox = el("div", { class: "stimulus-box" }, ["+"]);
    const screen = el("section", { class: "screen task-screen" }, [el("div", { class: "progress" }, ["Letter Monitoring"]), stimulusBox]);
    mount(root, screen);

    runTrialLoop<CptPlanItem>({
      plan,
      keys: [" "],
      durationMs: (t) => CPT_STIMULUS_MS + t.isiMs,
      render: (t) => {
        stimulusBox.textContent = t.letter;
      },
      midTrial: {
        delayMs: () => CPT_STIMULUS_MS,
        render: () => {
          stimulusBox.textContent = "+";
        },
      },
      onTrialEnd: (t, _i, responded, rt) => {
        trials.push({ nogo: t.nogo, rt: responded ? rt : null });
      },
      onAllDone: () => onComplete(trials),
    });
  }
}
