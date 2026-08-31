/**
 * Independent symbolic check of whatever the tutor claims.
 *
 * The model is good at locating a flawed step but is not a calculator: during
 * prompt testing it produced confidently wrong arithmetic more than once. So the
 * final value of a full solution is recomputed from the problem itself by SymPy
 * — running as WebAssembly in the student's browser, which costs nothing per
 * check and keeps the work off any server.
 *
 * Loading is deferred until the first check: the runtime is several megabytes
 * and most sessions never reach a full solution.
 */

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v314.0.6/full/";

export interface Check {
  /** A SymPy expression computing the answer from the problem statement. */
  expression: string;
  /** The tutor's final answer, as a SymPy expression. */
  claimed: string;
}

export type Verdict =
  | { status: "verified"; computed: string }
  | { status: "contradicted"; computed: string }
  | { status: "inconclusive"; reason: string };

interface Pyodide {
  loadPackage(name: string): Promise<void>;
  runPython(code: string): string;
  globals: { set(name: string, value: unknown): void };
}

let runtime: Promise<Pyodide> | null = null;

function load(): Promise<Pyodide> {
  runtime ??= (async () => {
    const mod = (await import(
      /* webpackIgnore: true */ `${PYODIDE}pyodide.mjs`
    )) as {
      loadPyodide: (opts: { indexURL: string }) => Promise<Pyodide>;
    };
    const py = await mod.loadPyodide({ indexURL: PYODIDE });
    await py.loadPackage("sympy");
    return py;
  })();
  return runtime;
}

const SCRIPT = `
from sympy import simplify, sympify, nsimplify
from sympy.abc import *  # single letters become symbols, so "x" parses

try:
    computed = sympify(_expression)
    claimed = sympify(_claimed)
    difference = simplify(computed - claimed)
    agree = bool(difference == 0)
    if not agree:
        # Two forms of the same number can survive simplify() unequal;
        # fall back on a numeric comparison before calling it a contradiction.
        try:
            agree = bool(abs(complex(computed) - complex(claimed)) < 1e-9)
        except Exception:
            pass
    _result = ("verified" if agree else "contradicted") + "|" + str(computed)
except Exception as exc:
    _result = "inconclusive|" + type(exc).__name__

_result
`;

export async function verifyAnswer(check: Check): Promise<Verdict> {
  try {
    const py = await load();
    py.globals.set("_expression", check.expression);
    py.globals.set("_claimed", check.claimed);

    const [status, detail] = py.runPython(SCRIPT).split("|");
    if (status === "verified") return { status: "verified", computed: detail };
    if (status === "contradicted")
      return { status: "contradicted", computed: detail };
    return { status: "inconclusive", reason: detail };
  } catch (err) {
    // An offline student, a blocked CDN, or an expression SymPy cannot parse:
    // never a reason to withhold the solution, only to stop vouching for it.
    return {
      status: "inconclusive",
      reason: err instanceof Error ? err.message : "unavailable",
    };
  }
}
