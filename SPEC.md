# FreeFlow: System Specification

## Objective

FreeFlow is an offline-first, keyboard-first Progressive Web Application (PWA) designed for rapid mindmapping and concept sketching. It captures ideas in real-time "flow" by enabling friction-free node creation, branching, and navigation via intuitive keyboard shortcuts and mouse interactions.

All mindmap data is persisted locally on the user's filesystem following the open [JSON Canvas 1.0 Spec](https://jsoncanvas.org/spec/1.0/) (`.canvas` files), guaranteeing zero vendor lock-in and seamless interoperability with tools like Obsidian Canvas.

### Target User & Persona

- General brainstormers capturing ideas fast without mouse/cloud friction. Not architects-only, not researchers-only in MVP.
- Source of truth for MVP scope is `docs/ideas/freeflow-flow-note.md`; this SPEC mirrors it.

---

## Tech Stack

- **Runtime & Package Manager**: Bun (`bun`)
- **Language**: TypeScript (`strict: true`)
- **Frontend Framework**: React 19 / React 18
- **Build Tool**: Vite (`@vitejs/plugin-react`, `vite-plugin-pwa`)
- **Canvas / Graph Engine**: React Flow (`@xyflow/react`)
- **Routing**: TanStack Router (`@tanstack/react-router`)
- **Styling**: Tailwind CSS + `lucide-react` icons
- **State Management**: Zustand (for canvas interaction state, active tool, selection, and undo/redo history)
- **Local Storage / Persistence**:
  - Web File System Access API (`showOpenFilePicker`, `showSaveFilePicker`, directory picker) with fallback to IndexedDB (`idb-keyval`) and manual file downloads for unsupported browsers.
- **Testing**: Vitest (`vitest`) + React Testing Library (`@testing-library/react`) + Playwright for e2e shortcut verification.

---

## Commands

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Type check
bun run typecheck

# Linting & Formatting
bun run lint
bun run format

# Run Unit / Integration Tests (not gated in MVP — skipped)
bun run test

# Run End-to-End / Smoke Tests (MVP gate)
bun run test:e2e

# Build for Production PWA
bun run build

# Preview Production Build
bun run preview
```

---

## Project Structure

```
freeflow/
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.webmanifest
├── src/
│   ├── app/                      # Application entry & routing
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx            # TanStack Router / Router setup
│   ├── components/               # UI components
│   │   ├── canvas/               # React Flow canvas, custom nodes/edges
│   │   │   ├── FlowCanvas.tsx
│   │   │   ├── MindmapNode.tsx   # Markdown editable node
│   │   │   ├── GroupNode.tsx     # JSON Canvas group node
│   │   │   └── MindmapEdge.tsx   # JSON Canvas edge
│   │   ├── ui/                   # Buttons, dialogs, command palette, toasts
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── ShortcutCheatSheet.tsx
│   │   │   └── Toolbar.tsx
│   │   └── layout/               # Header, sidebar, bottom status bar
│   ├── hooks/                    # Custom hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useFileSystem.ts
│   │   └── useAutoLayout.ts
│   ├── lib/
│   │   ├── jsoncanvas/           # JSON Canvas Spec 1.0 Parser & Serializer
│   │   │   ├── parser.ts
│   │   │   ├── serializer.ts
│   │   │   ├── validator.ts
│   │   │   └── types.ts          # JSON Canvas standard types
│   │   ├── layout/               # Tree / radial auto-layout algorithms (e.g. dagre/elkjs or custom mindmap layout)
│   │   │   └── mindmapLayout.ts
│   │   └── storage/              # File System Access API & IndexedDB driver
│   │       ├── fsaDriver.ts
│   │       └── index.ts
│   ├── store/                    # Zustand state management
│   │   ├── canvasStore.ts        # Nodes, edges, active selection, history
│   │   └── fileStore.ts          # File handle, dirty state, file name
│   ├── styles/
│   │   └── globals.css
│   └── test/                     # Test utilities & fixtures
│       └── fixtures/sample.canvas
├── tests/                        # Vitest unit & integration tests
│   ├── jsoncanvas.test.ts
│   └── shortcuts.test.ts
├── SPEC.md                       # This specification document
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Features & Interaction Architecture

### 1. JSON Canvas 1.0 Compliant Data Model

- Parse and serialize `.canvas` JSON structure:
  - **Nodes**: `id`, `type` (`text` | `group` | `file` | `link`), `x`, `y`, `width`, `height`, `color` (1-6 or hex), plus type-specific fields (`text`, `label`, `url`, `file`).
  - **Edges**: `id`, `fromNode`, `fromSide`, `toNode`, `toSide`, `toEnd`, `color`, `label`.
- Bidirectional mapping between React Flow state (`Node`, `Edge`) and JSON Canvas 1.0 specification.
- Clean JSON formatting with 2 spaces for human git diff-ability.

### 2. Keyboard-First "Flow" State Mechanics

Designed for friction-free thought capture without leaving the keyboard. Two modes: navigation ↔ edit.

- Navigation mode:
  - `Tab` / `Ctrl+Left`: Create and branch a **Child Node** (placed to the right, `x = parent.x + 150 + 80`, connected `fromSide: right → toSide: left`, auto-enters edit on new node).
  - `Ctrl+Up` / `Ctrl+Down`: Create **Sibling Node** above / below (`y = prev.y + height + 40` + push-down collision pass, auto-enters edit).
  - `Ctrl+Right`: No-op.
  - `Enter`: Edit selected node (cursor at end).
  - `Arrow Keys` (`Up` / `Down` / `Left` / `Right`): Navigate spatial focus between adjacent nodes.
  - `Delete` / `Backspace`: Request delete — always opens confirm dialog, even for leaf nodes. If node has children, dialog offers: (a) delete subtree, (b) reparent children as siblings of deleted node then delete only current node, (c) cancel. Root with children offers delete-subtree vs cancel only. Group delete offers delete-group+members vs ungroup-keep-members vs cancel. Undo restores.
  - `Cmd/Ctrl + Z` & `Cmd/Ctrl + Shift + Z`: Full Undo and Redo stack.
  - `Cmd/Ctrl + S`: Quick-save (Save picker upfront for new files, else direct write-back).
  - `Cmd/Ctrl + O`: Open `.canvas` file.
  - `Cmd/Ctrl + K`: Actions palette (new/open/save, create child/sibling above/below, edit, delete with same confirm flow, undo/redo, zoom in/out/fit, cheat sheet — every row shows its shortcut; no Save As or color actions in MVP).
- Edit mode:
  - Type edits text; `Shift + Enter`: line break (no-op in navigation mode).
  - `Escape`: Exit edit mode back to navigation mode.
- `Space + Drag` or Middle Click: Pan canvas smoothly.

### 3. Local-First File Persistence & Launch Flow

- **Welcome / Launch Screen**: When launching without an active file:
  - Simple, distraction-free welcome screen with two primary actions:
    1. **Open Existing**: Invokes native file picker (`showOpenFilePicker` with `.canvas` filter) to load an existing JSON Canvas file into the workspace.
    2. **Create New**: Prompts the user to pick a location/folder (using `showSaveFilePicker` with `suggestedName: 'ff-note.canvas'` or folder selector creating `ff-note.canvas`), initializes a default root node (`Central Idea` at origin `(0, 0)`), saves the initial `.canvas` file immediately, and opens the canvas in edit mode on the root node.
- **File System Access API (Chrome-only MVP)**: Uses native OS file picker and direct filesystem reads/writes. Safari/Firefox fallback (download/IndexedDB) is post-MVP.
- **Save & Direct Write-Back**: Direct write-back to the chosen `FileSystemFileHandle`.
- **Auto-save**: Debounced autosave back to the active FileSystemFileHandle after changes.
- **Dirty State Indicator**: Clear `●` indicator when changes are unsaved, and `beforeunload` warning.
- **Node scope MVP**: Text + Group + Link editing; file nodes read-tolerant and preserved on write (no file editing UI). Edges right-to-left only (`fromSide: right`, `toSide: left`, `toEnd: arrow`). Default text node 150x150, resize-drag allowed, auto-height grow on overflow, move-drag post-MVP.
- **PWA Capabilities**: Installable as a standalone desktop app on macOS, Windows, Linux, and ChromeOS with offline caching via Service Worker. Router shell kept (TanStack Router) for future views.

---

## Code Style

- **TypeScript**: Strict type checking (`strict: true`, no explicit `any`).
- **Functional Components**: React hooks, explicit return types where beneficial, no class components.
- **Separation of Concerns**: Pure domain logic (JSON Canvas parsing, layout calculations) decoupled from React UI components.
- **Styling**: Utility-first Tailwind CSS with consistent color tokens matching JSON Canvas preset colors (`1`: Red, `2`: Orange, `3`: Yellow, `4`: Green, `5`: Cyan, `6`: Purple).

### Example Snippet: JSON Canvas Parser & Edge Connector

```typescript
import { CanvasData, CanvasTextNode, CanvasEdge } from "./types";

export function createChildNode(
  parentNode: CanvasTextNode,
  newText: string = "",
): { node: CanvasTextNode; edge: CanvasEdge } {
  const childId = crypto.randomUUID();
  const edgeId = crypto.randomUUID();

  const childNode: CanvasTextNode = {
    id: childId,
    type: "text",
    text: newText,
    x: parentNode.x + parentNode.width + 80,
    y: parentNode.y,
    width: 260,
    height: 100,
  };

  const edge: CanvasEdge = {
    id: edgeId,
    fromNode: parentNode.id,
    fromSide: "right",
    toNode: childId,
    toSide: "left",
    toEnd: "arrow",
  };

  return { node: childNode, edge };
}
```

---

## Testing Strategy (MVP: no unit-only, e2E/smoke only)

- **No unit testing in MVP**: No Vitest unit/integration suite (`tests/` not required for v1). Parser, layout, and keyboard hooks verified via e2E/smoke + manual checklist instead.
- **End-to-End / Smoke (Playwright, `bun run test:e2e`)**:
  - Core flow loop: `Tab` -> type -> `Ctrl+Left` child -> `Ctrl+Up/Down` sibling -> `Enter` edit -> arrows navigate — 10-node no-mouse map builds without errors.
  - Round-trip smoke: open fixture `.canvas`, edit, save, reopen — `parse(serialize(data))` preserves nodes/edges/file nodes (spot-checked, not 100% coverage).
  - Delete safety smoke: leaf confirm, parent subtree vs reparent-as-siblings vs cancel, root subtree vs cancel only, group delete-group+members vs ungroup-keep-members vs cancel, undo restores.
  - File smoke: new file forces Save picker upfront, dirty `●` + `beforeunload`, direct write-back.
  - Offline/PWA smoke: production build installs and runs offline.
- **Manual checklist supplements e2E** for 100+ node overlap spot-check and macOS/Windows shortcut conflicts.

---

## Boundaries

- **Always do**:
  - Ensure strict JSON Canvas 1.0 specification compliance (spec only, not Obsidian-specific behavior); file nodes preserved losslessly on round-trip.
  - Keep offline functionality 100% operational (zero external API or cloud database dependencies).
  - Test keyboard shortcuts for conflicts across macOS (`Cmd`) and Windows/Linux (`Ctrl`); respect navigation vs edit modes.
  - Protect user data with unsaved changes guards before closing or reloading tabs; new files get Save location upfront.
  - Delete always confirms; child-node cases must offer delete-subtree vs reparent-as-siblings vs cancel (root with children: delete-subtree vs cancel only; group: delete-group+members vs ungroup-keep-members vs cancel), with undo restore.
- **Ask first**:
  - Introducing server-side cloud sync, backend services, or analytics trackers.
  - Adding non-standard extensions to the JSON Canvas spec schema that could break Obsidian compatibility.
  - Switching routing libraries or major architectural frameworks (router shell stays).
  - Adding Safari/Firefox fallback, outline view, or file-node editing before v1 proves single-file flow.
- **Never do**:
  - Store unencrypted user content on remote third-party servers.
  - Lock keyboard focus such that keyboard navigation breaks or accessibility is impaired.
  - Overwrite user files without verified file handles or user consent.
  - Enable node move-drag in MVP (resize-drag + auto-layout only).

---

## Success Criteria

1. **JSON Canvas Spec Compliance**: Reads and writes standard `.canvas` files accurately with zero data loss on round-trips (`parse(serialize(data)) === data`), including preserved file nodes. Verified with JSON Canvas 1.0 fixtures.
2. **True Keyboard-Driven Brainstorming**: A user can create a 10-node mindmap completely using only `Tab`, `Ctrl+Arrows`, `Enter`, type, and `Arrow` keys without touching the mouse (timed no-mouse test).
3. **Node Editing MVP**: Text + Group + Link nodes editable (text markdown inline, group label/resize, link URL card); file nodes preserved read-only.
4. **Local Filesystem Integration**: Simple Welcome Screen with "Open Existing" (file picker) and "Create New" (picker with default name `ff-note.canvas`, initializes centered root node, direct write-back via Chrome FSA API with dirty `●` + `beforeunload`).
5. **Delete Safety**: `Delete`/`Backspace` in navigation mode always confirms; subtree vs reparent-as-siblings vs cancel works (root: subtree vs cancel only; group: delete-group+members vs ungroup-keep-members vs cancel) and undo restores.
6. **PWA Offline Execution**: Functions with full feature parity offline when disconnected and installable as desktop PWA. Router shell present.
7. **Fluid Canvas Performance**: 60 FPS panning, zooming, and layout up to 500+ nodes; auto-layout avoids overlap at 100+ nodes (80px X-gap, 40px Y-gap + push-down pass).

---

## Approved Architectural Decisions

1. **Routing**: Standardized on **TanStack Router** (`@tanstack/react-router`) for end-to-end type safety. Shell kept in v1 even though MVP is single-file, for future outline/library views.
2. **Layout Engine**: Automatic hierarchical tree layout for MVP (`Tab`/`Ctrl+Left` child to right, `Ctrl+Up/Down` siblings, 80px X-gap, 40px Y-gap + push-down collision pass); freeform move-drag deferred post-MVP, resize-drag + auto-height grow in MVP.
3. **Node Types (MVP Scope)**: Text + Group + Link editing:
   - **Text Node**: Plain text & Markdown with inline editing/rendering, default 150x150, resize + auto-height grow.
   - **Group Node**: Bounding container with label, resizable.
   - **Link Node**: URL cards with click-to-open and metadata display.
     _(File nodes: read-tolerant, preserved on write, no editing UI in MVP. Safari/Firefox fallback post-MVP. Chrome-only File System Access in MVP.)_
4. **Launch Screen**: Welcome screen with "Open Existing" and "Create New" (suggested file name `ff-note.canvas`), automatically creating a central node and opening into flow edit mode.
5. **Delete UX**: `Delete`/`Backspace` in navigation mode always confirms; nodes with children offer delete-subtree vs reparent-children-as-siblings vs cancel; root with children offers delete-subtree vs cancel only; group offers delete-group+members vs ungroup-keep-members vs cancel.
6. **Actions Palette**: `Cmd/Ctrl+K` lists file/node/view actions (new/open/save, child/sibling/edit/delete, undo/redo, zoom in/out/fit, cheat sheet), each row showing its shortcut. No Save As or color actions in MVP.
