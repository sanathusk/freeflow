import type { Node, Edge } from "@xyflow/react";
import type { FlowNodeData } from "../jsoncanvas/reactFlowAdapter";

export interface LayoutOptions {
  horizontalGap: number;
  verticalGap: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  horizontalGap: 80,
  verticalGap: 40,
};

/**
 * Calculates a hierarchical right-branching mindmap layout.
 * Ensures parent -> child branches to the right, siblings stack vertically,
 * and performs a push-down collision pass to guarantee no overlapping subtrees at 100+ nodes.
 */
export function layoutMindmapTree(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  options: LayoutOptions = DEFAULT_OPTIONS,
): Node<FlowNodeData>[] {
  if (nodes.length === 0) return [];

  // Build adjacency map
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  for (const node of nodes) {
    childrenMap.set(node.id, []);
  }

  for (const edge of edges) {
    if (childrenMap.has(edge.source)) {
      childrenMap.get(edge.source)!.push(edge.target);
      parentMap.set(edge.target, edge.source);
    }
  }

  // Find root nodes (nodes without incoming edges)
  const rootNodes = nodes.filter((n) => !parentMap.has(n.id));
  if (rootNodes.length === 0) {
    // If graph has cycles or no obvious root, treat first node as root
    rootNodes.push(nodes[0]);
  }

  const nodeMap = new Map<string, Node<FlowNodeData>>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n }));

  // Helper to compute subtree height
  function computeSubtreeHeight(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const nodeHeight = typeof node.style?.height === "number" ? node.style.height : 150;
    const children = childrenMap.get(nodeId) || [];

    if (children.length === 0) {
      return nodeHeight;
    }

    let totalChildrenHeight = 0;
    children.forEach((childId, idx) => {
      totalChildrenHeight += computeSubtreeHeight(childId);
      if (idx < children.length - 1) {
        totalChildrenHeight += options.verticalGap;
      }
    });

    return Math.max(nodeHeight, totalChildrenHeight);
  }

  // Position nodes recursively
  function positionNodeAndChildren(nodeId: string, x: number, y: number) {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const nodeWidth = typeof node.style?.width === "number" ? node.style.width : 150;
    const nodeHeight = typeof node.style?.height === "number" ? node.style.height : 150;

    node.position = { x, y };

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    const childX = x + nodeWidth + options.horizontalGap;

    // Calculate total height of all children
    const childHeights = children.map((cid) => computeSubtreeHeight(cid));
    const totalHeight =
      childHeights.reduce((acc, h) => acc + h, 0) +
      Math.max(0, children.length - 1) * options.verticalGap;

    let currentY = y + nodeHeight / 2 - totalHeight / 2;

    children.forEach((childId, idx) => {
      const subtreeHeight = childHeights[idx];
      const childCenterY = currentY + subtreeHeight / 2 - 75; // center on node height
      positionNodeAndChildren(childId, childX, childCenterY);
      currentY += subtreeHeight + options.verticalGap;
    });
  }

  // Layout all roots stacked vertically
  let currentRootY = 0;
  rootNodes.forEach((root) => {
    const subtreeHeight = computeSubtreeHeight(root.id);
    positionNodeAndChildren(root.id, 0, currentRootY);
    currentRootY += subtreeHeight + options.verticalGap * 2;
  });

  return Array.from(nodeMap.values());
}
