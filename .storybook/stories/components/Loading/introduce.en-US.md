Displays a loading indicator that works either as an overlay (wrapping children with a spinner) or as a standalone visual state that fills its parent.

## When to use

Use `Loading` to signal an in-progress state: wrap a region with the overlay spinner, or drop in the standalone animation as a centered placeholder while data loads.

## Key features

- **Two usage modes**
  1. **Spin** — when the component wraps `children`, it overlays Ant Design's `Spin` on top of them.
  2. **Standalone** — with no children, it renders a loader that auto-fills and centers within the parent container.
- **Inherits Spin** — extends Ant Design `SpinProps`, so `tip`, `size`, `indicator`, `spinning`, etc. all apply.
- **Standalone extras** — `mode` (`absolute` | `flex`) controls standalone positioning; `rootClassName` / `rootStyle` style the mask container.

## Usage notes

- In Spin mode the children stay in the DOM and are merely covered; in standalone mode there are no children.
- `mode` only matters for the standalone variant; `absolute` centers via absolute positioning, `flex` fills the parent.
- Because it extends `SpinProps`, most styling and behavior matches Ant Design's `Spin`.
