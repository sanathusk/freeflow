import type { NodeProps } from "@xyflow/react";
import type { FlowNodeData } from "../../lib/jsoncanvas/reactFlowAdapter";
import { canvasColorToHex } from "../../lib/jsoncanvas/reactFlowAdapter";
import { useCanvasStore } from "../../store/canvasStore";

export function GroupNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const isSelected = selected || selectedNodeId === id;

  const borderColor = canvasColorToHex(nodeData.color);

  return (
    <div
      style={{
        borderColor: isSelected ? "#38bdf8" : borderColor,
        backgroundColor: nodeData.background || "rgba(30, 41, 59, 0.4)",
      }}
      className={`relative h-full w-full rounded-2xl border-2 border-dashed p-4 shadow-sm backdrop-blur-sm transition-all ${
        isSelected ? "ring-2 ring-sky-400" : ""
      }`}
    >
      {nodeData.label && (
        <div className="absolute -top-3 left-4 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
          {nodeData.label}
        </div>
      )}
    </div>
  );
}
