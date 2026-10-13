import type { CanvasData } from "../jsoncanvas/types";
import { parseJSONCanvas } from "../jsoncanvas/parser";
import { serializeJSONCanvas } from "../jsoncanvas/serializer";

export interface FileSystemState {
  fileHandle: FileSystemFileHandle | null;
  fileName: string | null;
  isDirty: boolean;
}

/**
 * Open file picker to select an existing .canvas file
 */
export async function openCanvasFile(): Promise<{
  data: CanvasData;
  fileHandle: FileSystemFileHandle;
  fileName: string;
} | null> {
  try {
    const [fileHandle] = await (
      window as unknown as {
        showOpenFilePicker: (options: unknown) => Promise<FileSystemFileHandle[]>;
      }
    ).showOpenFilePicker({
      types: [
        {
          description: "JSON Canvas files",
          accept: {
            "application/json": [".canvas", ".json"],
          },
        },
      ],
      multiple: false,
    });

    const file = await fileHandle.getFile();
    const content = await file.text();
    const data = parseJSONCanvas(content);

    return {
      data,
      fileHandle,
      fileName: file.name,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return null;
    }
    throw err;
  }
}

/**
 * Upfront Save / Location picker for creating a new file
 * Defaults suggestedName to 'ff-note.canvas' per SPEC
 */
export async function createNewCanvasFile(
  initialData: CanvasData,
  suggestedName = "ff-note.canvas",
): Promise<{
  fileHandle: FileSystemFileHandle;
  fileName: string;
} | null> {
  try {
    const fileHandle = await (
      window as unknown as {
        showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle>;
      }
    ).showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "JSON Canvas file",
          accept: {
            "application/json": [".canvas"],
          },
        },
      ],
    });

    // Write initial mindmap immediately
    const writable = await (
      fileHandle as unknown as {
        createWritable: () => Promise<FileSystemWritableFileStream>;
      }
    ).createWritable();
    await writable.write(serializeJSONCanvas(initialData));
    await writable.close();

    return {
      fileHandle,
      fileName: fileHandle.name,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return null;
    }
    throw err;
  }
}

/**
 * Direct write-back to an existing FileSystemFileHandle
 */
export async function saveCanvasFile(
  fileHandle: FileSystemFileHandle,
  data: CanvasData,
): Promise<void> {
  const writable = await (
    fileHandle as unknown as {
      createWritable: () => Promise<FileSystemWritableFileStream>;
    }
  ).createWritable();
  await writable.write(serializeJSONCanvas(data));
  await writable.close();
}
