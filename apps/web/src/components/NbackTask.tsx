import { useMemo, useRef, useState } from "react";
import {
  generateNbackPlan,
  mulberry32,
  NBACK_N,
  NBACK_STIMULUS_MS,
  NBACK_ISI_MS,
  type NbackPlanItem,
  type NbackTrial,
} from "@adhd-screener/core";
import { useTimedTrials } from "../hooks/useTimedTrials";
import { Instructions, TaskShell } from "./CptTask";

interface Props {
  onComplete: (trials: NbackTrial[]) => void;
}

export function NbackTask({ onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const plan = useMemo(() => generateNbackPlan(mulberry32(Date.now()), 50, NBACK_N, 0.3), []);
  const trialsRef = useRef<NbackTrial[]>([]);

  const { trial, phase } = useTimedTrials<NbackPlanItem>({
    plan,
    active: started,
    keys: [" "],
    durationMs: () => NBACK_STIMULUS_MS + NBACK_ISI_MS,
    midTrial: { delayMs: () => NBACK_STIMULUS_MS },
    onTrialEnd: (t, _i, responded) => {
      trialsRef.current.push({ target: t.isTarget, responded });
    },
    onAllDone: () => onComplete(trialsRef.current),
  });

  if (!started) {
    return (
      <Instructions
        title="Task 3 of 3: 2-Back Memory"
        bullets={[
          `Press SPACE whenever the current letter is the SAME as the letter shown ${NBACK_N} positions earlier.`,
          "Do nothing for every other letter.",
          "Takes about 2 minutes.",
        ]}
        onStart={() => setStarted(true)}
      />
    );
  }

  const showLetter = trial && phase === "primary";
  return (
    <TaskShell label="2-Back Memory">
      <span>{showLetter ? trial.letter : "+"}</span>
    </TaskShell>
  );
}
