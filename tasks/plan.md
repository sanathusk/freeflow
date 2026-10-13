# Implementation Plan: FreeFlow Mindmap PWA

## Overview

FreeFlow is an offline-first, keyboard-shortcut-driven mindmapping Progressive Web Application built with Bun, React, TypeScript, TanStack Router, and React Flow (`@xyflow/react`). The app persists maps locally as standard `.canvas` files compliant with the open [JSON Canvas 1.0 Specification](https://jsoncanvas.org/spec/1.0/).

## Architecture Decisions

1. **Tooling & Build**: Bun runtime + Vite + React 18/19 + TypeScript strict mode + Tailwind CSS.
2. **Data Model & Standards**: Full compliance with JSON Canvas 1.0 (`TextNode`, `GroupNode`, `LinkNode`, and `Edge`; `FileNode` read-tolerant and preserved on save). State stored and transformed cleanly between React Flow graph elements and JSON Canvas schema.
3. **Routing**: TanStack Router (`@tanstack/react-router`) for type-safe routing shell (single-file canvas view for MVP, ready for outline/library views post-MVP).
4. **Mindmap Layout Engine**: Hierarchical tree layout placing children to the right (`Tab` / `Ctrl+Left`, X-gap 80px) and siblings (`Ctrl+Up` / `Ctrl+Down`, Y-gap 40px) with push-down collision pass to prevent overlap at 100+ nodes. No freeform move-drag in MVP; resize-drag and auto-height grow supported.
5. **Persistence & Launch Flow**: Welcome Screen on launch offering "Open Existing" (file picker) and "Create New" (picker with default name `ff-note.canvas`, initializes centered root node, direct write-back via Chrome FSA API with dirty `●` + `beforeunload`). Safari/Firefox fallbacks deferred post-MVP.
6. **Keyboard State Machine**: Explicit modal state machine distinguishing `NAVIGATING` vs `EDITING_TEXT` mode. Navigation mode: `Tab` / `Ctrl+Left` (child), `Ctrl+Up` / `Ctrl+Down` (sibling above/below), `Ctrl+Right` (no-op), `Enter` (edit selected node), `Arrow Keys` (spatial focus), `Delete`/`Backspace` (delete confirm flow), `Cmd/Ctrl+Z`/`Shift+Cmd/Ctrl+Z` (undo/redo), `Cmd/Ctrl+S` (save), `Cmd/Ctrl+O` (open), `Cmd/Ctrl+K` (actions palette). Edit mode: typing edits text, `Shift+Enter` (newline), `Esc` (return to navigation mode).

7. **Delete Safety**: `Delete`/`Backspace` always confirms. If node has children: offer delete-subtree vs reparent-children-as-siblings vs cancel (root with children: delete-subtree vs cancel only). Group node: delete-group+members vs ungroup-keep-members vs cancel. Undo restores deleted subtrees.
8. **Testing Strategy**: MVP gated by Playwright e2E / smoke tests (`bun run test:e2e`) and manual checklists; unit testing suite skipped for MVP speed per spec.

---

## Phase Breakdown

### Phase 1: Foundation & Project Scaffolding

- Setup Bun project, Vite, React, TypeScript, Tailwind CSS, TanStack Router shell, and Playwright e2e test configuration.
- Implement JSON Canvas 1.0 types (`types.ts`), parser (`parser.ts`), serializer (`serializer.ts`), and validator (`validator.ts`).

### Phase 2: Canvas Core & Custom Nodes

- Integrate React Flow (`@xyflow/react`) with canvas viewport, controls, and background grid.
- Implement custom node types:
  - `MindmapNode` (Text): Markdown inline editing (`Enter`/focus to edit, `Esc`/blur to view), auto-height grow, resize-drag.
  - `GroupNode`: Container bounding box with label, resizable.
  - `LinkNode`: URL card with title and click-to-open.
  - Read-tolerant preservation for `FileNode`.
- Implement custom `MindmapEdge` matching JSON Canvas anchor sides (right-to-left, arrow terminator).

### Phase 3: Keyboard Flow, Auto-Layout & Delete Safety

- Mindmap auto-layout engine: child placement (`+150 + 80`), sibling placement (`+height + 40`), and push-down collision pass.
- Keyboard flow controller & modal state machine (`NAVIGATING` ↔ `EDITING_TEXT`).
- Delete confirmation modal with subtree deletion, reparent-as-siblings, ungroup, and cancel options.
- Actions palette (`Cmd/Ctrl+K`) with all shortcuts displayed.
- Undo/redo history stack in Zustand canvas store.

### Phase 4: Local Filesystem Persistence, UI & PWA

- Native File System Access API integration (upfront Save picker on new file, open, direct write-back, dirty `●` dot, `beforeunload` guard).
- PWA manifest, offline service worker caching via `vite-plugin-pwa`.
- End-to-end / smoke tests with Playwright verifying 10-node keyboard flow, delete safety, and round-trip canvas fidelity.

---

## Risks and Mitigations

| Risk                                                      | Impact | Mitigation                                                                                                                                             |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| JSON Canvas schema divergence with Obsidian Canvas        | High   | Strict compliance with JSON Canvas 1.0 specification; preserve non-editable file nodes losslessly on serialize.                                        |
| Keyboard shortcut collisions (browser vs canvas vs input) | High   | Explicit modal state machine distinguishing `NAVIGATING` vs `EDITING_TEXT` mode; stop event propagation when editing text inputs.                      |
| Node overlaps in dense mindmaps                           | Medium | Deterministic auto-layout engine with push-down collision pass to guarantee no overlaps at 100+ nodes.                                                 |
| Accidental data loss during deletion                      | High   | Deletion always triggers confirmation dialog with explicit choices (delete-subtree vs reparent-as-siblings vs cancel), backed by full undo/redo stack. |
