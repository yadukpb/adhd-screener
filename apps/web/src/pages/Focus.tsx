import { useEffect, useRef, useState } from "react";
import { practiceApi, type PracticeEntry } from "../lib/api";

type Phase = "setup" | "running" | "reflect";

const EXERCISE_ID = "externalized-focus-blocks";
const DURATIONS = [10, 15, 25, 45];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function Focus() {
  const [sessions, setSessions] = useState<PracticeEntry[] | null>(null);
  const [taskName, setTaskName] = useState("");
  const [doneLooksLike, setDoneLooksLike] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [phase, setPhase] = useState<Phase>("setup");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    practiceApi.list(EXERCISE_ID).then(setSessions).catch(() => setSessions([]));
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
      exerciseId: EXERCISE_ID,
      taskName,
      doneLooksLike,
      durationMinutes,
      completedFocusBlock: secondsLeft === 0,
      stayedOnTask,
    });
    setSessions((prev) => [entry, ...(prev ?? [])]);
    setPhase("setup");
    setTaskName("");
    setDoneLooksLike("");
  }

  const todayCount = sessions?.filter((s) => isToday(s.createdAt)).length ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-heading">Focus Timer</h1>
      <p className="mt-1 text-sm text-subtle">
        A visible countdown to help you start and stay on one thing -- solo, not a live shared room. Every session gets
        logged so you can see how many you've actually completed, not just intended.
      </p>
      {sessions !== null && (
        <p className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-300">
          {todayCount} focus block{todayCount === 1 ? "" : "s"} today &middot; {sessions.length} all time
        </p>
      )}

      <div className="glass-card mt-6 p-6 text-center sm:p-8">
        {phase === "setup" && (
          <div className="mx-auto max-w-sm space-y-3 text-left">
            <input
              className="input-field"
              placeholder="What task are you focusing on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="What does 'done' look like for this block? (optional)"
              value={doneLooksLike}
              onChange={(e) => setDoneLooksLike(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-subtle">Minutes:</label>
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    durationMinutes === m ? "bg-brand-500 text-white" : "bg-inset text-body hover-inset"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button className="btn-primary w-full" disabled={!taskName.trim()} onClick={start}>
              Start timer
            </button>
          </div>
        )}

        {phase === "running" && (
          <div>
            <p className="text-sm text-subtle">{taskName}</p>
            <p className="mt-2 font-mono text-7xl font-bold text-heading">{formatTime(secondsLeft)}</p>
            <button className="btn-secondary mt-6 px-5 py-2.5" onClick={stopEarly}>
              Stop early
            </button>
          </div>
        )}

        {phase === "reflect" && (
          <div>
            <p className="text-body">{secondsLeft === 0 ? "Block complete! " : ""}Did you stay on task?</p>
            <div className="mt-4 flex justify-center gap-3">
              <button className="btn-primary px-5 py-2.5" onClick={() => reflect(true)}>
                Mostly yes
              </button>
              <button className="btn-secondary px-5 py-2.5" onClick={() => reflect(false)}>
                Drifted a lot
              </button>
            </div>
          </div>
        )}
      </div>

      {sessions && sessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-heading">Past sessions</h2>
          <div className="glass-card mt-3 divide-y divide-faint">
            {sessions.slice(0, 20).map((s) => (
              <div key={s._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-body">{s.taskName}</p>
                  <p className="text-xs text-faint">
                    {new Date(s.createdAt).toLocaleString()} &middot; {s.durationMinutes} min
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.stayedOnTask ? "badge-typical" : "badge-mild"
                  }`}
                >
                  {s.stayedOnTask ? "Stayed on task" : "Drifted"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
