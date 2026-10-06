import { Router } from "express";
import type { CptTrial, StopTrial, NbackTrial } from "@adhd-screener/core";
import { ScreeningDraftModel } from "../models/ScreeningDraft";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const screeningDraftRouter = Router();
screeningDraftRouter.use(requireAuth);

const VALID_STEPS = ["asrs", "wurs", "cpt", "stop", "nback"] as const;
type DraftStep = (typeof VALID_STEPS)[number];

interface SaveDraftBody {
  step: DraftStep;
  asrs?: number[];
  wurs?: number[];
  cptTrials?: CptTrial[];
  stopTrials?: StopTrial[];
  stopMaxRt?: number;
  nbackTrials?: NbackTrial[];
}

screeningDraftRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const draft = await ScreeningDraftModel.findOne({ user: req.userId }).lean();
    res.json(draft ?? null);
  }),
);

screeningDraftRouter.put(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const body = req.body as SaveDraftBody;
    if (!VALID_STEPS.includes(body.step)) {
      res.status(400).json({ error: "Invalid step" });
      return;
    }

    const update: Record<string, unknown> = { step: body.step };
    if (body.asrs) update.asrs = body.asrs;
    if (body.wurs) update.wurs = body.wurs;
    if (body.cptTrials) update.cptTrials = body.cptTrials;
    if (body.stopTrials) update.stopTrials = body.stopTrials;
    if (body.stopMaxRt !== undefined) update.stopMaxRt = body.stopMaxRt;
    if (body.nbackTrials) update.nbackTrials = body.nbackTrials;

    const draft = await ScreeningDraftModel.findOneAndUpdate(
      { user: req.userId },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    res.json(draft);
  }),
);

screeningDraftRouter.delete(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    await ScreeningDraftModel.deleteOne({ user: req.userId });
    res.status(204).end();
  }),
);
