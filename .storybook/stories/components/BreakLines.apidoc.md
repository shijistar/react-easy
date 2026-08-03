# BreakLines

- **EN:** Renders plain text with preserved line breaks by splitting with a configurable EOL marker and output tag.
- **CN:** 按指定换行符拆分文本并保留换行展示，可自定义输出标签。

## When to use | 适用场景

- **EN:** Display backend-provided text that contains `\n` (or another EOL marker) and you want it shown as multiple visual lines instead of a single wrapped paragraph.
- **CN:** 展示后端返回、包含 `\n`（或其它换行符）的文本，希望按原换行分段显示，而不是被当作一整段自动折行。

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| undefined` | - | Text content to render |
| `enabled` | `boolean` | `true` | Whether line-break conversion is enabled |
| `EOL` | `string` | `'\n'` | The end-of-line character used to split lines |
| `tagName` | `false \| 'span' \| 'div' \| 'i' \| 'pre' \| (string & {})` | `false` | HTML tag used to render the content. When `false`, content is rendered as a React fragment |
| `className` | `string` | - | CSS class of the DOM node. Ignored when `tagName` is `false` |

## Notes | 说明

- **EN:** When `tagName` is `false` (default), the content is returned as a fragment with `<br/>` between segments, so it can be embedded inline.
- **CN:** `tagName` 为 `false`（默认）时，内容以 React fragment 返回，段间用 `<br/>`，可内联嵌入其它文本中。
