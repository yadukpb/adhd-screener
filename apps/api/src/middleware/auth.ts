import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
}

function requiredSecret(): string {
  const v = process.env.JWT_SECRET;
  if (!v) throw new Error("JWT_SECRET must be set");
  return v;
}
const JWT_SECRET: string = requiredSecret();

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
