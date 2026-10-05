import type { Exercise } from "@adhd-screener/core";
import { referenceById } from "@adhd-screener/core";
import { ExercisePracticeTool } from "./practice/ExercisePracticeTool";

interface Props {
  exercise: Exercise;
  /** When provided, shows a done/pending toggle in the card header -- used by the learning path, omitted everywhere else (the report, the standalone library). */
  progress?: { done: boolean; onToggle: () => void };
  /** Shows the actual working tool (timer, saved plans, checklist, etc.), not just the written steps. Only pass this from logged-in pages -- the public /exercises library has no user to save practice entries against. */
  interactive?: boolean;
}

export function ExerciseCard({ exercise, progress, interactive }: Props) {
  return (
    <article
      className={`glass-card border-l-4 p-5 ${
        progress?.done ? "accent-typical" : "border-l-brand-500 dark:border-l-brand-400"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{exercise.category}</p>
        {progress && (
          <button
            type="button"
            onClick={progress.onToggle}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              progress.done ? "badge-typical" : "bg-inset text-subtle hover:text-heading"
            }`}
          >
            {progress.done ? "✓ Done" : "Mark as done"}
          </button>
        )}
      </div>
      <h3 className="mt-1 text-lg font-bold text-heading">{exercise.title}</h3>
      <p className="mt-1 text-xs text-subtle">Technique: {exercise.technique}</p>
      <p className="mt-3 text-sm leading-relaxed text-body">{exercise.summary}</p>

      <ol className="mt-4 space-y-2.5">
        {exercise.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-body">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-xs font-semibold text-brand-600 dark:text-brand-300">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {interactive && <ExercisePracticeTool exerciseId={exercise.id} />}

      <details className="mt-4 border-t border-faint pt-3 text-xs text-faint">
        <summary className="cursor-pointer select-none hover:text-heading">Sources</summary>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {exercise.refs.map((id) => (
            <li key={id}>{referenceById(id)?.cite ?? id}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}
