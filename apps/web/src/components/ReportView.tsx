import type { Indicator, Level } from "@adhd-screener/core";
import { referenceById } from "@adhd-screener/core";

const LEVEL_LABEL: Record<Level, string> = {
  typical: "Typical range",
  mild: "Mildly elevated",
  elevated: "Elevated",
};

const LEVEL_STYLES: Record<Level, { border: string; badge: string }> = {
  typical: { border: "border-l-emerald-400", badge: "bg-emerald-400/10 text-emerald-300" },
  mild: { border: "border-l-amber-400", badge: "bg-amber-400/10 text-amber-300" },
  elevated: { border: "border-l-rose-400", badge: "bg-rose-400/10 text-rose-300" },
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
        <h3 className="font-semibold text-slate-100">{ind.label}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}>{LEVEL_LABEL[ind.level]}</span>
      </div>
      <p className="mt-2 font-mono text-sm text-slate-400">
        {ind.valueText}
        {ind.z !== null && <span className="text-slate-500"> &middot; z = {ind.z.toFixed(2)}</span>}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{ind.meaning}</p>
      {ind.regions.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">Associated regions: {ind.regions.map((r) => REGION_LABEL[r] ?? r).join(", ")}</p>
      )}
      <details className="mt-3 text-xs text-slate-500">
        <summary className="cursor-pointer select-none text-slate-400 hover:text-slate-300">Sources</summary>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {ind.refs.map((id) => (
            <li key={id}>{referenceById(id)?.cite ?? id}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}

export function ReportView({ indicators }: { indicators: Indicator[] }) {
  const elevated = indicators.filter((i) => i.level === "elevated").length;
  const mild = indicators.filter((i) => i.level === "mild").length;

  return (
    <div className="animate-fade-in">
      <div className="glass-card mb-6 p-5">
        <p className="text-slate-300">
          <span className="font-semibold text-rose-300">{elevated}</span> elevated and{" "}
          <span className="font-semibold text-amber-300">{mild}</span> mildly elevated, out of {indicators.length} measured.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.key} ind={ind} />
        ))}
      </div>

      <div className="glass-card mt-6 space-y-3 p-5 text-sm leading-relaxed text-slate-400">
        <p className="font-semibold text-slate-200">This is a research-based screening aid, not a diagnosis.</p>
        <p>
          ADHD diagnosis requires a clinical interview against DSM-5/ICD-11 criteria, developmental history, and evidence of
          impairment across settings -- no questionnaire or reaction-time task, including this one, is diagnostic on its own.
          If several indicators above are elevated, consider discussing this report with a clinician.
        </p>
        <p>
          This tool implements its own simplified versions of these tasks in the browser -- it is not a clinically normed
          instrument, and comparison values are literature-informed estimates, not exact normative tables. See each
          indicator's sources for what is and isn't established.
        </p>
      </div>
    </div>
  );
}
