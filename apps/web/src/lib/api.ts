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

export interface ScreeningDraft {
  step: "asrs" | "wurs" | "cpt" | "stop" | "nback";
  asrs?: number[];
  wurs?: number[];
  cptTrials?: CptTrial[];
  stopTrials?: StopTrial[];
  stopMaxRt?: number;
  nbackTrials?: NbackTrial[];
}

export const screeningDraftApi = {
  get: () => request<ScreeningDraft | null>("/api/screening-draft"),
  save: (patch: ScreeningDraft) =>
    request<ScreeningDraft>("/api/screening-draft", { method: "PUT", body: JSON.stringify(patch) }),
  clear: () => request<void>("/api/screening-draft", { method: "DELETE" }),
};

export const sessionsApi = {
  create: (payload: CreateSessionPayload) =>
    request<SessionSummary>("/api/sessions", { method: "POST", body: JSON.stringify(payload) }),
  list: () => request<SessionSummary[]>("/api/sessions"),
  get: (id: string) => request<SessionSummary>(`/api/sessions/${id}`),
};

export interface LearningPathStep {
  key: string;
  type: "learn" | "practice";
  category: string;
  title: string;
  anchor?: string;
  exerciseId?: string;
  status: "pending" | "done";
  completedAt?: string;
}

export interface LearningPath {
  _id?: string;
  steps: LearningPathStep[];
}

export const learningPathApi = {
  get: () => request<LearningPath>("/api/learning-path"),
  setStepStatus: (key: string, status: "pending" | "done") =>
    request<LearningPath>(`/api/learning-path/steps/${key}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export interface ChunkItem {
  text: string;
  done: boolean;
}

export interface PracticeEntry {
  _id: string;
  exerciseId: string;
  createdAt: string;
  // pause-plan
  situation?: string;
  action?: string;
  used?: boolean;
  // externalized-focus-blocks
  taskName?: string;
  durationMinutes?: number;
  doneLooksLike?: string;
  completedFocusBlock?: boolean;
  stayedOnTask?: boolean;
  // chunk-and-externalize
  listTitle?: string;
  chunks?: ChunkItem[];
  // break-it-down
  bigTask?: string;
  completedActions?: string[];
  nextAction?: string;
  taskComplete?: boolean;
  // time-estimation-trainer
  estimatedMinutes?: number;
  actualSeconds?: number;
  // mindful-pause
  durationSeconds?: number;
  noticedUrge?: boolean;
  note?: string;
  // thought-record (situation is shared with pause-plan above)
  automaticThought?: string;
  evidence?: string;
  reframe?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatApi = {
  send: (sessionId: string, message: string, history: ChatMessage[]) =>
    request<{ reply: string }>(`/api/chat/${sessionId}`, { method: "POST", body: JSON.stringify({ message, history }) }),
};

export const practiceApi = {
  create: (payload: Partial<PracticeEntry> & { exerciseId: string }) =>
    request<PracticeEntry>("/api/practice", { method: "POST", body: JSON.stringify(payload) }),
  list: (exerciseId: string) => request<PracticeEntry[]>(`/api/practice?exerciseId=${encodeURIComponent(exerciseId)}`),
  update: (id: string, patch: Partial<PracticeEntry>) =>
    request<PracticeEntry>(`/api/practice/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
};
