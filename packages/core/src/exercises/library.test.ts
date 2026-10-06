import { describe, it, expect } from "vitest";
import { exercises, exercisesForCategory } from "./library";
import { referenceById } from "../data/references";

describe("exercises library", () => {
  it("has at least one exercise per report category", () => {
    const categories: Array<typeof exercises[number]["category"]> = [
      "Self-reported symptoms",
      "Attention & focus",
      "Impulse control",
      "Working memory",
      "Emotional Regulation",
    ];
    for (const cat of categories) {
      expect(exercisesForCategory(cat).length).toBeGreaterThan(0);
    }
  });

  it("every exercise has at least one step and one valid citation", () => {
    for (const ex of exercises) {
      expect(ex.steps.length).toBeGreaterThan(0);
      expect(ex.refs.length).toBeGreaterThan(0);
      for (const refId of ex.refs) {
        expect(referenceById(refId), `missing reference "${refId}" used by exercise "${ex.id}"`).toBeDefined();
      }
    }
  });

  it("exercisesForCategory only returns exercises matching that category", () => {
    for (const ex of exercisesForCategory("Impulse control")) {
      expect(ex.category).toBe("Impulse control");
    }
  });
});
