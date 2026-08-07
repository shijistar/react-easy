A family of typography components (`Text` / `Paragraph` / `Title` / `Link`) with enhanced ellipsis and automatic tooltip. When content overflows, a tooltip shows the full text; when it fits, no tooltip appears.

## When to use

Use these components instead of plain Ant Design Typography whenever long text may overflow its container and you want a graceful "show more on hover" experience — single-line labels, multi-line paragraphs, headings, or links.

## Key features

- **Smart tooltip** — enable automatic ellipsis+tooltip in three equivalent ways: `ellipsis={true}`, `ellipsis.tooltip={true}`, or `ellipsis.tooltip.title={true}`. The tooltip only renders when text actually overflows.
- **Four variants** — `EllipsisText`, `EllipsisParagraph`, `EllipsisTitle`, `EllipsisLink` map to the corresponding Ant Design typography elements.
- **Rich ellipsis config** — supports row count (`rows`), tooltip title/content, and all of Ant Design's `ellipsis` options.
- **Drop-in** — accepts the same props as the underlying Ant Design typography component, so migration is usually a one-line swap.

## Sample code

```tsx
import { EllipsisParagraph, EllipsisText } from '@tiny-codes/react-easy';

export function Demo() {
  return (
    <>
      <EllipsisText ellipsis={{ tooltip: true }} style={{ maxWidth: 240 }}>
        A very long text that should be clamped with a tooltip…
      </EllipsisText>
      <EllipsisParagraph ellipsis={{ rows: 2, tooltip: true }}>
        Multi-line paragraph clamped to two rows.
      </EllipsisParagraph>
    </>
  );
}
```

## Usage notes

- The tooltip is suppressed automatically when content fits, so you don't need conditional logic.
- Prefer `rows` for paragraph/title multi-line clamping; single-line uses the default behavior.
- Because it forwards Ant Design typography props, styling via `style`/`className` works as expected.
