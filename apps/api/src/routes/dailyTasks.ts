import { Router } from "express";
import { DailyTaskModel, TASK_COLORS } from "../models/DailyTask";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const dailyTasksRouter = Router();
dailyTasksRouter.use(requireAuth);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

dailyTasksRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const { date } = req.query as { date?: string };
    if (!date || !DATE_RE.test(date)) {
      res.status(400).json({ error: "date query param required, as YYYY-MM-DD" });
      return;
    }
    const tasks = await DailyTaskModel.find({ user: req.userId, date }).sort({ createdAt: 1 }).lean();
    // Mongo sorts a missing `time` field before any string value, which
    // pushes untimed tasks to the top -- sort in JS instead so untimed
    // tasks land at the end, matching how the client re-sorts after adding
    // one locally (same "99:99" fallback), so order doesn't shift between
    // an initial load and a same-session add.
    tasks.sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
    res.json(tasks);
  }),
);

dailyTasksRouter.post(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const body = req.body as { title?: string; date?: string; time?: string; color?: string };
    if (!body.title || !body.title.trim()) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    if (!body.date || !DATE_RE.test(body.date)) {
      res.status(400).json({ error: "date is required, as YYYY-MM-DD" });
      return;
    }
    if (body.time && !TIME_RE.test(body.time)) {
      res.status(400).json({ error: "time must be HH:MM" });
      return;
    }
    if (body.color && !TASK_COLORS.includes(body.color as (typeof TASK_COLORS)[number])) {
      res.status(400).json({ error: "color must be one of " + TASK_COLORS.join(", ") });
      return;
    }
    const task = await DailyTaskModel.create({
      user: req.userId,
      title: body.title.trim(),
      date: body.date,
      time: body.time || undefined,
      color: body.color || "blue",
    });
    res.status(201).json(task);
  }),
);

dailyTasksRouter.patch(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const task = await DailyTaskModel.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      res.status(404).json({ error: "No such task" });
      return;
    }
    const body = req.body as { title?: string; time?: string | null; color?: string; done?: boolean };
    if (body.title !== undefined) {
      if (!body.title.trim()) {
        res.status(400).json({ error: "title can't be empty" });
        return;
      }
      task.title = body.title.trim();
    }
    if (body.time !== undefined) {
      if (body.time !== null && !TIME_RE.test(body.time)) {
        res.status(400).json({ error: "time must be HH:MM" });
        return;
      }
      task.time = body.time ?? undefined;
    }
    if (body.color !== undefined) {
      if (!TASK_COLORS.includes(body.color as (typeof TASK_COLORS)[number])) {
        res.status(400).json({ error: "color must be one of " + TASK_COLORS.join(", ") });
        return;
      }
      task.color = body.color as (typeof TASK_COLORS)[number];
    }
    if (body.done !== undefined) task.done = body.done;
    await task.save();
    res.json(task);
  }),
);

dailyTasksRouter.delete(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const { deletedCount } = await DailyTaskModel.deleteOne({ _id: req.params.id, user: req.userId });
    if (deletedCount === 0) {
      res.status(404).json({ error: "No such task" });
      return;
    }
    res.status(204).end();
  }),
);
