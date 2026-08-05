## API

### Props — UseMovableProps

| Name              | Description                                                                        | Type                     | (Default) |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------ | --------- |
| `enabled`         | Whether dragging is enabled                                                        | `boolean`                | `true`    |
| `containerRef`    | Ref of the container element                                                       | `RefObject<HTMLElement>` | -         |
| `ignoreSelectors` | Selectors of elements that should not trigger dragging (e.g. interactive controls) | `string[]`               | -         |
| `storageKey`      | Key for storing position in `localStorage`; omit to disable persistence            | `string`                 | -         |

### Return

| Member          | Description                                             | Signature                                         |
| --------------- | ------------------------------------------------------- | ------------------------------------------------- |
| `onPointerDown` | Pointer down handler; spread onto the draggable element | `(e: React.PointerEvent<HTMLDivElement>) => void` |
| `position`      | Current position `{ left, top }` in pixels              | `MovePosition \| undefined`                       |

### Types

`MovePosition = { left: number; top: number }`
