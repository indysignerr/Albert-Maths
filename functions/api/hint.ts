import { HINT_SYSTEM } from "../_lib/prompts";
import { completeJson } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const body = await readJson<{
    statement?: string;
    level?: number;
    language?: string;
    priorHints?: string[];
  }>(request);

  const level = Number(body.level);
  if (!body.statement || !Number.isInteger(level) || level < 1 || level > 4) {
    throw new Error("Send a statement and a level between 1 and 4");
  }

  // Whether this level *may* be revealed is decided by the database policy on
  // hint_reveals; by the time a request lands here the row already exists.
  const prior = body.priorHints?.length
    ? `\n\nHints already given:\n${body.priorHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
    : "";

  return completeJson<{ hint: string }>(
    env,
    HINT_SYSTEM,
    `Language: ${body.language ?? "en"}\nRequested level: ${level}\n\nProblem: ${body.statement}${prior}`,
  );
});
