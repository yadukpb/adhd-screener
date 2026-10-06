import { ResultsChat } from "../components/ResultsChat";

export function Coach() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-heading">Daily Coach</h1>
      <p className="mt-1 text-sm text-subtle">
        An AI that already knows your latest results, today's planner, today's check-in, and your learning path --
        ask it for help deciding what to do next, or just how things are going.
      </p>

      <div className="mt-6">
        <ResultsChat
          mode="coach"
          title="Talk to your coach"
          subtitle="Context-aware across your whole account, not just one screening. Not a substitute for professional advice."
        />
      </div>
    </div>
  );
}
