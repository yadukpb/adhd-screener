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

  const { trial, phase, respond } = useTimedTrials<CptPlanItem>({
    plan,
    active: started,
    keys: [" ", "Tap"],
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
        title="Task 1 of 4: Letter Monitoring"
        bullets={[
          `Press SPACE (or tap the button) for every letter EXCEPT "${CPT_NOGO_LETTER}".`,
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
    <TaskShell
      label="Letter Monitoring"
      hint={`Tap / press SPACE for every letter except "${CPT_NOGO_LETTER}"`}
      controls={
        <TapButton onClick={() => respond("Tap")}>Tap</TapButton>
      }
    >
      <span className={showLetter ? undefined : "text-2xl text-faint"}>{showLetter ? trial.letter : "+"}</span>
    </TaskShell>
  );
}

export function Instructions({ title, bullets, onStart }: { title: string; bullets: string[]; onStart: () => void }) {
  return (
    <div className="mx-auto max-w-lg animate-fade-in text-center">
      <h2 className="text-2xl font-bold text-heading">{title}</h2>
      <div className="glass-card mt-6 p-6 text-left">
        <ul className="space-y-3 text-body">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-brand-500 dark:text-brand-400">&#8226;</span>
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

export function TaskShell({
  label,
  hint,
  controls,
  children,
}: {
  label: string;
  hint?: string;
  controls?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg animate-fade-in text-center">
      <p className="mb-1 text-sm uppercase tracking-wide text-subtle">{label}</p>
      {hint && <p className="mb-3 text-xs text-faint">{hint}</p>}
      <div className="glass-card flex h-64 items-center justify-center text-6xl font-extrabold text-heading">{children}</div>
      {controls && <div className="mt-5 flex flex-wrap items-center justify-center gap-4">{controls}</div>}
    </div>
  );
}

export function TapButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary min-w-[140px] flex-1 select-none px-6 py-4 text-base active:scale-95 sm:flex-none sm:px-10"
    >
      {children}
    </button>
  );
}
