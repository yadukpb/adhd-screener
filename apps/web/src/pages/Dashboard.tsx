import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sessionsApi, habitLogApi, dailyTasksApi, type SessionSummary, type DailyTask } from "../lib/api";
import { todayKey } from "../lib/date";
import { TrendChart } from "../components/TrendChart";
import { ResultsChat } from "../components/ResultsChat";
import { useAuth } from "../hooks/useAuth";
import { headlineForCounts } from "../lib/plainLanguage";
import {
  IconClipboard,
  IconCalendar,
  IconTimer,
  IconHeart,
  IconChat,
  IconRoute,
  IconActivity,
  IconArrowRight,
} from "../components/icons";

const QUICK_LINKS = [
  { href: "/planner", icon: IconCalendar, title: "Planner", body: "Plan your day" },
  { href: "/focus", icon: IconTimer, title: "Focus Timer", body: "Start a focus block" },
  { href: "/habits", icon: IconHeart, title: "Daily Check-in", body: "Log mood, meds, sleep" },
  { href: "/coach", icon: IconChat, title: "Daily Coach", body: "Ask what to focus on" },
  { href: "/learning-path", icon: IconRoute, title: "Learning Path", body: "Your personalized path" },
  { href: "/exercises", icon: IconActivity, title: "Exercises", body: "Browse coping techniques" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatTile({ icon: Icon, label, value }: { icon: typeof IconClipboard; label: string; value: string }) {
  return (
    <div className="glass-card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-heading">{value}</p>
        <p className="text-xs text-subtle">{label}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [todayTasks, setTodayTasks] = useState<DailyTask[] | null>(null);

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(() => setSessions([]));
    habitLogApi
      .range(30)
      .then((r) => setStreak(r.streak))
      .catch(() => setStreak(0));
    dailyTasksApi
      .list(todayKey())
      .then(setTodayTasks)
      .catch(() => setTodayTasks([]));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 animate-fade-in">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading sm:text-3xl">
            {greeting()}, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-subtle">Here's where things stand today.</p>
        </div>
        <Link to="/screen" className="btn-primary px-5 py-2.5">
          New screening
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatTile icon={IconClipboard} label="Screenings completed" value={sessions === null ? "..." : String(sessions.length)} />
        <StatTile
          icon={IconHeart}
          label="Check-in streak"
          value={streak === null ? "..." : streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "None yet"}
        />
        <StatTile
          icon={IconCalendar}
          label="Tasks today"
          value={todayTasks === null ? "..." : todayTasks.length === 0 ? "None planned" : `${todayTasks.filter((t) => t.done).length}/${todayTasks.length} done`}
        />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">Your tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              to={q.href}
              className="glass-card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
                <q.icon />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-heading">{q.title}</p>
                <p className="mt-0.5 text-xs text-subtle">{q.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {sessions === null && <p className="text-subtle">Loading your screening history...</p>}

      {sessions && sessions.length === 0 && (
        <div className="glass-card p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300">
            <IconClipboard size={22} />
          </span>
          <p className="mt-3 font-semibold text-heading">No screenings yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-subtle">
            The tools above work right away, but a screening unlocks your trend chart, the results chat, and a
            personalized learning path.
          </p>
          <Link to="/screen" className="btn-primary mt-4 inline-flex">
            Start your first screening
          </Link>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div className="space-y-6">
          <ResultsChat
            sessionId={sessions[sessions.length - 1]._id}
            indicators={sessions[sessions.length - 1].indicators}
            title="Ask about your latest results"
          />

          <TrendChart sessions={sessions} />

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">Screening history</h2>
            <div className="glass-card divide-y divide-faint">
              {[...sessions].reverse().map((s) => {
                const elevated = s.indicators.filter((i) => i.level === "elevated").length;
                const mild = s.indicators.filter((i) => i.level === "mild").length;
                const headline = headlineForCounts(elevated, mild);
                const accent =
                  elevated > 0 ? "border-l-rose-500 dark:border-l-rose-400" : mild > 0 ? "border-l-amber-500 dark:border-l-amber-400" : "border-l-emerald-500 dark:border-l-emerald-400";
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
                    className={`flex items-center justify-between gap-3 border-l-4 px-5 py-4 transition hover-inset ${accent}`}
                  >
                    <span className="text-body">{new Date(s.createdAt).toLocaleString()}</span>
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${color}`}>{headline}</span>
                      <IconArrowRight size={14} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
