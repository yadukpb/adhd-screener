import type { Indicator } from "../types";
import { el, mount } from "./dom";
import { referenceById } from "../data/references";

const LEVEL_LABEL: Record<Indicator["level"], string> = {
  typical: "Typical range",
  mild: "Mildly elevated",
  elevated: "Elevated",
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

function indicatorCard(ind: Indicator): HTMLElement {
  const refLines = ind.refs.map((id) => {
    const ref = referenceById(id);
    return el("li", {}, [ref ? ref.cite : id]);
  });
  return el("article", { class: `indicator-card level-${ind.level}` }, [
    el("div", { class: "indicator-head" }, [
      el("h3", {}, [ind.label]),
      el("span", { class: `badge badge-${ind.level}` }, [LEVEL_LABEL[ind.level]]),
    ]),
    el("p", { class: "indicator-value" }, [
      ind.valueText,
      ...(ind.z !== null ? [` (z = ${ind.z.toFixed(2)} vs. reference)`] : []),
    ]),
    el("p", { class: "indicator-meaning" }, [ind.meaning]),
    ...(ind.regions.length
      ? [
          el("p", { class: "indicator-regions" }, [
            "Associated brain regions: " + ind.regions.map((r) => REGION_LABEL[r] ?? r).join(", "),
          ]),
        ]
      : []),
    el("details", {}, [el("summary", {}, ["Sources"]), el("ul", { class: "ref-list" }, refLines)]),
  ]);
}

export function renderReport(root: HTMLElement, indicators: Indicator[], onRestart: () => void): void {
  const elevatedCount = indicators.filter((i) => i.level === "elevated").length;
  const mildCount = indicators.filter((i) => i.level === "mild").length;

  const summary = el("div", { class: "report-summary" }, [
    el("p", {}, [
      `${elevatedCount} indicator(s) elevated and ${mildCount} mildly elevated, out of ${indicators.length} measured.`,
    ]),
  ]);

  const disclaimer = el("div", { class: "disclaimer-block" }, [
    el("strong", {}, ["This is a research-based screening aid, not a diagnosis."]),
    el("p", {}, [
      "ADHD diagnosis requires a clinical interview against DSM-5/ICD-11 criteria, developmental history, and evidence of impairment across settings -- no questionnaire or reaction-time task, including this one, is diagnostic on its own. If several indicators above are elevated, consider discussing this report with a clinician (a primary care physician, psychiatrist, or psychologist).",
    ]),
    el("p", {}, [
      "This tool also implements its own simplified versions of these tasks in the browser -- it is not a clinically normed instrument (e.g. Conners CPT-3, TOVA), and the comparison values used are literature-informed estimates, not exact normative tables. See each indicator's sources for what is and isn't established.",
    ]),
  ]);

  const restartBtn = el("button", { class: "btn btn-secondary" }, ["Start over"]);
  restartBtn.addEventListener("click", onRestart);

  const screen = el("section", { class: "screen report" }, [
    el("h2", {}, ["Your Results"]),
    summary,
    el("div", { class: "indicator-grid" }, indicators.map(indicatorCard)),
    disclaimer,
    restartBtn,
  ]);
  mount(root, screen);
}
