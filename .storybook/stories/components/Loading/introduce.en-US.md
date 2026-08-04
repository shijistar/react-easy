Displays a loading indicator that can work as an overlay (wrapping children) or as a standalone visual state that fills and centers within its parent.

## When to use

Show a spinner over existing content, or render a standalone centered loading placeholder inside a relatively-positioned container.

## Two usage modes

1. **Spin (overlay)** — pass `children`; the component wraps them with Ant Design `Spin` and toggles the animation via `spinning`.
2. **Standalone** — no children; renders a self-filled, centered loading animation. Hidden automatically when `spinning` is `false`.
