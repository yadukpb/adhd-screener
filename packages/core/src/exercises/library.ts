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
];

export function exercisesForCategory(category: Exercise["category"]): Exercise[] {
  return exercises.filter((e) => e.category === category);
}
