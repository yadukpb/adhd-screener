import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center animate-slide-up">
      <span className="rounded-full border border-subtle bg-inset px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
        Research-based screening aid &middot; Not a diagnosis
      </span>
      <h1 className="mt-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-4xl font-extrabold text-transparent dark:from-white dark:to-slate-400 sm:text-5xl">
        Understand your attention, inhibition, and working memory
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-subtle">
        Three short questionnaires and three computer tasks, scored against literature-informed norms with every claim
        traced to a citation. Track how your indicators move over time, and ask an AI that already knows your results
        to walk you through them in plain language.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to={user ? "/screen" : "/register"} className="btn-primary px-6 py-3">
          {user ? "Start a screening" : "Create a free account"}
        </Link>
        {!user && (
          <Link to="/login" className="btn-secondary px-6 py-3">
            Sign in
          </Link>
        )}
      </div>

      <div className="mt-16 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "3 questionnaires", body: "Current symptoms, childhood symptoms, and emotional regulation -- every scoring threshold traced to its source." },
          { title: "3 objective tasks", body: "A go/no-go CPT, a stop-signal task, and a 2-back -- the same measures used in the ADHD research literature." },
          { title: "Your trend over time", body: "Every result is saved to your account so you can see each indicator move across repeated screenings." },
          { title: "Ask the AI about it", body: "Once you have results, chat with an assistant that already has the full context -- plain-language answers, no clinical jargon." },
        ].map((f) => (
          <div key={f.title} className="glass-card p-5">
            <h3 className="font-semibold text-heading">{f.title}</h3>
            <p className="mt-2 text-sm text-subtle">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
