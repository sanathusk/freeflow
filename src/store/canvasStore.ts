import { create } from "zustand";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { FlowNodeData } from "../lib/jsoncanvas/reactFlowAdapter";
import { jsonCanvasToReactFlow, reactFlowToJSONCanvas } from "../lib/jsoncanvas/reactFlowAdapter";
import type { CanvasData } from "../lib/jsoncanvas/types";

interface HistorySnapshot {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
}

interface CanvasStoreState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  mode: "navigation" | "edit";
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<Node<FlowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  selectNode: (id: string | null) => void;
  setMode: (mode: "navigation" | "edit") => void;
  updateNodeData: (id: string, data: Partial<FlowNodeData>) => void;
  updateNodeStyle: (id: string, style: React.CSSProperties) => void;

  // History & Graph mutations
  loadCanvasData: (data: CanvasData) => void;
  getCanvasData: () => CanvasData;
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Node operations
  addChildNode: (parentId: string, text?: string) => string;
  addSiblingNode: (referenceId: string, direction: "above" | "below", text?: string) => string;
  deleteNodeWithPolicy: (
    nodeId: string,
    policy: "subtree" | "reparent" | "leaf" | "ungroup",
  ) => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  mode: "navigation",
  past: [],
  future: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  selectNode: (id) => {
    set((state) => ({
      selectedNodeId: id,
      nodes: state.nodes.map((n) => ({
        ...n,
        selected: n.id === id,
      })),
    }));
  },

  setMode: (mode) => set({ mode }),

  updateNodeData: (id, partialData) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { ...node.data, ...partialData },
            }
          : node,
      ),
    }));
  },

  updateNodeStyle: (id, style) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              style: { ...node.style, ...style },
            }
          : node,
      ),
    }));
  },

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    set({
      past: [
        ...past,
        { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
      ],
      future: [],
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      past: newPast,
      future: [{ nodes, edges }, ...future],
      nodes: previous.nodes,
      edges: previous.edges,
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      past: [...past, { nodes, edges }],
      future: newFuture,
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  loadCanvasData: (data) => {
    const { nodes, edges } = jsonCanvasToReactFlow(data);
    set({
      nodes,
      edges,
      selectedNodeId: nodes.length > 0 ? nodes[0].id : null,
      mode: "navigation",
      past: [],
      future: [],
    });
  },

  getCanvasData: () => {
    const { nodes, edges } = get();
    return reactFlowToJSONCanvas(nodes, edges);
  },

  addChildNode: (parentId, text = "") => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return "";

    const childId = crypto.randomUUID();
    const edgeId = crypto.randomUUID();

    const parentWidth = typeof parent.style?.width === "number" ? parent.style.width : 150;
    const childX = parent.position.x + parentWidth + 80;
    const childY = parent.position.y;

    const childNode: Node<FlowNodeData> = {
      id: childId,
      type: "mindmapText",
      position: { x: childX, y: childY },
      style: { width: 150, height: 150 },
      data: {
        id: childId,
        type: "text",
        text,
        color: parent.data.color,
        isEditing: true,
      },
      selected: true,
    };

    const edge: Edge = {
      id: edgeId,
      source: parent.id,
      target: childId,
      sourceHandle: "right",
      targetHandle: "left",
      type: "mindmapEdge",
      style: { stroke: "#64748b", strokeWidth: 2 },
    };

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), childNode],
      edges: [...edges, edge],
      selectedNodeId: childId,
      mode: "edit",
    });

    return childId;
  },

  addSiblingNode: (referenceId, direction, text = "") => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const refNode = nodes.find((n) => n.id === referenceId);
    if (!refNode) return "";

    // Find parent edge
    const incomingEdge = edges.find((e) => e.target === referenceId);
    const parentId = incomingEdge?.source;

    const siblingId = crypto.randomUUID();
    const refHeight = typeof refNode.style?.height === "number" ? refNode.style.height : 150;
    const refWidth = typeof refNode.style?.width === "number" ? refNode.style.width : 150;

    const offsetY = direction === "below" ? refHeight + 40 : -(refHeight + 40);
    const siblingX = refNode.position.x;
    const siblingY = refNode.position.y + offsetY;

    const siblingNode: Node<FlowNodeData> = {
      id: siblingId,
      type: "mindmapText",
      position: { x: siblingX, y: siblingY },
      style: { width: refWidth, height: refHeight },
      data: {
        id: siblingId,
        type: "text",
        text,
        color: refNode.data.color,
        isEditing: true,
      },
      selected: true,
    };

    const newEdges = [...edges];
    if (parentId) {
      newEdges.push({
        id: crypto.randomUUID(),
        source: parentId,
        target: siblingId,
        sourceHandle: "right",
        targetHandle: "left",
        type: "mindmapEdge",
        style: { stroke: "#64748b", strokeWidth: 2 },
      });
    }

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), siblingNode],
      edges: newEdges,
      selectedNodeId: siblingId,
      mode: "edit",
    });

    return siblingId;
  },

  deleteNodeWithPolicy: (nodeId, policy) => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    if (policy === "leaf" || policy === "subtree") {
      // Find all descendant node IDs recursively
      const toDelete = new Set<string>([nodeId]);
      if (policy === "subtree") {
        const queue = [nodeId];
        while (queue.length > 0) {
          const current = queue.shift()!;
          const children = edges.filter((e) => e.source === current).map((e) => e.target);
          for (const ch of children) {
            if (!toDelete.has(ch)) {
              toDelete.add(ch);
              queue.push(ch);
            }
          }
        }
      }

      const nextNodes = nodes.filter((n) => !toDelete.has(n.id));
      const nextEdges = edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target));

      // Select fallback node
      const fallback = nextNodes[0]?.id || null;

      set({
        nodes: nextNodes.map((n) => ({ ...n, selected: n.id === fallback })),
        edges: nextEdges,
        selectedNodeId: fallback,
        mode: "navigation",
      });
    } else if (policy === "reparent") {
      // Attach target node's children to target node's parent
      const parentEdge = edges.find((e) => e.target === nodeId);
      const parentId = parentEdge?.source;

      const childEdges = edges.filter((e) => e.source === nodeId);

      const updatedEdges = edges
        .filter((e) => e.target !== nodeId && e.source !== nodeId)
        .concat(
          parentId
            ? childEdges.map((e) => ({
                ...e,
                id: crypto.randomUUID(),
                source: parentId,
                sourceHandle: "right",
              }))
            : [],
        );

      const nextNodes = nodes.filter((n) => n.id !== nodeId);
      const fallback = parentId || nextNodes[0]?.id || null;

      set({
        nodes: nextNodes.map((n) => ({ ...n, selected: n.id === fallback })),
        edges: updatedEdges,
        selectedNodeId: fallback,
        mode: "navigation",
      });
    } else if (policy === "ungroup") {
      // Delete container only, keep members
      const nextNodes = nodes.filter((n) => n.id !== nodeId);
      const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      const fallback = nextNodes[0]?.id || null;

      set({
        nodes: nextNodes.map((n) => ({ ...n, selected: n.id === fallback })),
        edges: nextEdges,
        selectedNodeId: fallback,
        mode: "navigation",
      });
    }
  },
}));
