"use client";

import { useMemo } from "react";
import katex from "katex";

interface TexProps {
  children: string;
  /** Typeset on its own line rather than inline. */
  block?: boolean;
  /**
   * The whole string is LaTeX with no $ delimiters — how the transcription
   * endpoint returns a statement. Without this the source would be printed
   * verbatim, since there is nothing to mark as mathematics.
   */
  raw?: boolean;
}

export function Tex({ children, block = false, raw = false }: TexProps) {
  const html = useMemo(() => {
    if (raw) return render(children, block) ?? escapeHtml(children);

    // Prose: only the $…$ spans are mathematics.
    return children
      .split(/(\$[^$]+\$)/g)
      .map((part) => {
        if (!part.startsWith("$") || !part.endsWith("$") || part.length < 3) {
          return escapeHtml(part);
        }
        return render(part.slice(1, -1), block) ?? escapeHtml(part);
      })
      .join("");
  }, [children, block, raw]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Returns null when the source is not valid LaTeX, so callers can fall back. */
function render(source: string, block: boolean): string | null {
  try {
    return katex.renderToString(source, {
      displayMode: block,
      // Render what it can and mark the rest, rather than throwing away the
      // whole hint because one command was mangled.
      throwOnError: false,
      strict: false,
    });
  } catch {
    return null;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
