/**
 * WURS-25 (Wender Utah Rating Scale, short form), Ward, Wender & Reimherr
 * 1993 -- see data/references.ts#ward1993wurs. Retrospective self-report of
 * childhood (ages 6-10) behavior, used as an adjunct to current-symptom
 * screens like ASRS since ADHD requires childhood-onset symptoms.
 *
 * The WURS is a copyrighted clinical instrument (University of Utah); item
 * text below is PARAPHRASED to capture each item's clinical content for this
 * non-commercial screening aid, not a verbatim reproduction of the licensed
 * instrument. Anyone needing the exact validated wording for clinical or
 * research use should obtain it from the copyright holder.
 *
 * Response scale is 0-4: 0 Not at all, 1 Mildly, 2 Moderately, 3 Quite a bit,
 * 4 Very much -- "as a child, I was/had..."
 */

export interface WursItem {
  id: string;
  text: string;
}

export const wursItems: WursItem[] = [
  { id: "w1", text: "Had difficulty concentrating, was easily distracted" },
  { id: "w2", text: "Was anxious or worried a lot" },
  { id: "w3", text: "Was nervous, fidgety" },
  { id: "w4", text: "Was inattentive, prone to daydreaming" },
  { id: "w5", text: "Had a hot/short temper, a low boiling point" },
  { id: "w6", text: "Had temper outbursts or tantrums" },
  { id: "w7", text: "Had trouble with authority figures, was sent to the principal's office" },
  { id: "w8", text: "Had trouble finishing things I started" },
  { id: "w9", text: "Was stubborn, strong-willed" },
  { id: "w10", text: "Felt sad, blue, or unhappy" },
  { id: "w11", text: "Was disorganized, had trouble with order and sequence" },
  { id: "w12", text: "Was disobedient with parents, rebellious, sassy" },
  { id: "w13", text: "Had a low opinion of myself" },
  { id: "w14", text: "Was irritable" },
  { id: "w15", text: "Was a loner, preferred playing alone" },
  { id: "w16", text: "Told lies for no clear reason" },
  { id: "w17", text: "Had repeated trouble at school separate from poor grades" },
  { id: "w18", text: "Did schoolwork below my actual potential" },
  { id: "w19", text: "Acted without thinking, was impulsive" },
  { id: "w20", text: "Tended to be or act immature for my age" },
  { id: "w21", text: "Felt guilty, felt bad about myself" },
  { id: "w22", text: "Lost control of myself" },
  { id: "w23", text: "Tended to act irrationally" },
  { id: "w24", text: "Was unpopular with other children, had trouble keeping friends" },
  { id: "w25", text: "Had poor coordination, avoided sports or was picked last" },
];

export const wursResponseLabels = ["Not at all", "Mildly", "Moderately", "Quite a bit", "Very much"] as const;

export interface WursResult {
  /** Raw 0-100 sum. */
  total: number;
  /** Published cutoff: total >= 46 is consistent with childhood-onset ADHD. */
  screenPositive: boolean;
}

export const WURS_CUTOFF = 46;

export function scoreWurs(responses: number[]): WursResult {
  if (responses.length !== wursItems.length) {
    throw new RangeError(`expected ${wursItems.length} WURS responses, got ${responses.length}`);
  }
  let total = 0;
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    if (r < 0 || r > 4) throw new RangeError(`WURS response ${i} out of range 0-4: ${r}`);
    total += r;
  }
  return { total, screenPositive: total >= WURS_CUTOFF };
}
