import { useEffect, useState } from "react";
import { dailyTasksApi, ApiError, type DailyTask, type TaskColor } from "../lib/api";
import { toDateKey, todayKey } from "../lib/date";

const COLOR_STYLES: Record<TaskColor, { border: string; dot: string; ring: string; bg: string }> = {
  blue: { border: "border-sky-400", dot: "bg-sky-400", ring: "ring-sky-400", bg: "bg-sky-500/10" },
  green: { border: "border-emerald-400", dot: "bg-emerald-400", ring: "ring-emerald-400", bg: "bg-emerald-500/10" },
  purple: { border: "border-purple-400", dot: "bg-purple-400", ring: "ring-purple-400", bg: "bg-purple-500/10" },
  amber: { border: "border-amber-400", dot: "bg-amber-400", ring: "ring-amber-400", bg: "bg-amber-500/10" },
  rose: { border: "border-rose-400", dot: "bg-rose-400", ring: "ring-rose-400", bg: "bg-rose-500/10" },
};
const COLORS: TaskColor[] = ["blue", "green", "purple", "amber", "rose"];

// Timeline shows this window of hours as rows; tasks outside it (very early
// morning, late night) still show, just in a separate "Other times" list
// below the grid rather than being silently hidden.
const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 23;

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

function formatHour12(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${period}`;
}

interface TaskRowProps {
  task: DailyTask;
  onToggleDone: (task: DailyTask) => void;
  onRemove: (id: string) => void;
  onSave: (id: string, patch: { title: string; time: string; color: TaskColor }) => Promise<void>;
  compact?: boolean;
}

function TaskRow({ task, onToggleDone, onRemove, onSave, compact }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time ?? "");
  const [color, setColor] = useState<TaskColor>(task.color);
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setTitle(task.title);
    setTime(task.time ?? "");
    setColor(task.color);
    setEditing(true);
  }

  async function save() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(task._id, { title: title.trim(), time, color });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className={`space-y-2 border-l-4 p-3 ${COLOR_STYLES[color].border} ${COLOR_STYLES[color].bg} rounded-r-lg`}>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="w-full rounded-lg border border-subtle bg-white px-2.5 py-1.5 text-sm text-body outline-none focus:border-brand-400 dark:bg-slate-900"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-subtle bg-white px-2 py-1 text-xs text-body outline-none focus:border-brand-400 dark:bg-slate-900"
          />
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color: ${c}`}
                className={`h-5 w-5 shrink-0 rounded-full ${COLOR_STYLES[c].dot} ${color === c ? `ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-950 ${COLOR_STYLES[c].ring}` : ""}`}
              />
            ))}
          </div>
          <button type="button" onClick={save} disabled={saving || !title.trim()} className="btn-primary ml-auto px-3 py-1 text-xs disabled:opacity-50">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary px-3 py-1 text-xs">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-3 border-l-4 ${COLOR_STYLES[task.color].border} ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <button
        type="button"
        onClick={() => onToggleDone(task)}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
          task.done ? "border-brand-500 bg-brand-500 text-white" : "border-subtle text-transparent"
        }`}
      >
        &#10003;
      </button>
      <button type="button" onClick={startEdit} className="min-w-0 flex-1 text-left">
        <p className={`truncate text-sm ${task.done ? "text-faint line-through" : "text-body"}`}>{task.title}</p>
        {task.time && !compact && <p className="text-xs text-faint">{formatTime12h(task.time)}</p>}
      </button>
      <button
        type="button"
        onClick={() => onRemove(task._id)}
        aria-label="Remove task"
        className="shrink-0 px-2 py-1 text-xs text-faint opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
      >
        Remove
      </button>
    </div>
  );
}

export function Planner() {
  const today = todayKey();
  const [dateKey, setDateKey] = useState(today);
  const [tasks, setTasks] = useState<DailyTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "list">("timeline");

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

  async function saveEdit(id: string, patch: { title: string; time: string; color: TaskColor }) {
    const prev = tasks;
    const updatePayload: Parameters<typeof dailyTasksApi.update>[1] = { title: patch.title, color: patch.color };
    if (patch.time) updatePayload.time = patch.time;
    try {
      const updated = await dailyTasksApi.update(id, updatePayload);
      setTasks((cur) => cur?.map((t) => (t._id === id ? updated : t)).sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99")) ?? null);
    } catch (err) {
      setTasks(prev ?? null);
      setError(err instanceof ApiError ? err.message : "Could not save that change");
    }
  }

  const dayLabel = fromDateKey(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const isToday = dateKey === today;
  const currentHour = new Date().getHours();

  const untimedTasks = tasks?.filter((t) => !t.time) ?? [];
  const timedTasks = tasks?.filter((t) => t.time) ?? [];
  const inWindow = (hour: number) => hour >= TIMELINE_START_HOUR && hour <= TIMELINE_END_HOUR;
  const outsideWindowTasks = timedTasks.filter((t) => !inWindow(Number(t.time!.split(":")[0])));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">Planner</h1>
          <p className="mt-1 text-sm text-subtle">A visual day plan -- see your day instead of holding it all in your head.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-inset p-1">
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${view === "timeline" ? "bg-white text-heading shadow-sm dark:bg-slate-800" : "text-subtle"}`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${view === "list" ? "bg-white text-heading shadow-sm dark:bg-slate-800" : "text-subtle"}`}
          >
            List
          </button>
        </div>
      </div>

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
          {!isToday && (
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

        {tasks && tasks.length > 0 && view === "list" && (
          <div className="glass-card divide-y divide-faint">
            {tasks.map((t) => (
              <TaskRow key={t._id} task={t} onToggleDone={toggleDone} onRemove={removeTask} onSave={saveEdit} />
            ))}
          </div>
        )}

        {tasks && tasks.length > 0 && view === "timeline" && (
          <div className="space-y-4">
            {untimedTasks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Anytime</p>
                <div className="glass-card divide-y divide-faint">
                  {untimedTasks.map((t) => (
                    <TaskRow key={t._id} task={t} onToggleDone={toggleDone} onRemove={removeTask} onSave={saveEdit} compact />
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card divide-y divide-faint overflow-hidden">
              {Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }, (_, i) => TIMELINE_START_HOUR + i).map((hour) => {
                const hourTasks = timedTasks.filter((t) => Number(t.time!.split(":")[0]) === hour);
                const isNow = isToday && hour === currentHour;
                return (
                  <div key={hour} className={`flex gap-3 px-3 py-2 ${isNow ? "bg-brand-500/5" : ""}`}>
                    <div className="w-14 shrink-0 pt-1.5 text-right text-xs text-faint">
                      {formatHour12(hour)}
                      {isNow && <span className="mt-0.5 block text-[10px] font-semibold text-brand-600 dark:text-brand-300">Now</span>}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                      {hourTasks.length === 0 ? (
                        <div className="h-7" />
                      ) : (
                        hourTasks.map((t) => (
                          <div key={t._id} className="rounded-lg">
                            <TaskRow task={t} onToggleDone={toggleDone} onRemove={removeTask} onSave={saveEdit} compact />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {outsideWindowTasks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                  Other times (before {formatHour12(TIMELINE_START_HOUR)} / after {formatHour12(TIMELINE_END_HOUR)})
                </p>
                <div className="glass-card divide-y divide-faint">
                  {outsideWindowTasks.map((t) => (
                    <TaskRow key={t._id} task={t} onToggleDone={toggleDone} onRemove={removeTask} onSave={saveEdit} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
