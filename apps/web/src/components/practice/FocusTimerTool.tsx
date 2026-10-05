import { useEffect, useRef, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

type Phase = "setup" | "running" | "reflect";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FocusTimerTool() {
  const [sessions, setSessions] = useState<PracticeEntry[]>([]);
  const [taskName, setTaskName] = useState("");
  const [doneLooksLike, setDoneLooksLike] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [phase, setPhase] = useState<Phase>("setup");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    practiceApi.list("externalized-focus-blocks").then(setSessions).catch(() => setSessions([]));
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("reflect");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  function start() {
    if (!taskName.trim()) return;
    setSecondsLeft(durationMinutes * 60);
    setPhase("running");
  }

  function stopEarly() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("reflect");
  }

  async function reflect(stayedOnTask: boolean) {
    const entry = await practiceApi.create({
      exerciseId: "externalized-focus-blocks",
      taskName,
      doneLooksLike,
      durationMinutes,
      completedFocusBlock: secondsLeft === 0,
      stayedOnTask,
    });
    setSessions((prev) => [entry, ...prev]);
    setPhase("setup");
    setTaskName("");
    setDoneLooksLike("");
  }

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>

      {phase === "setup" && (
        <div className="mt-2 space-y-2">
          <input
            className="input-field py-1.5 text-sm"
            placeholder="What task are you focusing on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            className="input-field py-1.5 text-sm"
            placeholder="What does 'done' look like for this block?"
            value={doneLooksLike}
            onChange={(e) => setDoneLooksLike(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-subtle">Minutes:</label>
            {[10, 15, 25].map((m) => (
              <button
                key={m}
                onClick={() => setDurationMinutes(m)}
                className={`rounded-lg px-3 py-1 text-sm transition ${
                  durationMinutes === m ? "bg-brand-500 text-white" : "bg-white text-body dark:bg-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button className="btn-primary px-4 py-1.5 text-sm" disabled={!taskName.trim()} onClick={start}>
            Start timer
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="mt-3 text-center">
          <p className="text-sm text-subtle">{taskName}</p>
          <p className="mt-1 font-mono text-4xl font-bold text-heading">{formatTime(secondsLeft)}</p>
          <button className="btn-secondary mt-3 px-4 py-1.5 text-sm" onClick={stopEarly}>
            Stop early
          </button>
        </div>
      )}

      {phase === "reflect" && (
        <div className="mt-3 text-center">
          <p className="text-sm text-body">{secondsLeft === 0 ? "Block complete! " : ""}Did you stay on task?</p>
          <div className="mt-2 flex justify-center gap-2">
            <button className="btn-primary px-4 py-1.5 text-sm" onClick={() => reflect(true)}>
              Mostly yes
            </button>
            <button className="btn-secondary px-4 py-1.5 text-sm" onClick={() => reflect(false)}>
              Drifted a lot
            </button>
          </div>
        </div>
      )}

      {sessions.length > 0 && phase === "setup" && (
        <p className="mt-4 border-t border-faint pt-3 text-xs text-faint">
          {sessions.length} focus block{sessions.length === 1 ? "" : "s"} logged, {sessions.filter((s) => s.stayedOnTask).length}{" "}
          where you stayed on task.
        </p>
      )}
    </div>
  );
}
