import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { FlowNodeData } from "../../lib/jsoncanvas/reactFlowAdapter";
import { canvasColorToHex } from "../../lib/jsoncanvas/reactFlowAdapter";
import { useCanvasStore } from "../../store/canvasStore";
import { FileText } from "lucide-react";

export function FileNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const isSelected = selected || selectedNodeId === id;

  const borderColor = canvasColorToHex(nodeData.color);

  return (
    <div
      style={{
        borderColor: isSelected ? "#38bdf8" : borderColor,
      }}
      className={`relative flex min-h-[90px] min-w-[200px] flex-col justify-between rounded-xl border-2 bg-slate-900/90 p-3 shadow-lg backdrop-blur transition-all ${
        isSelected ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-3 !w-3 !bg-slate-400"
      />

      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        <span className="truncate text-xs font-medium text-slate-200">
          {nodeData.file || "attachment"}
        </span>
      </div>

      <div className="text-[10px] text-slate-500">
        {nodeData.subpath ? `Subpath: ${nodeData.subpath}` : "Preserved file node"}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-3 !w-3 !bg-slate-400"
      />
    </div>
  );
}
