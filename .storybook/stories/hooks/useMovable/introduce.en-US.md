Make an element **movable by dragging**, with optional position persistence in `localStorage`. The hook tracks the element's position during `pointermove`, clamps it to the visible area, and keeps it in bounds on window resize.

## When to use

- Draggable floating panels, widgets, or tooltips that users can reposition.
- Elements whose position should survive page reloads.
- Custom drag interactions where you need full control over pointer events.

## Key features

- **Pointer-based drag** — pointer capture keeps drags working even when the pointer leaves the element.
- **Viewport clamping** — positions are clamped to the visible area and re-clamped on resize.
- **Selective ignore** — `ignoreSelectors` prevents drags that start on interactive controls.
- **Optional persistence** — pass `storageKey` to save/restore the position via `localStorage`.

## Usage notes

- The hook does not render anything; spread `onPointerDown` on your draggable element and attach `containerRef` to the container.
- `enabled` toggles the global `pointermove`/`pointerup` listeners.
- Use `ignoreSelectors` for buttons/inputs inside the draggable area so clicks still work.
