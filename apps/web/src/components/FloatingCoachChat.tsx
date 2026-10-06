import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ChatThread } from "./ResultsChat";
import { IconChat, IconX } from "./icons";

/**
 * A Crisp/Intercom-style floating bubble, bottom-right on every authed page.
 * Opens into the same "coach" chat as /coach -- same ChatThread, same
 * /api/chat/coach endpoint, so it carries the same server-built context
 * (latest screening, today's planner, today's check-in, learning path)
 * instead of a second, context-blind chat implementation.
 */
export function FloatingCoachChat() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading || !user) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Coach chat"
          className="fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-2xl shadow-slate-900/20 animate-fade-in dark:border-slate-600 dark:bg-slate-900 dark:shadow-black/60 sm:bottom-28 sm:right-6"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <div>
              <h2 className="text-base font-bold text-heading">Coach</h2>
              <p className="mt-0.5 text-xs text-subtle">
                Knows your latest results, today's planner, today's check-in, and your learning path.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-faint transition hover-inset"
            >
              <IconX size={16} />
            </button>
          </div>

          <div className="mt-3">
            <ChatThread mode="coach" maxHeightClassName="max-h-80" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close coach chat" : "Open coach chat"}
        className="fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-lg transition hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {open ? <IconX size={22} /> : <IconChat size={22} />}
      </button>
    </>
  );
}
