## API

| Prop                  | Description                                                                          | Type                                                          | Default    |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------- |
| `open`                | Whether the drawer is open (controlled)                                              | `boolean`                                                     | -          |
| `position`            | Drawer position                                                                      | `'left' \| 'right' \| 'top' \| 'bottom'`                      | `'right'`  |
| `defaultSize`         | Default size (width for left/right, height otherwise); when unset, adapts to content | `number`                                                      | -          |
| `minSize`             | Minimum size                                                                         | `number`                                                      | `0`        |
| `maxSize`             | Maximum size                                                                         | `number`                                                      | `Infinity` |
| `edgeOffset`          | Offset from the parent edge; tune so the drawer hides fully outside the container    | `CSSProperties['width']`                                      | `0`        |
| `showToggle`          | Whether to show the toggle handle                                                    | `boolean`                                                     | `true`     |
| `resizable`           | Whether the drawer is resizable                                                      | `boolean`                                                     | `true`     |
| `destroyOnClose`      | Destroy content when closed                                                          | `boolean`                                                     | `false`    |
| `cacheKey`            | localStorage key to persist drawer size                                              | `string`                                                      | -          |
| `cardProps`           | Props for the inner `Card`                                                           | `Omit<CardProps, 'children'>`                                 | -          |
| `className` / `style` | Root class / style                                                                   | `string` / `CSSProperties`                                    | -          |
| `classNames`          | Class names for specific parts                                                       | `{ drawer; toggle; resizeHandle; handleIcon; content; card }` | -          |
| `styles`              | Styles for specific parts                                                            | `{ drawer; toggle; resizeHandle; handleIcon; content; card }` | -          |
| `onOpenChange`        | Called when open state changes                                                       | `(open: boolean) => void`                                     | -          |
| `onResize`            | Called when the drawer is resized                                                    | `(size: number) => void`                                      | -          |
| `onClick`             | Click handler for the drawer container                                               | `(e: React.MouseEvent) => void`                               | -          |
| `children`            | Drawer content                                                                       | `ReactNode`                                                   | -          |

## Notes

Size is applied as `width` for left/right and `height` for top/bottom. Use `edgeOffset` to fully hide the drawer behind the parent's padding/border.
When `cacheKey` is set, the size is stored in `localStorage` and restored on next mount.
