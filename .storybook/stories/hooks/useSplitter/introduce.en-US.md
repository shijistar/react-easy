Make any two-pane layout resizable with a draggable splitter. The hook renders a splitter `dom` element for you, tracks the live ratio, and supports vertical/horizontal directions with configurable min/max boundaries. It integrates with the library's CSS variables and prefix class system.

## When to use

- Left/right or top/bottom resizable panes (file explorers, code editors, dashboards).
- Any layout where the user should be able to adjust the proportion of two areas.
- When you want the splitter visuals to follow the library's theme tokens and `prefixCls` convention.

## Key features

- **Render-ready** — returns a `dom` splitter element; just place it between your panes.
- **Controlled bounds** — `minRatio` / `maxRatio` clamp the draggable range; `defaultRatio` sets the initial split.
- **Bidirectional** — `vertical` (left/right) or `horizontal` (top/bottom) layouts.
- **Live feedback** — `percent`, `width`, and `dragging` are exposed for custom UI.
- **Theme-aware** — uses `ConfigProvider` prefix and CSS variables; hover/dragging/handle class hooks available.

## Usage notes

- The splitter resolves its container automatically from the `dom`'s parent element, or use the `container` prop explicitly.
- `maxRatio` defaults to `1 - minRatio` when not provided.
- Drag listeners are attached to `window` during drag, so the splitter keeps working when the pointer leaves the container.
- The ratio passed to `onChange` is the left/top pane's share of the container (0~1).
