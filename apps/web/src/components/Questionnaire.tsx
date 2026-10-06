import { useEffect, useState } from "react";

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
  const selected = responses[index];

  function choose(value: number) {
    const next = [...responses];
    next[index] = value;
    setResponses(next);
    if (index + 1 >= items.length) onComplete(next);
    else setIndex(index + 1);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= labels.length) choose(n - 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, responses, labels.length]);

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-heading">{title}</h2>
      <p className="mt-1 text-subtle">{subtitle}</p>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-inset">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all" style={{ width: `${progressPct}%` }} />
      </div>
      <p className="mt-2 text-sm text-faint">
        Question {index + 1} of {items.length}
      </p>

      <div className="glass-card mt-4 p-6">
        <p className="text-lg text-heading">{item.text}</p>
        <div className="mt-6 flex flex-col gap-2">
          {labels.map((label, value) => (
            <button
              key={label}
              className={`rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                selected === value
                  ? "border-brand-400 bg-brand-500/15 text-heading"
                  : "border-subtle bg-inset text-body hover:border-brand-400/50 hover:bg-brand-500/10"
              }`}
              onClick={() => choose(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-faint">Tip: press 1-{labels.length} on your keyboard to answer.</p>
      </div>

      {index > 0 && (
        <button className="btn-secondary mt-4" onClick={() => setIndex(index - 1)}>
          Back
        </button>
      )}
    </div>
  );
}
