import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { referenceById, referencesByTopic, type Reference } from "@adhd-screener/core";

function SourceList({ ids }: { ids: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-faint">
      {ids.map((id) => (
        <li key={id}>{referenceById(id)?.cite ?? id}</li>
      ))}
    </ul>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="glass-card scroll-mt-20 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-heading">{title}</h2>
      <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-body">{children}</div>
    </section>
  );
}

const TOC = [
  { id: "what-is-it", label: "What ADHD actually is" },
  { id: "emotional-regulation", label: "Emotional regulation" },
  { id: "how-common", label: "How common it is" },
  { id: "causes", label: "What causes it" },
  { id: "brain-science", label: "The brain science" },
  { id: "diagnosis", label: "How it's actually diagnosed" },
  { id: "co-occurring", label: "Conditions that often come with it" },
  { id: "management", label: "How it's typically managed" },
  { id: "outlook", label: "Long-term outlook" },
  { id: "myths", label: "Common myths, corrected" },
];

export function LearnAboutAdhd() {
  const brainRefs: Reference[] = referencesByTopic("brain");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <span className="rounded-full border border-subtle bg-inset px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
          Reference &middot; not personalized
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-heading sm:text-4xl">What is ADHD?</h1>
        <p className="mt-3 max-w-xl text-subtle">
          An in-depth look at the condition this screener is built around -- what it is, what the research actually shows
          about its causes and the brain, how it's really diagnosed, and what gets treated once it is. Every claim here
          is traced to a source at the bottom of its section, the same standard the rest of this app holds itself to.
        </p>
      </div>

      <nav className="glass-card mb-8 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">On this page</p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {TOC.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="text-sm text-brand-600 hover:underline dark:text-brand-300">
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        <Section id="what-is-it" title="What ADHD actually is">
          <p>
            Attention-Deficit/Hyperactivity Disorder (ADHD) is a <strong>neurodevelopmental condition</strong> -- meaning it
            arises from differences in how the brain develops, not from a character flaw, a lack of effort, or bad habits.
            It's defined by a persistent pattern of inattention and/or hyperactivity-impulsivity that's more frequent and
            severe than what's typical for a person's developmental stage, and that measurably gets in the way of
            functioning -- not just occasionally, and not in only one part of life.
          </p>
          <p>Clinically, it's described as one of three presentations:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Predominantly inattentive</strong> -- trouble sustaining attention, organizing tasks, following
              through on instructions, and being easily distracted. Often the least visible presentation because there's
              no disruptive behavior attached to it.
            </li>
            <li>
              <strong>Predominantly hyperactive-impulsive</strong> -- fidgeting, difficulty remaining seated or still,
              interrupting others, and acting before thinking something through.
            </li>
            <li>
              <strong>Combined</strong> -- a mix of both patterns, and the most commonly diagnosed presentation in
              children.
            </li>
          </ul>
          <SourceList ids={["dsm5tr", "faraone2021consensus"]} />
        </Section>

        <Section id="emotional-regulation" title="Emotional regulation">
          <p>
            Trouble staying attentive and sitting still get the most attention, but a lot of adults with ADHD say the
            harder part day-to-day is emotional: mood shifting faster than feels controllable, irritability that seems
            out of proportion to what triggered it, or taking longer than they'd like to calm back down after something
            upsets them.
          </p>
          <p>
            This isn't an official DSM-5 symptom domain the way inattention and hyperactivity-impulsivity are -- a
            diagnosis doesn't require it. But it's widely documented in the research literature as a common, often
            impairing feature of adult ADHD, and more recent self-report instruments have started measuring it directly
            as an extension of existing ADHD screeners, rather than treating it as a separate, unrelated problem.
          </p>
          <p>
            That's the basis for this app's "Emotional Regulation" result: an original set of questions, on the same
            response scale as the other questionnaires here, asking about mood lability, irritability, and reacting more
            strongly than a situation seems to call for.
          </p>
          <SourceList ids={["faraone2021consensus", "silverstein2019ec"]} />
        </Section>

        <Section id="how-common" title="How common it is">
          <p>
            Pooled across worldwide studies, ADHD affects roughly <strong>5.3% of children and adolescents</strong>. It
            doesn't simply disappear at adulthood: pooled estimates put adult prevalence around <strong>2.5%</strong>,
            reflecting that a meaningful share of people who had it as children continue to have impairing symptoms as
            adults, even when they no longer meet the full criteria used for children.
          </p>
          <SourceList ids={["polanczyk2007", "simon2009"]} />
        </Section>

        <Section id="causes" title="What causes it">
          <p>
            ADHD is substantially genetic. Twin studies consistently put its <strong>heritability around 70-80%</strong>,
            placing it among the most heritable conditions in psychiatry -- comparable to height. No single gene is
            responsible; like most psychiatric conditions, risk comes from the combined, small effect of many genetic
            variants, plus some contribution from early environmental factors (for example, prematurity or certain
            prenatal exposures) in a minority of cases.
          </p>
          <p>
            Three explanations that are <strong>not</strong> supported as primary causes, despite being common: parenting
            style, too much sugar, and too much screen time. None of these show the kind of consistent, dose-dependent
            relationship with ADHD that a causal factor would need to show, and none come close to explaining the
            heritability numbers above.
          </p>
          <SourceList ids={["faraone2019genetics"]} />
        </Section>

        <Section id="brain-science" title="The brain science">
          <p>
            This is also, concretely, why this screener's three tasks measure what they measure -- each one is a proxy
            for a specific brain system that the research below has repeatedly implicated in ADHD.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Prefrontal cortex</strong> -- supports executive function and working memory; shows a delay in
              cortical maturation in ADHD, most pronounced in the regions responsible for executive control.
            </li>
            <li>
              <strong>Inferior frontal gyrus &amp; striatum</strong> -- the circuit that lets you cancel a response
              you've already started; this "braking" pathway is measurably weaker in ADHD, which is exactly what the
              stop-signal task in this app is built to detect.
            </li>
            <li>
              <strong>Default mode network (DMN)</strong> -- the brain's "idling" network, which should quiet down during
              a task. In ADHD it intrudes into task-focused activity instead, which shows up behaviorally as
              moment-to-moment inconsistency in reaction time and brief attention lapses.
            </li>
            <li>
              <strong>Anterior cingulate cortex</strong> -- involved in monitoring conflict and errors; reduced activity
              here lines up with more impulsive, unfiltered responses.
            </li>
            <li>
              <strong>Nucleus accumbens / reward circuitry</strong> -- reduced dopamine receptor and transporter
              availability here correlates with inattention severity, which is part of why low task engagement (missing
              targets outright) is itself a meaningful signal, not just "not trying."
            </li>
            <li>
              <strong>Cerebellum</strong> -- beyond its role in movement, consistently shows volume differences in ADHD
              and is tied to timing and motor-response variability.
            </li>
          </ul>
          <SourceList ids={brainRefs.map((r) => r.id)} />
        </Section>

        <Section id="diagnosis" title="How it's actually diagnosed">
          <p>
            No blood test, brain scan, questionnaire, or reaction-time task -- including every one in this app -- is
            diagnostic on its own. A real diagnosis comes from a clinical interview that checks for several symptoms
            present <strong>before age 12</strong>, clear impairment in <strong>two or more settings</strong> (for
            example, both school/work and home), and symptoms that aren't better explained by another condition.
          </p>
          <p>
            That childhood-onset requirement is specifically why this app pairs a current-symptom scale (the ASRS) with a
            childhood-retrospective scale (the WURS) -- it's trying to mirror the shape of a real evaluation, not
            shortcut around it.
          </p>
          <SourceList ids={["dsm5tr", "faraone2021consensus"]} />
        </Section>

        <Section id="co-occurring" title="Conditions that often come with it">
          <p>
            ADHD rarely shows up alone. Anxiety, depression, and learning disorders are commonly reported alongside it,
            and a proper evaluation typically screens for these too -- partly because they can look similar to ADHD from
            the outside, and partly because treating only one while missing another tends to produce worse results than
            treating what's actually there.
          </p>
          <SourceList ids={["faraone2021consensus"]} />
        </Section>

        <Section id="management" title="How it's typically managed">
          <p>
            This is general information, not medical advice -- any treatment decision belongs with a licensed clinician
            who knows the specific person. That said, the approaches most commonly used, often in combination, are:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Behavioral therapy / parent training</strong> -- building structure, routines, and specific coping strategies.</li>
            <li><strong>Educational or workplace accommodations</strong> -- extended time, reduced distraction, broken-down instructions.</li>
            <li><strong>Medication</strong> -- stimulant and non-stimulant options exist; effectiveness and side effects vary by person, which is why this is a conversation with a prescriber, not a one-size-fits-all choice.</li>
          </ul>
        </Section>

        <Section id="outlook" title="Long-term outlook">
          <p>
            Left unaddressed, childhood ADHD predicts measurably worse educational attainment, job stability, and
            relationship outcomes by young adulthood compared to peers without it. That's the main reason this app
            encourages following up with a clinician when several indicators come back notably different from typical --
            not to alarm, but because the data says earlier support tends to matter.
          </p>
          <SourceList ids={["barkley2006outcomes"]} />
        </Section>

        <Section id="myths" title="Common myths, corrected">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong>"It's just kids being kids, or laziness."</strong> It's a recognized neurodevelopmental condition
              with consistent, replicated brain-based correlates -- see the brain science section above.
            </li>
            <li>
              <strong>"It's caused by bad parenting, sugar, or screen time."</strong> It's substantially genetic
              (70-80% heritability); none of these are supported as primary causes.
            </li>
            <li>
              <strong>"Only hyperactive boys have it."</strong> The inattentive presentation produces no disruptive
              behavior and is easy to miss -- historically it has been under-recognized, especially in girls and women.
            </li>
            <li>
              <strong>"It goes away by adulthood."</strong> For a large share of people, impairing symptoms persist into
              adulthood, sometimes presenting differently than they did in childhood.
            </li>
            <li>
              <strong>"A quiz like this one can diagnose it."</strong> It can't, and this app says so on every page --
              see <Link to="/dashboard" className="text-brand-600 hover:underline dark:text-brand-300">your report</Link> for what it can
              actually tell you.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
