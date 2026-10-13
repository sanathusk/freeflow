import type { NodeTypes, EdgeTypes } from "@xyflow/react";
import { ReactFlow, Background, Controls, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "../../store/canvasStore";
import { MindmapNode } from "./MindmapNode";
import { GroupNode } from "./GroupNode";
import { LinkNode } from "./LinkNode";
import { FileNode } from "./FileNode";
import { MindmapEdge } from "./MindmapEdge";

const nodeTypes: NodeTypes = {
  mindmapText: MindmapNode,
  mindmapGroup: GroupNode,
  mindmapLink: LinkNode,
  mindmapFile: FileNode,
};

const edgeTypes: EdgeTypes = {
  mindmapEdge: MindmapEdge,
};

export function FlowCanvas() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const selectNode = useCanvasStore((s) => s.selectNode);

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        nodesDraggable={false} // Move-drag disabled in MVP per spec
        nodesConnectable={false}
        elementsSelectable={true}
        className="touch-none"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls className="!border-slate-800 !bg-slate-900 !text-slate-100" />
      </ReactFlow>
    </div>
  );
}
