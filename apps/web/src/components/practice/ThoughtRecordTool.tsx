import { useEffect, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

export function ThoughtRecordTool() {
  const [records, setRecords] = useState<PracticeEntry[]>([]);
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [evidence, setEvidence] = useState("");
  const [reframe, setReframe] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    practiceApi.list("thought-record").then(setRecords).catch(() => setRecords([]));
  }, []);

  const canSave = situation.trim() && automaticThought.trim() && reframe.trim();

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      const entry = await practiceApi.create({
        exerciseId: "thought-record",
        situation: situation.trim(),
        automaticThought: automaticThought.trim(),
        evidence: evidence.trim() || undefined,
        reframe: reframe.trim(),
      });
      setRecords((prev) => [entry, ...prev]);
      setSituation("");
      setAutomaticThought("");
      setEvidence("");
      setReframe("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>
      <div className="mt-2 space-y-2">
        <div>
          <label className="text-xs text-faint">What happened?</label>
          <input className="input-field mt-1 py-1.5 text-sm" value={situation} onChange={(e) => setSituation(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-faint">What went through your mind?</label>
          <input className="input-field mt-1 py-1.5 text-sm" value={automaticThought} onChange={(e) => setAutomaticThought(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-faint">Evidence against this thought (optional)</label>
          <input className="input-field mt-1 py-1.5 text-sm" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-faint">A more balanced way to see it</label>
          <input className="input-field mt-1 py-1.5 text-sm" value={reframe} onChange={(e) => setReframe(e.target.value)} />
        </div>
        <button className="btn-primary px-4 py-1.5 text-sm" disabled={!canSave || saving} onClick={save}>
          Save
        </button>
      </div>

      {records.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-faint pt-3">
          {records.slice(0, 3).map((r) => (
            <li key={r._id} className="text-sm">
              <p className="text-faint">
                <em>{r.automaticThought}</em>
              </p>
              <p className="mt-0.5 text-body">&rarr; {r.reframe}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
