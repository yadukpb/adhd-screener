import { buildLearningPathSteps, type Indicator } from "@adhd-screener/core";
import { LearningPathModel } from "../models/LearningPath";

/**
 * Regenerates a user's rolling learning path from a just-completed
 * session's indicators, carrying over the status of any step that still
 * applies (matched by its stable `key`) rather than resetting progress
 * every time someone screens again. A step for a category that's no
 * longer flagged simply drops out of the list.
 */
export async function regenerateLearningPath(userId: string, sessionId: string, indicators: Indicator[]) {
  const freshSteps = buildLearningPathSteps(indicators);

  const existing = await LearningPathModel.findOne({ user: userId });
  const existingByKey = new Map((existing?.steps ?? []).map((s) => [s.key, s]));

  const mergedSteps = freshSteps.map((def) => {
    const prior = existingByKey.get(def.key);
    return {
      ...def,
      status: prior?.status ?? "pending",
      completedAt: prior?.completedAt,
    };
  });

  return LearningPathModel.findOneAndUpdate(
    { user: userId },
    { user: userId, sourceSession: sessionId, steps: mergedSteps },
    { upsert: true, new: true },
  );
}
