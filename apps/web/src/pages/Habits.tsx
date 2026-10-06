import { useEffect, useMemo, useState } from "react";
import { habitLogApi, ApiError, type HabitLogEntry } from "../lib/api";
import { todayKey } from "../lib/date";
import { useAuth } from "../hooks/useAuth";
import { SoothingSounds } from "../components/SoothingSounds";

const MOOD_COLORS = ["bg-rose-400", "bg-orange-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"];
const MOOD_LABELS = ["Rough", "Hard", "Okay", "Good", "Great"];

/**
 * The point of this isn't "notice the pattern yourself" -- the whole value
 * of a check-in for ADHD is externalizing self-monitoring that's hard to do
 * internally (see /about-adhd#emotional-regulation and the Barkley
 * citations there on self-regulation). So the app does the noticing and
 * just states it plainly, not as a diagnosis -- a correlation in someone's
 * own data, nothing more.
 */
function sleepMoodInsight(entries: HabitLogEntry[]): string | null {
  const withBoth = entries.filter((e) => e.mood !== undefined && e.sleepHours !== undefined);
  const low = withBoth.filter((e) => e.sleepHours! < 6);
  const higher = withBoth.filter((e) => e.sleepHours! >= 6);
  if (low.length < 3 || higher.length < 3) return null;
  const avg = (arr: HabitLogEntry[]) => arr.reduce((s, e) => s + e.mood!, 0) / arr.length;
  const avgLow = avg(low);
  const avgHigh = avg(higher);
  if (avgHigh - avgLow < 0.6) return null;
  return `I'm noticing something in your own numbers: on nights with under 6 hours of sleep, your mood averages ${avgLow.toFixed(1)}/5 -- on better-rested nights it's ${avgHigh.toFixed(1)}/5. Not medical advice, just a pattern in your own data that might be worth knowing.`;
}

function medicationMoodInsight(entries: HabitLogEntry[]): string | null {
  const withBoth = entries.filter((e) => e.mood !== undefined && e.medicationTaken !== undefined);
  const took = withBoth.filter((e) => e.medicationTaken);
  const skipped = withBoth.filter((e) => !e.medicationTaken);
  if (took.length < 3 || skipped.length < 3) return null;
  const avg = (arr: HabitLogEntry[]) => arr.reduce((s, e) => s + e.mood!, 0) / arr.length;
  const avgTook = avg(took);
  const avgSkipped = avg(skipped);
  if (Math.abs(avgTook - avgSkipped) < 0.6) return null;
  return `Another pattern in your own numbers: your average mood is ${avgTook.toFixed(1)}/5 on days you took medication vs ${avgSkipped.toFixed(1)}/5 on days you didn't. Not medical advice -- just something you might want to mention if you talk to a clinician.`;
}

export function Habits() {
  const { user, setMedicationTracking } = useAuth();
  const [entries, setEntries] = useState<HabitLogEntry[] | null>(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefSaving, setPrefSaving] = useState(false);

  const today = todayKey();
  const todayEntry = entries?.find((e) => e.date === today);

  const [mood, setMood] = useState<number | undefined>(undefined);
  const [medicationTaken, setMedicationTaken] = useState<boolean | undefined>(undefined);
  const [sleepHours, setSleepHours] = useState("");

  useEffect(() => {
    habitLogApi
      .range(30)
      .then(({ entries, streak, longestStreak, totalDays }) => {
        setEntries(entries);
        setStreak(streak);
        setLongestStreak(longestStreak);
        setTotalDays(totalDays);
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

  const insight = useMemo(() => {
    if (!entries) return null;
    return sleepMoodInsight(entries) ?? (user?.medicationTracking === "on" ? medicationMoodInsight(entries) : null);
  }, [entries, user?.medicationTracking]);

  async function save(patch: { mood?: number; medicationTaken?: boolean; sleepHours?: number }) {
    setSaving(true);
    setError(null);
    try {
      const updated = await habitLogApi.save(patch);
      setEntries((prev) => {
        const rest = (prev ?? []).filter((e) => e.date !== today);
        return [...rest, updated].sort((a, b) => a.date.localeCompare(b.date));
      });
      if (!todayEntry) {
        setStreak((s) => s + 1);
        setTotalDays((d) => d + 1);
        setLongestStreak((best) => Math.max(best, streak + 1));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save that");
    } finally {
      setSaving(false);
    }
  }

  async function chooseMedicationTracking(value: "on" | "off") {
    setPrefSaving(true);
    try {
      await setMedicationTracking(value);
    } catch {
      /* harmless to retry later -- the prompt just stays visible */
    } finally {
      setPrefSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-heading">Daily Check-in</h1>
      <p className="mt-1 text-sm text-subtle">A quick daily log -- mood, sleep, and medication if that's relevant to you. Nothing here is required, and missing a day doesn't erase anything.</p>

      {entries !== null && totalDays > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {streak > 0 && (
            <p className="font-medium text-brand-600 dark:text-brand-300">{streak}-day streak</p>
          )}
          <p className="text-subtle">
            Best: <span className="font-medium text-body">{longestStreak} day{longestStreak === 1 ? "" : "s"}</span>
          </p>
          <p className="text-subtle">
            <span className="font-medium text-body">{totalDays}</span> check-in{totalDays === 1 ? "" : "s"} total
          </p>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-300">{error}</p>}

      {insight && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-400/20 dark:bg-brand-400/10 dark:text-brand-200">
          {insight}
        </div>
      )}

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

        <div className="border-t border-faint pt-5">
          {user?.medicationTracking === "unset" && (
            <div className="rounded-xl bg-inset p-4">
              <p className="text-sm font-medium text-heading">Want to track medication here too?</p>
              <p className="mt-1 text-xs text-subtle">Not everyone takes medication for this -- only turn it on if it's relevant to you. You can change this later.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={prefSaving}
                  onClick={() => chooseMedicationTracking("on")}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Yes, track it
                </button>
                <button
                  type="button"
                  disabled={prefSaving}
                  onClick={() => chooseMedicationTracking("off")}
                  className="px-3 py-1.5 text-xs text-faint transition hover:text-body disabled:opacity-50"
                >
                  No, skip this
                </button>
              </div>
            </div>
          )}

          {user?.medicationTracking === "on" && (
            <>
              <p className="text-sm font-medium text-heading">Medication</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
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
                <button
                  type="button"
                  disabled={prefSaving}
                  onClick={() => chooseMedicationTracking("off")}
                  className="ml-auto text-xs text-faint transition hover:text-body disabled:opacity-50"
                >
                  Turn off
                </button>
              </div>
            </>
          )}

          {user?.medicationTracking === "off" && (
            <button
              type="button"
              disabled={prefSaving}
              onClick={() => chooseMedicationTracking("on")}
              className="text-xs text-faint transition hover:text-body disabled:opacity-50"
            >
              Want to track medication too? Turn it on
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <SoothingSounds />
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
