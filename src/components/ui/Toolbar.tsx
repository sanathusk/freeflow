import { useFileStore } from "../../store/fileStore";
import { useCanvasStore } from "../../store/canvasStore";
import { FilePlus, FolderOpen, Save, Undo2, Redo2, HelpCircle, Command } from "lucide-react";

interface ToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onOpenPalette: () => void;
  onOpenCheatSheet: () => void;
}

export function Toolbar({ onNew, onOpen, onSave, onOpenPalette, onOpenCheatSheet }: ToolbarProps) {
  const fileName = useFileStore((s) => s.fileName);
  const isDirty = useFileStore((s) => s.isDirty);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.canUndo());
  const canRedo = useCanvasStore((s) => s.canRedo());

  return (
    <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* File branding & dirty status */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur pointer-events-auto">
        <span className="text-sm font-bold tracking-tight text-white">FreeFlow</span>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">
            {fileName || "Untitled.canvas"}
          </span>
          {isDirty && (
            <span
              title="Unsaved changes"
              className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"
            />
          )}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur pointer-events-auto">
        <button
          onClick={onNew}
          title="New file (Save location upfront)"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <FilePlus className="h-4 w-4" />
        </button>

        <button
          onClick={onOpen}
          title="Open .canvas file (Cmd/Ctrl + O)"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
        </button>

        <button
          onClick={onSave}
          title="Save file (Cmd/Ctrl + S)"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Save className="h-4 w-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-slate-800" />

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Cmd/Ctrl + Z)"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Cmd/Ctrl + Shift + Z)"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-slate-800" />

        <button
          onClick={onOpenPalette}
          title="Actions palette (Cmd/Ctrl + K)"
          className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Command className="h-3.5 w-3.5 text-sky-400" />
          <span>Actions</span>
          <span className="font-mono text-[10px] text-slate-500">⌘K</span>
        </button>

        <button
          onClick={onOpenCheatSheet}
          title="Shortcuts cheat sheet (?)"
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
