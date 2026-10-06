import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  asrsItems,
  asrsResponseLabels,
  wursItems,
  wursResponseLabels,
  emotionalDyscontrolItems,
  emotionalDyscontrolResponseLabels,
  type CptTrial,
  type StopTrial,
  type NbackTrial,
  type FlankerTrial,
} from "@adhd-screener/core";
import { Questionnaire } from "../components/Questionnaire";
import { CptTask } from "../components/CptTask";
import { StopTask } from "../components/StopTask";
import { FlankerTask } from "../components/FlankerTask";
import { NbackTask } from "../components/NbackTask";
import { sessionsApi, screeningDraftApi, ApiError, type ScreeningDraft } from "../lib/api";

type Step = "intro" | "asrs" | "wurs" | "emotionalDyscontrol" | "cpt" | "stop" | "flanker" | "nback" | "submitting";

function saveDraft(patch: ScreeningDraft) {
  // Best-effort: losing a draft write shouldn't block the person from
  // moving on to the next step they're already looking at.
  screeningDraftApi.save(patch).catch((err) => console.error("[screening-draft] failed to save:", err));
}

export function ScreeningFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ScreeningDraft | null | undefined>(undefined); // undefined = still checking

  const asrsRef = useRef<number[] | null>(null);
  const wursRef = useRef<number[] | null>(null);
  const emotionalDyscontrolRef = useRef<number[] | null>(null);
  const cptRef = useRef<CptTrial[] | null>(null);
  const stopRef = useRef<{ trials: StopTrial[]; maxRt: number } | null>(null);
  const flankerRef = useRef<FlankerTrial[] | null>(null);
  const nbackRef = useRef<NbackTrial[] | null>(null);

  useEffect(() => {
    screeningDraftApi
      .get()
      .then(setDraft)
      .catch(() => setDraft(null));
  }, []);

  function resumeDraft(d: ScreeningDraft) {
    asrsRef.current = d.asrs ?? null;
    wursRef.current = d.wurs ?? null;
    emotionalDyscontrolRef.current = d.emotionalDyscontrol ?? null;
    cptRef.current = d.cptTrials ?? null;
    if (d.stopTrials && d.stopMaxRt !== undefined) stopRef.current = { trials: d.stopTrials, maxRt: d.stopMaxRt };
    flankerRef.current = d.flankerTrials ?? null;
    setStep(d.step);
  }

  function startOver() {
    screeningDraftApi.clear().catch((err) => console.error("[screening-draft] failed to clear:", err));
    setDraft(null);
    asrsRef.current = null;
    wursRef.current = null;
    emotionalDyscontrolRef.current = null;
    cptRef.current = null;
    stopRef.current = null;
    flankerRef.current = null;
    nbackRef.current = null;
    setStep("asrs");
  }

  async function finish() {
    setStep("submitting");
    setError(null);
    try {
      const created = await sessionsApi.create({
        asrs: asrsRef.current ?? undefined,
        wurs: wursRef.current ?? undefined,
        emotionalDyscontrol: emotionalDyscontrolRef.current ?? undefined,
        cptTrials: cptRef.current ?? undefined,
        stopTrials: stopRef.current?.trials,
        stopMaxRt: stopRef.current?.maxRt,
        flankerTrials: flankerRef.current ?? undefined,
        nbackTrials: nbackRef.current ?? undefined,
      });
      screeningDraftApi.clear().catch((err) => console.error("[screening-draft] failed to clear:", err));
      navigate(`/report/${created._id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your results. Please try again.");
      setStep("nback");
    }
  }

  if (step === "intro") {
    if (draft === undefined) {
      return <div className="py-24 text-center text-subtle">Checking for an unfinished screening...</div>;
    }

    const hasDraft =
      draft &&
      (draft.asrs || draft.wurs || draft.emotionalDyscontrol || draft.cptTrials || draft.stopTrials || draft.flankerTrials || draft.nbackTrials);

    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-slide-up">
        <h1 className="text-2xl font-bold text-heading">New Screening</h1>
        <p className="mt-3 text-subtle">
          This takes about 14 minutes total: three short questionnaires (~2 min each), then four brief computer tasks
          measuring attention, response inhibition, selective attention, and working memory (~2 min each).
        </p>
        <p className="mt-3 text-sm text-faint">
          Make sure you have about 14 uninterrupted minutes before you begin. Each individual task needs your full
          attention start to finish, but your progress is saved after every section -- if you do need to stop, you can
          pick up again right where you left off.
        </p>

        {hasDraft ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-subtle">
              You have an unfinished screening in progress (next up: <span className="font-medium text-heading">{draft!.step}</span>).
            </p>
            <div className="flex gap-3">
              <button className="btn-primary px-5 py-2.5" onClick={() => resumeDraft(draft!)}>
                Resume
              </button>
              <button className="btn-secondary px-5 py-2.5" onClick={startOver}>
                Start over
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-primary mt-6" onClick={() => setStep("asrs")}>
            Begin
          </button>
        )}
      </div>
    );
  }

  if (step === "asrs") {
    return (
      <div className="px-4 py-12">
        <Questionnaire
          key="asrs"
          title="Current Symptoms"
          subtitle="Think about the last 6 months. For each question, choose how often it applies to you."
          items={asrsItems}
          labels={asrsResponseLabels}
          onComplete={(responses) => {
            asrsRef.current = responses;
            saveDraft({ step: "wurs", asrs: responses });
            setStep("wurs");
          }}
        />
      </div>
    );
  }

  if (step === "wurs") {
    return (
      <div className="px-4 py-12">
        <Questionnaire
          key="wurs"
          title="Childhood Symptoms"
          subtitle="Think back to when you were a child (roughly ages 6-10). Rate how much each item described you then."
          items={wursItems}
          labels={wursResponseLabels}
          onComplete={(responses) => {
            wursRef.current = responses;
            saveDraft({ step: "emotionalDyscontrol", wurs: responses });
            setStep("emotionalDyscontrol");
          }}
        />
      </div>
    );
  }

  if (step === "emotionalDyscontrol") {
    return (
      <div className="px-4 py-12">
        <Questionnaire
          key="emotionalDyscontrol"
          title="Mood & Reactions"
          subtitle="Think about the last 6 months. For each question, choose how often it applies to you."
          items={emotionalDyscontrolItems}
          labels={emotionalDyscontrolResponseLabels}
          onComplete={(responses) => {
            emotionalDyscontrolRef.current = responses;
            saveDraft({ step: "cpt", emotionalDyscontrol: responses });
            setStep("cpt");
          }}
        />
      </div>
    );
  }

  if (step === "cpt") {
    return (
      <div className="px-4 py-12">
        <CptTask
          onComplete={(trials) => {
            cptRef.current = trials;
            saveDraft({ step: "stop", cptTrials: trials });
            setStep("stop");
          }}
        />
      </div>
    );
  }

  if (step === "stop") {
    return (
      <div className="px-4 py-12">
        <StopTask
          onComplete={(trials, maxRt) => {
            stopRef.current = { trials, maxRt };
            saveDraft({ step: "flanker", stopTrials: trials, stopMaxRt: maxRt });
            setStep("flanker");
          }}
        />
      </div>
    );
  }

  if (step === "flanker") {
    return (
      <div className="px-4 py-12">
        <FlankerTask
          onComplete={(trials) => {
            flankerRef.current = trials;
            saveDraft({ step: "nback", flankerTrials: trials });
            setStep("nback");
          }}
        />
      </div>
    );
  }

  if (step === "nback") {
    return (
      <div className="px-4 py-12">
        {error && (
          <p className="mx-auto mb-4 max-w-lg rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-600 dark:text-rose-300">
            {error}
          </p>
        )}
        <NbackTask
          onComplete={(trials) => {
            nbackRef.current = trials;
            finish();
          }}
        />
      </div>
    );
  }

  return <div className="py-24 text-center text-subtle">Scoring your results...</div>;
}
