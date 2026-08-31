import { NOTION_SYSTEM } from "../_lib/prompts";
import { completeJson } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

/**
 * Deliberately narrow: it takes a question and a language, and nothing else.
 *
 * The solver never passes the current problem through here, so this endpoint
 * cannot become a way around the hint ladder even if the prompt were coaxed —
 * there is no exercise in scope to leak. Pasting one in is handled by the
 * prompt, which answers with the underlying notion instead.
 */
export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const body = await readJson<{
    question?: string;
    language?: string;
    history?: { author: string; content: string }[];
  }>(request);

  const question = body.question?.trim();
  if (!question) throw new Error("Ask about a notion");

  const history = (body.history ?? [])
    .slice(-6)
    .map((m) => `${m.author === "tutor" ? "You" : "Student"}: ${m.content}`)
    .join("\n");

  return completeJson<{
    notion: string;
    explanation: string;
    deflected: boolean;
  }>(
    env,
    NOTION_SYSTEM,
    `Language: ${body.language ?? "en"}` +
      (history ? `\n\nEarlier in this conversation:\n${history}` : "") +
      `\n\nStudent: ${question}`,
  );
});
