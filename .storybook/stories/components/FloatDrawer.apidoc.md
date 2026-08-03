# FloatDrawer

- **EN:** FloatDrawer is a draggable, resizable drawer that can sit at any edge of a parent container, with a toggle handle and optional size persistence.
- **CN:** FloatDrawer 是一个可拖动、可调整大小的浮动抽屉，可停靠在父容器的任意边缘，带展开/收起手柄，并可选记忆宽度。

## When to use | 适用场景

- **EN:** You want a side panel that overlays part of a container (not a full-screen modal), can be collapsed, resized by dragging, and optionally remembers its size.
- **CN:** 你需要一个覆盖在容器局部的侧边面板（而非全屏弹窗），可收起、可通过拖拽调整大小，并可选择性记忆尺寸。

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Whether the drawer is open (controlled) |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Drawer position |
| `defaultSize` | `number` | - | Default size (width for left/right, height otherwise); when unset, adapts to content |
| `minSize` | `number` | `0` | Minimum size |
| `maxSize` | `number` | `Infinity` | Maximum size |
| `edgeOffset` | `CSSProperties['width']` | `0` | Offset from the parent edge; tune so the drawer hides fully outside the container |
| `showToggle` | `boolean` | `true` | Whether to show the toggle handle |
| `resizable` | `boolean` | `true` | Whether the drawer is resizable |
| `destroyOnClose` | `boolean` | `false` | Destroy content when closed |
| `cacheKey` | `string` | - | localStorage key to persist drawer size |
| `cardProps` | `Omit<CardProps, 'children'>` | - | Props for the inner `Card` |
| `className` / `style` | `string` / `CSSProperties` | - | Root class / style |
| `classNames` | `{ drawer; toggle; resizeHandle; handleIcon; content; card }` | - | Class names for specific parts |
| `styles` | `{ drawer; toggle; resizeHandle; handleIcon; content; card }` | - | Styles for specific parts |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open state changes |
| `onResize` | `(size: number) => void` | - | Called when the drawer is resized |
| `onClick` | `(e: React.MouseEvent) => void` | - | Click handler for the drawer container |
| `children` | `ReactNode` | - | Drawer content |

## Notes | 说明

- **EN:** Size is applied as `width` for left/right and `height` for top/bottom. Use `edgeOffset` to fully hide the drawer behind the parent's padding/border.
- **CN:** 尺寸对左右为 `width`、上下为 `height`。若抽屉未完全隐藏在父容器外，可用 `edgeOffset` 调整偏移。
- **EN:** When `cacheKey` is set, the size is stored in `localStorage` and restored on next mount.
- **CN:** 设置 `cacheKey` 后，抽屉尺寸会存入 `localStorage`，下次挂载时恢复。
