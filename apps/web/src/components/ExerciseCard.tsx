import type { Exercise } from "@adhd-screener/core";
import { referenceById } from "@adhd-screener/core";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <article className="glass-card border-l-4 border-l-brand-400 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">{exercise.category}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-100">{exercise.title}</h3>
      <p className="mt-1 text-xs text-slate-500">Technique: {exercise.technique}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{exercise.summary}</p>

      <ol className="mt-4 space-y-2">
        {exercise.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <details className="mt-4 border-t border-white/5 pt-3 text-xs text-slate-500">
        <summary className="cursor-pointer select-none hover:text-slate-300">Sources</summary>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {exercise.refs.map((id) => (
            <li key={id}>{referenceById(id)?.cite ?? id}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}
