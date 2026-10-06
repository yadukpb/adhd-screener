import { useMemo, useRef, useState } from "react";
import {
  generateFlankerPlan,
  mulberry32,
  FLANKER_RESPONSE_WINDOW_MS,
  type FlankerPlanItem,
  type FlankerTrial,
  type GoDirection,
} from "@adhd-screener/core";
import { useTimedTrials } from "../hooks/useTimedTrials";
import { Instructions, TapButton, TaskShell } from "./CptTask";

const ARROW: Record<GoDirection, string> = { left: "←", right: "→" };
const KEY_TO_DIR: Record<string, GoDirection> = { ArrowLeft: "left", ArrowRight: "right" };

function opposite(d: GoDirection): GoDirection {
  return d === "left" ? "right" : "left";
}

function stimulusRow(item: FlankerPlanItem): string {
  const center = ARROW[item.direction];
  const flanker = ARROW[item.congruent ? item.direction : opposite(item.direction)];
  return `${flanker} ${flanker} ${center} ${flanker} ${flanker}`;
}

interface Props {
  onComplete: (trials: FlankerTrial[]) => void;
}

export function FlankerTask({ onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const plan = useMemo(() => generateFlankerPlan(mulberry32(Date.now()), 60, 0.5), []);
  const trialsRef = useRef<FlankerTrial[]>([]);

  const { trial, respond } = useTimedTrials<FlankerPlanItem>({
    plan,
    active: started,
    keys: ["ArrowLeft", "ArrowRight"],
    durationMs: () => FLANKER_RESPONSE_WINDOW_MS,
    onTrialEnd: (t, _i, responded, rt, key) => {
      const correct = responded && key ? KEY_TO_DIR[key] === t.direction : false;
      trialsRef.current.push({ congruent: t.congruent, correct, rt: responded ? rt : null });
    },
    onAllDone: () => onComplete(trialsRef.current),
  });

  if (!started) {
    return (
      <Instructions
        title="Task 3 of 4: Which Way Is the Middle Arrow?"
        bullets={[
          "A row of 5 arrows appears. Press LEFT or RIGHT (or tap) to match the MIDDLE arrow only -- ignore the ones around it.",
          "Sometimes the outer arrows point the same way as the middle one, sometimes the opposite way. Either way, only the middle one counts.",
          "Respond as quickly and accurately as you can.",
          "Takes about 2 minutes.",
        ]}
        onStart={() => setStarted(true)}
      />
    );
  }

  return (
    <TaskShell
      label="Which Way Is the Middle Arrow?"
      hint="Tap / press the direction of the CENTER arrow only"
      controls={
        <>
          <TapButton onClick={() => respond("ArrowLeft")}>&larr; Left</TapButton>
          <TapButton onClick={() => respond("ArrowRight")}>Right &rarr;</TapButton>
        </>
      }
    >
      <span className="text-4xl tracking-widest sm:text-5xl">{trial ? stimulusRow(trial) : ""}</span>
    </TaskShell>
  );
}
