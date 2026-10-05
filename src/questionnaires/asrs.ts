/**
 * ASRS-v1.1 Part A (6-item screener), WHO/Kessler et al. 2005 -- see
 * data/references.ts#kessler2005asrs. The WHO ASRS was explicitly released
 * for free reproduction in screening contexts (unlike WURS below), so item
 * wording here follows the published instrument closely.
 *
 * Response scale is 0-4: 0 Never, 1 Rarely, 2 Sometimes, 3 Often, 4 Very Often.
 */

export interface AsrsItem {
  id: string;
  text: string;
  /** Minimum response (0-4) that counts as "met" per the validated Part A scoring key. */
  threshold: number;
}

export const asrsItems: AsrsItem[] = [
  {
    id: "a1",
    text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
    threshold: 2, // Sometimes+
  },
  {
    id: "a2",
    text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
    threshold: 2, // Sometimes+
  },
  {
    id: "a3",
    text: "How often do you have problems remembering appointments or obligations?",
    threshold: 3, // Often+
  },
  {
    id: "a4",
    text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
    threshold: 3, // Often+
  },
  {
    id: "a5",
    text: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
    threshold: 3, // Often+
  },
  {
    id: "a6",
    text: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
    threshold: 3, // Often+
  },
];

export const asrsResponseLabels = ["Never", "Rarely", "Sometimes", "Often", "Very Often"] as const;

export interface AsrsResult {
  /** Raw 0-24 sum, used only for the report's trend indicator, not the screening call. */
  total: number;
  /** Count of items (0-6) meeting their validated threshold. */
  metCount: number;
  /** Official Part A screening call: positive at >=4 of 6 met. */
  screenPositive: boolean;
}

export function scoreAsrs(responses: number[]): AsrsResult {
  if (responses.length !== asrsItems.length) {
    throw new RangeError(`expected ${asrsItems.length} ASRS responses, got ${responses.length}`);
  }
  let metCount = 0;
  let total = 0;
  for (let i = 0; i < asrsItems.length; i++) {
    const r = responses[i];
    if (r < 0 || r > 4) throw new RangeError(`ASRS response ${i} out of range 0-4: ${r}`);
    total += r;
    if (r >= asrsItems[i].threshold) metCount++;
  }
  return { total, metCount, screenPositive: metCount >= 4 };
}
