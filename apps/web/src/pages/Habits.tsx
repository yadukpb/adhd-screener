import { useEffect, useState } from "react";
import { habitLogApi, ApiError, type HabitLogEntry } from "../lib/api";
import { todayKey } from "../lib/date";

const MOOD_COLORS = ["bg-rose-400", "bg-orange-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"];
const MOOD_LABELS = ["Rough", "Hard", "Okay", "Good", "Great"];

export function Habits() {
  const [entries, setEntries] = useState<HabitLogEntry[] | null>(null);
  const [streak, setStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = todayKey();
  const todayEntry = entries?.find((e) => e.date === today);

  const [mood, setMood] = useState<number | undefined>(undefined);
  const [medicationTaken, setMedicationTaken] = useState<boolean | undefined>(undefined);
  const [sleepHours, setSleepHours] = useState("");

  useEffect(() => {
    habitLogApi
      .range(30)
      .then(({ entries, streak }) => {
        setEntries(entries);
        setStreak(streak);
        const mine = entries.find((e) => e.date === today);
        if (mine) {
          setMood(mine.mood);
          setMedicationTaken(mine.medicationTaken);
          setSleepHours(mine.sleepHours !== undefined ? String(mine.sleepHours) : "");
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load your log"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(patch: { mood?: number; medicationTaken?: boolean; sleepHours?: number }) {
    setSaving(true);
    setError(null);
    try {
      const updated = await habitLogApi.save(patch);
      setEntries((prev) => {
        const rest = (prev ?? []).filter((e) => e.date !== today);
        return [...rest, updated].sort((a, b) => a.date.localeCompare(b.date));
      });
      if (!todayEntry) setStreak((s) => s + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save that");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-heading">Daily Check-in</h1>
      <p className="mt-1 text-sm text-subtle">A quick daily log -- mood, medication, sleep. Nothing here is required.</p>
      {entries !== null && (
        <p className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-300">
          {streak > 0 ? `${streak} day streak` : "No active streak -- today's your chance to start one"}
        </p>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-300">{error}</p>}

      <div className="glass-card mt-6 space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-sm font-medium text-heading">How's today going?</p>
          <div className="mt-2 flex gap-2">
            {MOOD_COLORS.map((cls, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setMood(value);
                    save({ mood: value });
                  }}
                  title={MOOD_LABELS[i]}
                  className={`h-10 w-10 rounded-full ${cls} transition ${
                    mood === value ? "ring-2 ring-offset-2 ring-offset-white ring-brand-500 dark:ring-offset-slate-950" : "opacity-60 hover:opacity-100"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="border-t border-faint pt-5">
          <p className="text-sm font-medium text-heading">Medication</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setMedicationTaken(true);
                save({ medicationTaken: true });
              }}
              className={`rounded-lg px-4 py-1.5 text-sm transition ${medicationTaken === true ? "bg-brand-500 text-white" : "bg-inset text-body hover-inset"}`}
            >
              Took it
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setMedicationTaken(false);
                save({ medicationTaken: false });
              }}
              className={`rounded-lg px-4 py-1.5 text-sm transition ${medicationTaken === false ? "bg-brand-500 text-white" : "bg-inset text-body hover-inset"}`}
            >
              Didn't take it
            </button>
          </div>
        </div>

        <div className="border-t border-faint pt-5">
          <label className="text-sm font-medium text-heading" htmlFor="sleep-hours">
            Hours of sleep last night
          </label>
          <input
            id="sleep-hours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={sleepHours}
            disabled={saving}
            onChange={(e) => setSleepHours(e.target.value)}
            onBlur={() => {
              const n = Number(sleepHours);
              if (sleepHours !== "" && !Number.isNaN(n)) save({ sleepHours: n });
            }}
            className="input-field mt-2 max-w-[8rem]"
          />
        </div>
      </div>

      {entries && entries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-heading">Last 30 days</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entries.map((e) => (
              <div
                key={e.date}
                title={`${e.date}${e.mood ? ` -- ${MOOD_LABELS[e.mood - 1]}` : ""}`}
                className={`h-6 w-6 rounded ${e.mood ? MOOD_COLORS[e.mood - 1] : "bg-inset"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
