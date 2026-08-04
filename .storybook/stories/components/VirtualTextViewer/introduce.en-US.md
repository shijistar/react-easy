A virtualized plain-text viewer for very large documents. It measures text with a canvas-based layout engine (Pretext) and only renders the visible lines, so it stays smooth at hundreds of thousands of lines.

## When to use

Use `VirtualTextViewer` to display huge read-only text — logs, source files, SQL dumps, generated artifacts — where rendering the whole string with a normal element would freeze the browser.

## Key features

- **Canvas layout** — uses Pretext to compute line wrapping with a real font metric, so projection matches what a browser would paint.
- **Windowing** — only visible lines plus an `overscan` buffer are mounted; scrolling is O(1) in DOM nodes.
- **Typography control** — `lineHeight`, `font`, `letterSpacing`, `tabSize`, `wordBreak` tune the rendering and stay in sync with the canvas metric.
- **Per-row styling** — `lineClassName` / `lineStyle` / `contentClassName` / `contentStyle` let you theme the surface and individual rows.

## Usage notes

- Keep `font` in sync with the actual CSS font; a mismatch makes the canvas metric diverge from the painted text.
- `value` of `null`/`undefined` shows the `empty` placeholder instead of crashing.
- For best performance, fix `height` (viewport) and `lineHeight`; avoid changing `font` on every render.
