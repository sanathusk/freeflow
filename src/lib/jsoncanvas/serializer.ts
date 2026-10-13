import type { CanvasData } from "./types";

/**
 * Serializes CanvasData into formatted JSON string according to JSON Canvas 1.0.
 * Uses 2-space indentation for clean git diff-ability.
 */
export function serializeJSONCanvas(data: CanvasData): string {
  const cleanData: CanvasData = {
    nodes: data.nodes.map((node) => {
      const base: Record<string, unknown> = {
        id: node.id,
        type: node.type,
        x: Math.round(node.x),
        y: Math.round(node.y),
        width: Math.round(node.width),
        height: Math.round(node.height),
      };

      if (node.color !== undefined) base.color = node.color;

      if (node.type === "text") {
        base.text = node.text;
      } else if (node.type === "file") {
        base.file = node.file;
        if (node.subpath !== undefined) base.subpath = node.subpath;
      } else if (node.type === "link") {
        base.url = node.url;
      } else if (node.type === "group") {
        if (node.label !== undefined) base.label = node.label;
        if (node.background !== undefined) base.background = node.background;
        if (node.backgroundStyle !== undefined) base.backgroundStyle = node.backgroundStyle;
      }

      return base as unknown as typeof node;
    }),
    edges: data.edges.map((edge) => {
      const base: Record<string, unknown> = {
        id: edge.id,
        fromNode: edge.fromNode,
        toNode: edge.toNode,
      };

      if (edge.fromSide !== undefined) base.fromSide = edge.fromSide;
      if (edge.fromEnd !== undefined) base.fromEnd = edge.fromEnd;
      if (edge.toSide !== undefined) base.toSide = edge.toSide;
      if (edge.toEnd !== undefined) base.toEnd = edge.toEnd;
      if (edge.color !== undefined) base.color = edge.color;
      if (edge.label !== undefined) base.label = edge.label;

      return base as unknown as typeof edge;
    }),
  };

  return JSON.stringify(cleanData, null, 2);
}
