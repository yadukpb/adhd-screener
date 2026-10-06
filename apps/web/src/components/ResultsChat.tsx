import { useEffect, useMemo, useRef, useState } from "react";
import type { Indicator } from "@adhd-screener/core";
import { chatApi, ApiError, type ChatMessage } from "../lib/api";
import { FRIENDLY_LABEL } from "../lib/plainLanguage";
import { COACH_NAME, COACH_AVATAR_URL } from "../lib/coachPersona";

function CoachAvatar({ size = 28 }: { size?: number }) {
  return (
    <img
      src={COACH_AVATAR_URL}
      alt={COACH_NAME}
      width={size}
      height={size}
      className="mt-0.5 shrink-0 rounded-full bg-inset"
      style={{ width: size, height: size }}
    />
  );
}

const FALLBACK_SUGGESTIONS = ["What does this actually mean for me?", "What should I do next?", "Explain that in simpler terms"];

function greetingFor(indicators: Indicator[] | undefined): string {
  if (!indicators || indicators.length === 0) {
    return "Hi! I can see your screening results -- ask me anything about what they mean, in plain language.";
  }
  const elevated = indicators.filter((i) => i.level === "elevated");
  const mild = indicators.filter((i) => i.level === "mild");
  if (elevated.length === 0 && mild.length === 0) {
    return "Hi! Your results came back mostly typical. Ask me anything about what that does (and doesn't) tell you.";
  }
  const parts: string[] = [];
  if (elevated.length > 0) parts.push(`${elevated.length} measure${elevated.length > 1 ? "s" : ""} notably different from typical`);
  if (mild.length > 0) parts.push(`${mild.length} mildly so`);
  return `Hi! I can see ${parts.join(" and ")} in your results. Ask me anything -- I'll explain it in plain language, no jargon.`;
}

function suggestionsFor(indicators: Indicator[] | undefined): string[] {
  if (!indicators || indicators.length === 0) return FALLBACK_SUGGESTIONS;
  const notable = [...indicators].filter((i) => i.level !== "typical").sort((a, b) => (b.z ?? 0) - (a.z ?? 0));
  if (notable.length === 0) return ["What does 'typical' actually mean here?", "What should I do with this result?", "Is this worth telling a doctor about?"];
  const top = notable[0];
  const label = FRIENDLY_LABEL[top.key] ?? top.label;
  const suggestions = [`What does "${label}" actually mean for me?`, "What should I do next?"];
  if (notable.length > 1) suggestions.push("Which of these matters most?");
  else suggestions.push("Explain that in simpler terms");
  return suggestions;
}

const COACH_GREETING =
  "Hi! I'm your daily coach -- I can see your latest screening, today's planner, today's check-in, and your learning path. Ask me anything, from \"what should I focus on\" to how your week's been going.";
const COACH_SUGGESTIONS = ["What should I focus on today?", "Help me get started on something I'm avoiding", "How am I doing lately?"];

/** "Today" / "Yesterday" / a short date -- used to break up a long-running, persisted conversation into visitable days. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

/**
 * The actual stateful chat UI (messages + input), with no card/header chrome
 * around it -- shared by the full-page ResultsChat card below and the
 * floating widget, so both talk to the exact same /api/chat endpoints with
 * the exact same context-aware system prompt instead of drifting apart.
 */
export function ChatThread({
  mode = "results",
  sessionId,
  indicators,
  maxHeightClassName = "max-h-96",
}: {
  mode?: "results" | "coach";
  sessionId?: string;
  indicators?: Indicator[];
  maxHeightClassName?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dynamicGreeting, setDynamicGreeting] = useState<string | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[] | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const skipNextScrollRef = useRef(false);
  const fallbackGreeting = useMemo(() => (mode === "coach" ? COACH_GREETING : greetingFor(indicators)), [mode, indicators]);
  const fallbackSuggestions = useMemo(() => (mode === "coach" ? COACH_SUGGESTIONS : suggestionsFor(indicators)), [mode, indicators]);
  // The coach's greeting/suggestions are rules-based but recomputed server-side
  // on every load (apps/api/src/routes/chat.ts#buildCoachGreeting) from
  // whatever's actually true right now, so they vary visit to visit instead
  // of being the same fixed script -- these are just the offline fallback.
  const greeting = dynamicGreeting ?? fallbackGreeting;
  const suggestions = dynamicSuggestions ?? fallbackSuggestions;

  // Every chat turn is persisted server-side -- load it back in so reopening
  // the widget or the results page doesn't throw away a real conversation.
  useEffect(() => {
    let cancelled = false;
    setHistoryLoaded(false);
    setDynamicGreeting(null);
    setDynamicSuggestions(null);
    chatApi
      .history(mode === "coach" ? undefined : sessionId)
      .then((page) => {
        if (cancelled) return;
        setMessages(page.messages);
        setHasMore(page.hasMore);
        if (page.greeting) setDynamicGreeting(page.greeting);
        if (page.suggestions) setDynamicSuggestions(page.suggestions);
      })
      .catch(() => {
        /* no history yet, or it failed to load -- start fresh either way */
      })
      .finally(() => {
        if (!cancelled) setHistoryLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, sessionId]);

  useEffect(() => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    setInput("");
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setSending(true);
    try {
      const { reply } = mode === "coach" ? await chatApi.sendCoach(trimmed, messages) : await chatApi.send(sessionId!, trimmed, messages);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function loadEarlier() {
    const oldest = messages[0];
    if (loadingMore || !oldest?.createdAt) return;
    setLoadingMore(true);
    try {
      const page = await chatApi.history(mode === "coach" ? undefined : sessionId, oldest.createdAt);
      skipNextScrollRef.current = true;
      setMessages((prev) => [...page.messages, ...prev]);
      setHasMore(page.hasMore);
    } catch {
      /* the button just stays put -- they can try again */
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <div ref={scrollRef} className={`flex min-h-[8rem] flex-col gap-3 overflow-y-auto pr-1 ${maxHeightClassName}`}>
        {!historyLoaded && <p className="text-sm text-faint">Loading conversation...</p>}
        {historyLoaded && hasMore && (
          <button
            type="button"
            onClick={loadEarlier}
            disabled={loadingMore}
            className="mx-auto rounded-full border border-subtle px-3 py-1 text-xs text-faint transition hover-inset disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load earlier messages"}
          </button>
        )}
        {historyLoaded && messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-start gap-2">
              <CoachAvatar />
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-inset px-4 py-2.5 text-sm leading-relaxed text-body">
                {greeting}
              </p>
            </div>
            <p className="text-sm text-faint">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-subtle bg-inset px-3 py-1.5 text-xs text-body transition hover-inset"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => {
          const prevDay = i > 0 && messages[i - 1].createdAt ? dayLabel(messages[i - 1].createdAt!) : null;
          const thisDay = m.createdAt ? dayLabel(m.createdAt) : null;
          const showDivider = thisDay !== null && thisDay !== prevDay;
          return (
            <div key={i}>
              {showDivider && (
                <p className="my-1 text-center text-xs font-medium uppercase tracking-wide text-faint">{thisDay}</p>
              )}
              <div className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && <CoachAvatar />}
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-gradient-to-br from-brand-500 to-purple-500 text-white" : "bg-inset text-body"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex items-start justify-start gap-2">
            <CoachAvatar />
            <p className="rounded-2xl bg-inset px-4 py-2.5 text-sm text-faint">{COACH_NAME} is thinking...</p>
          </div>
        )}
      </div>

      {historyLoaded && messages.length > 0 && suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={sending}
              className="rounded-full border border-subtle bg-inset px-3 py-1.5 text-xs text-body transition hover-inset disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={sending}
          className="min-w-0 flex-1 rounded-xl border border-subtle bg-inset px-4 py-2.5 text-sm text-body outline-none transition focus:border-brand-400"
        />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-50">
          Send
        </button>
      </form>
    </>
  );
}

export function ResultsChat({
  mode = "results",
  sessionId,
  indicators,
  title = `Ask ${COACH_NAME} about your results`,
  subtitle = "Chat about what these results mean, in plain language -- no jargon. Not a substitute for professional advice.",
}: {
  mode?: "results" | "coach";
  sessionId?: string;
  indicators?: Indicator[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="glass-card flex flex-col p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <CoachAvatar size={36} />
        <div>
          <h2 className="text-lg font-bold text-heading">{title}</h2>
          <p className="mt-0.5 text-sm text-subtle">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        <ChatThread mode={mode} sessionId={sessionId} indicators={indicators} />
      </div>
    </div>
  );
}
