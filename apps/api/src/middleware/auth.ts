import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

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

/** Register AFTER requireAuth on a route -- relies on req.userId already being set. */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const user = await UserModel.findById(req.userId).select("role").lean();
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
