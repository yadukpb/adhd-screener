import type { Indicator, Level } from "@adhd-screener/core";

// Hand-written, not LLM-generated -- this is fixed, well-understood content
// (what each indicator measures, in plain words), so a static mapping is
// simpler and more reliable than a live API call for something that never
// actually needs to vary per request.

export const FRIENDLY_LABEL: Record<string, string> = {
  asrs: "Day-to-day attention & activity",
  wurs: "Childhood attention & activity",
  "cpt-omission": "Staying focused on simple tasks",
  "cpt-commission": "Holding back before reacting",
  "cpt-rtsd": "Consistency of reaction speed",
  "cpt-tau": "Moments of 'zoning out'",
  "cpt-dprime": "Overall accuracy on the focus task",
  "stop-ssrt": "Cancelling a response quickly",
  "nback-dprime": "Holding information in mind",
};

export const FRIENDLY_LEVEL: Record<Level, string> = {
  typical: "Typical",
  mild: "Worth keeping an eye on",
  elevated: "Notably different from typical",
};

const BLURBS: Record<string, Record<Level, string>> = {
  asrs: {
    typical: "Your day-to-day attention and activity levels look typical.",
    mild: "You reported some day-to-day attention and activity symptoms -- more than most people, but not a strong pattern.",
    elevated: "You reported a clear pattern of day-to-day attention and activity symptoms.",
  },
  wurs: {
    typical: "You didn't report much attention or activity difficulty as a child.",
    mild: "You reported some attention or activity difficulty as a child.",
    elevated: "You reported a clear pattern of attention or activity difficulty as a child.",
  },
  "cpt-omission": {
    typical: "You caught almost every target in the focus task.",
    mild: "You missed a few more targets than most people in the focus task.",
    elevated: "You missed a lot of targets in the focus task -- a sign your attention wandered.",
  },
  "cpt-commission": {
    typical: "You held back well when you were supposed to -- few accidental reactions.",
    mild: "You reacted a bit more than most people when you should have held back.",
    elevated: "You reacted often when you should have held back -- a sign of quick, hard-to-stop responses.",
  },
  "cpt-rtsd": {
    typical: "Your reaction speed was consistent from one moment to the next.",
    mild: "Your reaction speed bounced around a bit more than typical.",
    elevated: "Your reaction speed varied a lot moment to moment -- a sign of wandering focus.",
  },
  "cpt-tau": {
    typical: "You didn't have many slow, 'zoned out' moments.",
    mild: "You had a few slower, 'zoned out' moments.",
    elevated: "You had several much slower, 'zoned out' moments during the task.",
  },
  "cpt-dprime": {
    typical: "Overall, you told targets and non-targets apart very reliably.",
    mild: "Overall, you told targets and non-targets apart reasonably well.",
    elevated: "Overall, it was harder for you to reliably tell targets and non-targets apart.",
  },
  "stop-ssrt": {
    typical: "You could cancel an action you'd already started quickly.",
    mild: "It took you a bit longer than typical to cancel an action you'd already started.",
    elevated: "It took you noticeably longer to cancel an action you'd already started.",
  },
  "nback-dprime": {
    typical: "You held information in mind well while doing the memory task.",
    mild: "You had some trouble holding information in mind during the memory task.",
    elevated: "You had real trouble holding information in mind during the memory task.",
  },
};

export function friendlyBlurb(ind: Indicator): string {
  if (ind.key === "stop-ssrt" && ind.valueText.startsWith("invalid estimate")) {
    return "This task didn't run cleanly enough to measure this one reliably -- not a result either way.";
  }
  return BLURBS[ind.key]?.[ind.level] ?? ind.meaning;
}

/** Short phrase for a list row (dashboard history) -- no counts, no jargon. */
export function headlineForCounts(elevated: number, mild: number): string {
  if (elevated === 0 && mild === 0) return "All typical";
  if (elevated === 0) return "A couple of things to watch";
  if (elevated <= 2) return "A couple of notable differences";
  return "Several notable differences";
}

// --- In-depth summary: same plain-language voice, but walks through the
// actual findings with the technical term + measured value named inline
// (not hidden) instead of a two-sentence headline. ---

interface Category {
  title: string;
  keys: string[];
  /** One line of context for what this category of measures is getting at. */
  blurb: string;
}

const CATEGORIES: Category[] = [
  {
    title: "Self-reported symptoms",
    keys: ["asrs", "wurs"],
    blurb: "What you reported about your own day-to-day (and childhood) attention and activity patterns.",
  },
  {
    title: "Attention & focus",
    keys: ["cpt-omission", "cpt-rtsd", "cpt-tau", "cpt-dprime"],
    blurb: "How consistently you caught targets and stayed locked onto the focus task, measured a few different ways.",
  },
  {
    title: "Impulse control",
    keys: ["cpt-commission", "stop-ssrt"],
    blurb: "How well you held back a reaction you weren't supposed to make, and how fast you could cancel one already underway.",
  },
  {
    title: "Working memory",
    keys: ["nback-dprime"],
    blurb: "How well you kept track of recent information while the task kept moving.",
  },
];

function indicatorSentence(ind: Indicator): string {
  const friendly = FRIENDLY_LABEL[ind.key] ?? ind.label;
  const blurb = friendlyBlurb(ind);
  if (ind.level === "typical") {
    return `${friendly} (technical name: "${ind.label}") measured ${ind.valueText} -- in the typical range. ${blurb}`;
  }
  return `${friendly} (technical name: "${ind.label}") measured ${ind.valueText}${
    ind.z !== null ? `, or ${ind.z.toFixed(1)} standard deviations from the reference norm (z = ${ind.z.toFixed(2)})` : ""
  } -- ${FRIENDLY_LEVEL[ind.level].toLowerCase()}. ${blurb}`;
}

export interface DetailedSection {
  title: string;
  blurb: string;
  sentences: string[];
}

export interface DetailedReport {
  headline: string;
  sections: DetailedSection[];
  comparison: string[];
  disclaimer: string;
}

/** The full in-depth version: every finding named, with its technical term and measured value, grouped by what it's actually testing. */
export function buildDetailedReport(indicators: Indicator[], previous?: Indicator[] | null): DetailedReport {
  const byKey = new Map(indicators.map((i) => [i.key, i]));

  const sections: DetailedSection[] = CATEGORIES.map((cat) => ({
    title: cat.title,
    blurb: cat.blurb,
    sentences: cat.keys.map((k) => byKey.get(k)).filter((i): i is Indicator => !!i).map(indicatorSentence),
  })).filter((s) => s.sentences.length > 0);

  const elevated = indicators.filter((i) => i.level === "elevated").length;
  const mild = indicators.filter((i) => i.level === "mild").length;
  const headline =
    elevated === 0 && mild === 0
      ? `All ${indicators.length} measures came back in the typical range.`
      : `${elevated} of ${indicators.length} measures came back notably different from typical, and ${mild} were mildly so -- details by category below.`;

  const comparison: string[] = [];
  if (previous && previous.length > 0) {
    const prevByKey = new Map(previous.map((i) => [i.key, i]));
    for (const ind of indicators) {
      const prev = prevByKey.get(ind.key);
      if (!prev || prev.level === ind.level) continue;
      const friendly = FRIENDLY_LABEL[ind.key] ?? ind.label;
      const direction = rank(ind.level) < rank(prev.level) ? "improved" : "moved in the other direction";
      comparison.push(
        `${friendly} (${ind.label}) ${direction}: ${FRIENDLY_LEVEL[prev.level].toLowerCase()} (${prev.valueText}) → ${FRIENDLY_LEVEL[ind.level].toLowerCase()} (${ind.valueText}).`,
      );
    }
    if (comparison.length === 0) {
      comparison.push("No category changed status compared to your last screening.");
    }
  }

  return {
    headline,
    sections,
    comparison,
    disclaimer:
      "This is a screening aid, not a diagnosis. ADHD diagnosis requires a clinical interview against DSM-5/ICD-11 criteria, developmental history, and evidence of impairment across settings -- no questionnaire or reaction-time task, including this one, is diagnostic on its own. If several measures above are notably different from typical, it's worth discussing this report with a clinician.",
  };
}

function rank(level: Level): number {
  return level === "typical" ? 0 : level === "mild" ? 1 : 2;
}
