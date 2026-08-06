Make an element **movable by dragging**, with optional position persistence in `localStorage`. The hook tracks the element's position during `pointermove`. You can choose a free movement mode or restrict it to the visible area, keeping it in bounds on window resize. If you choose container-bound movement, make sure to add `position: relative` to the parent container.

## When to use

- Draggable floating panels, widgets, or tooltips that users can reposition.
- Elements whose position should survive page reloads.
- Custom drag interactions where you need full control over pointer events.

## Key features

- **Pointer-based drag** — pointer capture keeps drags working even when the pointer leaves the element.
- **Viewport clamping** — positions are clamped to the visible area and re-clamped on resize.
- **Selective ignore** — `ignoreSelectors` prevents drags that start on interactive controls.
- **Optional persistence** — pass `storageKey` to save/restore the position via `localStorage`.

## Sample code

```tsx
import { useRef } from 'react';
import { useMovable } from '@tiny-codes/react-easy';

export function DraggableCard() {
  const movableDomRef = useRef<HTMLDivElement>(null);
  const viewPortRef = useRef<HTMLDivElement>(null);

  const { onPointerDown } = useMovable({
    movableDomRef,
    viewPortRef,
    storageKey: 'my-card.position',
  });

  return (
    <div ref={viewPortRef} style={{ position: 'relative', height: 300 }}>
      <div
        ref={movableDomRef}
        onPointerDown={onPointerDown}
        style={{ position: 'absolute', left: 0, top: 0, cursor: 'move' }}
      >
        Drag me
      </div>
    </div>
  );
}
```

## Usage notes

- The hook does not render anything; spread `onPointerDown` on your draggable element and attach `containerRef` to the container.
- `enabled` toggles the global `pointermove`/`pointerup` listeners.
- Use `ignoreSelectors` for buttons/inputs inside the draggable area so clicks still work.
