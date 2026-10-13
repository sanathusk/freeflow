# FreeFlow Flow-note

## Problem Statement

How Might We let general brainstormers capture mindmaps at thinking speed — keyboard-only, local-only, no lock-in?

## Target User

General brainstormers capturing ideas fast without mouse/cloud friction. Not architects-only, not researchers-only in MVP.

## Success Moment (v1)

- Create a 10-node mindmap with `Tab` / `Ctrl+Arrows` / `Enter` / type / arrows only, no mouse.
- Save/open standard `.canvas` per JSON Canvas 1.0 with lossless `parse(serialize())` round-trip.
- Installable offline PWA with full feature parity offline.

## Recommended Direction

Mindmap-native keyboard flow. One file at a time, nodes created spatially with `Tab` / `Ctrl+Left` (child to right) and `Ctrl+Up` / `Ctrl+Down` (sibling above / below), `Enter` edits selected node, inline markdown edit, arrow-key navigation, deterministic auto tree layout. Open/save `.canvas` per JSON Canvas 1.0 spec locally via Chrome File System Access API. Text + Group + Link editing in MVP (file nodes read-tolerant only). Router shell kept (TanStack Router) even for single-file v1. No outline editor in MVP. No node move-drag in MVP.

## Key Assumptions to Validate (via e2E/smoke + manual, no unit-only in MVP)

- [ ] 10-node map completable with Tab / Ctrl+Arrows / Enter / arrows only — timed no-mouse test.
- [ ] Auto-placement without move-drag is acceptable — test frustration when move disabled (resize still allowed).
- [ ] `parse(serialize())` round-trips JSON Canvas 1.0 fixtures losslessly.

## MVP Scope

In:

- Text + Group + Link nodes + edges (file nodes read-tolerant, preserved on write, no file editing UI in MVP).
- Default text node 150x150, manual resize via drag, auto-height grow on text overflow. Group resizable container with label. Link URL card with click-to-open.
- Edges right-to-left only (`fromSide: right`, `toSide: left`, `toEnd: arrow`).
- Keyboard (navigation mode): arrows move focus, `Enter` edits selected node (cursor at end), `Ctrl+Left` creates child, `Ctrl+Up` / `Ctrl+Down` creates sibling above / below, `Ctrl+Right` no-op, `Tab` creates child, `Delete`/`Backspace` requests delete (always confirms, see delete flow), `Cmd/Ctrl+Z` / `Shift+Z` undo/redo, `Cmd/Ctrl+S` save, `Cmd/Ctrl+O` open, `Cmd/Ctrl+K` actions palette.
- Keyboard (edit mode): type edits text, `Shift+Enter` newline (edit-only, no-op in navigation mode), `Esc` exits edit to navigation mode.
- Delete flow (navigation mode only): `Delete`/`Backspace` always opens confirm dialog, even for leaf nodes. If node has children, dialog offers: (a) delete subtree including all descendants, (b) reparent children as siblings of deleted node (attach to deleted node's parent at deleted node's index) then delete only current node, (c) cancel. Root node with children offers delete-subtree vs cancel only (no reparent — no parent exists). Group node delete lets the user choose: (a) delete group + contained members, (b) delete group container only and keep members (ungroup), (c) cancel. If leaf/group-empty/link node, dialog is simple confirm/cancel. Undo restores deleted subtree.
- Actions palette (`Cmd/Ctrl+K`): new file (Save picker upfront), open file, save, create child, create sibling above, create sibling below, edit selected, delete selected (same confirm flow), undo, redo, zoom in, zoom out, zoom fit, toggle shortcut cheat sheet. Every palette action shows its keyboard shortcut. No Save As or color actions in MVP.
- File: new mindmap requires Save picker location upfront; dirty dot + `beforeunload` guard; direct write-back to same handle.
- Offline PWA shell. Router shell kept.
  Out:
- Outline pane / outline-as-source (post-MVP view).
- Node move-drag tuning (post-MVP; resize-drag stays).
- Full file attachment node editing UI.
- Multi-file library/search (v1.1).
- Screen-reader support (post-MVP).
- Safari/Firefox fallback (download/IndexedDB) — post-MVP, Chrome-only for v1.
- Cloud sync, analytics, collaboration.

## Not Doing (and Why)

- Outline-as-source — doubles interaction model; post-MVP view.
- Local file library/search — permission/index cost; after single-file flow proven.
- Full file node editing — keeps parser/writer scope minimal, still spec-compliant on read.
- Non-Chrome fallbacks (download/IndexedDB) — deferred to keep solo scope; Chrome-only for MVP.
- Cloud sync/analytics — violates local-first + solo budget.
- Screen-reader support — deferred post-MVP for speed, navigation mode must not break a11y basics.

## Decisions (resolved)

- User: general brainstormers; constraints: keyboard simplicity + solo/small scope.
- Differentiator vs Miro/Excalidraw/Canvas: speed (no mouse/cloud) + open `.canvas` format + offline.
- Auto-layout must avoid overlap at 100+ nodes: child X-gap 80px (`x = parent.x + 150 + 80`), sibling Y-gap 40px (`y = prev.y + height + 40`), plus push-down collision pass for overlapping subtrees.
- MVP is Chrome-only with File System Access API: always read/write specific local file handle. Safari/Firefox fallback post-MVP.
- Node move-drag post-MVP; resize-drag in MVP with auto-height grow.
- Compliance target is JSON Canvas 1.0 spec only, not Obsidian-specific behavior.
- Two modes: navigation ↔ edit. `Enter` enters edit from navigation; `Esc` returns to navigation; `Shift+Enter` newline edit-only; creating a node auto-enters edit on the new node.
- New file forces Save location picker upfront.
- MVP edits Text + Group + Link nodes; file nodes preserved read-only.
- Router shell kept in v1 for future multi-view (outline, library).
- Delete always confirms; parented delete offers delete-subtree vs reparent-children-as-siblings vs cancel. Root with children offers delete-subtree vs cancel only. Group delete offers delete-group+members vs ungroup-keep-members vs cancel.
