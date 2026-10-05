import { Router } from "express";
import { PracticeEntryModel } from "../models/PracticeEntry";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const practiceRouter = Router();
practiceRouter.use(requireAuth);

const KNOWN_EXERCISE_IDS = [
  "pause-plan",
  "externalized-focus-blocks",
  "chunk-and-externalize",
  "break-it-down",
  "time-estimation-trainer",
  "mindful-pause",
  "thought-record",
];

practiceRouter.post(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const { exerciseId, ...rest } = req.body as { exerciseId?: string; [k: string]: unknown };
    if (!exerciseId || !KNOWN_EXERCISE_IDS.includes(exerciseId)) {
      res.status(400).json({ error: "exerciseId must be one of " + KNOWN_EXERCISE_IDS.join(", ") });
      return;
    }
    const entry = await PracticeEntryModel.create({ user: req.userId, exerciseId, ...rest });
    res.status(201).json(entry);
  }),
);

practiceRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const { exerciseId } = req.query as { exerciseId?: string };
    const filter: Record<string, unknown> = { user: req.userId };
    if (exerciseId) filter.exerciseId = exerciseId;
    const entries = await PracticeEntryModel.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    res.json(entries);
  }),
);

practiceRouter.patch(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const entry = await PracticeEntryModel.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) {
      res.status(404).json({ error: "No such practice entry" });
      return;
    }
    // Scoped, explicit field allow-list -- not a blind Object.assign of the
    // request body into the document.
    const patch = req.body as Record<string, unknown>;
    const allowed = ["used", "completedFocusBlock", "stayedOnTask", "chunks", "nextAction", "completedActions", "taskComplete"];
    for (const key of allowed) {
      if (key in patch) (entry as unknown as Record<string, unknown>)[key] = patch[key];
    }
    await entry.save();
    res.json(entry);
  }),
);
