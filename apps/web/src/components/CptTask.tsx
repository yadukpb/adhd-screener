import { useMemo, useRef, useState, type ReactNode } from "react";
import { generateCptPlan, mulberry32, CPT_STIMULUS_MS, CPT_NOGO_LETTER, type CptPlanItem, type CptTrial } from "@adhd-screener/core";
import { useTimedTrials } from "../hooks/useTimedTrials";

interface Props {
  onComplete: (trials: CptTrial[]) => void;
}

export function CptTask({ onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const plan = useMemo(() => generateCptPlan(mulberry32(Date.now()), 80, 0.2), []);
  const trialsRef = useRef<CptTrial[]>([]);

  const { trial, phase } = useTimedTrials<CptPlanItem>({
    plan,
    active: started,
    keys: [" "],
    durationMs: (t) => CPT_STIMULUS_MS + t.isiMs,
    midTrial: { delayMs: () => CPT_STIMULUS_MS },
    onTrialEnd: (t, _i, responded, rt) => {
      trialsRef.current.push({ nogo: t.nogo, rt: responded ? rt : null });
    },
    onAllDone: () => onComplete(trialsRef.current),
  });

  if (!started) {
    return (
      <Instructions
        title="Task 1 of 3: Letter Monitoring"
        bullets={[
          `Press the SPACE bar for every letter EXCEPT "${CPT_NOGO_LETTER}".`,
          `When you see "${CPT_NOGO_LETTER}", do nothing.`,
          "Respond as quickly and accurately as you can.",
          "Takes about 2 minutes.",
        ]}
        onStart={() => setStarted(true)}
      />
    );
  }

  const showLetter = trial && phase === "primary";
  return (
    <TaskShell label="Letter Monitoring">
      <span>{showLetter ? trial.letter : "+"}</span>
    </TaskShell>
  );
}

export function Instructions({ title, bullets, onStart }: { title: string; bullets: string[]; onStart: () => void }) {
  return (
    <div className="mx-auto max-w-lg animate-fade-in text-center">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="glass-card mt-6 p-6 text-left">
        <ul className="space-y-3 text-slate-300">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-brand-400">&#8226;</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn-primary mt-6" onClick={onStart}>
        Start
      </button>
    </div>
  );
}

export function TaskShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg animate-fade-in text-center">
      <p className="mb-3 text-sm uppercase tracking-wide text-slate-500">{label}</p>
      <div className="glass-card flex h-64 items-center justify-center text-6xl font-extrabold text-white">{children}</div>
    </div>
  );
}
