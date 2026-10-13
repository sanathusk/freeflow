import { X } from "lucide-react";

interface ShortcutCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutCheatSheet({ isOpen, onClose }: ShortcutCheatSheetProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { mode: "Navigation", key: "Tab / Ctrl+Left", desc: "Create & branch child node to the right" },
    { mode: "Navigation", key: "Ctrl+Up / Ctrl+Down", desc: "Create sibling node above / below" },
    { mode: "Navigation", key: "Enter", desc: "Edit selected node" },
    {
      mode: "Navigation",
      key: "Arrow Keys",
      desc: "Navigate spatial focus between adjacent nodes",
    },
    {
      mode: "Navigation",
      key: "Delete / Backspace",
      desc: "Open delete confirmation safety dialog",
    },
    { mode: "Navigation", key: "Cmd/Ctrl + Z", desc: "Undo previous canvas mutation" },
    { mode: "Navigation", key: "Cmd/Ctrl + Shift + Z", desc: "Redo canvas mutation" },
    { mode: "Navigation", key: "Cmd/Ctrl + S", desc: "Save changes to disk" },
    { mode: "Navigation", key: "Cmd/Ctrl + O", desc: "Open .canvas file" },
    { mode: "Navigation", key: "Cmd/Ctrl + K", desc: "Open actions command palette" },
    { mode: "Navigation", key: "Space + Drag", desc: "Pan canvas smoothly" },
    { mode: "Edit Mode", key: "Type", desc: "Direct inline markdown editing" },
    { mode: "Edit Mode", key: "Shift + Enter", desc: "Insert line break" },
    { mode: "Edit Mode", key: "Enter", desc: "Finish editing and return to navigation" },
    { mode: "Edit Mode", key: "Escape", desc: "Cancel / finish editing" },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">Keyboard Shortcuts Cheat Sheet</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-xs"
            >
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium">{sc.desc}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {sc.mode}
                </span>
              </div>
              <span className="rounded bg-slate-800 px-2 py-1 font-mono text-sky-400">
                {sc.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
