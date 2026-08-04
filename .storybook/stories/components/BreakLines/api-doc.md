## API

| Prop        | Type                                                        | Default | Description                                                                                |
| ----------- | ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `value`     | `string \| undefined`                                       | -       | Text content to render                                                                     |
| `enabled`   | `boolean`                                                   | `true`  | Whether line-break conversion is enabled                                                   |
| `EOL`       | `string`                                                    | `'\n'`  | The end-of-line character used to split lines                                              |
| `tagName`   | `false \| 'span' \| 'div' \| 'i' \| 'pre' \| (string & {})` | `false` | HTML tag used to render the content. When `false`, content is rendered as a React fragment |
| `className` | `string`                                                    | -       | CSS class of the DOM node. Ignored when `tagName` is `false`                               |

## Notes | 说明

- **EN:** When `tagName` is `false` (default), the content is returned as a fragment with `<br/>` between segments, so it can be embedded inline.
- **CN:** `tagName` 为 `false`（默认）时，内容以 React fragment 返回，段间用 `<br/>`，可内联嵌入其它文本中。
