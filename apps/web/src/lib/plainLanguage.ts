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

/** The lead paragraph(s) at the top of a report. */
export function overallSummary(indicators: Indicator[], previous?: Indicator[] | null): string[] {
  const elevated = indicators.filter((i) => i.level === "elevated").length;
  const mild = indicators.filter((i) => i.level === "mild").length;

  const lines: string[] = [];

  if (elevated === 0 && mild === 0) {
    lines.push("Everything here came back in the typical range today.");
  } else if (elevated === 0) {
    lines.push(`Mostly typical today, with ${mild === 1 ? "one area" : `${mild} areas`} worth keeping an eye on.`);
  } else if (elevated <= 2) {
    lines.push(`A couple of areas stood out as notably different from typical today.`);
  } else {
    lines.push(`Several areas stood out as notably different from typical today.`);
  }

  if (previous && previous.length > 0) {
    const prevElevated = previous.filter((i) => i.level === "elevated").length;
    const prevMild = previous.filter((i) => i.level === "mild").length;
    const prevScore = prevElevated * 2 + prevMild;
    const curScore = elevated * 2 + mild;
    if (curScore < prevScore) lines.push("That's an improvement compared to your last screening.");
    else if (curScore > prevScore) lines.push("That's more than your last screening showed.");
    else lines.push("That's about the same as your last screening.");
  }

  lines.push("This is a screening aid, not a diagnosis -- if you're concerned, it's worth talking to a doctor.");
  return lines;
}
