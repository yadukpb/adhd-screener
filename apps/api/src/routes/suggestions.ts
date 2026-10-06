import { Router } from "express";
import { SuggestionModel } from "../models/Suggestion";
import { requireAuth, requireAdmin, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const suggestionsRouter = Router();
suggestionsRouter.use(requireAuth);

const MAX_MESSAGE_LEN = 2000;

suggestionsRouter.post(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const message = ((req.body as { message?: string }).message ?? "").trim().slice(0, MAX_MESSAGE_LEN);
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }
    const suggestion = await SuggestionModel.create({ user: req.userId, message });
    res.status(201).json(suggestion);
  }),
);

// Admin-only from here down.
suggestionsRouter.get(
  "/",
  requireAdmin,
  asyncHandler<AuthedRequest>(async (_req, res) => {
    const suggestions = await SuggestionModel.find().sort({ createdAt: -1 }).populate("user", "name email").lean();
    res.json(suggestions);
  }),
);

suggestionsRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler<AuthedRequest>(async (req, res) => {
    const status = (req.body as { status?: string }).status;
    if (status !== "new" && status !== "reviewed") {
      res.status(400).json({ error: "status must be 'new' or 'reviewed'" });
      return;
    }
    const suggestion = await SuggestionModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!suggestion) {
      res.status(404).json({ error: "Suggestion not found" });
      return;
    }
    res.json(suggestion);
  }),
);
