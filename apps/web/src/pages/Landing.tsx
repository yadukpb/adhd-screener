import { Link } from "react-router-dom";
import { referenceById } from "@adhd-screener/core";
import { useAuth } from "../hooks/useAuth";
import { IconClipboard, IconCpu, IconTrend, IconChat, IconUsers, IconSplit, IconHeart, IconSparkle, IconArrowRight, IconLightbulb } from "../components/icons";

const FEATURES = [
  {
    icon: IconClipboard,
    title: "3 questionnaires",
    body: "Current symptoms, childhood symptoms, and emotional regulation -- every scoring threshold traced to its source.",
  },
  {
    icon: IconCpu,
    title: "4 objective tasks",
    body: "A go/no-go CPT, a stop-signal task, a flanker (filtering distractions) task, and a 2-back -- the same measures used in the ADHD research literature.",
  },
  {
    icon: IconTrend,
    title: "Your trend over time",
    body: "Every result is saved to your account so you can see each indicator move across repeated screenings.",
  },
  {
    icon: IconChat,
    title: "Ask the AI about it",
    body: "Once you have results, chat with an assistant that already has the full context -- plain-language answers, no clinical jargon.",
  },
];

const STATS = [
  { icon: IconUsers, value: "~50%", body: "of U.S. adults with a current ADHD diagnosis were only diagnosed at age 18 or older -- roughly half went through childhood and adolescence without it being caught." },
  { icon: IconSplit, value: "61% vs 40%", body: "of women vs. men with ADHD are diagnosed in adulthood rather than childhood -- the quieter, inattentive presentation is easy to miss, especially in girls." },
  { icon: IconHeart, value: "57% / 73%", body: "of long-term studies found untreated ADHD linked to worse self-esteem and worse social functioning -- confidence issues aren't a side note, they're a documented pattern." },
  { icon: IconSparkle, value: "89% / 77%", body: "of those same studies found that treatment improved self-esteem and social-functioning outcomes -- the gap above is addressable once it's identified." },
];

const MYTH_GLIMPSE = [
  {
    myth: "It's just laziness or bad parenting.",
    reality: "It's substantially genetic -- heritability around 70-80%, among the most heritable conditions in psychiatry.",
  },
  {
    myth: "Only hyperactive boys have it.",
    reality: "The inattentive presentation is quiet and easy to miss -- historically under-recognized in girls and women.",
  },
  {
    myth: "You just grow out of it by adulthood.",
    reality: "For a large share of people, impairing symptoms persist into adulthood, just presenting differently.",
  },
];

const STEPS = [
  {
    title: "You answer 3 short questionnaires",
    time: "~6 minutes",
    body: (
      <>
        The <strong>ASRS-v1.1 Part A</strong> asks about your current, day-to-day attention and activity patterns,
        scored against its published clinical threshold key -- not just a raw score cutoff. The <strong>WURS-25</strong>{" "}
        asks you to think back to childhood (ages 6-10), because a real ADHD evaluation requires symptoms to have
        started young, not just be present now. A third, <strong>original</strong> questionnaire asks about mood
        swings, irritability, and overreacting -- emotional regulation most screeners skip entirely.
      </>
    ),
  },
  {
    title: "You run 4 short computer tasks",
    time: "~8 minutes",
    body: (
      <>
        Self-report only tells you what you believe about yourself. These tasks measure something harder to fake: a{" "}
        <strong>go/no-go test</strong>, a <strong>stop-signal task</strong> (the most specific marker of inhibitory
        control in the ADHD literature), a <strong>flanker task</strong> (filtering out distractions), and a{" "}
        <strong>2-back task</strong>. Each one is scored against literature-derived norms, not an arbitrary pass/fail.
      </>
    ),
  },
  {
    title: "You get a report with both a plain-language and a technical view",
    time: null,
    body: (
      <>
        Every single measure -- 11 of them across 5 categories -- gets its own card: what it found in plain words, the
        actual technical value underneath if you want it, and the published source behind it. Nothing is hidden.
      </>
    ),
  },
  {
    title: "You get a learning path and an AI chat built from your own results",
    time: null,
    body: (
      <>
        Whatever came back notably different from typical turns into a personalized path: a short explainer plus a
        real, cited coping exercise -- not generic self-help. An AI chat sits alongside your report, already loaded
        with your actual results.
      </>
    ),
  },
  {
    title: "You can repeat it and watch your trend over time",
    time: null,
    body: (
      <>
        Your dashboard charts each objective indicator's score across every past screening, so you can see whether
        something you're trying is actually moving the numbers, instead of relying on a gut feeling.
      </>
    ),
  },
];

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-32 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/25"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-subtle bg-inset px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              ADHD screening aid &middot; Not a diagnosis
            </span>
            <h1 className="mt-6 bg-gradient-to-br from-slate-900 via-brand-700 to-slate-900 bg-clip-text text-4xl font-extrabold leading-tight text-transparent dark:from-white dark:via-brand-300 dark:to-white sm:text-5xl">
              Could it be ADHD? Get a clearer picture.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-subtle lg:mx-0">
              A few short questionnaires and quick computer games -- not a clinical interview -- that check for common
              ADHD patterns like attention, impulse control, and emotional ups and downs. Backed by real research,
              explained in plain language, and you can chat with an AI afterward to understand what it found.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to={user ? "/screen" : "/register"} className="btn-primary px-6 py-3">
                {user ? "Start a screening" : "Create a free account"}
              </Link>
              {!user && (
                <Link to="/login" className="btn-secondary px-6 py-3">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div
              aria-hidden
              className="absolute -right-5 -top-5 h-full w-full rotate-6 rounded-[2rem] bg-gradient-to-br from-brand-400/50 to-purple-400/50 blur-md dark:from-brand-500/40 dark:to-purple-500/40"
            />
            <div className="glass-card relative -rotate-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-faint">Your Results</p>
                <span className="badge-mild rounded-full px-2 py-0.5 text-[10px] font-medium">2 worth watching</span>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Attention & focus", level: "mild" as const },
                  { label: "Impulse control", level: "typical" as const },
                  { label: "Working memory", level: "elevated" as const },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg bg-inset px-3 py-2 text-xs">
                    <span className="text-body">{row.label}</span>
                    <span className={`badge-${row.level} rounded-full px-2 py-0.5 font-medium capitalize`}>{row.level}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-faint pt-3">
                <svg viewBox="0 0 100 30" className="h-8 w-full text-brand-500 dark:text-brand-400" preserveAspectRatio="none">
                  <polyline
                    points="0,25 20,19 40,21 60,11 80,13 100,4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-1 text-[10px] text-faint">Trend across 4 screenings</p>
              </div>
            </div>

            <div className="glass-card absolute -bottom-6 -left-6 hidden w-48 rotate-3 p-3 shadow-xl sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">Daily Coach</p>
              <p className="mt-1 text-[11px] leading-snug text-body">
                "I can see 2 measures notably different today -- want help deciding what to focus on?"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Why early detection matters ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-heading">Why catching it early actually matters</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-subtle">
          ADHD rarely announces itself. For a lot of people it just looks like years of feeling like everyone else has
          a manual you never got -- here's what the research says about what that costs, and what changes once it's
          identified.
        </p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          {STATS.map((s) => (
            <div key={s.value} className="glass-card p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300">
                  <s.icon size={18} />
                </span>
                <p className="bg-gradient-to-br from-brand-500 to-purple-500 bg-clip-text text-2xl font-extrabold text-transparent">
                  {s.value}
                </p>
              </div>
              <p className="mt-2 text-sm text-subtle">{s.body}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-faint">
          Left unaddressed, childhood ADHD also predicts measurably worse educational attainment, job stability, and
          relationship outcomes by young adulthood ({referenceById("barkley2006outcomes")?.cite}). None of this means
          catching it is a cure-all -- it means the cost of not looking is real, and worth weighing against the ~14
          minutes this screening takes.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-center text-[11px] leading-relaxed text-faint">
          Sources: {referenceById("staley2024mmwr")?.cite} &middot; {referenceById("harpin2013selfesteem")?.cite}
        </p>
      </section>

      {/* ---------- What is ADHD glimpse ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="glass-card overflow-hidden p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                <IconLightbulb size={14} />
                Myth check
              </span>
              <h2 className="mt-4 text-2xl font-bold text-heading sm:text-3xl">Most of what you've heard about ADHD is wrong.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-subtle lg:mx-0">
                Three of the most common misconceptions -- and what the research actually says, with a source for
                every claim.
              </p>
              <Link
                to="/about-adhd"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                Get the full picture <IconArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-3 lg:w-96">
              {MYTH_GLIMPSE.map((m) => (
                <div key={m.myth} className="rounded-xl bg-inset p-4 text-left">
                  <p className="text-sm text-faint line-through decoration-rose-400/70">{m.myth}</p>
                  <p className="mt-1.5 text-sm text-body">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Actually: </span>
                    {m.reality}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Feature grid ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
                <f.icon />
              </span>
              <h3 className="mt-3 font-semibold text-heading">{f.title}</h3>
              <p className="mt-2 text-sm text-subtle">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- What this actually does ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-heading">What this actually does</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-subtle">
          Not a vague "take our quiz" -- here's exactly what happens, in order, and why each piece is there.
        </p>

        <div className="relative mt-10">
          <div aria-hidden className="absolute bottom-6 left-4 top-6 w-px bg-gradient-to-b from-brand-500/40 via-brand-500/20 to-transparent" />
          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <div key={step.title} className="glass-card relative flex gap-4 p-5 sm:p-6">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-heading">
                    {step.title}
                    {step.time && <span className="ml-2 text-xs font-normal text-faint">{step.time}</span>}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-subtle">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-faint">
          What this is <strong>not</strong>: a diagnosis. No questionnaire or task, including every one here, is
          diagnostic on its own -- a real evaluation requires a clinical interview against DSM-5/ICD-11 criteria. If
          your results come back notably different from typical, the honest next step this app will tell you is the
          same one a doctor would: talk to a clinician.
        </p>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-purple-600 p-8 text-center shadow-xl sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-2xl font-bold text-white sm:text-3xl">Ready to get a clearer picture?</h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/80">
            Free, about 14 minutes, and you'll have a real report -- not just a score -- by the end of it.
          </p>
          <Link
            to={user ? "/screen" : "/register"}
            className="relative mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition hover:brightness-95 active:scale-[0.98]"
          >
            {user ? "Start a screening" : "Create a free account"}
          </Link>
        </div>
      </section>
    </div>
  );
}
