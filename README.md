# FreeFlow

> **Offline-first, keyboard-first mindmapping and concept sketching at thinking speed — with zero vendor lock-in.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.x-fbf0df.svg)](https://bun.sh/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![JSON Canvas](https://img.shields.io/badge/JSON%20Canvas-1.0-orange.svg)](https://jsoncanvas.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

FreeFlow is a high-speed, local-first Progressive Web Application (PWA) designed to capture brainstorms, system architecture, and mental models without mouse friction or cloud dependency.

All mindmaps are persisted directly on your local filesystem using the open [JSON Canvas 1.0 Specification](https://jsoncanvas.org/spec/1.0/) (`.canvas` files), guaranteeing complete data ownership and immediate interoperability with tools like **Obsidian Canvas**.

---

## ⚡ Key Features

- **Keyboard-Driven Flow**: Create children (`Tab` / `Ctrl+Left`), branch siblings (`Ctrl+Up` / `Ctrl+Down`), edit (`Enter`), and navigate spatially (`Arrow keys`) without touching the mouse.
- **Open JSON Canvas 1.0 Interoperability**: Full two-way compatibility with `.canvas` files. Preserves Obsidian file attachments and complex attributes losslessly across save cycles.
- **Native Filesystem Persistence**: Built on the Chrome [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) with upfront file target creation, debounced auto-saves, live dirty indicator (`●`), and `beforeunload` guards.
- **Collision-Free Auto-Layout**: Deterministic hierarchical tree layout engine that automatically positions branches and resolves subtree collisions as your ideas expand.
- **Safety-First Deletions**: Deleting branches triggers a confirmation modal offering subtree deletion, child reparenting (promoting children to siblings), or safe cancellation.
- **Node & Canvas Types**:
  - **Text Nodes**: Auto-expanding markdown editing with live preview rendering.
  - **Group Nodes**: Resizable visual boundary containers for clustering related thoughts.
  - **Link Nodes**: Interactive URL preview cards with direct click-to-open.
  - **File Nodes**: Lossless read-tolerance preserving external file references.
- **Action Command Palette (`Cmd/Ctrl + K`)**: Quickly access all canvas, zoom, file, and navigation operations with displayed shortcuts.
- **Offline-First PWA**: Installable as a standalone desktop or tablet app with service-worker caching for instant offline boot.

---

## ⌨️ Keyboard Shortcuts Reference

FreeFlow features a modal shortcut system alternating seamlessly between **Navigation Mode** and **Edit Mode**:

### Navigation Mode

| Shortcut                       | Action                                                    |
| :----------------------------- | :-------------------------------------------------------- |
| `Tab` or `Ctrl + Left`         | Create and branch a new child node to the right           |
| `Ctrl + Up`                    | Create a sibling node above                               |
| `Ctrl + Down`                  | Create a sibling node below                               |
| `Enter`                        | Edit selected node text                                   |
| `Arrow Keys` (`↑` `↓` `←` `→`) | Spatially navigate focus between adjacent nodes           |
| `Delete` / `Backspace`         | Open deletion safety dialog (subtree / reparent / cancel) |
| `Cmd/Ctrl + Z`                 | Undo canvas mutation                                      |
| `Cmd/Ctrl + Shift + Z`         | Redo canvas mutation                                      |
| `Cmd/Ctrl + S`                 | Save changes directly to disk                             |
| `Cmd/Ctrl + O`                 | Open an existing `.canvas` file                           |
| `Cmd/Ctrl + K`                 | Open Actions Command Palette                              |
| `Space + Drag`                 | Pan canvas smoothly                                       |

### Text Edit Mode

| Shortcut               | Action                                     |
| :--------------------- | :----------------------------------------- |
| Any character / typing | Live markdown editing in node              |
| `Shift + Enter`        | Insert new line break                      |
| `Enter`                | Commit edits and return to Navigation Mode |
| `Escape`               | Cancel / exit editing mode                 |

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (version 1.0 or newer recommended)
- A modern Chromium-based browser (Chrome, Edge, Brave, Arc) supporting the File System Access API

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/freeflow.git
cd freeflow

# Install dependencies
bun install
```

### Development

```bash
# Start local development server with HMR
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Available Scripts

| Command              | Description                                                        |
| :------------------- | :----------------------------------------------------------------- |
| `bun run dev`        | Starts Vite dev server with hot module replacement                 |
| `bun run build`      | Compiles TypeScript and generates production PWA bundle in `dist/` |
| `bun run preview`    | Previews the production build locally                              |
| `bun run typecheck`  | Validates TypeScript types strictly (`tsc --noEmit`)               |
| `bun run lint`       | Runs fast linting via [oxlint](https://oxc.rs/)                    |
| `bun run lint:fix`   | Runs oxlint and applies automated fixes                            |
| `bun run format`     | Checks code formatting via oxfmt                                   |
| `bun run format:fix` | Automatically formats files with oxfmt                             |
| `bun run test:e2e`   | Runs Playwright end-to-end integration test suite                  |

---

## 📂 Project Architecture

```
freeflow/
├── public/                       # PWA manifest, icons & static assets
├── src/
│   ├── app/                      # Application entry & TanStack Router setup
│   │   ├── App.tsx               # Root container & lifecycle guards
│   │   ├── main.tsx              # React 19 bootstrap
│   │   └── router.tsx            # Application routing shell
│   ├── components/
│   │   ├── canvas/               # React Flow canvas & custom node renderers
│   │   │   ├── FlowCanvas.tsx    # Interactive canvas viewport
│   │   │   ├── MindmapNode.tsx   # Markdown editable text node
│   │   │   ├── GroupNode.tsx     # JSON Canvas visual container
│   │   │   ├── LinkNode.tsx      # URL bookmark card node
│   │   │   ├── FileNode.tsx      # Lossless file reference node
│   │   │   └── MindmapEdge.tsx   # Side-anchored directional edge
│   │   └── ui/                   # Interface overlays
│   │       ├── CommandPalette.tsx     # Cmd+K quick actions modal
│   │       ├── DeleteConfirmModal.tsx # Safe deletion & reparenting modal
│   │       ├── ShortcutCheatSheet.tsx # Keyboard cheatsheet overlay
│   │       ├── Toolbar.tsx            # Top header, dirty status & controls
│   │       └── WelcomeScreen.tsx      # Initial launch & file picker
│   ├── hooks/
│   │   └── useKeyboardFlow.ts    # Central keyboard shortcut state machine
│   ├── lib/
│   │   ├── jsoncanvas/           # JSON Canvas 1.0 spec parser, serializer & validator
│   │   │   ├── types.ts          # Specification TypeScript contracts
│   │   │   ├── parser.ts         # Lossless parser
│   │   │   ├── serializer.ts     # Standardized JSON serializer
│   │   │   ├── validator.ts      # Spec validation schema
│   │   │   └── reactFlowAdapter.ts # Bidirectional JSON Canvas <-> React Flow adapter
│   │   ├── layout/
│   │   │   └── mindmapLayout.ts  # Hierarchical auto-layout & collision engine
│   │   └── storage/
│   │       └── fsaDriver.ts      # File System Access API read/write handles
│   └── store/
│       ├── canvasStore.ts        # Zustand canvas graph state & undo/redo stack
│       └── fileStore.ts          # File handle, dirty state & active file metadata
└── e2e/
    └── smoke.spec.ts             # Playwright smoke & user journey suite
```

---

## 📜 JSON Canvas 1.0 Compatibility

FreeFlow is strictly spec-compliant with [JSON Canvas 1.0](https://jsoncanvas.org/spec/1.0/):

- **Round-Trip Lossless**: `parse(serialize(canvas)) === canvas`.
- **Obsidian Ready**: You can create a mindmap in FreeFlow, save it, open it directly in Obsidian Canvas, modify it, and reopen it in FreeFlow without losing data.
- **Standardized Side Anchors**: Right-to-left auto-routing (`fromSide: "right"`, `toSide: "left"`, `toEnd: "arrow"`).

---

## 📄 License

This project is licensed under the [Apache License, Version 2.0](LICENSE).
