import { CONSOLIDATION_SYSTEM } from "../_lib/prompts";
import { completeJson } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const body = await readJson<{
    statement?: string;
    misconception?: string;
    language?: string;
  }>(request);

  if (!body.statement || !body.misconception) {
    throw new Error("Send the original problem and what went wrong");
  }

  return completeJson<{
    statement_latex: string;
    sympy: string | null;
    targets: string;
  }>(
    env,
    CONSOLIDATION_SYSTEM,
    `Language: ${body.language ?? "en"}\nOriginal problem: ${body.statement}\nWhat the student got wrong: ${body.misconception}`,
  );
});
