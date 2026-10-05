import type { Indicator, Level } from "@adhd-screener/core";
import { referenceById } from "@adhd-screener/core";
import { FRIENDLY_LABEL, FRIENDLY_LEVEL, friendlyBlurb, overallSummary } from "../lib/plainLanguage";

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
  const summaryLines = overallSummary(indicators, previous);

  return (
    <div className="animate-fade-in">
      <div className="glass-card mb-6 space-y-2 p-6">
        {summaryLines.map((line, i) => (
          <p key={i} className={i === 0 ? "text-lg font-semibold text-slate-100" : "text-sm text-slate-400"}>
            {line}
          </p>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.key} ind={ind} />
        ))}
      </div>
    </div>
  );
}
