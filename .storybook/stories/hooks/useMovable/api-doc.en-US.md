## API

### Props — UseMovableProps

| Name              | Description                                                                        | Type                               | (Default) |
| ----------------- | ---------------------------------------------------------------------------------- | ---------------------------------- | --------- |
| `enabled`         | Whether dragging is enabled                                                        | `boolean`                          | `true`    |
| `containerRef`    | Ref of the container element                                                       | `RefObject<HTMLElement>`           | -         |
| `viewPortRef`     | Ref of the viewport element (only used when `inContainer` is `true`)               | `RefObject<HTMLElement>`           | -         |
| `ignoreSelectors` | Selectors of elements that should not trigger dragging (e.g. interactive controls) | `string[]`                         | -         |
| `storageKey`      | Key for storing position in `localStorage`; omit to disable persistence            | `string`                           | -         |
| `onMove`          | Callback function triggered during dragging, receives the current position         | `(position: MovePosition) => void` | -         |

### Types

`MovePosition = { left: number; top: number }`
