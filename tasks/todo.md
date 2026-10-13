# Task List: FreeFlow Mindmap PWA

## Phase 1: Project Setup & JSON Canvas Engine

- [ ] Task 1.1: Project Scaffolding
  - Description: Initialize Bun Vite React TypeScript project with Tailwind CSS, Lucide icons, TanStack Router shell, and Playwright e2e testing setup.
  - Acceptance: `bun run dev`, `bun run build`, and `bun run typecheck` run cleanly.
  - Verify: Build and typecheck exit with code 0.
  - Files: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/app/main.tsx`, `src/app/router.tsx`
  - Scope: Medium (5 files)

- [ ] Task 1.2: JSON Canvas 1.0 Specification Parser & Serializer
  - Description: Implement TypeScript types for JSON Canvas 1.0 (`TextNode`, `FileNode`, `LinkNode`, `GroupNode`, `Edge`, `Color`) with parser, serializer, and validation logic. Ensure read-tolerance for `FileNode` so it is preserved losslessly on save.
  - Acceptance: Parses valid `.canvas` files into memory, serializes back to standard JSON Canvas format with 2-space indentation without data loss (`parse(serialize(data)) === data`).
  - Verify: Smoke verification script on JSON Canvas sample fixtures.
  - Files: `src/lib/jsoncanvas/types.ts`, `src/lib/jsoncanvas/parser.ts`, `src/lib/jsoncanvas/serializer.ts`, `src/lib/jsoncanvas/validator.ts`
  - Scope: Medium (4 files)

### Checkpoint 1: Foundation Verified
- [ ] TypeScript compilation passes with strict checks.
- [ ] JSON Canvas 1.0 types and serialization ready for state mapping.

---

## Phase 2: React Flow Canvas & Custom Node Types

- [ ] Task 2.1: Canvas Setup & Bidirectional State Mapping
  - Description: Integrate `@xyflow/react`, setup Zustand canvas store with undo/redo history, and provide bidirectional adapter between JSON Canvas data and React Flow graph state.
  - Acceptance: React Flow canvas renders an empty or loaded map with grid background, pan, and zoom controls.
  - Verify: Store imports and exports JSON Canvas objects accurately.
  - Files: `src/store/canvasStore.ts`, `src/components/canvas/FlowCanvas.tsx`, `src/lib/jsoncanvas/reactFlowAdapter.ts`
  - Scope: Medium (3-4 files)

- [ ] Task 2.2: Custom Text Node with Markdown Editing & Auto-Height Grow
  - Description: Implement `MindmapNode` (text node) with dual-mode inline editing (Enter to edit, Esc/blur to preview), default 150x150, auto-height grow on text overflow, and resize drag handles.
  - Acceptance: Displays rendered markdown; pressing Enter enters edit mode; typing resizes height; Esc returns to navigation.
  - Verify: Visual inspection and Playwright smoke check.
  - Files: `src/components/canvas/nodes/MindmapNode.tsx`, `src/components/canvas/nodes/MarkdownEditor.tsx`
  - Scope: Small (2 files)

- [ ] Task 2.3: Custom Group Node & Link Node Implementation
  - Description: Implement `GroupNode` (resizable visual container with label) and `LinkNode` (clickable URL card with metadata) per JSON Canvas 1.0 spec. Preserve `FileNode` instances read-only on canvas.
  - Acceptance: Group nodes visually encompass subnodes; link nodes open URL on click and show title/url.
  - Verify: Both node types render in React Flow and serialize back to JSON Canvas nodes.
  - Files: `src/components/canvas/nodes/GroupNode.tsx`, `src/components/canvas/nodes/LinkNode.tsx`
  - Scope: Small (2 files)

- [ ] Task 2.4: Custom Mindmap Edge Component
  - Description: Implement `MindmapEdge` with JSON Canvas side anchors (right-to-left: `fromSide: right`, `toSide: left`, `toEnd: arrow`) and color presets.
  - Acceptance: Edges route smoothly between nodes with proper arrow terminations and colors.
  - Verify: Edges render correctly on canvas and update smoothly during layout changes.
  - Files: `src/components/canvas/edges/MindmapEdge.tsx`
  - Scope: Small (1-2 files)

### Checkpoint 2: Visual Canvas Complete
- [ ] All 3 node types (Text with Markdown, Group, Link) and edges render in React Flow.
- [ ] Bidirectional synchronization with JSON Canvas data model validated.

---

## Phase 3: Auto-Layout Engine, Keyboard-First Flow & Delete Safety

- [ ] Task 3.1: Hierarchical Mindmap Auto-Layout Algorithm
  - Description: Create layout calculation utility that arranges parent-child (`x = parent.x + 150 + 80`) and siblings (`y = prev.y + height + 40`) with a push-down collision pass to guarantee no overlapping subtrees at 100+ nodes.
  - Acceptance: Given a tree/graph, automatically recalculates and updates `(x, y)` coordinates without overlaps.
  - Verify: Layout calculation smoke test verifies non-overlapping node bounds and correct horizontal/vertical offsets.
  - Files: `src/lib/layout/mindmapLayout.ts`
  - Scope: Small (1-2 files)

- [ ] Task 3.2: Keyboard "Flow" State Controller & Actions Palette
  - Description: Implement modal shortcut manager (`NAVIGATING` ↔ `EDITING_TEXT`):
    - `Tab` / `Ctrl+Left`: create and branch child node, auto-layout, switch to edit mode
    - `Ctrl+Up` / `Ctrl+Down`: create sibling node above / below, auto-layout, switch to edit mode
    - `Ctrl+Right`: no-op
    - `Enter`: edit selected node (cursor at end)
    - `Shift+Enter`: line break (edit-only)
    - `Escape`: exit edit mode to spatial navigation
    - `Arrow Keys`: navigate spatial focus between adjacent nodes
    - `Cmd/Ctrl + Z` & `Shift + Cmd/Ctrl + Z`: undo / redo
    - `Cmd/Ctrl + K`: Actions palette (lists file/node/view actions with shortcuts; no Save As or color actions in MVP)
  - Acceptance: A user can build and navigate a 10-node mindmap purely using keyboard shortcuts without touching the mouse.
  - Verify: Playwright e2e test simulates keyboard sequence and asserts 10 nodes created and focused.
  - Files: `src/hooks/useKeyboardFlow.ts`, `src/components/ui/CommandPalette.tsx`, `src/components/ui/ShortcutCheatSheet.tsx`
  - Scope: Medium (3-4 files)

- [ ] Task 3.3: Delete Safety Flow Modal
  - Description: Implement delete confirmation flow triggered by `Delete`/`Backspace` in navigation mode.
    - Always opens confirmation dialog.
    - If node has children: offer (a) delete subtree, (b) reparent children as siblings of deleted node, (c) cancel.
    - Root with children: offer delete-subtree vs cancel only.
    - Group node: offer (a) delete group + contained members, (b) delete container only (ungroup), (c) cancel.
    - Leaf node: simple confirm/cancel.
    - Undo restores deleted node/subtree.
  - Acceptance: Selecting delete options properly updates graph structure and reparents/deletes as selected.
  - Verify: Playwright e2e test verifies delete choices and reparenting behavior.
  - Files: `src/components/ui/DeleteConfirmModal.tsx`, `src/store/canvasStore.ts`
  - Scope: Small (2 files)

### Checkpoint 3: Keyboard-First Flow & Safety Verified
- [ ] Full keyboard flow operates smoothly without mouse.
- [ ] Delete confirmation protects subtrees and supports reparenting.

---

## Phase 4: Local Filesystem Persistence, UI & PWA

- [ ] Task 4.1: Welcome Screen & Chrome File System Access API Driver
  - Description: Implement simple Welcome Screen with "Open Existing" (file picker) and "Create New" (picker defaulting to `ff-note.canvas`, initializes centered root node, direct write-back to handle). Local storage driver with File System Access API (`showOpenFilePicker`, `showSaveFilePicker`, direct file writes). Debounced auto-save, dirty state indicator (`●`), and `beforeunload` warning.
  - Acceptance: App launches to Welcome Screen; clicking Open Existing loads file; clicking Create New prompts picker with `ff-note.canvas`, creates root node, and opens into canvas.
  - Verify: Manual and Playwright smoke check for welcome screen, upfront save, open, and dirty indicator.
  - Files: `src/components/ui/WelcomeScreen.tsx`, `src/lib/storage/fsaDriver.ts`, `src/store/fileStore.ts`, `src/components/ui/Toolbar.tsx`
  - Scope: Medium (4 files)

- [ ] Task 4.2: PWA Offline Support & Final Polish
  - Description: Configure PWA manifest, service worker via `vite-plugin-pwa`, app icons, and offline caching. Ensure TanStack Router shell is intact.
  - Acceptance: App installs as standalone desktop PWA and launches fully offline.
  - Verify: Production build succeeds; service worker registered; offline execution verified.
  - Files: `vite.config.ts`, `public/manifest.webmanifest`, `src/app/App.tsx`
  - Scope: Small (2-3 files)

- [ ] Task 4.3: Playwright End-to-End Test Suite
  - Description: Create Playwright test suite (`bun run test:e2e`) verifying:
    1. Core 10-node keyboard flow (`Tab` -> type -> `Ctrl+Left` -> `Ctrl+Up/Down` -> `Enter` -> arrows).
    2. JSON Canvas 1.0 round-trip lossless equality on fixtures.
    3. Delete confirmation (leaf, subtree, reparenting).
    4. File upfront save and dirty indicator.
  - Acceptance: `bun run test:e2e` passes with 100% green tests.
  - Verify: Playwright execution exits with code 0.
  - Files: `playwright.config.ts`, `e2e/flow.spec.ts`, `e2e/roundtrip.spec.ts`, `e2e/delete.spec.ts`
  - Scope: Medium (4 files)

### Checkpoint 4: Project Ready for Launch
- [ ] End-to-end user journey works: Launch app -> create mindmap with keyboard -> save to `.canvas` -> open in Obsidian -> reopen in FreeFlow.
- [ ] `bun run test:e2e` and `bun run build` succeed cleanly.

