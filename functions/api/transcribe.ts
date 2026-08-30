import { TRANSCRIBE_SYSTEM } from "../_lib/prompts";
import { completeJson, ocr } from "../_lib/mistral";
import { readJson, type Env } from "../_lib/http";
import { apiRoute } from "../_lib/handler";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

interface Transcription {
  statement_latex: string;
  statement_plain: string;
  topic: string;
  lang: string;
  student_working: string[];
}

export const onRequest = apiRoute(async (request: Request, env: Env) => {
  const { image } = await readJson<{ image?: string }>(request);
  if (!image?.startsWith("data:image/")) {
    throw new Error("Send the photo as a data: URL");
  }
  // base64 inflates by 4/3; guard before shipping it to the provider.
  if (image.length > MAX_IMAGE_BYTES * 1.4) {
    throw new Error("That photo is too large — try a tighter crop");
  }

  const markdown = await ocr(env, image);
  if (!markdown) {
    throw new Error(
      "Nothing readable in that photo. Try better light or a closer crop.",
    );
  }

  const parsed = await completeJson<Transcription>(env, TRANSCRIBE_SYSTEM, markdown);
  return { ...parsed, raw_markdown: markdown };
});
