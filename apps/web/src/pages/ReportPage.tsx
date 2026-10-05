import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { sessionsApi, ApiError, type SessionSummary } from "../lib/api";
import { ReportView } from "../components/ReportView";

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [previous, setPrevious] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setSession(null);
    setPrevious(null);
    setError(null);

    sessionsApi
      .get(id)
      .then(async (current) => {
        setSession(current);
        try {
          const all = await sessionsApi.list(); // ascending by createdAt
          const idx = all.findIndex((s) => s._id === current._id);
          if (idx > 0) setPrevious(all[idx - 1]);
        } catch {
          // Comparison line is a nice-to-have -- don't block the report on it.
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this report"));
  }, [id]);

  if (error) {
    return <div className="py-24 text-center text-rose-400">{error}</div>;
  }
  if (!session) {
    return <div className="py-24 text-center text-slate-500">Loading report...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Results</h1>
          <p className="text-sm text-slate-500">{new Date(session.createdAt).toLocaleString()}</p>
        </div>
        <Link to="/dashboard" className="btn-secondary px-4 py-2 text-sm">
          Back to dashboard
        </Link>
      </div>
      <ReportView indicators={session.indicators} previous={previous?.indicators} />
    </div>
  );
}
