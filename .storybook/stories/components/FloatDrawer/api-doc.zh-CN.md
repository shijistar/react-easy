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

## 说明

尺寸对左右为 `width`、上下为 `height`。若抽屉未完全隐藏在父容器外，可用 `edgeOffset` 调整偏移。
设置 `cacheKey` 后，抽屉尺寸会存入 `localStorage`，下次挂载时恢复。
