import { useEffect, useRef, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

const DURATION_SECONDS = 60;
const BREATH_CYCLE_SECONDS = 4;

type Phase = "setup" | "running" | "reflect";

export function MindfulPauseTool() {
  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [note, setNote] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    practiceApi.list("mindful-pause").then(setEntries).catch(() => setEntries([]));
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
    setSecondsLeft(DURATION_SECONDS);
    setPhase("running");
  }

  async function finish(noticedUrge: boolean) {
    const entry = await practiceApi.create({ exerciseId: "mindful-pause", durationSeconds: DURATION_SECONDS, noticedUrge, note: note.trim() || undefined });
    setEntries((prev) => [entry, ...prev]);
    setNote("");
    setPhase("setup");
  }

  const breathingIn = Math.floor((DURATION_SECONDS - secondsLeft) / BREATH_CYCLE_SECONDS) % 2 === 0;

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>

      {phase === "setup" && (
        <div className="mt-2 text-center">
          <p className="text-sm text-body">A 1-minute guided pause. Find a quiet moment, then start.</p>
          <button className="btn-primary mt-2 px-4 py-1.5 text-sm" onClick={start}>
            Start 1-minute pause
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="mt-3 text-center">
          <p className="font-mono text-3xl font-bold text-heading">{secondsLeft}s</p>
          <p className="mt-2 text-lg text-brand-600 transition-opacity dark:text-brand-300">
            {breathingIn ? "Breathe in..." : "Breathe out..."}
          </p>
          <p className="mt-2 text-xs text-faint">If a thought or urge shows up, just notice it, then come back to your breath.</p>
        </div>
      )}

      {phase === "reflect" && (
        <div className="mt-3">
          <p className="text-center text-sm text-body">Did you notice an urge or a distraction during that minute?</p>
          <input
            className="input-field mt-2 py-1.5 text-sm"
            placeholder="What happened? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-2 flex justify-center gap-2">
            <button className="btn-primary px-4 py-1.5 text-sm" onClick={() => finish(true)}>
              Yes, I noticed one
            </button>
            <button className="btn-secondary px-4 py-1.5 text-sm" onClick={() => finish(false)}>
              Not really
            </button>
          </div>
        </div>
      )}

      {entries.length > 0 && phase === "setup" && (
        <p className="mt-4 border-t border-faint pt-3 text-xs text-faint">
          {entries.length} pause{entries.length === 1 ? "" : "s"} completed, {entries.filter((e) => e.noticedUrge).length} where
          you caught yourself noticing an urge.
        </p>
      )}
    </div>
  );
}
