import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type {
  CanvasData,
  CanvasNode,
  CanvasEdge,
  CanvasTextNode,
  CanvasGroupNode,
  CanvasLinkNode,
  CanvasFileNode,
  CanvasNodeSide,
} from "./types";

export type FlowNodeData = {
  id: string;
  type: CanvasNode["type"];
  color?: string;
  text?: string;
  url?: string;
  file?: string;
  subpath?: string;
  label?: string;
  background?: string;
  backgroundStyle?: string;
  isEditing?: boolean;
};

export function canvasColorToHex(color?: string): string {
  if (!color) return "#64748b"; // default slate-500
  switch (color) {
    case "1":
      return "#e53935"; // Red
    case "2":
      return "#fb8c00"; // Orange
    case "3":
      return "#fdd835"; // Yellow
    case "4":
      return "#43a047"; // Green
    case "5":
      return "#00acc1"; // Cyan
    case "6":
      return "#8e24aa"; // Purple
    default:
      return color.startsWith("#") ? color : "#64748b";
  }
}

export function jsonCanvasToReactFlow(data: CanvasData): {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<FlowNodeData>[] = data.nodes.map((node) => {
    let nodeType = "mindmapText";
    if (node.type === "group") nodeType = "mindmapGroup";
    else if (node.type === "link") nodeType = "mindmapLink";
    else if (node.type === "file") nodeType = "mindmapFile";

    return {
      id: node.id,
      type: nodeType,
      position: { x: node.x, y: node.y },
      style: {
        width: node.width,
        height: node.height,
      },
      data: {
        id: node.id,
        type: node.type,
        color: node.color,
        text: (node as CanvasTextNode).text,
        url: (node as CanvasLinkNode).url,
        file: (node as CanvasFileNode).file,
        subpath: (node as CanvasFileNode).subpath,
        label: (node as CanvasGroupNode).label,
        background: (node as CanvasGroupNode).background,
        backgroundStyle: (node as CanvasGroupNode).backgroundStyle,
        isEditing: false,
      },
    };
  });

  const edges: Edge[] = data.edges.map((edge) => {
    const strokeColor = canvasColorToHex(edge.color);
    return {
      id: edge.id,
      source: edge.fromNode,
      target: edge.toNode,
      sourceHandle: edge.fromSide || "right",
      targetHandle: edge.toSide || "left",
      type: "mindmapEdge",
      animated: false,
      markerEnd:
        edge.toEnd !== "none" ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
      style: {
        stroke: strokeColor,
        strokeWidth: 2,
      },
      data: {
        color: edge.color,
        label: edge.label,
        fromSide: edge.fromSide,
        toSide: edge.toSide,
        toEnd: edge.toEnd,
      },
    };
  });

  return { nodes, edges };
}

export function reactFlowToJSONCanvas(nodes: Node<FlowNodeData>[], edges: Edge[]): CanvasData {
  const canvasNodes: CanvasNode[] = nodes.map((node) => {
    const width =
      typeof node.style?.width === "number" ? node.style.width : (node.measured?.width ?? 150);
    const height =
      typeof node.style?.height === "number" ? node.style.height : (node.measured?.height ?? 150);

    const base = {
      id: node.id,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
      width: Math.round(width),
      height: Math.round(height),
      ...(node.data.color ? { color: node.data.color } : {}),
    };

    switch (node.data.type) {
      case "text":
        return {
          ...base,
          type: "text",
          text: node.data.text || "",
        } as CanvasTextNode;

      case "group":
        return {
          ...base,
          type: "group",
          ...(node.data.label ? { label: node.data.label } : {}),
          ...(node.data.background ? { background: node.data.background } : {}),
          ...(node.data.backgroundStyle
            ? { backgroundStyle: node.data.backgroundStyle as CanvasGroupNode["backgroundStyle"] }
            : {}),
        } as CanvasGroupNode;

      case "link":
        return {
          ...base,
          type: "link",
          url: node.data.url || "",
        } as CanvasLinkNode;

      case "file":
        return {
          ...base,
          type: "file",
          file: node.data.file || "",
          ...(node.data.subpath ? { subpath: node.data.subpath } : {}),
        } as CanvasFileNode;

      default:
        return {
          ...base,
          type: "text",
          text: node.data.text || "",
        } as CanvasTextNode;
    }
  });

  const canvasEdges: CanvasEdge[] = edges.map((edge) => {
    const data = (edge.data || {}) as Record<string, unknown>;
    return {
      id: edge.id,
      fromNode: edge.source,
      fromSide:
        (edge.sourceHandle as CanvasNodeSide) || (data.fromSide as CanvasNodeSide) || "right",
      toNode: edge.target,
      toSide: (edge.targetHandle as CanvasNodeSide) || (data.toSide as CanvasNodeSide) || "left",
      toEnd: "arrow",
      ...(data.color ? { color: data.color as string } : {}),
      ...(data.label ? { label: data.label as string } : {}),
    };
  });

  return {
    nodes: canvasNodes,
    edges: canvasEdges,
  };
}
