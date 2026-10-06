import { Router } from "express";
import type { Indicator } from "@adhd-screener/core";
import { ScreeningSessionModel } from "../models/ScreeningSession";
import { DailyTaskModel } from "../models/DailyTask";
import { HabitLogModel } from "../models/HabitLog";
import { LearningPathModel } from "../models/LearningPath";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const chatRouter = Router();
chatRouter.use(requireAuth);

const GROQ_MODEL = "openai/gpt-oss-120b";
const MAX_MESSAGE_LEN = 2000;
const MAX_HISTORY_TURNS = 10;

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
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function buildCoachSystemPrompt(userId: string): Promise<string> {
  const date = todayKey();
  const [latestSession, todayTasks, todayHabit, learningPath] = await Promise.all([
    ScreeningSessionModel.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    DailyTaskModel.find({ user: userId, date }).sort({ time: 1 }).lean(),
    HabitLogModel.findOne({ user: userId, date }).lean(),
    LearningPathModel.findOne({ user: userId }).lean(),
  ]);

  const lines: string[] = [
    "You are a friendly, practical daily coach inside an ADHD self-management app.",
    "You are NOT a doctor, and this app's data is NOT a diagnosis -- if asked for medical advice, say so plainly and suggest a clinician.",
    "Keep replies short and conversational (roughly 3-6 sentences), plain language, no clinical jargon.",
    "You have context on this person's most recent screening, today's planned tasks, today's check-in, and their learning path -- use it to give concrete, specific help (e.g. suggest which planned task to tackle first, reference a relevant exercise from their path), not generic advice.",
    "",
  ];

  if (latestSession) {
    const indicators = (latestSession.indicators ?? []) as unknown as Indicator[];
    const notable = indicators.filter((i) => i.level !== "typical");
    lines.push(
      notable.length > 0
        ? `Most recent screening (${new Date(latestSession.createdAt as unknown as string).toLocaleDateString()}): ${notable.map((i) => `${i.label} (${i.level})`).join(", ")}.`
        : `Most recent screening (${new Date(latestSession.createdAt as unknown as string).toLocaleDateString()}): everything came back typical.`,
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

  const pending = learningPath?.steps.filter((s) => s.status === "pending") ?? [];
  lines.push(
    pending.length > 0
      ? `Pending learning-path steps: ${pending.map((s) => s.title).join(", ")}.`
      : "No pending learning-path steps (either none generated yet, or all caught up).",
  );

  return lines.join("\n");
}

// Registered BEFORE the "/:sessionId" route below -- Express matches routes
// in registration order, and ":sessionId" is a wildcard segment that would
// otherwise swallow a literal "/coach" request (treating "coach" as a
// session id) before it ever reached this handler.
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
    res.status(result.status).json(result.body);
  }),
);

function buildResultsSystemPrompt(indicators: Indicator[], createdAt: Date): string {
  const lines = indicators.map(
    (ind) => `- ${ind.label}: ${ind.level} (${ind.valueText}). What it measures: ${ind.meaning}`,
  );

  return [
    "You are a friendly, supportive assistant helping someone understand their own ADHD indicator screening results.",
    "You are NOT a doctor and this is NOT a diagnosis -- if they ask whether they \"have ADHD\" or something similarly definitive, gently say this tool can't answer that and a clinician can.",
    "Explain everything in simple, everyday language. Avoid clinical or statistical jargon (z-scores, percentiles, task names like \"d-prime\", \"SSRT\") unless they specifically ask for the technical detail -- translate it into plain terms instead.",
    "Keep replies short and conversational (roughly 3-6 sentences), like a knowledgeable friend, not a wall of text or a bulleted essay.",
    "If they ask something outside these results, or something needing real medical advice, say so plainly and suggest talking to a clinician.",
    "",
    `Here are their results from the screening on ${createdAt.toLocaleDateString()}:`,
    ...lines,
  ].join("\n");
}

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
    res.status(result.status).json(result.body);
  }),
);
