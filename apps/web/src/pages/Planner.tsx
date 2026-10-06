import { useEffect, useState } from "react";
import { dailyTasksApi, ApiError, type DailyTask, type TaskColor } from "../lib/api";
import { toDateKey, todayKey } from "../lib/date";

const COLOR_STYLES: Record<TaskColor, { border: string; dot: string; ring: string }> = {
  blue: { border: "border-sky-400", dot: "bg-sky-400", ring: "ring-sky-400" },
  green: { border: "border-emerald-400", dot: "bg-emerald-400", ring: "ring-emerald-400" },
  purple: { border: "border-purple-400", dot: "bg-purple-400", ring: "ring-purple-400" },
  amber: { border: "border-amber-400", dot: "bg-amber-400", ring: "ring-amber-400" },
  rose: { border: "border-rose-400", dot: "bg-rose-400", ring: "ring-rose-400" },
};
const COLORS: TaskColor[] = ["blue", "green", "purple", "amber", "rose"];

function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(key: string, delta: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function Planner() {
  const today = todayKey();
  const [dateKey, setDateKey] = useState(today);
  const [tasks, setTasks] = useState<DailyTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [color, setColor] = useState<TaskColor>("blue");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setTasks(null);
    dailyTasksApi
      .list(dateKey)
      .then(setTasks)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this day's tasks"));
  }, [dateKey]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || adding) return;
    setAdding(true);
    setError(null);
    try {
      const created = await dailyTasksApi.create({ title: title.trim(), date: dateKey, time: time || undefined, color });
      setTasks((prev) => [...(prev ?? []), created].sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99")));
      setTitle("");
      setTime("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add that task");
    } finally {
      setAdding(false);
    }
  }

  async function toggleDone(task: DailyTask) {
    setTasks((prev) => prev?.map((t) => (t._id === task._id ? { ...t, done: !t.done } : t)) ?? null);
    try {
      await dailyTasksApi.update(task._id, { done: !task.done });
    } catch {
      setTasks((prev) => prev?.map((t) => (t._id === task._id ? { ...t, done: task.done } : t)) ?? null);
    }
  }

  async function removeTask(id: string) {
    const prev = tasks;
    setTasks((cur) => cur?.filter((t) => t._id !== id) ?? null);
    try {
      await dailyTasksApi.remove(id);
    } catch {
      setTasks(prev ?? null);
    }
  }

  const dayLabel = fromDateKey(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-heading">Planner</h1>
      <p className="mt-1 text-sm text-subtle">A simple, color-coded day plan -- visible structure instead of holding it all in your head.</p>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setDateKey((d) => addDays(d, -1))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-subtle text-subtle transition hover-inset hover:text-heading"
          aria-label="Previous day"
        >
          &larr;
        </button>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-heading">{dayLabel}</span>
          {dateKey !== today && (
            <button type="button" onClick={() => setDateKey(today)} className="text-xs text-brand-600 hover:underline dark:text-brand-300">
              Back to today
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDateKey((d) => addDays(d, 1))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-subtle text-subtle transition hover-inset hover:text-heading"
          aria-label="Next day"
        >
          &rarr;
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-300">{error}</p>
      )}

      <form onSubmit={addTask} className="glass-card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add something for this day..."
          disabled={adding}
          className="min-w-0 flex-1 rounded-xl border border-subtle bg-inset px-4 py-2.5 text-sm text-body outline-none transition focus:border-brand-400"
        />
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={adding}
            className="rounded-xl border border-subtle bg-inset px-3 py-2.5 text-sm text-body outline-none transition focus:border-brand-400"
          />
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color: ${c}`}
                className={`h-6 w-6 shrink-0 rounded-full ${COLOR_STYLES[c].dot} ${color === c ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 ${COLOR_STYLES[c].ring}` : ""}`}
              />
            ))}
          </div>
          <button type="submit" disabled={adding || !title.trim()} className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-50">
            Add
          </button>
        </div>
      </form>

      <div className="mt-6">
        {tasks === null && <p className="text-center text-subtle">Loading...</p>}
        {tasks && tasks.length === 0 && (
          <div className="glass-card p-8 text-center text-subtle">Nothing planned for this day yet.</div>
        )}
        {tasks && tasks.length > 0 && (
          <div className="glass-card divide-y divide-faint">
            {tasks.map((t) => (
              <div key={t._id} className={`flex items-center gap-3 border-l-4 px-4 py-3 ${COLOR_STYLES[t.color].border}`}>
                <button
                  type="button"
                  onClick={() => toggleDone(t)}
                  aria-label={t.done ? "Mark as not done" : "Mark as done"}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                    t.done ? "border-brand-500 bg-brand-500 text-white" : "border-subtle text-transparent"
                  }`}
                >
                  &#10003;
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${t.done ? "text-faint line-through" : "text-body"}`}>{t.title}</p>
                  {t.time && <p className="text-xs text-faint">{formatTime12h(t.time)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(t._id)}
                  aria-label="Remove task"
                  className="shrink-0 px-2 py-1 text-xs text-faint transition hover:text-rose-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
