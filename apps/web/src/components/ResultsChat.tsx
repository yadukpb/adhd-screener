import { useEffect, useRef, useState } from "react";
import { chatApi, ApiError, type ChatMessage } from "../lib/api";

const SUGGESTIONS = ["What does this actually mean for me?", "What should I do next?", "Explain that in simpler terms"];

export function ResultsChat({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <h2 className="text-lg font-bold text-heading">Ask about your results</h2>
      <p className="mt-1 text-sm text-subtle">
        Chat about what these results mean, in plain language -- no jargon. Not a substitute for professional advice.
      </p>

      <div ref={scrollRef} className="mt-4 flex max-h-96 min-h-[8rem] flex-col gap-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-faint">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
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
