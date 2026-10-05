import type { CptTrial, StopTrial, NbackTrial, Indicator } from "@adhd-screener/core";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    request<AuthUser>("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    request<AuthUser>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  me: () => request<AuthUser>("/api/auth/me"),
};

export interface SessionSummary {
  _id: string;
  indicators: Indicator[];
  createdAt: string;
}

export interface CreateSessionPayload {
  asrs?: number[];
  wurs?: number[];
  cptTrials?: CptTrial[];
  stopTrials?: StopTrial[];
  stopMaxRt?: number;
  nbackTrials?: NbackTrial[];
}

export const sessionsApi = {
  create: (payload: CreateSessionPayload) =>
    request<SessionSummary>("/api/sessions", { method: "POST", body: JSON.stringify(payload) }),
  list: () => request<SessionSummary[]>("/api/sessions"),
  get: (id: string) => request<SessionSummary>(`/api/sessions/${id}`),
};
