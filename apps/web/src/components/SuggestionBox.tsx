import { useState } from "react";
import { suggestionsApi, ApiError } from "../lib/api";
import { IconLightbulb } from "./icons";

/**
 * A small, separate channel for "here's an idea for the app" feedback --
 * deliberately NOT routed through the AI chat (no LLM call, nothing for the
 * model to interpret or act on). It's stored as-is for a human (the admin
 * suggestions list) to read later.
 */
export function SuggestionBox() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-600 transition hover:underline dark:text-brand-300"
      >
        <IconLightbulb size={13} />
        Suggest something for the app
      </button>
    );
  }

  if (sent) {
    return <p className="mt-2 text-xs text-subtle">Thanks -- that's been sent along.</p>;
  }

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await suggestionsApi.create(trimmed);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-subtle bg-inset p-3">
      <p className="text-xs font-semibold text-heading">Suggest something for the app</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="A feature, a fix, anything you wish this app did..."
        rows={3}
        disabled={sending}
        className="mt-2 w-full resize-none rounded-lg border border-subtle bg-white px-3 py-2 text-sm text-body outline-none transition focus:border-brand-400 dark:bg-slate-800"
      />
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setText("");
            setError(null);
          }}
          className="px-3 py-1.5 text-xs text-faint transition hover:text-body"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={sending || !text.trim()}
          className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
