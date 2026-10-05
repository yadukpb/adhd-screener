import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { exercises } from "@adhd-screener/core";
import { learningPathApi, ApiError, type LearningPath as LearningPathData, type LearningPathStep } from "../lib/api";
import { ExerciseCard } from "../components/ExerciseCard";
import { LearnStepCard } from "../components/LearnStepCard";

function groupByCategory(steps: LearningPathStep[]): { category: string; steps: LearningPathStep[] }[] {
  const order: string[] = [];
  const byCategory = new Map<string, LearningPathStep[]>();
  for (const step of steps) {
    if (!byCategory.has(step.category)) {
      byCategory.set(step.category, []);
      order.push(step.category);
    }
    byCategory.get(step.category)!.push(step);
  }
  return order.map((category) => ({ category, steps: byCategory.get(category)! }));
}

export function LearningPath() {
  const [path, setPath] = useState<LearningPathData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    learningPathApi
      .get()
      .then(setPath)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load your learning path"));
  }, []);

  async function toggle(step: LearningPathStep) {
    if (!path) return;
    const nextStatus = step.status === "done" ? "pending" : "done";
    // Optimistic update -- this is a personal checklist, not a scored
    // result; a brief rollback-on-failure is fine, we don't need to block
    // the click on a round trip.
    setPath({ ...path, steps: path.steps.map((s) => (s.key === step.key ? { ...s, status: nextStatus } : s)) });
    try {
      await learningPathApi.setStepStatus(step.key, nextStatus);
    } catch {
      setPath((prev) => prev && { ...prev, steps: prev.steps.map((s) => (s.key === step.key ? step : s)) });
    }
  }

  if (error) {
    return <div className="py-24 text-center text-rose-600 dark:text-rose-400">{error}</div>;
  }
  if (!path) {
    return <div className="py-24 text-center text-subtle">Loading your path...</div>;
  }

  if (path.steps.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-heading">No learning path yet</h1>
        <p className="mt-3 text-subtle">
          Your path is built from your most recent screening -- complete one and we'll put together a sequence of
          sections to read and exercises to try, based on what actually came back notably different for you.
        </p>
        <Link to="/screen" className="btn-primary mt-6 inline-flex">
          Start a screening
        </Link>
      </div>
    );
  }

  const done = path.steps.filter((s) => s.status === "done").length;
  const total = path.steps.length;
  const groups = groupByCategory(path.steps);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading">Your Learning Path</h1>
        <p className="mt-1 text-sm text-subtle">
          Built from your latest results: one section to read and exercises to try for each area that stood out.
          Updates automatically after every new screening -- your progress carries over.
        </p>

        <div className="glass-card mt-5 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-body">
              {done} of {total} steps done
            </span>
            <span className="text-subtle">{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {groups.map(({ category, steps }) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-heading">{category}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {steps.map((step) => {
                if (step.type === "learn") {
                  return (
                    <LearnStepCard
                      key={step.key}
                      title={step.title}
                      category={step.category}
                      anchor={step.anchor ?? "what-is-it"}
                      done={step.status === "done"}
                      onToggle={() => toggle(step)}
                    />
                  );
                }
                const exercise = exercises.find((e) => e.id === step.exerciseId);
                if (!exercise) return null; // defensive -- core's exercise library should always have every referenced id
                return (
                  <ExerciseCard
                    key={step.key}
                    exercise={exercise}
                    progress={{ done: step.status === "done", onToggle: () => toggle(step) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
