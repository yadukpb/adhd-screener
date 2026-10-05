import { useEffect, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

export function PausePlanTool() {
  const [plans, setPlans] = useState<PracticeEntry[]>([]);
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    practiceApi.list("pause-plan").then(setPlans).catch(() => setPlans([]));
  }, []);

  async function save() {
    if (!situation.trim() || !action.trim()) return;
    setSaving(true);
    try {
      const entry = await practiceApi.create({ exerciseId: "pause-plan", situation: situation.trim(), action: action.trim() });
      setPlans((prev) => [entry, ...prev]);
      setSituation("");
      setAction("");
    } finally {
      setSaving(false);
    }
  }

  async function markUsed(id: string) {
    setPlans((prev) => prev.map((p) => (p._id === id ? { ...p, used: true } : p)));
    try {
      await practiceApi.update(id, { used: true });
    } catch {
      setPlans((prev) => prev.map((p) => (p._id === id ? { ...p, used: false } : p)));
    }
  }

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>
      <div className="mt-2 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-body">
          <span className="text-subtle">If</span>
          <input
            className="input-field flex-1 py-1.5"
            placeholder="I feel the urge to reply immediately"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-body">
          <span className="text-subtle">then I will</span>
          <input
            className="input-field flex-1 py-1.5"
            placeholder="take 3 breaths and finish my sentence first"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
        </div>
        <button className="btn-primary px-4 py-1.5 text-sm" disabled={saving || !situation.trim() || !action.trim()} onClick={save}>
          Save my plan
        </button>
      </div>

      {plans.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-faint pt-3">
          {plans.map((p) => (
            <li key={p._id} className="flex items-start justify-between gap-2 text-sm">
              <span className="text-body">
                If <strong>{p.situation}</strong>, then I will <strong>{p.action}</strong>
              </span>
              {p.used ? (
                <span className="shrink-0 rounded-full badge-typical px-2 py-0.5 text-xs">Used it</span>
              ) : (
                <button className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300" onClick={() => markUsed(p._id)}>
                  I used this
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
