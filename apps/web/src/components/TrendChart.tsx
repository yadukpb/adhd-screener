import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SessionSummary } from "../lib/api";
import { FRIENDLY_LABEL } from "../lib/plainLanguage";

// A small, print-stable categorical palette -- distinct hues at matched
// lightness so lines stay distinguishable without relying on color alone
// (also differ in nothing else here, so keep the count modest).
const LINE_COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f472b6", "#38bdf8", "#a78bfa"];

export function TrendChart({ sessions }: { sessions: SessionSummary[] }) {
  if (sessions.length < 2) {
    return (
      <div className="glass-card p-6 text-center text-slate-400">
        Complete at least 2 screenings to see your trend over time.
      </div>
    );
  }

  // Collect every objective (z-scored) indicator key that ever appeared.
  const keys = new Map<string, string>();
  for (const s of sessions) {
    for (const ind of s.indicators) {
      if (ind.z !== null) keys.set(ind.key, FRIENDLY_LABEL[ind.key] ?? ind.label);
    }
  }

  const data = sessions.map((s) => {
    const row: Record<string, number | string> = {
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
    for (const ind of s.indicators) {
      if (ind.z !== null) row[ind.key] = Number(ind.z.toFixed(2));
    }
    return row;
  });

  const keyList = [...keys.entries()];

  return (
    <div className="glass-card p-5">
      <h3 className="mb-1 font-semibold text-slate-100">Your trend over time</h3>
      <p className="mb-4 text-xs text-slate-500">
        Lower is closer to typical. Above the yellow line is worth watching; above the red line is notably different.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={1} stroke="#fbbf24" strokeDasharray="4 4" />
          <ReferenceLine y={2} stroke="#f87171" strokeDasharray="4 4" />
          {keyList.map(([key, label], i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
