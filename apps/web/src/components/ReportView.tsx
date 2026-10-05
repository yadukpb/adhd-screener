import type { Indicator, Level } from "@adhd-screener/core";
import { referenceById, exercisesForCategory, type Exercise } from "@adhd-screener/core";
import { FRIENDLY_LABEL, FRIENDLY_LEVEL, friendlyBlurb, buildDetailedReport, categoriesNeedingAttention } from "../lib/plainLanguage";
import { ExerciseCard } from "./ExerciseCard";

const LEVEL_STYLES: Record<Level, { accent: string; badge: string }> = {
  typical: { accent: "accent-typical", badge: "badge-typical" },
  mild: { accent: "accent-mild", badge: "badge-mild" },
  elevated: { accent: "accent-elevated", badge: "badge-elevated" },
};

const REGION_LABEL: Record<string, string> = {
  pfc: "Prefrontal cortex",
  ifg: "Inferior frontal gyrus",
  parietal: "Parietal cortex",
  acc: "Anterior cingulate cortex",
  dmn: "Default mode network",
  striatum: "Striatum",
  accumbens: "Nucleus accumbens",
  limbic: "Limbic system",
  cerebellum: "Cerebellum",
};

function IndicatorCard({ ind }: { ind: Indicator }) {
  const styles = LEVEL_STYLES[ind.level];
  return (
    <article className={`glass-card border-l-4 p-5 ${styles.accent}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="font-semibold text-heading">{FRIENDLY_LABEL[ind.key] ?? ind.label}</h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}>{FRIENDLY_LEVEL[ind.level]}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-body">{friendlyBlurb(ind)}</p>

      <details className="group mt-4 border-t border-faint pt-3">
        <summary className="cursor-pointer select-none text-xs font-medium text-subtle hover:text-heading">
          Show technical details
        </summary>
        <div className="mt-3 space-y-3 text-xs">
          <p className="font-mono text-faint">
            {ind.label}: {ind.valueText}
            {ind.z !== null && <span className="text-faint"> &middot; z = {ind.z.toFixed(2)}</span>}
          </p>
          <p className="text-faint">{ind.meaning}</p>
          {ind.regions.length > 0 && (
            <p className="text-faint">Associated regions: {ind.regions.map((r) => REGION_LABEL[r] ?? r).join(", ")}</p>
          )}
          <div>
            <p className="mb-1 text-faint">Sources:</p>
            <ul className="list-disc space-y-1 pl-4 text-faint">
              {ind.refs.map((id) => (
                <li key={id}>{referenceById(id)?.cite ?? id}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </article>
  );
}

export function ReportView({ indicators, previous }: { indicators: Indicator[]; previous?: Indicator[] | null }) {
  const report = buildDetailedReport(indicators, previous);

  // categoriesNeedingAttention()'s titles are hand-matched to Exercise["category"]
  // in @adhd-screener/core -- the library.test.ts suite checks every category
  // has at least one exercise, which is what keeps this cast honest.
  const suggestedExercises: Exercise[] = categoriesNeedingAttention(indicators).flatMap((cat) =>
    exercisesForCategory(cat as Exercise["category"]),
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div className="glass-card p-6 sm:p-8">
        <p className="text-xl font-bold leading-snug text-heading">{report.headline}</p>

        <div className="mt-6 space-y-6">
          {report.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                {section.title}
              </h3>
              <p className="mt-1 text-xs text-faint">{section.blurb}</p>
              <ul className="mt-3 space-y-2.5">
                {section.sentences.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-body">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-white/20" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {report.comparison.length > 0 && (
          <div className="mt-6 border-t border-faint pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              Compared to your last screening
            </h3>
            <ul className="mt-3 space-y-1.5">
              {report.comparison.map((line, i) => (
                <li key={i} className="text-sm leading-relaxed text-body">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 border-t border-faint pt-5 text-xs leading-relaxed text-faint">{report.disclaimer}</p>
      </div>

      {suggestedExercises.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-heading">Exercises to try</h2>
          <p className="mt-1 text-sm text-subtle">
            Self-guided skill practice for the areas above that stood out today -- not therapy, and not a substitute for
            it. Each is a real, cited technique; this just walks you through trying it.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {suggestedExercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-heading">Every measure</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {indicators.map((ind) => (
            <IndicatorCard key={ind.key} ind={ind} />
          ))}
        </div>
      </div>
    </div>
  );
}
