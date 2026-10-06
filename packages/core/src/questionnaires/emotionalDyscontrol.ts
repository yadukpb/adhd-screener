/**
 * Emotional Dyscontrol (current symptoms) -- see
 * data/references.ts#silverstein2019ec. Emotional dysregulation (mood
 * lability, irritability, overreacting to frustration) is increasingly
 * recognized as a core adult ADHD feature, not just a side effect, but the
 * standard self-report instruments for it (DERS, the BDEFS emotional-
 * regulation subscale) are commercially copyrighted and not reproducible
 * here. Silverstein et al. (2019) validated a 4-item "Emotional Dyscontrol"
 * extension built directly on top of the ASRS-v1.1 this app already uses
 * (same research lineage, same response scale) -- but that extended
 * instrument's own item wording isn't openly published either.
 *
 * The 4 items below are ORIGINAL, written by this project to assess the
 * same three symptom themes Silverstein et al. define for that subscale
 * (mood lability, irritability, emotional overreactivity), on the same 0-4
 * response scale as the ASRS. They are NOT a reproduction of any published
 * instrument's wording, and the scoring below is this project's own
 * exploratory threshold, not a validated clinical cutoff -- see the
 * "meaning" text on the resulting indicator, which says so explicitly.
 *
 * Response scale is 0-4: 0 Never, 1 Rarely, 2 Sometimes, 3 Often, 4 Very Often.
 */

export interface EmotionalDyscontrolItem {
  id: string;
  text: string;
  theme: "mood-lability" | "irritability" | "overreactivity";
}

export const emotionalDyscontrolItems: EmotionalDyscontrolItem[] = [
  {
    id: "ed1",
    text: "How often does your mood shift quickly and noticeably, with little warning?",
    theme: "mood-lability",
  },
  {
    id: "ed2",
    text: "How often do you feel irritable or easily annoyed by things that didn't used to bother you as much?",
    theme: "irritability",
  },
  {
    id: "ed3",
    text: "How often do you react more strongly to frustration or criticism than the situation seems to call for?",
    theme: "overreactivity",
  },
  {
    id: "ed4",
    text: "How often does it take you longer than you'd like to calm back down after something upsets you?",
    theme: "overreactivity",
  },
];

export const emotionalDyscontrolResponseLabels = ["Never", "Rarely", "Sometimes", "Often", "Very Often"] as const;

export interface EmotionalDyscontrolResult {
  /** Raw 0-16 sum. */
  total: number;
  /** Count of items (0-4) at "Often" or more -- this project's own threshold, not a published cutoff. */
  metCount: number;
  screenPositive: boolean;
}

const ITEM_THRESHOLD = 3; // "Often" or more

export function scoreEmotionalDyscontrol(responses: number[]): EmotionalDyscontrolResult {
  if (responses.length !== emotionalDyscontrolItems.length) {
    throw new RangeError(`expected ${emotionalDyscontrolItems.length} emotional dyscontrol responses, got ${responses.length}`);
  }
  let total = 0;
  let metCount = 0;
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    if (r < 0 || r > 4) throw new RangeError(`emotional dyscontrol response ${i} out of range 0-4: ${r}`);
    total += r;
    if (r >= ITEM_THRESHOLD) metCount++;
  }
  return { total, metCount, screenPositive: metCount >= 3 };
}
