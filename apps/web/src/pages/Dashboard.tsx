import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sessionsApi, type SessionSummary } from "../lib/api";
import { TrendChart } from "../components/TrendChart";
import { useAuth } from "../hooks/useAuth";
import { headlineForCounts } from "../lib/plainLanguage";

export function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(() => setSessions([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-500">Your personalized screening history.</p>
        </div>
        <Link to="/screen" className="btn-primary px-5 py-2.5">
          Start a new screening
        </Link>
      </div>

      {sessions === null && <p className="text-slate-500">Loading...</p>}

      {sessions && sessions.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-300">You haven't completed a screening yet.</p>
          <Link to="/screen" className="btn-primary mt-4 inline-flex">
            Start your first screening
          </Link>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div className="space-y-6">
          <TrendChart sessions={sessions} />

          <div className="glass-card divide-y divide-white/5">
            {[...sessions].reverse().map((s) => {
              const elevated = s.indicators.filter((i) => i.level === "elevated").length;
              const mild = s.indicators.filter((i) => i.level === "mild").length;
              const headline = headlineForCounts(elevated, mild);
              const color = elevated > 0 ? "text-rose-300" : mild > 0 ? "text-amber-300" : "text-emerald-300";
              return (
                <Link
                  key={s._id}
                  to={`/report/${s._id}`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-white/5"
                >
                  <span className="text-slate-200">{new Date(s.createdAt).toLocaleString()}</span>
                  <span className={`text-sm ${color}`}>{headline}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
