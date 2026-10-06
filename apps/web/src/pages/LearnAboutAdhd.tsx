import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { referenceById, referencesByTopic, type Reference } from "@adhd-screener/core";
import {
  IconClipboard,
  IconHeart,
  IconUsers,
  IconDna,
  IconCpu,
  IconStethoscope,
  IconPuzzle,
  IconPill,
  IconTrend,
  IconLightbulb,
} from "../components/icons";

function SourceList({ ids }: { ids: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-faint">
      {ids.map((id) => (
        <li key={id}>{referenceById(id)?.cite ?? id}</li>
      ))}
    </ul>
  );
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: ComponentType<{ size?: number }>; children: ReactNode }) {
  return (
    <section id={id} className="glass-card scroll-mt-20 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 text-white">
          <Icon size={18} />
        </span>
        <h2 className="text-xl font-bold text-heading">{title}</h2>
      </div>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-body">{children}</div>
    </section>
  );
}

const TOC = [
  { id: "what-is-it", label: "What ADHD actually is", icon: IconClipboard },
  { id: "emotional-regulation", label: "Emotional regulation", icon: IconHeart },
  { id: "how-common", label: "How common it is", icon: IconUsers },
  { id: "causes", label: "What causes it", icon: IconDna },
  { id: "brain-science", label: "The brain science", icon: IconCpu },
  { id: "diagnosis", label: "How it's actually diagnosed", icon: IconStethoscope },
  { id: "co-occurring", label: "Conditions that often come with it", icon: IconPuzzle },
  { id: "management", label: "How it's typically managed", icon: IconPill },
  { id: "outlook", label: "Long-term outlook", icon: IconTrend },
  { id: "myths", label: "Common myths, corrected", icon: IconLightbulb },
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
        <p className="mt-3 max-w-xl text-lg font-medium text-heading">
          Not a character flaw. Not a parenting failure. Not something you just grow out of.
        </p>
        <p className="mt-2 max-w-xl text-subtle">
          An in-depth look at the condition this screener is built around -- what it is, what the research actually shows
          about its causes and the brain, how it's really diagnosed, and what gets treated once it is. Every claim here
          is traced to a source at the bottom of its section, the same standard the rest of this app holds itself to.
        </p>
      </div>

      <nav className="glass-card mb-8 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">On this page</p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {TOC.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="flex items-center gap-2 text-sm text-brand-600 hover:underline dark:text-brand-300">
                <t.icon size={14} />
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        <Section id="what-is-it" title="What ADHD actually is" icon={IconClipboard}>
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

        <Section id="emotional-regulation" title="Emotional regulation" icon={IconHeart}>
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

          <h3 className="mt-6 text-base font-semibold text-heading">Why it can feel like it comes from nowhere</h3>
          <p>
            A common way people describe this to themselves is that their emotions seem to just go wrong randomly --
            fine one moment, overwhelmed or furious the next, with no obvious build-up they could have caught earlier.
            The research points to it not being random at all; it's two specific, well-documented pieces working
            together.
          </p>
          <p>
            <strong>First, the reaction itself runs on a different timescale.</strong> Studies comparing ADHD and
            non-ADHD emotional responses describe a "fast up, fast down" pattern: the reaction rises quicker, reaches a
            level that looks out of proportion to what triggered it, and then fades faster than a typical emotional
            response would. From the outside -- and often from the inside too -- that compressed timeline is exactly
            what reads as "sudden" and "random," even though a real trigger was there the whole time.
          </p>
          <p>
            <strong>Second, it's the same braking system this app already tests, just applied to feelings instead of
            actions.</strong> The stop-signal task on this screener measures how well someone can cancel an action
            they've already started -- that's the brain's general-purpose inhibition circuit. The leading theoretical
            account of ADHD and emotion argues that circuit doesn't only brake actions; it also normally dampens an
            emotional reaction down to a proportionate size, usually before it even reaches conscious awareness. When
            that braking is weaker, the first thing a person actually notices is the full-sized reaction itself, not a
            build-up they could have stepped in on -- because the step that would have quietly turned it down a notch
            before they noticed anything is the part that didn't fire. That's also why it's described as a
            self-regulation deficit rather than "feeling too much": the research doesn't show the initial spark is
            bigger, just that the normal volume knob after it is weaker.
          </p>
          <p>
            Put together, this reframes "why do my emotions keep going wrong for no reason" into something more
            specific and far less self-blaming: a real trigger, a reaction that runs hot and fast, and a regulation
            step that normally works invisibly in the background not engaging in time. It's also exactly why the
            "Name the Feeling" exercise in this app's{" "}
            <Link to="/exercises" className="text-brand-600 hover:underline dark:text-brand-300">
              exercise library
            </Link>{" "}
            works on the same principle in reverse -- consciously naming a feeling while it's happening re-engages
            regulation circuitry that the automatic version of this process didn't get to in time.
          </p>
          <SourceList ids={["shaw2014emotion", "barkley2010deser", "aron2004"]} />
        </Section>

        <Section id="how-common" title="How common it is" icon={IconUsers}>
          <p>
            Pooled across worldwide studies, ADHD affects roughly <strong>5.3% of children and adolescents</strong>. It
            doesn't simply disappear at adulthood: pooled estimates put adult prevalence around <strong>2.5%</strong>,
            reflecting that a meaningful share of people who had it as children continue to have impairing symptoms as
            adults, even when they no longer meet the full criteria used for children.
          </p>
          <SourceList ids={["polanczyk2007", "simon2009"]} />
        </Section>

        <Section id="causes" title="What causes it" icon={IconDna}>
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

        <Section id="brain-science" title="The brain science" icon={IconCpu}>
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

        <Section id="diagnosis" title="How it's actually diagnosed" icon={IconStethoscope}>
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

        <Section id="co-occurring" title="Conditions that often come with it" icon={IconPuzzle}>
          <p>
            ADHD rarely shows up alone. Anxiety, depression, and learning disorders are commonly reported alongside it,
            and a proper evaluation typically screens for these too -- partly because they can look similar to ADHD from
            the outside, and partly because treating only one while missing another tends to produce worse results than
            treating what's actually there.
          </p>
          <SourceList ids={["faraone2021consensus"]} />
        </Section>

        <Section id="management" title="How it's typically managed" icon={IconPill}>
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

        <Section id="outlook" title="Long-term outlook" icon={IconTrend}>
          <p>
            Left unaddressed, childhood ADHD predicts measurably worse educational attainment, job stability, and
            relationship outcomes by young adulthood compared to peers without it. That's the main reason this app
            encourages following up with a clinician when several indicators come back notably different from typical --
            not to alarm, but because the data says earlier support tends to matter.
          </p>
          <SourceList ids={["barkley2006outcomes"]} />
        </Section>

        <Section id="myths" title="Common myths, corrected" icon={IconLightbulb}>
          <div className="space-y-3">
            {[
              {
                myth: "It's just kids being kids, or laziness.",
                reality: "It's a recognized neurodevelopmental condition with consistent, replicated brain-based correlates -- see the brain science section above.",
              },
              {
                myth: "It's caused by bad parenting, sugar, or screen time.",
                reality: "It's substantially genetic (70-80% heritability); none of these are supported as primary causes.",
              },
              {
                myth: "Only hyperactive boys have it.",
                reality: "The inattentive presentation produces no disruptive behavior and is easy to miss -- historically under-recognized, especially in girls and women.",
              },
              {
                myth: "It goes away by adulthood.",
                reality: "For a large share of people, impairing symptoms persist into adulthood, sometimes presenting differently than they did in childhood.",
              },
              {
                myth: "A quiz like this one can diagnose it.",
                reality: (
                  <>
                    It can't, and this app says so on every page -- see{" "}
                    <Link to="/dashboard" className="text-brand-600 hover:underline dark:text-brand-300">
                      your report
                    </Link>{" "}
                    for what it can actually tell you.
                  </>
                ),
              },
            ].map((m) => (
              <div key={m.myth} className="rounded-xl bg-inset p-4">
                <p className="text-sm text-faint line-through decoration-rose-400/70">"{m.myth}"</p>
                <p className="mt-1.5 text-sm text-body">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Actually: </span>
                  {m.reality}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
