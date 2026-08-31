import { REVISION_SYSTEM, revisionUserMessage } from "../_lib/prompts";
import { completeJson } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

const MAX_EXERCISES = 10;

export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const body = await readJson<{
    topics?: string[];
    mistakes?: string[];
    count?: number;
    language?: string;
  }>(request);

  const topics = (body.topics ?? []).filter(Boolean).slice(0, 6);
  if (!topics.length) throw new Error("Pick at least one topic");

  const result = await completeJson<{
    exercises: {
      statement_latex: string;
      sympy: string | null;
      topic: string;
      targets: string;
    }[];
  }>(
    env,
    REVISION_SYSTEM,
    revisionUserMessage({
      language: body.language ?? "en",
      count: Math.min(MAX_EXERCISES, Math.max(3, Number(body.count) || 8)),
      topics,
      // The student's own wrong steps, so the drill probes what they got wrong
      // rather than the topic in general.
      mistakes: (body.mistakes ?? []).filter(Boolean).slice(0, 8),
    }),
  );

  // An exercise with no expression cannot be marked, and an unmarkable question
  // in a drill is worse than a shorter drill.
  return {
    exercises: (result.exercises ?? []).filter((e) => e.sympy && e.statement_latex),
  };
});
