import { CHAT_SYSTEM, chatUserMessage } from "../_lib/prompts";
import { completeJson } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const body = await readJson<{
    statement?: string;
    working?: string | null;
    unlockedLevels?: number;
    history?: { author: string; content: string }[];
    message?: string;
  }>(request);

  if (!body.statement || !body.message?.trim()) {
    throw new Error("Send the problem and a message");
  }

  return completeJson<{ reply: string }>(
    env,
    CHAT_SYSTEM,
    chatUserMessage({
      statement: body.statement,
      working: body.working ?? null,
      // The chat honours the same ceiling as the hint ladder, so talking to the
      // tutor is never a way around it.
      unlockedLevels: Math.min(4, Math.max(0, Number(body.unlockedLevels) || 0)),
      history: (body.history ?? []).slice(-10),
      message: body.message.trim(),
    }),
  );
});
