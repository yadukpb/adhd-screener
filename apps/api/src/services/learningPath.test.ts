import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import mongoose from "mongoose";
import type { Indicator } from "@adhd-screener/core";
import { connectDb } from "../db";
import { UserModel } from "../models/User";
import { LearningPathModel } from "../models/LearningPath";
import { regenerateLearningPath } from "./learningPath";

// Integration test against a real local MongoDB (the same one `docker
// compose up -d mongo` provides for dev) rather than a mock -- the thing
// actually worth verifying here is that Mongoose round-trips the merge
// correctly, which a mocked model can't tell you.
const TEST_URI = process.env.MONGODB_URI_TEST ?? "mongodb://localhost:27017/adhd-screener-test";

function indicator(key: string, level: Indicator["level"]): Indicator {
  return { key, label: key, z: null, level, valueText: "", meaning: "", regions: [], refs: [] };
}

let userId: string;
const fakeSessionId = () => new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  await connectDb(TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
  await LearningPathModel.deleteMany({});
  const user = await UserModel.create({ email: "path-test@example.com", passwordHash: "x", name: "Path Test" });
  userId = user._id.toString();
});

describe("regenerateLearningPath", () => {
  it("creates a path with pending steps on first generation", async () => {
    const path = await regenerateLearningPath(userId, fakeSessionId(), [indicator("nback-dprime", "elevated")]);
    expect(path.steps.every((s) => s.status === "pending")).toBe(true);
    expect(path.steps.some((s) => s.category === "Working memory")).toBe(true);
  });

  it("carries over a step's done status across regeneration when the step still applies", async () => {
    await regenerateLearningPath(userId, fakeSessionId(), [indicator("cpt-commission", "elevated")]);
    const path = await LearningPathModel.findOne({ user: userId });
    const step = path!.steps.find((s) => s.key === "practice-pause-plan")!;
    step.status = "done";
    step.completedAt = new Date();
    await path!.save();

    // Regenerate from a *different* session that still flags Impulse control.
    const regenerated = await regenerateLearningPath(userId, fakeSessionId(), [indicator("stop-ssrt", "elevated")]);
    const survivor = regenerated.steps.find((s) => s.key === "practice-pause-plan");
    expect(survivor?.status).toBe("done");
  });

  it("drops a step once its category no longer needs attention, losing its progress", async () => {
    await regenerateLearningPath(userId, fakeSessionId(), [indicator("cpt-commission", "elevated")]);
    const before = await LearningPathModel.findOne({ user: userId });
    before!.steps.forEach((s) => (s.status = "done"));
    await before!.save();

    const regenerated = await regenerateLearningPath(userId, fakeSessionId(), [indicator("cpt-commission", "typical")]);
    expect(regenerated.steps.some((s) => s.category === "Impulse control")).toBe(false);
  });

  it("is idempotent for one user (upserts in place rather than creating a second path)", async () => {
    await regenerateLearningPath(userId, fakeSessionId(), [indicator("asrs", "elevated")]);
    await regenerateLearningPath(userId, fakeSessionId(), [indicator("asrs", "elevated")]);
    const count = await LearningPathModel.countDocuments({ user: userId });
    expect(count).toBe(1);
  });
});
