import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sessionsApi, type SessionSummary } from "../lib/api";
import { TrendChart } from "../components/TrendChart";
import { ResultsChat } from "../components/ResultsChat";
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
          <h1 className="text-2xl font-bold text-heading">Welcome back, {user?.name}</h1>
          <p className="text-sm text-subtle">Your personalized screening history.</p>
        </div>
        <Link to="/screen" className="btn-primary px-5 py-2.5">
          Start a new screening
        </Link>
      </div>

      {sessions === null && <p className="text-subtle">Loading...</p>}

      {sessions && sessions.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-body">You haven't completed a screening yet.</p>
          <Link to="/screen" className="btn-primary mt-4 inline-flex">
            Start your first screening
          </Link>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div className="space-y-6">
          <Link to="/learning-path" className="glass-card flex items-center justify-between gap-3 p-5 transition hover-inset">
            <div>
              <p className="font-semibold text-heading">Your learning path</p>
              <p className="mt-0.5 text-sm text-subtle">Sections to read and exercises to try, based on your latest results.</p>
            </div>
            <span className="shrink-0 text-brand-600 dark:text-brand-300">&rarr;</span>
          </Link>

          <ResultsChat
            sessionId={sessions[sessions.length - 1]._id}
            indicators={sessions[sessions.length - 1].indicators}
            title="Ask about your latest results"
          />

          <TrendChart sessions={sessions} />

          <div className="glass-card divide-y divide-faint">
            {[...sessions].reverse().map((s) => {
              const elevated = s.indicators.filter((i) => i.level === "elevated").length;
              const mild = s.indicators.filter((i) => i.level === "mild").length;
              const headline = headlineForCounts(elevated, mild);
              const color =
                elevated > 0
                  ? "text-rose-600 dark:text-rose-300"
                  : mild > 0
                    ? "text-amber-600 dark:text-amber-300"
                    : "text-emerald-600 dark:text-emerald-300";
              return (
                <Link
                  key={s._id}
                  to={`/report/${s._id}`}
                  className="flex items-center justify-between px-5 py-4 transition hover-inset"
                >
                  <span className="text-body">{new Date(s.createdAt).toLocaleString()}</span>
                  <span className={`text-sm font-medium ${color}`}>{headline}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
