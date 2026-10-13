import type { CanvasNode, CanvasEdge } from "./types";

export function isCanvasNode(item: unknown): item is CanvasNode {
  if (typeof item !== "object" || item === null) return false;
  const n = item as Partial<CanvasNode>;
  if (
    typeof n.id !== "string" ||
    typeof n.x !== "number" ||
    typeof n.y !== "number" ||
    typeof n.width !== "number" ||
    typeof n.height !== "number"
  ) {
    return false;
  }
  if (n.type === "text") {
    return typeof (n as { text?: unknown }).text === "string";
  }
  if (n.type === "file") {
    return typeof (n as { file?: unknown }).file === "string";
  }
  if (n.type === "link") {
    return typeof (n as { url?: unknown }).url === "string";
  }
  if (n.type === "group") {
    return true;
  }
  return false;
}

export function isCanvasEdge(item: unknown): item is CanvasEdge {
  if (typeof item !== "object" || item === null) return false;
  const e = item as Partial<CanvasEdge>;
  return typeof e.id === "string" && typeof e.fromNode === "string" && typeof e.toNode === "string";
}

export function validateCanvasData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Canvas data must be an object"] };
  }

  const c = data as { nodes?: unknown; edges?: unknown };

  if (!Array.isArray(c.nodes)) {
    errors.push("nodes must be an array");
  } else {
    c.nodes.forEach((node, i) => {
      if (!isCanvasNode(node)) {
        errors.push(`node at index ${i} is invalid`);
      }
    });
  }

  if (!Array.isArray(c.edges)) {
    errors.push("edges must be an array");
  } else {
    c.edges.forEach((edge, i) => {
      if (!isCanvasEdge(edge)) {
        errors.push(`edge at index ${i} is invalid`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
