import { Router } from "express";
import { HabitLogModel } from "../models/HabitLog";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const habitLogRouter = Router();
habitLogRouter.use(requireAuth);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Most recent run of consecutive days (ending today or yesterday -- missing today doesn't zero out a streak until tomorrow) that have a logged entry. */
function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  let cursor = new Date();
  if (!set.has(todayKey())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  for (;;) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!set.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Longest run of consecutive calendar days anywhere in their history, not
 * just one ending today -- a broken streak shouldn't erase the record of a
 * good one. Dates are "YYYY-MM-DD" strings, which sort lexicographically.
 */
function computeLongestStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  if (sorted.length === 0) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const dayGap = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    run = dayGap === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return longest;
}

habitLogRouter.get(
  "/range",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const days = Math.min(Number(req.query.days) || 30, 90);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceKey = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, "0")}-${String(since.getDate()).padStart(2, "0")}`;

    const [entries, allDates] = await Promise.all([
      HabitLogModel.find({ user: req.userId, date: { $gte: sinceKey } })
        .sort({ date: 1 })
        .lean(),
      // Separate, lightweight (date field only) all-time query -- longest
      // streak and total-days-logged are "personal best" stats that
      // shouldn't be clipped to whatever window the calendar view asked for.
      HabitLogModel.find({ user: req.userId }, { date: 1, _id: 0 }).lean(),
    ]);
    const allDateStrings = allDates.map((d) => d.date);
    const streak = computeStreak(entries.map((e) => e.date));
    const longestStreak = computeLongestStreak(allDateStrings);
    res.json({ entries, streak, longestStreak, totalDays: allDateStrings.length });
  }),
);

habitLogRouter.put(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const body = req.body as { date?: string; medicationTaken?: boolean; mood?: number; sleepHours?: number; note?: string };
    const date = body.date ?? todayKey();
    if (!DATE_RE.test(date)) {
      res.status(400).json({ error: "date must be YYYY-MM-DD" });
      return;
    }
    if (body.mood !== undefined && (body.mood < 1 || body.mood > 5)) {
      res.status(400).json({ error: "mood must be 1-5" });
      return;
    }
    if (body.sleepHours !== undefined && (body.sleepHours < 0 || body.sleepHours > 24)) {
      res.status(400).json({ error: "sleepHours must be 0-24" });
      return;
    }

    const update: Record<string, unknown> = {};
    if (body.medicationTaken !== undefined) update.medicationTaken = body.medicationTaken;
    if (body.mood !== undefined) update.mood = body.mood;
    if (body.sleepHours !== undefined) update.sleepHours = body.sleepHours;
    if (body.note !== undefined) update.note = body.note;

    const entry = await HabitLogModel.findOneAndUpdate(
      { user: req.userId, date },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    res.json(entry);
  }),
);
