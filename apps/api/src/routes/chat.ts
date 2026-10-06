import express, { Router } from "express";
import type { Indicator } from "@adhd-screener/core";
import { ScreeningSessionModel } from "../models/ScreeningSession";
import { DailyTaskModel } from "../models/DailyTask";
import { HabitLogModel } from "../models/HabitLog";
import { LearningPathModel } from "../models/LearningPath";
import { PracticeEntryModel } from "../models/PracticeEntry";
import { ChatMessageModel } from "../models/ChatMessage";
import { UserModel } from "../models/User";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const chatRouter = Router();
chatRouter.use(requireAuth);

// Keep in sync with apps/web/src/lib/coachPersona.ts -- this is the name/
// character the system prompt tells the model to answer as; that file is
// what actually renders the name and avatar in the UI.
const COACH_NAME = "Maya";
const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_WHISPER_MODEL = "whisper-large-v3-turbo";
const MAX_MESSAGE_LEN = 2000;
const MAX_HISTORY_TURNS = 10;
const HISTORY_PAGE_SIZE = 60;
const MAX_AUDIO_BYTES = "20mb";

// A plain-language map of the app's own features -- folded into every
// system prompt so Maya can answer "what does this app do" / "where do I
// find X" factually instead of guessing, not just answer from personal data.
const PLATFORM_OVERVIEW = `
This app ("ADHD Screener") is a self-guided ADHD indicator screener and daily-support toolkit. Its parts, in case someone asks what something is or where to find it:
- Screening (/screen): ASRS + WURS questionnaires, an Emotional Dyscontrol scale, and three timed cognitive tasks (go/no-go CPT, stop-signal, N-back, Flanker). Produces a report -- NOT a diagnosis.
- Dashboard (/dashboard): home hub with latest stats, a trend chart across past screenings, and quick links to every tool.
- Report pages (one per screening): full results in plain language, with their own results chat attached to that specific screening.
- What is ADHD? (/about-adhd): a cited, in-depth reference page about ADHD itself (not personalized to the user).
- Exercises (/exercises): a public library of research-grounded self-guided exercises (Pause-Plan, Focus Blocks, Thought Record, Name the Feeling, etc.); interactive versions appear when logged in, on the report and learning path.
- Learning Path (/learning-path): a personalized, rolling list of "learn" + "practice" steps generated from someone's screening results, merged forward as they complete things or re-screen.
- Planner (/planner): a daily task list/timeline.
- Focus Timer (/focus): a countdown focus-block timer with optional background sound and breathing breaks.
- Daily Check-in (/habits): logs today's mood, medication, and sleep, and tracks a streak.
- Daily Coach (/coach, and this same chat as a floating widget on every page): that's you, Maya.
- Admin (/admin, staff only): a queue of user-submitted suggestions about the app.
People can submit their own ideas about the app via the "Suggest something for the app" link right in this chat widget -- that goes straight to a human reviewer, not to you, so just point them to it rather than trying to log the idea yourself.
`.trim();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is ChatMessage => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LEN) }));
}

/** Shared Groq call + error handling for every chat mode below -- the only thing that varies between modes is the system prompt. */
async function callGroqChat(
  systemPrompt: string,
  history: ChatMessage[],
  message: string,
  logContext: string,
): Promise<{ status: number; body: { reply: string } | { error: string } }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn(`[chat] rejected request (${logContext}): GROQ_API_KEY not set`);
    return { status: 503, body: { error: "The chat isn't configured yet." } };
  }

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
      temperature: 0.4,
      max_tokens: 600,
      reasoning_effort: "low",
    }),
  });

  if (!groqRes.ok) {
    const errBody = await groqRes.text().catch(() => "");
    console.error(`[chat] groq request failed (${logContext}):`, groqRes.status, errBody);
    return { status: 502, body: { error: "Couldn't reach the chat assistant. Try again in a moment." } };
  }

  const data = (await groqRes.json()) as { choices?: { message?: { content?: string } }[] };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    console.error(`[chat] groq returned no reply content (${logContext}):`, JSON.stringify(data));
    return { status: 502, body: { error: "Couldn't reach the chat assistant. Try again in a moment." } };
  }

  return { status: 200, body: { reply } };
}

function todayKey(): string {
  return dateKeyDaysAgo(0);
}

function dateKeyDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

/** One line the model can use to ground "today"/"this evening"/"the weekend" references instead of being blind to time. */
function timeContextLine(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const hour = now.getHours();
  const partOfDay = hour < 5 ? "late night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
  return `Current date/time: ${weekday}, ${dateStr}, ${timeStr} (${partOfDay}).`;
}

function partOfDayNow(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

/** Longest run of consecutive days (ending today or yesterday) with a check-in, within the 7-day window already fetched. */
function weekCheckinStreak(dates: string[]): number {
  const set = new Set(dates);
  const cursor = new Date();
  if (!set.has(todayKey())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!set.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Everything both the system prompt and the dynamic greeting/suggestions are built from -- gathered once so the two can't drift apart. */
async function gatherCoachContext(userId: string) {
  const date = todayKey();
  const weekAgoKey = dateKeyDaysAgo(6); // 7-day window, inclusive of today
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);

  const [user, latestSession, screeningCount, todayTasks, todayHabit, weekHabits, learningPath, recentPractice, allTimePracticeCount] =
    await Promise.all([
      UserModel.findById(userId).select("name").lean(),
      ScreeningSessionModel.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
      ScreeningSessionModel.countDocuments({ user: userId }),
      DailyTaskModel.find({ user: userId, date }).sort({ time: 1 }).lean(),
      HabitLogModel.findOne({ user: userId, date }).lean(),
      HabitLogModel.find({ user: userId, date: { $gte: weekAgoKey } }).sort({ date: 1 }).lean(),
      LearningPathModel.findOne({ user: userId }).lean(),
      PracticeEntryModel.find({ user: userId, createdAt: { $gte: weekAgoDate } }).lean(),
      PracticeEntryModel.countDocuments({ user: userId }),
    ]);

  return {
    name: user?.name ? firstName(user.name) : null,
    latestSession,
    screeningCount,
    todayTasks,
    todayHabit,
    weekHabits,
    learningPath,
    recentPractice,
    allTimePracticeCount,
    checkinStreak: weekCheckinStreak(weekHabits.map((h) => h.date)),
  };
}

type CoachContext = Awaited<ReturnType<typeof gatherCoachContext>>;

async function buildCoachSystemPrompt(userId: string): Promise<string> {
  const ctx = await gatherCoachContext(userId);

  const lines: string[] = [
    `You are ${COACH_NAME}, a friendly, practical daily coach inside an ADHD self-management app.`,
    ctx.name
      ? `Their name is ${ctx.name} -- address them by name naturally sometimes (not every single message), not generic "there" or "friend".`
      : "",
    timeContextLine(),
    "You are NOT a doctor, and this app's data is NOT a diagnosis -- if asked for medical advice, say so plainly and suggest a clinician.",
    "Keep replies short and conversational (roughly 3-6 sentences), plain language, no clinical jargon.",
    "Use the current date/time naturally where it's relevant (e.g. referencing today vs. the weekend, morning vs. evening) instead of ignoring it.",
    "Don't open every conversation the same way or default to the same stock question -- look at what's actually true for them right now (below) and lead with whatever's most relevant today; vary it conversation to conversation rather than repeating yourself.",
    "You can also answer questions about this app/platform itself (what it does, where a feature lives) using the overview near the end of this prompt -- those don't need their personal data.",
    "You have context on this person's full screening history, today's planned tasks, their check-ins over the last week, their learning path (including what they've already finished, not just what's left), and their recent practice-exercise activity -- use it for concrete, specific help, not generic advice.",
    "",
  ].filter(Boolean);

  if (ctx.latestSession) {
    const indicators = (ctx.latestSession.indicators ?? []) as unknown as Indicator[];
    const notable = indicators.filter((i) => i.level !== "typical");
    lines.push(
      notable.length > 0
        ? `Most recent screening (${new Date(ctx.latestSession.createdAt as unknown as string).toLocaleDateString()}, screening #${ctx.screeningCount}): ${notable.map((i) => `${i.label} (${i.level})`).join(", ")}.`
        : `Most recent screening (${new Date(ctx.latestSession.createdAt as unknown as string).toLocaleDateString()}, screening #${ctx.screeningCount}): everything came back typical.`,
    );
  } else {
    lines.push("They haven't completed a screening yet.");
  }

  lines.push(
    ctx.todayTasks.length > 0
      ? `Today's planned tasks: ${ctx.todayTasks.map((t) => `${t.title}${t.time ? ` (${t.time})` : ""}${t.done ? " [done]" : ""}`).join("; ")}.`
      : "Nothing planned in today's planner yet.",
  );

  if (ctx.todayHabit) {
    const parts: string[] = [];
    if (ctx.todayHabit.mood !== undefined) parts.push(`mood ${ctx.todayHabit.mood}/5`);
    if (ctx.todayHabit.medicationTaken !== undefined) parts.push(ctx.todayHabit.medicationTaken ? "took medication" : "hasn't taken medication");
    if (ctx.todayHabit.sleepHours !== undefined) parts.push(`${ctx.todayHabit.sleepHours}h sleep`);
    lines.push(parts.length > 0 ? `Today's check-in: ${parts.join(", ")}.` : "They checked in today but logged nothing specific yet.");
  } else {
    lines.push("No check-in logged today yet.");
  }

  if (ctx.weekHabits.length > 1) {
    const trend = ctx.weekHabits
      .map((h) => {
        const parts: string[] = [];
        if (h.mood !== undefined) parts.push(`mood ${h.mood}`);
        if (h.sleepHours !== undefined) parts.push(`${h.sleepHours}h sleep`);
        return parts.length > 0 ? `${h.date}: ${parts.join(", ")}` : null;
      })
      .filter((s): s is string => s !== null);
    if (trend.length > 1) lines.push(`Past week's check-ins: ${trend.join("; ")}.`);
  }
  if (ctx.checkinStreak >= 2) lines.push(`Current check-in streak: ${ctx.checkinStreak} day${ctx.checkinStreak === 1 ? "" : "s"} running.`);

  const doneSteps = ctx.learningPath?.steps.filter((s) => s.status === "done") ?? [];
  const pendingSteps = ctx.learningPath?.steps.filter((s) => s.status === "pending") ?? [];
  lines.push(
    ctx.learningPath
      ? `Learning path: ${doneSteps.length} step${doneSteps.length === 1 ? "" : "s"} completed so far, ${pendingSteps.length} pending${pendingSteps.length > 0 ? ` (${pendingSteps.map((s) => s.title).join(", ")})` : ""}.`
      : "No learning path yet (one gets generated after their first screening).",
  );

  if (ctx.recentPractice.length > 0) {
    const byExercise = new Map<string, number>();
    for (const p of ctx.recentPractice) byExercise.set(p.exerciseId, (byExercise.get(p.exerciseId) ?? 0) + 1);
    const summary = [...byExercise.entries()].map(([id, n]) => `${id} x${n}`).join(", ");
    lines.push(`Practice exercises done in the last 7 days: ${summary}. (${ctx.allTimePracticeCount} total all-time.)`);
  } else {
    lines.push(`No practice-exercise activity in the last 7 days (${ctx.allTimePracticeCount} total all-time).`);
  }

  lines.push("", "About this app/platform (answer naturally if asked; no need to recite it unprompted):", PLATFORM_OVERVIEW);

  return lines.join("\n");
}

/** A rules-based (no LLM call, so it's instant and free) greeting + 3 suggestion chips, built from whatever's actually true right now -- not a fixed script. */
function buildCoachGreeting(ctx: CoachContext): { greeting: string; suggestions: string[] } {
  const name = ctx.name ?? "there";
  const pendingSteps = ctx.learningPath?.steps.filter((s) => s.status === "pending") ?? [];
  const incompleteTasks = ctx.todayTasks.filter((t) => !t.done);

  let hook: string;
  const suggestions: string[] = [];

  if (!ctx.latestSession) {
    hook = "You haven't run a screening yet -- that's the best place to start if you want more specific help from me.";
    suggestions.push("How do I start a screening?", "What does this app actually do?");
  } else if (!ctx.todayHabit) {
    hook = "Haven't seen a check-in from you today -- how's it going so far?";
    suggestions.push("Help me log today's check-in");
  } else if (pendingSteps.length > 0) {
    hook = `You've got ${pendingSteps.length} step${pendingSteps.length === 1 ? "" : "s"} waiting on your learning path.`;
    suggestions.push(`Help me with "${pendingSteps[0].title}"`);
  } else if (incompleteTasks.length > 0) {
    hook = `You've got ${incompleteTasks.length} task${incompleteTasks.length === 1 ? "" : "s"} left on today's planner.`;
    suggestions.push("Which task should I tackle first?");
  } else if (ctx.checkinStreak >= 3) {
    hook = `Nice, that's a ${ctx.checkinStreak}-day check-in streak going.`;
    suggestions.push("How am I trending this week?");
  } else {
    hook = "What's on your mind today?";
  }

  const fallbacks = [
    "What should I focus on today?",
    "Help me get started on something I'm avoiding",
    "How am I doing lately?",
    "What can this app help me with?",
  ];
  for (const f of fallbacks) {
    if (suggestions.length >= 3) break;
    if (!suggestions.includes(f)) suggestions.push(f);
  }

  return { greeting: `Good ${partOfDayNow()}, ${name}! ${hook}`, suggestions: suggestions.slice(0, 3) };
}

// Registered BEFORE the "/:sessionId" route below -- Express matches routes
// in registration order, and ":sessionId" is a wildcard segment that would
// otherwise swallow a literal "/coach" request (treating "coach" as a
// session id) before it ever reached this handler. Same reasoning puts
// "/coach/history" ahead of the "/:sessionId/history" GET route further down.
chatRouter.get(
  "/coach/history",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const beforeRaw = typeof req.query.before === "string" ? new Date(req.query.before) : null;
    const before = beforeRaw && !Number.isNaN(beforeRaw.getTime()) ? beforeRaw : null;

    const query: Record<string, unknown> = { user: req.userId, mode: "coach" };
    if (before) query.createdAt = { $lt: before };

    const [messages, ctx] = await Promise.all([
      ChatMessageModel.find(query).sort({ createdAt: -1 }).limit(HISTORY_PAGE_SIZE).lean(),
      // Only needed for the first page -- a "load earlier" page doesn't need a fresh greeting.
      before ? null : gatherCoachContext(req.userId!),
    ]);

    const greeting = ctx ? buildCoachGreeting(ctx) : null;
    res.json({
      messages: messages.reverse().map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
      hasMore: messages.length === HISTORY_PAGE_SIZE,
      ...(greeting ? { greeting: greeting.greeting, suggestions: greeting.suggestions } : {}),
    });
  }),
);

chatRouter.post(
  "/coach",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const body = req.body as { message?: string; history?: unknown };
    const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE_LEN);
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const history = sanitizeHistory(body.history);
    const systemPrompt = await buildCoachSystemPrompt(req.userId!);

    const result = await callGroqChat(systemPrompt, history, message, `coach user=${req.userId}`);
    if (result.status === 200 && "reply" in result.body) {
      await ChatMessageModel.insertMany([
        { user: req.userId, mode: "coach", role: "user", content: message },
        { user: req.userId, mode: "coach", role: "assistant", content: result.body.reply },
      ]);
    }
    res.status(result.status).json(result.body);
  }),
);

// Registered before the "/:sessionId" POST route below for the same reason
// "/coach" is -- otherwise ":sessionId" would swallow "transcribe" as a
// session id. Takes the raw audio bytes as the request body (not JSON, not
// multipart) -- the client sends whatever MediaRecorder produced (webm in
// Chrome, mp4/m4a in Safari) with its real Content-Type, which both
// expresses what format it is and is also exactly what Groq's endpoint
// (OpenAI-compatible, same formats) wants to receive as the uploaded file.
chatRouter.post(
  "/transcribe",
  express.raw({ type: () => true, limit: MAX_AUDIO_BYTES }),
  asyncHandler<AuthedRequest>(async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "Voice input isn't configured yet." });
      return;
    }
    const buf = req.body as unknown;
    if (!Buffer.isBuffer(buf) || buf.length === 0) {
      res.status(400).json({ error: "No audio received" });
      return;
    }

    const contentType = (req.headers["content-type"] ?? "audio/webm").split(";")[0].trim();
    const ext = contentType.includes("mp4") || contentType.includes("m4a") ? "mp4" : contentType.includes("wav") ? "wav" : contentType.includes("ogg") ? "ogg" : "webm";

    const form = new FormData();
    form.append("file", new Blob([buf], { type: contentType }), `voice-message.${ext}`);
    form.append("model", GROQ_WHISPER_MODEL);
    form.append("response_format", "json");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text().catch(() => "");
      console.error(`[transcribe] groq request failed (user=${req.userId}):`, groqRes.status, errBody);
      res.status(502).json({ error: "Couldn't transcribe that -- try again, or type it instead." });
      return;
    }

    const data = (await groqRes.json()) as { text?: string };
    const text = (data.text ?? "").trim();
    if (!text) {
      res.status(422).json({ error: "Didn't catch any speech there -- try again, or type it instead." });
      return;
    }
    res.json({ text });
  }),
);

function buildResultsSystemPrompt(indicators: Indicator[], createdAt: Date, userName: string | null): string {
  const lines = indicators.map(
    (ind) => `- ${ind.label}: ${ind.level} (${ind.valueText}). What it measures: ${ind.meaning}`,
  );

  return [
    `You are ${COACH_NAME}, a friendly, supportive assistant helping someone understand their own ADHD indicator screening results.`,
    userName ? `Their name is ${userName} -- address them by name naturally sometimes, not generic "there" or "friend".` : "",
    timeContextLine(),
    "You are NOT a doctor and this is NOT a diagnosis -- if they ask whether they \"have ADHD\" or something similarly definitive, gently say this tool can't answer that and a clinician can.",
    "Explain everything in simple, everyday language. Avoid clinical or statistical jargon (z-scores, percentiles, task names like \"d-prime\", \"SSRT\") unless they specifically ask for the technical detail -- translate it into plain terms instead.",
    "Keep replies short and conversational (roughly 3-6 sentences), like a knowledgeable friend, not a wall of text or a bulleted essay.",
    "If they ask something outside these results, or something needing real medical advice, say so plainly and suggest talking to a clinician.",
    "You can also answer questions about this app/platform itself using the overview below.",
    "",
    "About this app/platform (answer naturally if asked):",
    PLATFORM_OVERVIEW,
    "",
    `Here are their results from the screening on ${createdAt.toLocaleDateString()}:`,
    ...lines,
  ]
    .filter(Boolean)
    .join("\n");
}

chatRouter.get(
  "/:sessionId/history",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const session = await ScreeningSessionModel.findOne({ _id: req.params.sessionId, user: req.userId }).lean();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const beforeRaw = typeof req.query.before === "string" ? new Date(req.query.before) : null;
    const before = beforeRaw && !Number.isNaN(beforeRaw.getTime()) ? beforeRaw : null;

    const query: Record<string, unknown> = { user: req.userId, mode: "results", session: req.params.sessionId };
    if (before) query.createdAt = { $lt: before };

    const messages = await ChatMessageModel.find(query).sort({ createdAt: -1 }).limit(HISTORY_PAGE_SIZE).lean();
    res.json({
      messages: messages.reverse().map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
      hasMore: messages.length === HISTORY_PAGE_SIZE,
    });
  }),
);

chatRouter.post(
  "/:sessionId",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [session, user] = await Promise.all([
      ScreeningSessionModel.findOne({ _id: req.params.sessionId, user: req.userId }).lean(),
      UserModel.findById(req.userId).select("name").lean(),
    ]);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const body = req.body as { message?: string; history?: unknown };
    const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE_LEN);
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const history = sanitizeHistory(body.history);
    const indicators = (session.indicators ?? []) as unknown as Indicator[];
    const systemPrompt = buildResultsSystemPrompt(indicators, session.createdAt as unknown as Date, user?.name ? firstName(user.name) : null);

    const result = await callGroqChat(systemPrompt, history, message, `user=${req.userId} session=${req.params.sessionId}`);
    if (result.status === 200 && "reply" in result.body) {
      await ChatMessageModel.insertMany([
        { user: req.userId, mode: "results", session: req.params.sessionId, role: "user", content: message },
        { user: req.userId, mode: "results", session: req.params.sessionId, role: "assistant", content: result.body.reply },
      ]);
    }
    res.status(result.status).json(result.body);
  }),
);
