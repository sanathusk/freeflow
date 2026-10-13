import type { CanvasData } from "./types";
import { validateCanvasData } from "./validator";

export class JSONCanvasParseError extends Error {
  constructor(
    message: string,
    public readonly errors: string[] = [],
  ) {
    super(message);
    this.name = "JSONCanvasParseError";
  }
}

/**
 * Parse a raw JSON string into a validated CanvasData structure.
 * Preserves all standard fields, including non-text nodes (files, links, groups).
 */
export function parseJSONCanvas(jsonString: string): CanvasData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new JSONCanvasParseError(`Invalid JSON format: ${(err as Error).message}`);
  }

  const { valid, errors } = validateCanvasData(parsed);
  if (!valid) {
    throw new JSONCanvasParseError(`Invalid JSON Canvas 1.0 document`, errors);
  }

  const data = parsed as CanvasData;
  return {
    nodes: [...data.nodes],
    edges: [...data.edges],
  };
}
