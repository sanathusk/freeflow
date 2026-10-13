import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { FlowNodeData } from "../../lib/jsoncanvas/reactFlowAdapter";
import { canvasColorToHex } from "../../lib/jsoncanvas/reactFlowAdapter";
import { useCanvasStore } from "../../store/canvasStore";
import { useEffect, useRef, useState } from "react";

export function MindmapNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  const mode = useCanvasStore((s) => s.mode);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const setMode = useCanvasStore((s) => s.setMode);

  const isCurrentSelected = selected || selectedNodeId === id;
  const isEditing = isCurrentSelected && mode === "edit";

  const [text, setText] = useState(nodeData.text || "");
  const [prevNodeText, setPrevNodeText] = useState(nodeData.text || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (nodeData.text !== prevNodeText) {
    setPrevNodeText(nodeData.text || "");
    setText(nodeData.text || "");
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleBlur = () => {
    updateNodeData(id, { text });
    if (mode === "edit") {
      setMode("navigation");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    updateNodeData(id, { text: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      updateNodeData(id, { text });
      setMode("navigation");
    } else if (e.key === "Enter" && !e.shiftKey) {
      // In edit mode, regular Enter stops editing (Shift+Enter is newline)
      e.stopPropagation();
      e.preventDefault();
      updateNodeData(id, { text });
      setMode("navigation");
    }
  };

  const borderColor = canvasColorToHex(nodeData.color);

  return (
    <div
      style={{
        borderColor: isCurrentSelected ? "#38bdf8" : borderColor,
      }}
      className={`relative flex min-h-[150px] min-w-[150px] flex-col rounded-xl border-2 bg-slate-900/90 p-3 shadow-lg backdrop-blur transition-all ${
        isCurrentSelected ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-3 !w-3 !bg-slate-400 hover:!bg-sky-400"
      />

      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Type your idea..."
            className="h-full w-full resize-none bg-transparent font-sans text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        ) : (
          <div
            onDoubleClick={() => setMode("edit")}
            className="prose prose-invert h-full w-full select-text whitespace-pre-wrap font-sans text-sm text-slate-200"
          >
            {text ? (
              text
            ) : (
              <span className="italic text-slate-500">Empty idea (Press Enter to edit)</span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-3 !w-3 !bg-slate-400 hover:!bg-sky-400"
      />
    </div>
  );
}
