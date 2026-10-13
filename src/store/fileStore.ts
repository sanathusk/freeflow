import { create } from "zustand";

interface FileStoreState {
  fileHandle: FileSystemFileHandle | null;
  fileName: string | null;
  isDirty: boolean;

  setFile: (handle: FileSystemFileHandle | null, name: string | null) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
  fileHandle: null,
  fileName: null,
  isDirty: false,

  setFile: (fileHandle, fileName) => set({ fileHandle, fileName, isDirty: false }),
  setDirty: (isDirty) => set({ isDirty }),
  reset: () => set({ fileHandle: null, fileName: null, isDirty: false }),
}));
