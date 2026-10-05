import { useState } from "react";

export interface QuestionnaireItem {
  id: string;
  text: string;
}

interface Props {
  title: string;
  subtitle: string;
  items: QuestionnaireItem[];
  labels: readonly string[];
  onComplete: (responses: number[]) => void;
}

export function Questionnaire({ title, subtitle, items, labels, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);

  const item = items[index];
  const progressPct = Math.round((index / items.length) * 100);

  function choose(value: number) {
    const next = [...responses];
    next[index] = value;
    setResponses(next);
    if (index + 1 >= items.length) onComplete(next);
    else setIndex(index + 1);
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-slate-400">{subtitle}</p>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all" style={{ width: `${progressPct}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Question {index + 1} of {items.length}
      </p>

      <div className="glass-card mt-4 p-6">
        <p className="text-lg text-slate-100">{item.text}</p>
        <div className="mt-6 flex flex-col gap-2">
          {labels.map((label, value) => (
            <button
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-200
                transition hover:border-brand-400/50 hover:bg-brand-500/10 active:scale-[0.99]"
              onClick={() => choose(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {index > 0 && (
        <button className="btn-secondary mt-4" onClick={() => setIndex(index - 1)}>
          Back
        </button>
      )}
    </div>
  );
}
