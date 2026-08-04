Renders plain text with preserved line breaks by splitting with a configurable EOL marker and output tag.

## When to use

Display backend-provided text that contains `\n` (or another EOL marker) and you want it shown as multiple visual lines instead of a single wrapped paragraph. This is common for multi-line addresses, log snippets, poetry, or any string whose line structure carries meaning.

## Key features

- **Line break preservation** — splits the input by a configurable end-of-line character and renders each segment on its own line, joined by `<br />`.
- **Pluggable output tag** — when `tagName` is set, the whole content is wrapped in that HTML element (e.g. `div`, `span`, `pre`); when `tagName` is `false` (default) it renders a React fragment so it can be embedded inline.
- **Toggle at runtime** — the `enabled` prop turns conversion on/off without changing the source value.
- **Custom EOL** — `EOL` lets you split on any delimiter (e.g. `\r\n`, `|`, a custom token), not just `\n`.

## Usage notes

- When `tagName` is `false` (default), the result is a fragment with `<br />` between segments, so it can be placed inside running text without introducing an extra DOM node. `className` is ignored in this mode.
- `EOL` only affects splitting; it is not stripped from the rendered output — each segment keeps its own content.
- Long lines are still subject to the parent container's normal text wrapping; `BreakLines` does not force horizontal overflow.
