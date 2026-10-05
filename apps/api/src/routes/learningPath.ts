import { Router } from "express";
import { LearningPathModel } from "../models/LearningPath";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const learningPathRouter = Router();
learningPathRouter.use(requireAuth);

learningPathRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const path = await LearningPathModel.findOne({ user: req.userId }).lean();
    // No screening completed yet -- an empty path, not an error; the
    // frontend shows "take a screening first" rather than a failure state.
    res.json(path ?? { steps: [] });
  }),
);

learningPathRouter.patch(
  "/steps/:key",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const { status } = req.body as { status?: "pending" | "done" };
    if (status !== "pending" && status !== "done") {
      res.status(400).json({ error: "status must be 'pending' or 'done'" });
      return;
    }

    const path = await LearningPathModel.findOne({ user: req.userId });
    if (!path) {
      res.status(404).json({ error: "No learning path yet -- complete a screening first" });
      return;
    }

    const step = path.steps.find((s) => s.key === req.params.key);
    if (!step) {
      res.status(404).json({ error: "No such step on your current path" });
      return;
    }

    step.status = status;
    step.completedAt = status === "done" ? new Date() : undefined;
    await path.save();

    res.json(path);
  }),
);
