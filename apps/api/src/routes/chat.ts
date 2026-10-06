import { Router } from "express";
import type { Indicator } from "@adhd-screener/core";
import { ScreeningSessionModel } from "../models/ScreeningSession";
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

function buildSystemPrompt(indicators: Indicator[], createdAt: Date): string {
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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "The results chat isn't configured yet." });
      return;
    }

    const session = await ScreeningSessionModel.findOne({ _id: req.params.sessionId, user: req.userId }).lean();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const body = req.body as { message?: string; history?: ChatMessage[] };
    const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE_LEN);
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const history = (body.history ?? [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LEN) }));

    const indicators = (session.indicators ?? []) as unknown as Indicator[];
    const systemPrompt = buildSystemPrompt(indicators, session.createdAt as unknown as Date);

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
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
      console.error("[chat] groq request failed:", groqRes.status, errBody);
      res.status(502).json({ error: "Couldn't reach the chat assistant. Try again in a moment." });
      return;
    }

    const data = (await groqRes.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      res.status(502).json({ error: "Couldn't reach the chat assistant. Try again in a moment." });
      return;
    }

    res.json({ reply });
  }),
);
