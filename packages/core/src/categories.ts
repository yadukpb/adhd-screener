import type { Indicator } from "./types";

/**
 * The 4 groupings every indicator key belongs to -- shared by the report's
 * section headings (apps/web), the exercise library's category field, and
 * the learning-path generator (apps/api, server-side, no UI involved). This
 * used to be duplicated between apps/web's plainLanguage.ts and
 * exercises/library.ts, matched only by hand-written string literals with no
 * compiler check that they agreed; now there's exactly one definition.
 */
export const REPORT_CATEGORIES = [
  "Self-reported symptoms",
  "Attention & focus",
  "Impulse control",
  "Working memory",
  "Emotional Regulation",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const CATEGORY_KEYS: Record<ReportCategory, string[]> = {
  "Self-reported symptoms": ["asrs", "wurs"],
  "Attention & focus": ["cpt-omission", "cpt-rtsd", "cpt-tau", "cpt-dprime"],
  "Impulse control": ["cpt-commission", "stop-ssrt"],
  "Working memory": ["nback-dprime"],
  "Emotional Regulation": ["emotional-dyscontrol"],
};

/** Category titles with at least one mild/elevated indicator in this result set. */
export function categoriesNeedingAttention(indicators: Indicator[]): ReportCategory[] {
  const byKey = new Map(indicators.map((i) => [i.key, i]));
  return REPORT_CATEGORIES.filter((cat) =>
    CATEGORY_KEYS[cat].some((k) => {
      const ind = byKey.get(k);
      return ind !== undefined && ind.level !== "typical";
    }),
  );
}
