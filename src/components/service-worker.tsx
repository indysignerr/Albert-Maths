"use client";

import { useEffect } from "react";

/**
 * Registered after load so it never competes with the first paint. Failure is
 * silent on purpose: a browser without service workers, or a private window,
 * should still get a working app.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
