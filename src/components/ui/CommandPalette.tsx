import React from "react";
import { useCanvasStore } from "../../store/canvasStore";
import {
  FilePlus,
  FolderOpen,
  Save,
  PlusCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
  HelpCircle,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheatSheet: () => void;
  onSaveFile: () => void;
  onOpenFile: () => void;
  onNewFile: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenCheatSheet,
  onSaveFile,
  onOpenFile,
  onNewFile,
}: CommandPaletteProps) {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const addChildNode = useCanvasStore((s) => s.addChildNode);
  const addSiblingNode = useCanvasStore((s) => s.addSiblingNode);
  const setMode = useCanvasStore((s) => s.setMode);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);

  const [query, setQuery] = React.useState("");

  if (!isOpen) return null;

  const actions = [
    {
      id: "new",
      label: "New mindmap",
      shortcut: "Upfront Save",
      icon: FilePlus,
      action: () => {
        onNewFile();
        onClose();
      },
    },
    {
      id: "open",
      label: "Open canvas file",
      shortcut: "Cmd/Ctrl + O",
      icon: FolderOpen,
      action: () => {
        onOpenFile();
        onClose();
      },
    },
    {
      id: "save",
      label: "Save canvas file",
      shortcut: "Cmd/Ctrl + S",
      icon: Save,
      action: () => {
        onSaveFile();
        onClose();
      },
    },
    {
      id: "child",
      label: "Add child node",
      shortcut: "Tab / Ctrl+Left",
      icon: ArrowRight,
      disabled: !selectedNodeId,
      action: () => {
        if (selectedNodeId) addChildNode(selectedNodeId);
        onClose();
      },
    },
    {
      id: "sibling-above",
      label: "Add sibling above",
      shortcut: "Ctrl + Up",
      icon: ArrowUp,
      disabled: !selectedNodeId,
      action: () => {
        if (selectedNodeId) addSiblingNode(selectedNodeId, "above");
        onClose();
      },
    },
    {
      id: "sibling-below",
      label: "Add sibling below",
      shortcut: "Ctrl + Down",
      icon: ArrowDown,
      disabled: !selectedNodeId,
      action: () => {
        if (selectedNodeId) addSiblingNode(selectedNodeId, "below");
        onClose();
      },
    },
    {
      id: "edit",
      label: "Edit selected node",
      shortcut: "Enter",
      icon: PlusCircle,
      disabled: !selectedNodeId,
      action: () => {
        setMode("edit");
        onClose();
      },
    },
    {
      id: "undo",
      label: "Undo change",
      shortcut: "Cmd/Ctrl + Z",
      icon: Undo2,
      action: () => {
        undo();
        onClose();
      },
    },
    {
      id: "redo",
      label: "Redo change",
      shortcut: "Cmd/Ctrl + Shift + Z",
      icon: Redo2,
      action: () => {
        redo();
        onClose();
      },
    },
    {
      id: "cheatsheet",
      label: "Shortcut Cheat Sheet",
      shortcut: "?",
      icon: HelpCircle,
      action: () => {
        onOpenCheatSheet();
        onClose();
      },
    },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions or commands..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
          {filtered.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                disabled={act.disabled}
                onClick={act.action}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  act.disabled
                    ? "opacity-40 cursor-not-allowed text-slate-600"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span>{act.label}</span>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400">
                  {act.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
