/**
 * Where to send the student once they are signed in.
 *
 * Sign-up leaves the app entirely — into an inbox, sometimes onto another
 * device — so the destination cannot ride along in React state. It is parked in
 * localStorage before the link is sent and claimed once, on the way back.
 */
const KEY = "albert-return-to";

/** Only in-app paths: a stored value must never become an open redirect. */
function isSafe(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export function rememberDestination(path: string) {
  if (!isSafe(path)) return;
  try {
    localStorage.setItem(KEY, path);
  } catch {
    /* private mode — the student lands on the dashboard instead */
  }
}

export function claimDestination(fallback = "/app/"): string {
  try {
    const stored = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return stored && isSafe(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}
