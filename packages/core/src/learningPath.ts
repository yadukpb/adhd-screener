import type { Indicator } from "./types";
import type { ReportCategory } from "./categories";
import { categoriesNeedingAttention } from "./categories";
import { exercisesForCategory } from "./exercises/library";

/**
 * Which "Learn about ADHD" page section best grounds the mechanism behind
 * each category, so a learning-path "understand" step can link somewhere
 * real instead of a generic landing point. Self-reported symptoms maps to
 * the diagnosis section (criteria/evaluation); the three objective-task
 * categories all trace back to mechanisms covered in the brain-science
 * section -- that's a real overlap in the source content, not a cop-out.
 */
const CATEGORY_ANCHOR: Record<ReportCategory, string> = {
  "Self-reported symptoms": "diagnosis",
  "Attention & focus": "brain-science",
  "Impulse control": "brain-science",
  "Working memory": "brain-science",
  "Emotional Regulation": "emotional-regulation",
};

export type LearningPathStepType = "learn" | "practice";

export interface LearningPathStepDef {
  /** Stable across regenerations -- a category's "learn" step and an exercise's "practice" step always resolve to the same key. */
  key: string;
  type: LearningPathStepType;
  category: ReportCategory;
  title: string;
  /** Present for type "learn" -- an anchor id on /about-adhd. */
  anchor?: string;
  /** Present for type "practice" -- an id in @adhd-screener/core's exercises library. */
  exerciseId?: string;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Builds the ordered step list a learning path should have *right now* for
 * this result set: one "learn" step per category that needs attention,
 * followed by a "practice" step per exercise in that category. Pure and
 * stateless -- carrying over a person's progress on steps that still exist
 * across regenerations is the API layer's job (it has the database), not
 * this function's.
 */
export function buildLearningPathSteps(indicators: Indicator[]): LearningPathStepDef[] {
  const categories = categoriesNeedingAttention(indicators);
  const steps: LearningPathStepDef[] = [];

  for (const category of categories) {
    steps.push({
      key: `learn-${slug(category)}`,
      type: "learn",
      category,
      title: `Understand: ${category}`,
      anchor: CATEGORY_ANCHOR[category],
    });
    for (const exercise of exercisesForCategory(category)) {
      steps.push({
        key: `practice-${exercise.id}`,
        type: "practice",
        category,
        title: exercise.title,
        exerciseId: exercise.id,
      });
    }
  }

  return steps;
}
