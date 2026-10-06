/**
 * Structured self-guided exercises, one per result category. Each is built
 * from a real, cited behavioral/cognitive technique -- not invented, not a
 * simulation of therapy or medication. Explicitly self-help skill practice:
 * every exercise and the UI that renders it should keep saying so.
 */

import type { ReportCategory } from "../categories";

export interface Exercise {
  id: string;
  category: ReportCategory;
  title: string;
  technique: string;
  /** Why this helps, in plain language, tied to the cited research. */
  summary: string;
  steps: string[];
  refs: string[];
}

export const exercises: Exercise[] = [
  {
    id: "pause-plan",
    category: "Impulse control",
    title: "The Pause-Plan",
    technique: "Implementation intentions (if-then planning)",
    summary:
      "A specific 'if this happens, then I'll do that' plan, made in advance, reliably changes what people actually do in the moment -- far more than a general intention like 'I'll try to react less.' Deciding the response ahead of time removes the need to decide (and inhibit) in the heat of the moment.",
    steps: [
      "Think of one specific situation this week where you tend to react before thinking -- be concrete (e.g. \"when I get an unexpected message during focused work,\" not \"when I'm impulsive\").",
      "Write it as an if-then plan: \"If [situation], then I will [specific action].\" Example: \"If I feel the urge to reply immediately, then I will take 3 breaths and finish my current sentence first.\"",
      "Make the plan concrete, not vague -- a specific action beats a general intention.",
      "Put the written plan somewhere you'll actually see it (sticky note, phone lock screen) for the next 3 days.",
      "After 3 days, notice: did having the plan change what you actually did in that situation, even once? That's the signal to keep using it.",
    ],
    refs: ["gollwitzer1999"],
  },
  {
    id: "externalized-focus-blocks",
    category: "Attention & focus",
    title: "Externalized Focus Blocks",
    technique: "Externalizing structure (visible timers and goals)",
    summary:
      "Sustained attention relies on internal self-regulation that's harder to access in ADHD. Moving structure outside your head -- a visible timer, a written-down definition of 'done' -- substitutes external cues for the internal ones that are harder to rely on.",
    steps: [
      "Pick one task you've been avoiding or drifting away from.",
      "Set a visible timer for a short, concrete block -- start with 15 minutes, not an hour.",
      "Before starting, write down (on paper or a sticky note, visible -- not just held in your head) exactly what \"done\" looks like for this block.",
      "Work until the timer ends. If your attention drifts, that's expected -- bring it back without restarting the timer or judging yourself for it.",
      "When the timer ends, take a full break away from the screen for 5 minutes before deciding whether to do another block.",
      "Notice: did the visible timer and written goal change how long you actually stayed on task, compared to without them?",
    ],
    refs: ["barkley1997"],
  },
  {
    id: "chunk-and-externalize",
    category: "Working memory",
    title: "Chunk and Externalize",
    technique: "Chunking + externalized memory aids",
    summary:
      "Working memory holds a small number of meaningful groups, not a long list of raw items. Grouping steps into a few larger chunks -- and writing them down instead of holding them in mind -- reduces the load on exactly the system this task measures.",
    steps: [
      "Pick a task with multiple steps you need to remember (a morning routine, a multi-part errand).",
      "Instead of holding every step in your head, write each one down as a short chunk of 3-4 words -- not full sentences.",
      "Group related steps into one chunk rather than listing them separately (\"keys, wallet, phone\" as one chunk, not three).",
      "Keep the list visible in the place you'll actually need it -- not saved in an app you have to remember to open.",
      "Cross off each chunk as you finish it. The physical act of crossing off is part of what helps, not just the written reminder.",
    ],
    refs: ["miller1956", "barkley1997"],
  },
  {
    id: "break-it-down",
    category: "Self-reported symptoms",
    title: "Break It Down",
    technique: "Task breakdown (a core module of CBT for adult ADHD)",
    summary:
      "A task that feels too big or vague to start is often really a stalled first step. Structured task-breakdown -- defining the smallest possible physical next action -- is one of the specific techniques shown to reduce ADHD symptoms as part of a cognitive-behavioral program.",
    steps: [
      "Pick one task that's been sitting on your list because it feels too big or too vague to start.",
      "Write down the single smallest possible first physical action -- not \"clean the kitchen\" but \"put the 3 dishes in the sink into the dishwasher.\"",
      "Commit only to that one small action right now, nothing more.",
      "Do just that action.",
      "Once it's done, decide fresh whether to take the next small step or stop there -- don't pre-commit to finishing the whole task up front.",
    ],
    refs: ["safren2005cbt"],
  },
  {
    id: "time-estimation-trainer",
    category: "Attention & focus",
    title: "Time Estimation Trainer",
    technique: "Estimate-vs-actual calibration (targets 'time blindness')",
    summary:
      "ADHD is linked to measurable deficits in estimating and reproducing time durations -- not just 'losing track of time' casually, but a specific, studied executive-function gap. Repeatedly comparing your own estimate to the actual time a task takes is a direct way to train that calibration.",
    steps: [
      "Before starting a task, guess how many minutes it will actually take you.",
      "Start the timer and begin the task.",
      "Stop the timer the moment you actually finish -- don't round up or down in your head first.",
      "Look at your estimate next to the real time. Don't judge it, just notice the gap.",
      "Do this for a few different tasks over the next week. Most people's estimates get more accurate with repeated, honest comparison -- that's the actual skill being trained.",
    ],
    refs: ["barkley1997time"],
  },
  {
    id: "mindful-pause",
    category: "Impulse control",
    title: "Mindful Pause",
    technique: "Brief mindfulness practice (noticing an urge without acting on it)",
    summary:
      "A short mindfulness practice -- noticing an urge or a wandering thought and letting it pass without immediately reacting -- was feasible and showed early improvements in attention and self-reported symptoms in an 8-week ADHD-specific program. This is a much shorter version of the same core skill: noticing before reacting.",
    steps: [
      "Sit somewhere you won't be interrupted for about a minute.",
      "Close your eyes or soften your gaze, and just notice your breathing -- don't try to change it.",
      "When a thought, urge, or distraction shows up (it will), just notice it's there, without judging it or acting on it.",
      "Gently bring your attention back to your breathing. Expect to do this many times in one minute -- that's normal, not failure.",
      "When the minute ends, notice: did you catch yourself about to react to something, even once, without actually reacting?",
    ],
    refs: ["zylowska2008mindfulness"],
  },
  {
    id: "thought-record",
    category: "Self-reported symptoms",
    title: "Thought Record",
    technique: "Cognitive restructuring (a module of CBT for adult ADHD)",
    summary:
      "ADHD often comes with a running undercurrent of self-critical thoughts (\"I'm lazy,\" \"I'm broken\") built up from years of struggling with things that seem to come easily to others. Cognitive restructuring -- a structured module in evidence-based CBT for adult ADHD -- is the practice of catching one of these thoughts and actually examining whether it holds up.",
    steps: [
      "Write down a specific situation from today that triggered a self-critical thought (e.g. \"missed a deadline again\").",
      "Write the automatic thought exactly as it occurred to you (e.g. \"I always mess things up\").",
      "Ask: what's the actual evidence against this thought being 100% true? Be specific and factual, not reassuring.",
      "Write a more balanced version of the thought -- not a forced positive, just a more accurate one (e.g. \"I missed this one deadline, and I've met plenty of others\").",
      "Notice whether the balanced version feels even slightly different to hold than the original one did.",
    ],
    refs: ["safren2005cbt"],
  },
  {
    id: "name-the-feeling",
    category: "Emotional Regulation",
    title: "Name the Feeling",
    technique: "Affect labeling",
    summary:
      "When a strong reaction hits, naming the specific emotion in a word or two -- not analyzing it, not suppressing it, just naming it -- measurably reduces the brain's amygdala reactivity in the moment. It's one of the fastest, lowest-effort ways to take some heat out of a reaction while it's happening.",
    steps: [
      "The next time you notice a strong reaction building -- irritation, a mood shift, feeling overwhelmed -- pause for a moment before doing anything else.",
      "Silently (or out loud) name the specific emotion in one or two words: \"frustrated,\" \"embarrassed,\" \"overwhelmed\" -- not \"I'm fine\" or a vague \"bad.\"",
      "Be specific rather than general -- \"annoyed\" and \"hurt\" call for different responses even though both might show up as snapping at someone.",
      "That's the whole exercise -- just naming it, not fixing it or explaining it away.",
      "Notice afterward: did naming it, even briefly, take any of the edge off before you reacted?",
    ],
    refs: ["lieberman2007affectlabeling"],
  },
];

export function exercisesForCategory(category: Exercise["category"]): Exercise[] {
  return exercises.filter((e) => e.category === category);
}
