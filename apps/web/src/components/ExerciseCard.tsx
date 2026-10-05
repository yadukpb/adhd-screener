import type { Exercise } from "@adhd-screener/core";
import { referenceById } from "@adhd-screener/core";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <article className="glass-card border-l-4 border-l-brand-500 p-5 dark:border-l-brand-400">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{exercise.category}</p>
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
