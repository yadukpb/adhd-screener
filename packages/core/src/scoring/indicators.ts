import type { Indicator, RegionId, Session, Level } from "../types";
import { zScore } from "./stats";
import { cptNorms, stopNorms, nbackNorms, orientedZ, levelFromOrientedZ, type NormEntry } from "../data/norms";
import { scoreAsrs, type AsrsResult } from "../questionnaires/asrs";
import { scoreWurs, WURS_CUTOFF, type WursResult } from "../questionnaires/wurs";

function objectiveIndicator(
  key: string,
  label: string,
  raw: number,
  norm: NormEntry,
  valueText: string,
  meaning: string,
  regions: RegionId[],
): Indicator {
  if (!Number.isFinite(raw)) {
    return { key, label, z: null, level: "typical", valueText: "not enough data", meaning, regions, refs: norm.refs };
  }
  const z = orientedZ(zScore(raw, norm.mu, norm.sigma), norm.worseDirection);
  return { key, label, z, level: levelFromOrientedZ(z), valueText, meaning, regions, refs: norm.refs };
}

function asrsIndicator(result: AsrsResult): Indicator {
  const level: Level = result.screenPositive ? "elevated" : result.metCount >= 2 ? "mild" : "typical";
  return {
    key: "asrs",
    label: "ASRS-v1.1 Part A (current adult symptoms)",
    z: null,
    level,
    valueText: `${result.metCount}/6 threshold items met (raw sum ${result.total}/24)`,
    meaning:
      "Self-reported frequency of inattention/hyperactivity symptoms in the last 6 months, scored against the WHO validated Part A threshold key, not a simple sum cutoff.",
    regions: [],
    refs: ["kessler2005asrs"],
  };
}

function wursIndicator(result: WursResult): Indicator {
  const level: Level = result.screenPositive ? "elevated" : result.total >= WURS_CUTOFF - 10 ? "mild" : "typical";
  return {
    key: "wurs",
    label: "WURS-25 (childhood symptoms, retrospective)",
    z: null,
    level,
    valueText: `${result.total}/100 (cutoff ${WURS_CUTOFF})`,
    meaning:
      "Retrospective report of childhood (ages ~6-10) attention/behavior problems. ADHD requires childhood-onset symptoms, so this is a necessary complement to a current-symptom scale like the ASRS, not a replacement for it.",
    regions: [],
    refs: ["ward1993wurs", "faraone2021consensus"],
  };
}

export function computeIndicators(session: Session): Indicator[] {
  const indicators: Indicator[] = [];

  if (session.asrs) indicators.push(asrsIndicator(scoreAsrs(session.asrs)));
  if (session.wurs) indicators.push(wursIndicator(scoreWurs(session.wurs)));

  if (session.cpt) {
    const c = session.cpt;
    indicators.push(
      objectiveIndicator(
        "cpt-omission",
        "CPT omission errors",
        c.omissionPct,
        cptNorms.omissionPct,
        `${c.omissionPct.toFixed(1)}%`,
        "Missed responses to target letters -- associated with reduced sustained attention / vigilance and, per dopaminergic reward-pathway findings, reduced task engagement.",
        ["accumbens"],
      ),
      objectiveIndicator(
        "cpt-commission",
        "CPT commission errors",
        c.commissionPct,
        cptNorms.commissionPct,
        `${c.commissionPct.toFixed(1)}%`,
        "Responses to the no-go letter that should have been withheld -- a direct behavioral readout of impulsive responding and weak conflict monitoring.",
        ["acc"],
      ),
      objectiveIndicator(
        "cpt-rtsd",
        "CPT reaction-time variability",
        c.rtSd,
        cptNorms.rtSd,
        `SD ${c.rtSd.toFixed(0)} ms`,
        "Trial-to-trial inconsistency in response speed. More consistently linked to ADHD across studies than mean speed itself -- associated with intrusions from the brain's default-mode network during tasks that should suppress it.",
        ["dmn", "cerebellum"],
      ),
      objectiveIndicator(
        "cpt-tau",
        "CPT attentional lapses (tau)",
        c.tau,
        cptNorms.tau,
        `tau ${c.tau.toFixed(0)} ms`,
        "The slow tail of the response-time distribution -- occasional very slow trials thought to reflect brief attentional lapses rather than generally slower processing.",
        ["dmn", "parietal"],
      ),
      objectiveIndicator(
        "cpt-dprime",
        "CPT target sensitivity (d')",
        c.dPrime,
        cptNorms.dPrime,
        c.dPrime.toFixed(2),
        "Signal-detection sensitivity to the go/no-go distinction, combining omissions and commissions into one discriminability measure.",
        ["parietal"],
      ),
    );
  }

  if (session.stop) {
    const s = session.stop;
    if (s.valid) {
      indicators.push(
        objectiveIndicator(
          "stop-ssrt",
          "Stop-signal reaction time (SSRT)",
          s.ssrt,
          stopNorms.ssrt,
          `${s.ssrt.toFixed(0)} ms`,
          "Estimated time needed to cancel an already-initiated response. The most specific objective marker of inhibitory control deficits in the ADHD literature.",
          ["ifg", "striatum"],
        ),
      );
    } else {
      indicators.push({
        key: "stop-ssrt",
        label: "Stop-signal reaction time (SSRT)",
        z: null,
        level: "typical",
        valueText: `invalid estimate (p(respond|stop) ${(s.pRespondGivenStop * 100).toFixed(0)}%, outside the 25-75% band required for a valid SSRT)`,
        meaning: "The staircase didn't converge near a 50% stop rate, so SSRT can't be trusted this run -- not a result, just a disqualified estimate.",
        regions: ["ifg", "striatum"],
        refs: ["verbruggen2019"],
      });
    }
  }

  if (session.nback) {
    const n = session.nback;
    indicators.push(
      objectiveIndicator(
        "nback-dprime",
        "N-back working memory (d')",
        n.dPrime,
        nbackNorms.dPrime,
        n.dPrime.toFixed(2),
        "Signal-detection sensitivity on the 2-back task. Working-memory deficits in ADHD are moderate and partially independent of the inhibitory and attentional measures above.",
        ["pfc"],
      ),
    );
  }

  return indicators;
}
