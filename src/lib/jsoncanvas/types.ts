/**
 * JSON Canvas 1.0 Specification Type Definitions
 * @see https://jsoncanvas.org/spec/1.0/
 */

export type CanvasColor = "1" | "2" | "3" | "4" | "5" | "6" | string;

export type CanvasNodeSide = "top" | "right" | "bottom" | "left";

export type CanvasEdgeEnd = "none" | "arrow";

export interface CanvasBaseNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: CanvasColor;
}

export interface CanvasTextNode extends CanvasBaseNode {
  type: "text";
  text: string;
}

export interface CanvasFileNode extends CanvasBaseNode {
  type: "file";
  file: string;
  subpath?: string;
}

export interface CanvasLinkNode extends CanvasBaseNode {
  type: "link";
  url: string;
}

export interface CanvasGroupNode extends CanvasBaseNode {
  type: "group";
  label?: string;
  background?: string;
  backgroundStyle?: "cover" | "ratio" | "repeat";
}

export type CanvasNode = CanvasTextNode | CanvasFileNode | CanvasLinkNode | CanvasGroupNode;

export interface CanvasEdge {
  id: string;
  fromNode: string;
  fromSide?: CanvasNodeSide;
  fromEnd?: CanvasEdgeEnd;
  toNode: string;
  toSide?: CanvasNodeSide;
  toEnd?: CanvasEdgeEnd;
  color?: CanvasColor;
  label?: string;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}
