import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { signToken, requireAuth, type AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../asyncHandler";

export const authRouter = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

authRouter.post("/register", asyncHandler(async (req, res) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  if (!name || !name.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ email: email.toLowerCase(), passwordHash, name: name.trim() });

  const token = signToken(user._id.toString());
  res.cookie("token", token, COOKIE_OPTS);
  res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user._id.toString());
  res.cookie("token", token, COOKIE_OPTS);
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
}));

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { ...COOKIE_OPTS, maxAge: undefined });
  res.status(204).end();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler<AuthedRequest>(async (req, res) => {
    const user = await UserModel.findById(req.userId).select("email name role createdAt");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
  }),
);
