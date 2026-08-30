import { REVIEW_SYSTEM, reviewUserMessage } from "../_lib/prompts";
import { completeJson } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const body = await readJson<{ statement?: string; lines?: string[] }>(request);
  const lines = (body.lines ?? []).map((l) => l.trim()).filter(Boolean);

  if (!body.statement || lines.length === 0) {
    throw new Error("Send the problem and at least one line of working");
  }

  return completeJson<{
    verdict: "error" | "correct";
    first_bad_line: string | null;
    why: string;
    question_back: string;
  }>(env, REVIEW_SYSTEM, reviewUserMessage(body.statement, lines));
});
