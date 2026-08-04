# Loading

- **EN:** Displays a loading indicator that can work as an overlay (wrapping children) or as a standalone visual state that fills and centers within its parent.
- **CN:** 用于展示加载状态，可作为覆盖层（包裹 children），也可单独作为视觉占位：自动撑满父容器并居中显示。

## When to use | 适用场景

- **EN:** Show a spinner over existing content, or render a standalone centered loading placeholder inside a relatively-positioned container.
- **CN:** 在已有内容上叠加 spinner，或在相对定位的容器内渲染一个独立、居中、撑满的加载占位。

## Two usage modes | 两种用法

1. **Spin (overlay)** — pass `children`; the component wraps them with Ant Design `Spin` and toggles the animation via `spinning`.
2. **Standalone** — no children; renders a self-filled, centered loading animation. Hidden automatically when `spinning` is `false`.
