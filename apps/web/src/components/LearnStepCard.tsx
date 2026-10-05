import { Link } from "react-router-dom";

interface Props {
  title: string;
  category: string;
  anchor: string;
  done: boolean;
  onToggle: () => void;
}

export function LearnStepCard({ title, category, anchor, done, onToggle }: Props) {
  return (
    <article className={`glass-card border-l-4 p-5 ${done ? "accent-typical" : "border-l-slate-400 dark:border-l-slate-500"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{category}</p>
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
            done ? "badge-typical" : "bg-inset text-subtle hover:text-heading"
          }`}
        >
          {done ? "✓ Done" : "Mark as done"}
        </button>
      </div>
      <h3 className="mt-1 text-lg font-bold text-heading">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-body">
        A few minutes of background on what's actually going on here before practicing -- the research behind it, not
        just the exercise.
      </p>
      <Link
        to={`/about-adhd#${anchor}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
      >
        Read this section &rarr;
      </Link>
    </article>
  );
}
