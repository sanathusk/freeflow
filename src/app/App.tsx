import { useState, useEffect, useCallback } from "react";
import { FlowCanvas } from "../components/canvas/FlowCanvas";
import { WelcomeScreen } from "../components/ui/WelcomeScreen";
import { Toolbar } from "../components/ui/Toolbar";
import { CommandPalette } from "../components/ui/CommandPalette";
import { ShortcutCheatSheet } from "../components/ui/ShortcutCheatSheet";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { useCanvasStore } from "../store/canvasStore";
import { useFileStore } from "../store/fileStore";
import { useKeyboardFlow } from "../hooks/useKeyboardFlow";
import { openCanvasFile, createNewCanvasFile, saveCanvasFile } from "../lib/storage/fsaDriver";
import type { CanvasData } from "../lib/jsoncanvas/types";

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fileHandle = useFileStore((s) => s.fileHandle);
  const isDirty = useFileStore((s) => s.isDirty);
  const setFile = useFileStore((s) => s.setFile);
  const setDirty = useFileStore((s) => s.setDirty);

  const loadCanvasData = useCanvasStore((s) => s.loadCanvasData);
  const getCanvasData = useCanvasStore((s) => s.getCanvasData);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);

  // Mark file dirty on nodes/edges change
  useEffect(() => {
    if (fileHandle && nodes.length > 0) {
      setDirty(true);
    }
  }, [nodes, fileHandle, setDirty]);

  // beforeunload warning if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleCreateNew = useCallback(async () => {
    const defaultData: CanvasData = {
      nodes: [
        {
          id: crypto.randomUUID(),
          type: "text",
          text: "Central Idea",
          x: 0,
          y: 0,
          width: 150,
          height: 150,
        },
      ],
      edges: [],
    };

    try {
      const res = await createNewCanvasFile(defaultData, "ff-note.canvas");
      if (res) {
        setFile(res.fileHandle, res.fileName);
        loadCanvasData(defaultData);
      }
    } catch (err) {
      console.error("Failed to create new file:", err);
    }
  }, [setFile, loadCanvasData]);

  const handleOpenExisting = useCallback(async () => {
    try {
      const res = await openCanvasFile();
      if (res) {
        setFile(res.fileHandle, res.fileName);
        loadCanvasData(res.data);
      }
    } catch (err) {
      console.error("Failed to open file:", err);
      alert("Could not open file: " + (err as Error).message);
    }
  }, [setFile, loadCanvasData]);

  const handleSave = useCallback(async () => {
    if (!fileHandle) {
      handleCreateNew();
      return;
    }
    try {
      const data = getCanvasData();
      await saveCanvasFile(fileHandle, data);
      setDirty(false);
    } catch (err) {
      console.error("Failed to save file:", err);
      alert("Failed to save: " + (err as Error).message);
    }
  }, [fileHandle, getCanvasData, setDirty, handleCreateNew]);

  // Bind keyboard flows
  useKeyboardFlow({
    onOpenCommandPalette: () => setPaletteOpen(true),
    onOpenCheatSheet: () => setCheatSheetOpen(true),
    onRequestDelete: () => setDeleteModalOpen(true),
    onSave: handleSave,
    onOpen: handleOpenExisting,
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      {!fileHandle ? (
        <WelcomeScreen onOpenExisting={handleOpenExisting} onCreateNew={handleCreateNew} />
      ) : (
        <>
          <Toolbar
            onNew={handleCreateNew}
            onOpen={handleOpenExisting}
            onSave={handleSave}
            onOpenPalette={() => setPaletteOpen(true)}
            onOpenCheatSheet={() => setCheatSheetOpen(true)}
          />
          <FlowCanvas />
        </>
      )}

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenCheatSheet={() => setCheatSheetOpen(true)}
        onSaveFile={handleSave}
        onOpenFile={handleOpenExisting}
        onNewFile={handleCreateNew}
      />

      <ShortcutCheatSheet isOpen={cheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        nodeId={selectedNodeId}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
