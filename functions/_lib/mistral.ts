/**
 * The only place that knows which model provider is in use. Everything else
 * calls transcribe()/complete() and stays provider-agnostic, so swapping
 * Mistral for Kimi K2.6 or a student's own key is a config change.
 */

export interface ProviderEnv {
  LLM_PROVIDER?: string;
  MISTRAL_API_KEY?: string;
}

const API = "https://api.mistral.ai/v1";

/** Reasoning-capable, and measurably better than magistral on error location. */
const CHAT_MODEL = "mistral-medium-latest";
/** Dedicated OCR model — far more faithful on maths notation than a general VLM. */
const OCR_MODEL = "mistral-ocr-latest";

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function keyFor(env: ProviderEnv): string {
  const key = env.MISTRAL_API_KEY;
  if (!key) throw new ProviderError("Model provider is not configured", 503);
  return key;
}

async function call(env: ProviderEnv, path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keyFor(env)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    // 429 is the free tier's low request-per-minute ceiling, not a bug.
    throw new ProviderError(
      res.status === 429
        ? "The tutor is handling too many requests right now. Try again in a moment."
        : `Model provider error: ${detail.slice(0, 200)}`,
      res.status === 429 ? 429 : 502,
    );
  }
  return res.json();
}

/** Raw OCR of a photographed page, returned as markdown with LaTeX maths. */
export async function ocr(env: ProviderEnv, dataUrl: string): Promise<string> {
  const out = (await call(env, "/ocr", {
    model: OCR_MODEL,
    document: { type: "image_url", image_url: dataUrl },
  })) as { pages?: { markdown?: string }[] };

  return (out.pages ?? [])
    .map((p) => p.markdown ?? "")
    .join("\n\n")
    .trim();
}

/** A JSON-mode chat completion, parsed. */
export async function completeJson<T>(
  env: ProviderEnv,
  system: string,
  user: string,
): Promise<T> {
  const out = (await call(env, "/chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  })) as { choices: { message: { content: string } }[] };

  const content = out.choices?.[0]?.message?.content ?? "";
  try {
    return repairLatex(JSON.parse(content)) as T;
  } catch {
    throw new ProviderError("The tutor returned an unreadable response", 502);
  }
}

/**
 * A model writing LaTeX into JSON tends to emit `\frac` rather than `\\frac`.
 * That is *valid* JSON — `\f` is a form feed — so JSON.parse succeeds and
 * quietly yields "\x0Crac{2}{e}", which reaches the student as "rac{2}{e}".
 *
 * Repairing the raw JSON text is ambiguous (a correct `\\frac` contains a
 * `\f` substring too), so this runs on the parsed values, where a bare control
 * character can only have come from a mangled command.
 *
 * Tab and newline are deliberately left alone: a real line break in an
 * explanation is far likelier than \times or \neq, and the prompt already asks
 * for doubled backslashes.
 */
function repairLatex(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/\f/g, "\\f") // \frac, \forall
      .replace(/[\b]/g, "\\b") // \binom, \beta
      .replace(/\v/g, "\\v"); // \vec, \varphi
  }
  if (Array.isArray(value)) return value.map(repairLatex);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, repairLatex(v)]),
    );
  }
  return value;
}
