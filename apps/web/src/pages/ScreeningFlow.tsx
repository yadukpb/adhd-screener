import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  asrsItems,
  asrsResponseLabels,
  wursItems,
  wursResponseLabels,
  type CptTrial,
  type StopTrial,
  type NbackTrial,
} from "@adhd-screener/core";
import { Questionnaire } from "../components/Questionnaire";
import { CptTask } from "../components/CptTask";
import { StopTask } from "../components/StopTask";
import { NbackTask } from "../components/NbackTask";
import { sessionsApi, ApiError } from "../lib/api";

type Step = "intro" | "asrs" | "wurs" | "cpt" | "stop" | "nback" | "submitting";

export function ScreeningFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);

  const asrsRef = useRef<number[] | null>(null);
  const wursRef = useRef<number[] | null>(null);
  const cptRef = useRef<CptTrial[] | null>(null);
  const stopRef = useRef<{ trials: StopTrial[]; maxRt: number } | null>(null);
  const nbackRef = useRef<NbackTrial[] | null>(null);

  async function finish() {
    setStep("submitting");
    setError(null);
    try {
      const created = await sessionsApi.create({
        asrs: asrsRef.current ?? undefined,
        wurs: wursRef.current ?? undefined,
        cptTrials: cptRef.current ?? undefined,
        stopTrials: stopRef.current?.trials,
        stopMaxRt: stopRef.current?.maxRt,
        nbackTrials: nbackRef.current ?? undefined,
      });
      navigate(`/report/${created._id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your results. Please try again.");
      setStep("nback");
    }
  }

  if (step === "intro") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-slide-up">
        <h1 className="text-2xl font-bold text-heading">New Screening</h1>
        <p className="mt-3 text-subtle">
          This takes about 10 minutes: two short questionnaires, then three brief computer tasks measuring attention,
          response inhibition, and working memory.
        </p>
        <button className="btn-primary mt-6" onClick={() => setStep("asrs")}>
          Begin
        </button>
      </div>
    );
  }

  if (step === "asrs") {
    return (
      <div className="px-4 py-12">
        <Questionnaire
          title="Current Symptoms"
          subtitle="Think about the last 6 months. For each question, choose how often it applies to you."
          items={asrsItems}
          labels={asrsResponseLabels}
          onComplete={(responses) => {
            asrsRef.current = responses;
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
          title="Childhood Symptoms"
          subtitle="Think back to when you were a child (roughly ages 6-10). Rate how much each item described you then."
          items={wursItems}
          labels={wursResponseLabels}
          onComplete={(responses) => {
            wursRef.current = responses;
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
