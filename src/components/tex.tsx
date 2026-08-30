"use client";

import { useMemo } from "react";
import katex from "katex";

/**
 * Renders the mixed prose-and-LaTeX the tutor produces: text passes through,
 * anything between $…$ is typeset. Malformed LaTeX renders as its source rather
 * than throwing, so a bad model response degrades to readable text.
 */
export function Tex({
  children,
  block = false,
}: {
  children: string;
  block?: boolean;
}) {
  const html = useMemo(() => {
    const parts = children.split(/(\$[^$]+\$)/g);
    return parts
      .map((part) => {
        if (!part.startsWith("$") || !part.endsWith("$") || part.length < 3) {
          return escapeHtml(part);
        }
        try {
          return katex.renderToString(part.slice(1, -1), {
            displayMode: block,
            throwOnError: false,
          });
        } catch {
          return escapeHtml(part);
        }
      })
      .join("");
  }, [children, block]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
