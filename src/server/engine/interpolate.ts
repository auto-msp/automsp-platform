import "server-only";

export interface RunContext {
  input: Record<string, unknown>;
  vars: Record<string, unknown>;
}

export function getPath(obj: unknown, path: string): unknown {
  let current = obj;
  for (const part of path.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Replace {{path.to.value}} placeholders against the run context.
 * Unknown paths resolve to an empty string — templates never throw.
 */
export function interpolate(template: string, context: RunContext): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_m, expr: string) => {
    const root = expr.split(".")[0];
    const source =
      root === "input" ? context.input : root === "vars" ? context.vars : undefined;
    if (source === undefined) return "";
    const rest = expr.split(".").slice(1).join(".");
    const value = rest ? getPath(source, rest) : source;
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  });
}

/** Recursively interpolate every string in a config mapping. */
export function interpolateMapping(
  mapping: Record<string, unknown>,
  context: RunContext,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(mapping)) {
    out[key] = typeof value === "string" ? interpolate(value, context) : value;
  }
  return out;
}
