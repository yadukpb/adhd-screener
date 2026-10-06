import { useEffect, useState } from "react";
import { suggestionsApi, ApiError, type Suggestion } from "../lib/api";

function submitterLabel(user: Suggestion["user"]): string {
  if (typeof user === "string") return user;
  return `${user.name} (${user.email})`;
}

export function Admin() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    suggestionsApi
      .list()
      .then(setSuggestions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load suggestions."));
  }, []);

  async function toggleStatus(s: Suggestion) {
    setUpdating(s._id);
    try {
      const next = s.status === "new" ? "reviewed" : "new";
      const updated = await suggestionsApi.setStatus(s._id, next);
      setSuggestions((prev) => prev?.map((x) => (x._id === updated._id ? updated : x)) ?? prev);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update that.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-heading">Admin -- Suggestions</h1>
      <p className="mt-1 text-sm text-subtle">
        Ideas people have sent in from the coach chat's "Suggest something" box, newest first.
      </p>

      {error && <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {!suggestions && !error && <p className="mt-6 text-sm text-faint">Loading...</p>}

      {suggestions && suggestions.length === 0 && <p className="mt-6 text-sm text-faint">No suggestions yet.</p>}

      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          {suggestions.map((s) => (
            <div key={s._id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-body">{s.message}</p>
                  <p className="mt-1.5 text-xs text-faint">
                    {submitterLabel(s.user)} &middot; {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStatus(s)}
                  disabled={updating === s._id}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                    s.status === "reviewed" ? "badge-typical" : "badge-mild"
                  }`}
                >
                  {s.status === "reviewed" ? "Reviewed" : "New"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
