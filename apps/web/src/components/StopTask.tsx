import { useMemo, useRef, useState } from "react";
import {
  generateStopPlan,
  SsdStaircase,
  mulberry32,
  type StopPlanItem,
  type StopTrial,
  type GoDirection,
} from "@adhd-screener/core";
import { useTimedTrials } from "../hooks/useTimedTrials";
import { Instructions, TaskShell } from "./CptTask";

const TRIAL_WINDOW_MS = 1200;
const ARROW: Record<GoDirection, string> = { left: "←", right: "→" };
const KEY_TO_DIR: Record<string, GoDirection> = { ArrowLeft: "left", ArrowRight: "right" };

interface Props {
  onComplete: (trials: StopTrial[], maxRt: number) => void;
}

export function StopTask({ onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const plan = useMemo(() => generateStopPlan(mulberry32(Date.now()), 64, 0.25), []);
  const staircase = useMemo(() => new SsdStaircase(), []);
  const trialsRef = useRef<StopTrial[]>([]);
  const maxRtRef = useRef(0);
  const ssdForTrialRef = useRef<number | null>(null);

  const { trial, phase } = useTimedTrials<StopPlanItem>({
    plan,
    active: started,
    keys: ["ArrowLeft", "ArrowRight"],
    durationMs: () => TRIAL_WINDOW_MS,
    midTrial: {
      // Called once per trial, synchronously, before the trial's state is
      // committed -- the right place to snapshot the staircase's current
      // value for this trial, before onTrialEnd advances it.
      delayMs: (t) => {
        ssdForTrialRef.current = t.stop ? staircase.current() : null;
        return t.stop ? (ssdForTrialRef.current as number) : TRIAL_WINDOW_MS;
      },
    },
    onTrialEnd: (t, _i, responded, rt, key) => {
      if (!t.stop) {
        const correctDir = key ? KEY_TO_DIR[key] === t.direction : false;
        const keptRt = responded && correctDir ? rt : null;
        if (keptRt !== null) maxRtRef.current = Math.max(maxRtRef.current, keptRt);
        trialsRef.current.push({ stop: false, ssd: null, rt: keptRt });
      } else {
        staircase.next(!responded);
        trialsRef.current.push({ stop: true, ssd: ssdForTrialRef.current, rt: responded ? rt : null });
      }
    },
    onAllDone: () => onComplete(trialsRef.current, maxRtRef.current || TRIAL_WINDOW_MS),
  });

  if (!started) {
    return (
      <Instructions
        title="Task 2 of 3: Go / Stop"
        bullets={[
          "Press LEFT or RIGHT arrow to match the direction shown, as fast as you can.",
          "Sometimes the arrow turns red after it appears -- when that happens, try NOT to press anything.",
          "Takes about 2 minutes.",
        ]}
        onStart={() => setStarted(true)}
      />
    );
  }

  const isStopCue = trial?.stop && phase === "secondary";
  return (
    <TaskShell label="Go / Stop">
      <span className={isStopCue ? "text-red-500" : undefined}>{trial ? ARROW[trial.direction] : ""}</span>
    </TaskShell>
  );
}
