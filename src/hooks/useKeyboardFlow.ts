import { useEffect } from "react";
import { useCanvasStore } from "../store/canvasStore";

interface UseKeyboardFlowProps {
  onOpenCommandPalette: () => void;
  onOpenCheatSheet: () => void;
  onRequestDelete: () => void;
  onSave: () => void;
  onOpen: () => void;
}

export function useKeyboardFlow({
  onOpenCommandPalette,
  onOpenCheatSheet,
  onRequestDelete,
  onSave,
  onOpen,
}: UseKeyboardFlowProps) {
  const mode = useCanvasStore((s) => s.mode);
  const setMode = useCanvasStore((s) => s.setMode);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const selectNode = useCanvasStore((s) => s.selectNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const addChildNode = useCanvasStore((s) => s.addChildNode);
  const addSiblingNode = useCanvasStore((s) => s.addSiblingNode);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaOrCtrl = e.metaKey || e.ctrlKey;

      // Global shortcut: Command Palette
      if (isMetaOrCtrl && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Global shortcut: Save
      if (isMetaOrCtrl && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        onSave();
        return;
      }

      // Global shortcut: Open
      if (isMetaOrCtrl && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        onOpen();
        return;
      }

      // If user is editing text (in an input or textarea), let textarea handle typing
      if (mode === "edit") {
        if (e.key === "Escape") {
          e.preventDefault();
          setMode("navigation");
        }
        return;
      }

      // ---------------------------------------------
      // NAVIGATION MODE SHORTCUTS
      // ---------------------------------------------

      // Undo / Redo
      if (isMetaOrCtrl && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // Cheat sheet (?)
      if (e.key === "?") {
        e.preventDefault();
        onOpenCheatSheet();
        return;
      }

      // Delete confirmation
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) {
          e.preventDefault();
          onRequestDelete();
        }
        return;
      }

      // Enter -> Edit selected node
      if (e.key === "Enter") {
        if (selectedNodeId) {
          e.preventDefault();
          setMode("edit");
        }
        return;
      }

      // Tab or Ctrl+Left -> Add Child node to right
      if (e.key === "Tab" || (e.ctrlKey && e.key === "ArrowLeft")) {
        if (selectedNodeId) {
          e.preventDefault();
          addChildNode(selectedNodeId);
        }
        return;
      }

      // Ctrl + Up -> Sibling Above
      if (e.ctrlKey && e.key === "ArrowUp") {
        if (selectedNodeId) {
          e.preventDefault();
          addSiblingNode(selectedNodeId, "above");
        }
        return;
      }

      // Ctrl + Down -> Sibling Below
      if (e.ctrlKey && e.key === "ArrowDown") {
        if (selectedNodeId) {
          e.preventDefault();
          addSiblingNode(selectedNodeId, "below");
        }
        return;
      }

      // Ctrl + Right -> No-op per SPEC
      if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();
        return;
      }

      // Spatial Arrow navigation between nodes
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        if (!selectedNodeId && nodes.length > 0) {
          e.preventDefault();
          selectNode(nodes[0].id);
          return;
        }

        const current = nodes.find((n) => n.id === selectedNodeId);
        if (!current) return;

        e.preventDefault();

        // Spatial nearest-neighbor navigation in the chosen direction
        let bestTargetId: string | null = null;
        let minDistance = Infinity;

        for (const target of nodes) {
          if (target.id === current.id) continue;

          const dx = target.position.x - current.position.x;
          const dy = target.position.y - current.position.y;

          let matchesDirection = false;
          if (e.key === "ArrowRight" && dx > 20) matchesDirection = true;
          if (e.key === "ArrowLeft" && dx < -20) matchesDirection = true;
          if (e.key === "ArrowDown" && dy > 20) matchesDirection = true;
          if (e.key === "ArrowUp" && dy < -20) matchesDirection = true;

          if (matchesDirection) {
            const distance = Math.hypot(dx, dy);
            if (distance < minDistance) {
              minDistance = distance;
              bestTargetId = target.id;
            }
          }
        }

        if (bestTargetId) {
          selectNode(bestTargetId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    mode,
    selectedNodeId,
    nodes,
    edges,
    addChildNode,
    addSiblingNode,
    selectNode,
    setMode,
    undo,
    redo,
    onOpenCommandPalette,
    onOpenCheatSheet,
    onRequestDelete,
    onSave,
    onOpen,
  ]);
}
