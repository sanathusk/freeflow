import { parseJSONCanvas } from "./parser";
import { serializeJSONCanvas } from "./serializer";
import type { CanvasData } from "./types";

const sampleCanvas: CanvasData = {
  nodes: [
    {
      id: "root-1",
      type: "text",
      text: "# Central Idea\nBrainstorming session",
      x: 0,
      y: 0,
      width: 250,
      height: 120,
      color: "1",
    },
    {
      id: "child-1",
      type: "text",
      text: "Child branch",
      x: 330,
      y: 0,
      width: 200,
      height: 80,
    },
    {
      id: "file-1",
      type: "file",
      file: "notes/diagram.png",
      x: 330,
      y: 120,
      width: 200,
      height: 150,
    },
    {
      id: "link-1",
      type: "link",
      url: "https://jsoncanvas.org",
      x: 0,
      y: 200,
      width: 250,
      height: 90,
    },
    {
      id: "group-1",
      type: "group",
      label: "Main Cluster",
      x: -20,
      y: -20,
      width: 600,
      height: 400,
      color: "4",
    },
  ],
  edges: [
    {
      id: "edge-1",
      fromNode: "root-1",
      fromSide: "right",
      toNode: "child-1",
      toSide: "left",
      toEnd: "arrow",
      color: "1",
      label: "sub-idea",
    },
  ],
};

const jsonStr = serializeJSONCanvas(sampleCanvas);
const parsed = parseJSONCanvas(jsonStr);

if (parsed.nodes.length !== sampleCanvas.nodes.length) {
  throw new Error(
    `Node count mismatch: expected ${sampleCanvas.nodes.length}, got ${parsed.nodes.length}`,
  );
}

if (parsed.edges.length !== sampleCanvas.edges.length) {
  throw new Error(
    `Edge count mismatch: expected ${sampleCanvas.edges.length}, got ${parsed.edges.length}`,
  );
}

// Check round trip identity
const jsonRoundTrip = serializeJSONCanvas(parsed);
if (jsonStr !== jsonRoundTrip) {
  throw new Error("Roundtrip serialization failed!");
}

console.log("JSON Canvas 1.0 roundtrip verification PASSED cleanly.");
