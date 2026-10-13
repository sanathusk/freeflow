import { FolderOpen, Plus, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onOpenExisting: () => void;
  onCreateNew: () => void;
}

export function WelcomeScreen({ onOpenExisting, onCreateNew }: WelcomeScreenProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100 select-none">
      <div className="w-full max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center rounded-2xl bg-sky-500/10 p-3 ring-1 ring-sky-500/20 mb-6">
          <Sparkles className="h-8 w-8 text-sky-400" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">FreeFlow</h1>
        <p className="mt-2 text-sm text-slate-400">
          Offline-first, keyboard-first mindmapping & thought capture. Compatible with the open JSON
          Canvas 1.0 specification.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onCreateNew}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all hover:bg-sky-500 hover:shadow-sky-500/35 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Mindmap</span>
            <span className="ml-auto rounded-md bg-sky-700/60 px-2 py-0.5 text-[11px] font-normal text-sky-200">
              ff-note.canvas
            </span>
          </button>

          <button
            onClick={onOpenExisting}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3.5 text-sm font-semibold text-slate-200 shadow-sm transition-all hover:bg-slate-800 hover:text-white active:scale-[0.98]"
          >
            <FolderOpen className="h-5 w-5 text-slate-400" />
            <span>Open Existing .canvas</span>
          </button>
        </div>

        {/* Footer shortcuts hint */}
        <div className="mt-12 rounded-xl border border-slate-900 bg-slate-900/40 p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-400">Keyboard shortcuts ready</p>
          <p className="mt-1">
            Branch with <kbd className="font-mono text-slate-300">Tab</kbd> /{" "}
            <kbd className="font-mono text-slate-300">Ctrl+Arrows</kbd>, edit with{" "}
            <kbd className="font-mono text-slate-300">Enter</kbd>, actions with{" "}
            <kbd className="font-mono text-slate-300">Cmd/Ctrl+K</kbd>.
          </p>
        </div>
      </div>
    </div>
  );
}
