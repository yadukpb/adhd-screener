import { useEffect, useMemo, useRef, useState } from "react";
import type { Indicator } from "@adhd-screener/core";
import { chatApi, ApiError, type ChatMessage } from "../lib/api";
import { FRIENDLY_LABEL } from "../lib/plainLanguage";

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

export function ResultsChat({
  sessionId,
  indicators,
  title = "Ask about your results",
}: {
  sessionId: string;
  indicators?: Indicator[];
  title?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeting = useMemo(() => greetingFor(indicators), [indicators]);
  const suggestions = useMemo(() => suggestionsFor(indicators), [indicators]);

  useEffect(() => {
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
      const { reply } = await chatApi.send(sessionId, trimmed, messages);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass-card flex flex-col p-5 sm:p-6">
      <h2 className="text-lg font-bold text-heading">{title}</h2>
      <p className="mt-1 text-sm text-subtle">
        Chat about what these results mean, in plain language -- no jargon. Not a substitute for professional advice.
      </p>

      <div ref={scrollRef} className="mt-4 flex max-h-96 min-h-[8rem] flex-col gap-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-start">
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
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-gradient-to-br from-brand-500 to-purple-500 text-white" : "bg-inset text-body"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <p className="rounded-2xl bg-inset px-4 py-2.5 text-sm text-faint">Thinking...</p>
          </div>
        )}
      </div>

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
    </div>
  );
}
