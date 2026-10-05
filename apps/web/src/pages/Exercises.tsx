import { Link } from "react-router-dom";
import { exercises } from "@adhd-screener/core";
import { ExerciseCard } from "../components/ExerciseCard";

export function Exercises() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <span className="rounded-full border border-subtle bg-inset px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
          Self-guided practice &middot; not therapy
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-heading sm:text-4xl">Exercises</h1>
        <p className="mt-3 max-w-xl text-subtle">
          Structured exercises built from real, cited behavioral and cognitive techniques -- the same ones a
          personalized report shows you based on your own results, browsable here on their own. These are self-guided
          skill practice, not a treatment plan; see{" "}
          <Link to="/about-adhd" className="text-brand-600 hover:underline dark:text-brand-300">
            what is ADHD
          </Link>{" "}
          for how real treatment actually works.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </div>
  );
}
