Renders a collection of tags with overflow collapsing — when there are too many, the extras fold into an ellipsis tag that opens a dropdown. Built for dense metadata or filter summaries.

## When to use

Use `OverflowTags` to show a variable number of tags (selected filters, assigned labels, skills, categories) in a constrained space, gracefully collapsing the overflow instead of wrapping awkwardly or overflowing.

## Key features

- **Overflow collapsing** — once tags exceed the visible count, the rest collapse into an ellipsis tag that reveals them in a dropdown.
- **Flexible data** — `tags` is a generic `T[]`; `getTagName` / `getTagKey` map each item to label/key (defaulting to `label`/`name` and `value`/`id`).
- **Custom rendering** — `renderTag` overrides the tag, `tagProps` / `ellipsisTagProps` style the normal and ellipsis tags, `ellipsisDropdownProps` styles the overflow dropdown.
- **Colors** — `randomColors` assigns preset colors; per-tag `color` takes precedence.
- **Inherits rc-overflow** — `OverflowProps` (except `renderItem`) are forwarded, so sizing/spacing follow that library.

## Usage notes

- Provide a stable `getTagKey` so React reconciliation and the dropdown stay correct when the list changes.
- `renderTag` replaces the default tag entirely; if you only need styling, prefer `tagProps`.
- `randomColors` is best for non-semantic sets; for meaningful categories, set `color` per tag instead.
