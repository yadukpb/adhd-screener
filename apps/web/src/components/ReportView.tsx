import type { Indicator, Level } from "@adhd-screener/core";
import { referenceById, exercisesForCategory, type Exercise } from "@adhd-screener/core";
import { FRIENDLY_LABEL, FRIENDLY_LEVEL, friendlyBlurb, buildDetailedReport, categoriesNeedingAttention } from "../lib/plainLanguage";
import { ExerciseCard } from "./ExerciseCard";

const LEVEL_STYLES: Record<Level, { border: string; badge: string; dot: string }> = {
  typical: { border: "border-l-emerald-400", badge: "bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  mild: { border: "border-l-amber-400", badge: "bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  elevated: { border: "border-l-rose-400", badge: "bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
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
    <article className={`glass-card border-l-4 p-5 ${styles.border}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-100">{FRIENDLY_LABEL[ind.key] ?? ind.label}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}>{FRIENDLY_LEVEL[ind.level]}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{friendlyBlurb(ind)}</p>

      <details className="group mt-4 border-t border-white/5 pt-3">
        <summary className="cursor-pointer select-none text-xs font-medium text-slate-500 hover:text-slate-300">
          Show technical details
        </summary>
        <div className="mt-3 space-y-3 text-xs">
          <p className="font-mono text-slate-400">
            {ind.label}: {ind.valueText}
            {ind.z !== null && <span className="text-slate-500"> &middot; z = {ind.z.toFixed(2)}</span>}
          </p>
          <p className="text-slate-500">{ind.meaning}</p>
          {ind.regions.length > 0 && (
            <p className="text-slate-500">Associated regions: {ind.regions.map((r) => REGION_LABEL[r] ?? r).join(", ")}</p>
          )}
          <div>
            <p className="mb-1 text-slate-500">Sources:</p>
            <ul className="list-disc space-y-1 pl-4 text-slate-500">
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
    <div className="animate-fade-in">
      <div className="glass-card mb-6 p-6">
        <p className="text-lg font-semibold text-slate-100">{report.headline}</p>

        <div className="mt-5 space-y-5">
          {report.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">{section.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{section.blurb}</p>
              <ul className="mt-2 space-y-2">
                {section.sentences.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {report.comparison.length > 0 && (
          <div className="mt-5 border-t border-white/5 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">Compared to your last screening</h3>
            <ul className="mt-2 space-y-1.5">
              {report.comparison.map((line, i) => (
                <li key={i} className="text-sm leading-relaxed text-slate-300">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-5 border-t border-white/5 pt-4 text-xs leading-relaxed text-slate-500">{report.disclaimer}</p>
      </div>

      {suggestedExercises.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Exercises to try</h2>
          <p className="mt-1 text-sm text-slate-400">
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

      <div className="grid gap-4 sm:grid-cols-2">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.key} ind={ind} />
        ))}
      </div>
    </div>
  );
}
