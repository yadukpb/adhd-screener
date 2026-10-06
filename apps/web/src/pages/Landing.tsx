import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center animate-slide-up">
      <span className="rounded-full border border-subtle bg-inset px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
        ADHD screening aid &middot; Not a diagnosis
      </span>
      <h1 className="mt-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-4xl font-extrabold text-transparent dark:from-white dark:to-slate-400 sm:text-5xl">
        Could it be ADHD? Get a clearer picture.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-subtle">
        A few short questionnaires and quick computer games -- not a clinical interview -- that check for common ADHD
        patterns like attention, impulse control, and emotional ups and downs. Backed by real research, explained in
        plain language, and you can chat with an AI afterward to understand what it found.
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

      <div className="mt-20 text-left">
        <h2 className="text-center text-2xl font-bold text-heading">What this actually does</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-subtle">
          Not a vague "take our quiz" -- here's exactly what happens, in order, and why each piece is there.
        </p>

        <div className="mt-8 space-y-5">
          <div className="glass-card flex gap-4 p-5 sm:p-6">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-600 dark:text-brand-300">
              1
            </span>
            <div>
              <h3 className="font-semibold text-heading">You answer 3 short questionnaires (~6 minutes)</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                The <strong>ASRS-v1.1 Part A</strong> asks about your current, day-to-day attention and activity
                patterns, scored against its published clinical threshold key -- not just a raw score cutoff. The{" "}
                <strong>WURS-25</strong> asks you to think back to childhood (ages 6-10), because a real ADHD
                evaluation requires symptoms to have started young, not just be present now. A third,{" "}
                <strong>original</strong> questionnaire asks about mood swings, irritability, and overreacting --
                emotional regulation is increasingly recognized as a core adult ADHD feature that most screeners
                skip entirely.
              </p>
            </div>
          </div>

          <div className="glass-card flex gap-4 p-5 sm:p-6">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-600 dark:text-brand-300">
              2
            </span>
            <div>
              <h3 className="font-semibold text-heading">You run 3 short computer tasks (~6 minutes)</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                Self-report only tells you what you believe about yourself. These tasks measure something harder to
                fake: a <strong>go/no-go test</strong> (sustained attention -- do you catch targets and hold back on
                the one letter you shouldn't react to?), a <strong>stop-signal task</strong> (how fast you can cancel
                a response you've already started -- the most specific marker of inhibitory control in the ADHD
                literature), and a <strong>2-back task</strong> (holding a small amount of information in mind while
                it keeps changing). Each one is scored against literature-derived norms, not an arbitrary pass/fail.
              </p>
            </div>
          </div>

          <div className="glass-card flex gap-4 p-5 sm:p-6">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-600 dark:text-brand-300">
              3
            </span>
            <div>
              <h3 className="font-semibold text-heading">You get a report with both a plain-language and a technical view</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                Every single measure -- 10 of them across the three categories above -- gets its own card: what it
                found in plain words, the actual technical value underneath if you want it, and the published source
                behind it. Nothing is hidden, and nothing is asserted without a citation you can check yourself.
              </p>
            </div>
          </div>

          <div className="glass-card flex gap-4 p-5 sm:p-6">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-600 dark:text-brand-300">
              4
            </span>
            <div>
              <h3 className="font-semibold text-heading">You get a learning path and an AI chat built from your own results</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                Whatever came back notably different from typical turns into a personalized path: a short explainer
                for why that area matters, paired with a real, cited coping exercise to actually try -- not generic
                self-help. An AI chat sits alongside your report, already loaded with your actual results, to answer
                follow-up questions in plain language instead of leaving you to Google clinical terms alone.
              </p>
            </div>
          </div>

          <div className="glass-card flex gap-4 p-5 sm:p-6">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-600 dark:text-brand-300">
              5
            </span>
            <div>
              <h3 className="font-semibold text-heading">You can repeat it and watch your trend over time</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">
                Every screening you run gets saved to your account. Your dashboard charts each objective indicator's
                score across every past screening, so you can actually see whether something you're trying -- an
                exercise, a medication change, a new routine -- is moving the numbers, instead of relying on a gut
                feeling about whether things are getting better.
              </p>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-faint">
          What this is <strong>not</strong>: a diagnosis. No questionnaire or task, including every one here, is
          diagnostic on its own -- a real evaluation requires a clinical interview against DSM-5/ICD-11 criteria. If
          your results come back notably different from typical, the honest next step this app will tell you is the
          same one a doctor would: talk to a clinician.
        </p>
      </div>
    </div>
  );
}
