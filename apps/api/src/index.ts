import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDb } from "./db";
import { authRouter } from "./routes/auth";
import { sessionsRouter } from "./routes/sessions";
import { learningPathRouter } from "./routes/learningPath";
import { practiceRouter } from "./routes/practice";
import { chatRouter } from "./routes/chat";
import { screeningDraftRouter } from "./routes/screeningDraft";
import { dailyTasksRouter } from "./routes/dailyTasks";
import { habitLogRouter } from "./routes/habitLog";
import type { AuthedRequest } from "./middleware/auth";

const PORT = Number(process.env.PORT ?? 4000);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/adhd-screener";
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

// Render (like Heroku/Railway) sits the app behind a reverse proxy -- without
// this, express-rate-limit sees every request as coming from the proxy's own
// IP and either rate-limits everyone together or refuses to start.
const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// One line per request in Render's log viewer: method, path, status, timing,
// and the authenticated user if the route set one -- this is the first
// thing to check when something looks broken in production but works
// locally (e.g. "is this request even reaching the API, and as who?").
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - startedAt;
    const userId = (req as AuthedRequest).userId;
    console.log(`[req] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms${userId ? ` user=${userId}` : ""}`);
  });
  next();
});

// Generous baseline across the whole API, then tighter limits on the two
// routes that actually matter: auth (brute-force) and chat (each request
// costs real money against the Groq API, so it's the one an abuser would
// target first).
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in a few minutes." },
});
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You've reached the chat limit for now -- try again later." },
});
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/learning-path", learningPathRouter);
app.use("/api/practice", practiceRouter);
app.use("/api/chat", chatLimiter, chatRouter);
app.use("/api/screening-draft", screeningDraftRouter);
app.use("/api/daily-tasks", dailyTasksRouter);
app.use("/api/habit-log", habitLogRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function main() {
  await connectDb(MONGODB_URI);
  if (!process.env.GROQ_API_KEY) {
    console.warn("[chat] GROQ_API_KEY is not set -- /api/chat will return 503 until it's configured.");
  }
  app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("[api] failed to start:", err);
  process.exit(1);
});
