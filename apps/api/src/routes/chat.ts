import { Router } from "express";
import type { Indicator } from "@adhd-screener/core";
import { ScreeningSessionModel } from "../models/ScreeningSession";
import { DailyTaskModel } from "../models/DailyTask";
import { HabitLogModel } from "../models/HabitLog";
import { LearningPathModel } from "../models/LearningPath";
import { PracticeEntryModel } from "../models/PracticeEntry";
import { ChatMessageModel } from "../models/ChatMessage";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const chatRouter = Router();
chatRouter.use(requireAuth);

// Keep in sync with apps/web/src/lib/coachPersona.ts -- this is the name/
// character the system prompt tells the model to answer as; that file is
// what actually renders the name and avatar in the UI.
const COACH_NAME = "Avery";
const GROQ_MODEL = "openai/gpt-oss-120b";
const MAX_MESSAGE_LEN = 2000;
const MAX_HISTORY_TURNS = 10;
const HISTORY_PAGE_SIZE = 60;

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

async function buildCoachSystemPrompt(userId: string): Promise<string> {
  const date = todayKey();
  const weekAgoKey = dateKeyDaysAgo(6); // 7-day window, inclusive of today
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);

  const [latestSession, screeningCount, todayTasks, todayHabit, weekHabits, learningPath, recentPractice] = await Promise.all([
    ScreeningSessionModel.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    ScreeningSessionModel.countDocuments({ user: userId }),
    DailyTaskModel.find({ user: userId, date }).sort({ time: 1 }).lean(),
    HabitLogModel.findOne({ user: userId, date }).lean(),
    HabitLogModel.find({ user: userId, date: { $gte: weekAgoKey } }).sort({ date: 1 }).lean(),
    LearningPathModel.findOne({ user: userId }).lean(),
    PracticeEntryModel.find({ user: userId, createdAt: { $gte: weekAgoDate } }).lean(),
  ]);

  const lines: string[] = [
    `You are ${COACH_NAME}, a friendly, practical daily coach inside an ADHD self-management app.`,
    "You are NOT a doctor, and this app's data is NOT a diagnosis -- if asked for medical advice, say so plainly and suggest a clinician.",
    "Keep replies short and conversational (roughly 3-6 sentences), plain language, no clinical jargon.",
    "You have context on this person's full screening history, today's planned tasks, their check-ins over the last week, their learning path, and their recent practice-exercise activity -- use it to give concrete, specific help (e.g. suggest which planned task to tackle first, reference a relevant exercise from their path, notice a mood/sleep trend), not generic advice.",
    "",
  ];

  if (latestSession) {
    const indicators = (latestSession.indicators ?? []) as unknown as Indicator[];
    const notable = indicators.filter((i) => i.level !== "typical");
    lines.push(
      notable.length > 0
        ? `Most recent screening (${new Date(latestSession.createdAt as unknown as string).toLocaleDateString()}, screening #${screeningCount}): ${notable.map((i) => `${i.label} (${i.level})`).join(", ")}.`
        : `Most recent screening (${new Date(latestSession.createdAt as unknown as string).toLocaleDateString()}, screening #${screeningCount}): everything came back typical.`,
    );
  } else {
    lines.push("They haven't completed a screening yet.");
  }

  lines.push(
    todayTasks.length > 0
      ? `Today's planned tasks: ${todayTasks.map((t) => `${t.title}${t.time ? ` (${t.time})` : ""}${t.done ? " [done]" : ""}`).join("; ")}.`
      : "Nothing planned in today's planner yet.",
  );

  if (todayHabit) {
    const parts: string[] = [];
    if (todayHabit.mood !== undefined) parts.push(`mood ${todayHabit.mood}/5`);
    if (todayHabit.medicationTaken !== undefined) parts.push(todayHabit.medicationTaken ? "took medication" : "hasn't taken medication");
    if (todayHabit.sleepHours !== undefined) parts.push(`${todayHabit.sleepHours}h sleep`);
    lines.push(parts.length > 0 ? `Today's check-in: ${parts.join(", ")}.` : "They checked in today but logged nothing specific yet.");
  } else {
    lines.push("No check-in logged today yet.");
  }

  if (weekHabits.length > 1) {
    const trend = weekHabits
      .map((h) => {
        const parts: string[] = [];
        if (h.mood !== undefined) parts.push(`mood ${h.mood}`);
        if (h.sleepHours !== undefined) parts.push(`${h.sleepHours}h sleep`);
        return parts.length > 0 ? `${h.date}: ${parts.join(", ")}` : null;
      })
      .filter((s): s is string => s !== null);
    if (trend.length > 1) lines.push(`Past week's check-ins: ${trend.join("; ")}.`);
  }

  const pending = learningPath?.steps.filter((s) => s.status === "pending") ?? [];
  lines.push(
    pending.length > 0
      ? `Pending learning-path steps: ${pending.map((s) => s.title).join(", ")}.`
      : "No pending learning-path steps (either none generated yet, or all caught up).",
  );

  if (recentPractice.length > 0) {
    const byExercise = new Map<string, number>();
    for (const p of recentPractice) byExercise.set(p.exerciseId, (byExercise.get(p.exerciseId) ?? 0) + 1);
    const summary = [...byExercise.entries()].map(([id, n]) => `${id} x${n}`).join(", ");
    lines.push(`Practice exercises done in the last 7 days: ${summary}.`);
  } else {
    lines.push("No practice-exercise activity in the last 7 days.");
  }

  return lines.join("\n");
}

// Registered BEFORE the "/:sessionId" route below -- Express matches routes
// in registration order, and ":sessionId" is a wildcard segment that would
// otherwise swallow a literal "/coach" request (treating "coach" as a
// session id) before it ever reached this handler. Same reasoning puts
// "/coach/history" ahead of the "/:sessionId/history" GET route further down.
chatRouter.get(
  "/coach/history",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const messages = await ChatMessageModel.find({ user: req.userId, mode: "coach" })
      .sort({ createdAt: -1 })
      .limit(HISTORY_PAGE_SIZE)
      .lean();
    res.json(messages.reverse().map((m) => ({ role: m.role, content: m.content })));
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

function buildResultsSystemPrompt(indicators: Indicator[], createdAt: Date): string {
  const lines = indicators.map(
    (ind) => `- ${ind.label}: ${ind.level} (${ind.valueText}). What it measures: ${ind.meaning}`,
  );

  return [
    `You are ${COACH_NAME}, a friendly, supportive assistant helping someone understand their own ADHD indicator screening results.`,
    "You are NOT a doctor and this is NOT a diagnosis -- if they ask whether they \"have ADHD\" or something similarly definitive, gently say this tool can't answer that and a clinician can.",
    "Explain everything in simple, everyday language. Avoid clinical or statistical jargon (z-scores, percentiles, task names like \"d-prime\", \"SSRT\") unless they specifically ask for the technical detail -- translate it into plain terms instead.",
    "Keep replies short and conversational (roughly 3-6 sentences), like a knowledgeable friend, not a wall of text or a bulleted essay.",
    "If they ask something outside these results, or something needing real medical advice, say so plainly and suggest talking to a clinician.",
    "",
    `Here are their results from the screening on ${createdAt.toLocaleDateString()}:`,
    ...lines,
  ].join("\n");
}

chatRouter.get(
  "/:sessionId/history",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const session = await ScreeningSessionModel.findOne({ _id: req.params.sessionId, user: req.userId }).lean();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const messages = await ChatMessageModel.find({ user: req.userId, mode: "results", session: req.params.sessionId })
      .sort({ createdAt: -1 })
      .limit(HISTORY_PAGE_SIZE)
      .lean();
    res.json(messages.reverse().map((m) => ({ role: m.role, content: m.content })));
  }),
);

chatRouter.post(
  "/:sessionId",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const session = await ScreeningSessionModel.findOne({ _id: req.params.sessionId, user: req.userId }).lean();
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
    const systemPrompt = buildResultsSystemPrompt(indicators, session.createdAt as unknown as Date);

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
