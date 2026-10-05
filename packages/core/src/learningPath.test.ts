import { describe, it, expect } from "vitest";
import { buildLearningPathSteps } from "./learningPath";
import { exercisesForCategory } from "./exercises/library";
import type { Indicator } from "./types";

function indicator(key: string, level: Indicator["level"]): Indicator {
  return { key, label: key, z: null, level, valueText: "", meaning: "", regions: [], refs: [] };
}

describe("buildLearningPathSteps", () => {
  it("produces no steps when nothing needs attention", () => {
    expect(buildLearningPathSteps([indicator("asrs", "typical")])).toEqual([]);
  });

  it("produces one learn step followed by one practice step per exercise, for a single flagged category", () => {
    const steps = buildLearningPathSteps([indicator("nback-dprime", "elevated")]);
    const exercises = exercisesForCategory("Working memory");

    expect(steps).toHaveLength(1 + exercises.length);
    expect(steps[0]).toMatchObject({ type: "learn", category: "Working memory", anchor: "brain-science" });
    for (let i = 0; i < exercises.length; i++) {
      expect(steps[i + 1]).toMatchObject({ type: "practice", category: "Working memory", exerciseId: exercises[i].id });
    }
  });

  it("gives every step a stable, unique key", () => {
    const steps = buildLearningPathSteps([
      indicator("asrs", "elevated"),
      indicator("cpt-commission", "mild"),
      indicator("nback-dprime", "elevated"),
    ]);
    const keys = steps.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("regenerating from the same indicators yields identical keys (so progress can be matched up)", () => {
    const indicators = [indicator("stop-ssrt", "elevated")];
    const a = buildLearningPathSteps(indicators).map((s) => s.key);
    const b = buildLearningPathSteps(indicators).map((s) => s.key);
    expect(a).toEqual(b);
  });

  it("self-reported-symptoms steps link to the diagnosis anchor, not brain-science", () => {
    const steps = buildLearningPathSteps([indicator("wurs", "elevated")]);
    expect(steps[0]).toMatchObject({ type: "learn", anchor: "diagnosis" });
  });
});
