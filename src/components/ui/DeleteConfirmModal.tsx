import { useCanvasStore } from "../../store/canvasStore";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
}

export function DeleteConfirmModal({ isOpen, nodeId, onClose }: DeleteConfirmModalProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const deleteNodeWithPolicy = useCanvasStore((s) => s.deleteNodeWithPolicy);

  if (!isOpen || !nodeId) return null;

  const targetNode = nodes.find((n) => n.id === nodeId);
  if (!targetNode) return null;

  // Determine structural node role
  const childEdges = edges.filter((e) => e.source === nodeId);
  const parentEdge = edges.find((e) => e.target === nodeId);
  const hasChildren = childEdges.length > 0;
  const isRoot = !parentEdge;
  const isGroup = targetNode.data.type === "group";

  const handleDeleteSubtree = () => {
    deleteNodeWithPolicy(nodeId, "subtree");
    onClose();
  };

  const handleReparentChildren = () => {
    deleteNodeWithPolicy(nodeId, "reparent");
    onClose();
  };

  const handleUngroup = () => {
    deleteNodeWithPolicy(nodeId, "ungroup");
    onClose();
  };

  const handleDeleteLeaf = () => {
    deleteNodeWithPolicy(nodeId, "leaf");
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-red-900/50 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <h3 className="text-base font-bold text-slate-100">Confirm Deletion</h3>
        </div>

        <p className="mt-3 text-sm text-slate-300">
          Are you sure you want to delete this {targetNode.data.type} node?
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {isGroup ? (
            <>
              <button
                onClick={handleDeleteSubtree}
                className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete Group & All Contained Nodes
              </button>
              <button
                onClick={handleUngroup}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                Ungroup (Delete Container Only, Keep Members)
              </button>
            </>
          ) : hasChildren ? (
            <>
              <button
                onClick={handleDeleteSubtree}
                className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete Subtree (Node & All Children)
              </button>
              {!isRoot && (
                <button
                  onClick={handleReparentChildren}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Reparent Children as Siblings, Delete Only This Node
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleDeleteLeaf}
              className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Delete Node
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-transparent px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
