## API

| Prop                  | Type                                                          | Default    | Description                                                                          |
| --------------------- | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `open`                | `boolean`                                                     | -          | Whether the drawer is open (controlled)                                              |
| `position`            | `'left' \| 'right' \| 'top' \| 'bottom'`                      | `'right'`  | Drawer position                                                                      |
| `defaultSize`         | `number`                                                      | -          | Default size (width for left/right, height otherwise); when unset, adapts to content |
| `minSize`             | `number`                                                      | `0`        | Minimum size                                                                         |
| `maxSize`             | `number`                                                      | `Infinity` | Maximum size                                                                         |
| `edgeOffset`          | `CSSProperties['width']`                                      | `0`        | Offset from the parent edge; tune so the drawer hides fully outside the container    |
| `showToggle`          | `boolean`                                                     | `true`     | Whether to show the toggle handle                                                    |
| `resizable`           | `boolean`                                                     | `true`     | Whether the drawer is resizable                                                      |
| `destroyOnClose`      | `boolean`                                                     | `false`    | Destroy content when closed                                                          |
| `cacheKey`            | `string`                                                      | -          | localStorage key to persist drawer size                                              |
| `cardProps`           | `Omit<CardProps, 'children'>`                                 | -          | Props for the inner `Card`                                                           |
| `className` / `style` | `string` / `CSSProperties`                                    | -          | Root class / style                                                                   |
| `classNames`          | `{ drawer; toggle; resizeHandle; handleIcon; content; card }` | -          | Class names for specific parts                                                       |
| `styles`              | `{ drawer; toggle; resizeHandle; handleIcon; content; card }` | -          | Styles for specific parts                                                            |
| `onOpenChange`        | `(open: boolean) => void`                                     | -          | Called when open state changes                                                       |
| `onResize`            | `(size: number) => void`                                      | -          | Called when the drawer is resized                                                    |
| `onClick`             | `(e: React.MouseEvent) => void`                               | -          | Click handler for the drawer container                                               |
| `children`            | `ReactNode`                                                   | -          | Drawer content                                                                       |

## Notes

Size is applied as `width` for left/right and `height` for top/bottom. Use `edgeOffset` to fully hide the drawer behind the parent's padding/border.
When `cacheKey` is set, the size is stored in `localStorage` and restored on next mount.
