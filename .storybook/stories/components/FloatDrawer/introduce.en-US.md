A draggable, resizable edge drawer that can sit on any side of its parent. Unlike a modal, it shares the parent's layout and can stay open alongside content.

## When to use

Use `FloatDrawer` for persistent side panels — filters, inspectors, tool palettes, chat/assistants — that should hug a screen edge, be resized by the user, and not block the underlying content like a modal does.

## Key features

- **Four edges** — `position` picks `left` / `right` / `top` / `bottom`; `edgeOffset` nudges it from the edge.
- **Resizable & toggle** — `resizable` lets users drag the handle; `showToggle` shows the expand/collapse button.
- **Sizing** — `defaultSize` / `minSize` / `maxSize` bound the dimension (width for side drawers, height for top/bottom).
- **Persistence** — `cacheKey` remembers the size in `localStorage`.
- **Inherits antd Card** — the surface accepts `CardProps` for header/footer/extra.

## Usage notes

- It is positioned relative to its parent, so the parent needs `position: relative` (or non-static) for correct placement.
- `destroyOnClose` controls whether inner content is unmounted when closed; keep it `false` to preserve state.
- When fully collapsed it hides outside the parent edge; if the parent has padding/border, tweak `edgeOffset` so it tucks away completely.
