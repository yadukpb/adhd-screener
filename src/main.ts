import type { Session } from "./types";
import { el, mount, button } from "./ui/dom";
import { runQuestionnaire } from "./ui/questionnaireScreen";
import { runCptScreen } from "./ui/cptScreen";
import { runStopScreen } from "./ui/stopScreen";
import { runNbackScreen } from "./ui/nbackScreen";
import { renderReport } from "./ui/report";
import { computeIndicators } from "./scoring/indicators";
import { summarizeCpt } from "./tasks/cpt";
import { summarizeStop } from "./tasks/stopSignal";
import { summarizeNback } from "./tasks/nback";
import { asrsItems, asrsResponseLabels } from "./questionnaires/asrs";
import { wursItems, wursResponseLabels } from "./questionnaires/wurs";

const app = document.getElementById("app");
if (!app) throw new Error("#app root not found");

function freshSession(): Session {
  return { asrs: null, wurs: null };
}

function showIntro(root: HTMLElement) {
  const screen = el("section", { class: "screen intro" }, [
    el("h1", {}, ["ADHD Indicator Screener"]),
    el("p", {}, [
      "This takes about 10 minutes: two short questionnaires, then three brief computer tasks measuring attention, response inhibition, and working memory.",
    ]),
    el("p", {}, ["Your answers stay in this browser tab -- nothing is sent anywhere or saved after you close the page."]),
    button("Begin", () => showAsrs(root)),
  ]);
  mount(root, screen);
}

function showAsrs(root: HTMLElement) {
  runQuestionnaire(
    root,
    "Current Symptoms",
    "Think about the last 6 months. For each question, choose how often it applies to you.",
    asrsItems,
    asrsResponseLabels,
    (responses) => {
      session.asrs = responses;
      showWurs(root);
    },
  );
}

function showWurs(root: HTMLElement) {
  runQuestionnaire(
    root,
    "Childhood Symptoms",
    "Think back to when you were a child (roughly ages 6-10). For each item, rate how much it described you then.",
    wursItems,
    wursResponseLabels,
    (responses) => {
      session.wurs = responses;
      showCpt(root);
    },
  );
}

function showCpt(root: HTMLElement) {
  runCptScreen(root, (trials) => {
    session.cpt = summarizeCpt(trials);
    showStop(root);
  });
}

function showStop(root: HTMLElement) {
  runStopScreen(root, (trials, maxRt) => {
    session.stop = summarizeStop(trials, maxRt);
    showNback(root);
  });
}

function showNback(root: HTMLElement) {
  runNbackScreen(root, (trials) => {
    session.nback = summarizeNback(trials);
    showReport(root);
  });
}

function showReport(root: HTMLElement) {
  const indicators = computeIndicators(session);
  renderReport(root, indicators, () => {
    session = freshSession();
    showIntro(root);
  });
}

let session = freshSession();
showIntro(app);
