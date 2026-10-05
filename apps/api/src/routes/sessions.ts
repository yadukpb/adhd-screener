import { Router } from "express";
import {
  summarizeCpt,
  summarizeStop,
  summarizeNback,
  computeIndicators,
  type CptTrial,
  type StopTrial,
  type NbackTrial,
  type Session,
} from "@adhd-screener/core";
import { ScreeningSessionModel } from "../models/ScreeningSession";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const sessionsRouter = Router();
sessionsRouter.use(requireAuth);

interface CreateSessionBody {
  asrs?: number[];
  wurs?: number[];
  cptTrials?: CptTrial[];
  stopTrials?: StopTrial[];
  stopMaxRt?: number;
  nbackTrials?: NbackTrial[];
}

sessionsRouter.post("/", asyncHandler<AuthedRequest>(async (req, res) => {
  const body = req.body as CreateSessionBody;

  const session: Session = { asrs: body.asrs ?? null, wurs: body.wurs ?? null };
  try {
    if (body.cptTrials?.length) session.cpt = summarizeCpt(body.cptTrials);
    if (body.stopTrials?.length) session.stop = summarizeStop(body.stopTrials, body.stopMaxRt ?? 1200);
    if (body.nbackTrials?.length) session.nback = summarizeNback(body.nbackTrials);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid trial data" });
    return;
  }

  const indicators = computeIndicators(session);
  if (indicators.length === 0) {
    res.status(400).json({ error: "No questionnaire or task data provided" });
    return;
  }

  const doc = await ScreeningSessionModel.create({
    user: req.userId,
    asrs: session.asrs ?? undefined,
    wurs: session.wurs ?? undefined,
    cpt: session.cpt,
    stop: session.stop,
    nback: session.nback,
    indicators,
  });

  res.status(201).json(doc);
}));

sessionsRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const docs = await ScreeningSessionModel.find({ user: req.userId })
      .select("indicators createdAt")
      .sort({ createdAt: 1 })
      .lean();
    res.json(docs);
  }),
);

sessionsRouter.get(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const doc = await ScreeningSessionModel.findOne({ _id: req.params.id, user: req.userId }).lean();
    if (!doc) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(doc);
  }),
);
