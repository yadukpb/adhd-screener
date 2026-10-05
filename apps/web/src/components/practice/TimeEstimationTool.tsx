import { useEffect, useRef, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

type Phase = "setup" | "running" | "result";

export function TimeEstimationTool() {
  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [taskName, setTaskName] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [phase, setPhase] = useState<Phase>("setup");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActualSeconds, setLastActualSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    practiceApi.list("time-estimation-trainer").then(setEntries).catch(() => setEntries([]));
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  function start() {
    const est = Number(estimatedMinutes);
    if (!taskName.trim() || !est || est <= 0) return;
    setElapsedSeconds(0);
    setPhase("running");
  }

  async function finish() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const est = Number(estimatedMinutes);
    const entry = await practiceApi.create({
      exerciseId: "time-estimation-trainer",
      taskName,
      estimatedMinutes: est,
      actualSeconds: elapsedSeconds,
    });
    setEntries((prev) => [entry, ...prev]);
    setLastActualSeconds(elapsedSeconds);
    setPhase("result");
  }

  function reset() {
    setPhase("setup");
    setTaskName("");
    setEstimatedMinutes("");
  }

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>

      {phase === "setup" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            className="input-field flex-1 py-1.5 text-sm"
            placeholder="What are you about to do?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            className="input-field w-28 py-1.5 text-sm"
            type="number"
            min={1}
            placeholder="Est. min"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
          />
          <button className="btn-primary px-4 py-1.5 text-sm" disabled={!taskName.trim() || !Number(estimatedMinutes)} onClick={start}>
            Start
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="mt-3 text-center">
          <p className="text-sm text-subtle">{taskName} -- you guessed {estimatedMinutes} min</p>
          <p className="mt-1 font-mono text-4xl font-bold text-heading">
            {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
          </p>
          <button className="btn-primary mt-3 px-4 py-1.5 text-sm" onClick={finish}>
            I'm done
          </button>
        </div>
      )}

      {phase === "result" && (
        <div className="mt-3 text-center">
          {(() => {
            const actualMin = lastActualSeconds / 60;
            const est = Number(estimatedMinutes);
            const diff = actualMin - est;
            return (
              <p className="text-sm text-body">
                You guessed <strong>{est} min</strong>, it took <strong>{actualMin.toFixed(1)} min</strong> --{" "}
                {Math.abs(diff) < 0.5 ? "almost spot on." : diff > 0 ? `${diff.toFixed(1)} min longer than expected.` : `${Math.abs(diff).toFixed(1)} min faster than expected.`}
              </p>
            );
          })()}
          <button className="btn-secondary mt-3 px-4 py-1.5 text-sm" onClick={reset}>
            Try another
          </button>
        </div>
      )}

      {entries.length >= 2 && phase === "setup" && (
        <p className="mt-4 border-t border-faint pt-3 text-xs text-faint">
          Over your last {Math.min(entries.length, 10)} estimates, you've been off by an average of{" "}
          {(
            entries.slice(0, 10).reduce((sum, e) => sum + Math.abs((e.actualSeconds ?? 0) / 60 - (e.estimatedMinutes ?? 0)), 0) /
            Math.min(entries.length, 10)
          ).toFixed(1)}{" "}
          minutes.
        </p>
      )}
    </div>
  );
}
