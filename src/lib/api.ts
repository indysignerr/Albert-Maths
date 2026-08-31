import { supabase } from "@/lib/supabase/client";

/**
 * In production the Worker serves both the assets and /api, so the base is
 * empty. `next dev` has no Worker, so local development points at `wrangler dev`
 * via NEXT_PUBLIC_API_BASE.
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError("Your session expired — sign in again", 401);

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (payload as { error?: string }).error ?? "Something went wrong",
      res.status,
    );
  }
  return payload as T;
}

export interface Transcription {
  statement_latex: string;
  statement_plain: string;
  topic: string;
  lang: string;
  student_working: string[];
  raw_markdown: string;
}

export interface Review {
  verdict: "error" | "correct";
  first_bad_line: string | null;
  why: string;
  question_back: string;
}

export interface Check {
  expression: string;
  claimed: string;
}

export const api = {
  transcribe: (image: string) =>
    post<Transcription>("/api/transcribe", { image }),

  hint: (args: {
    statement: string;
    level: number;
    language: string;
    priorHints: string[];
  }) => post<{ hint: string; check: Check | null }>("/api/hint", args),

  review: (args: { statement: string; lines: string[] }) =>
    post<Review>("/api/review", args),

  chat: (args: {
    statement: string;
    working: string | null;
    unlockedLevels: number;
    history: { author: string; content: string }[];
    message: string;
  }) => post<{ reply: string }>("/api/chat", args),

  notion: (args: {
    question: string;
    language: string;
    history: { author: string; content: string }[];
  }) =>
    post<{ notion: string; explanation: string; deflected: boolean }>(
      "/api/notion",
      args,
    ),

  consolidate: (args: {
    statement: string;
    misconception: string;
    language: string;
  }) =>
    post<{ statement_latex: string; sympy: string | null; targets: string }>(
      "/api/consolidate",
      args,
    ),
};
