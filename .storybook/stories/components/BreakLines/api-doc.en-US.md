## API

| Prop        | Description                                                                                | Type                                                        | Default |
| ----------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------- |
| `value`     | Text content to render                                                                     | `string \| undefined`                                       | -       |
| `enabled`   | Whether line-break conversion is enabled                                                   | `boolean`                                                   | `true`  |
| `EOL`       | The end-of-line character used to split lines                                              | `string`                                                    | `'\n'`  |
| `tagName`   | HTML tag used to render the content. When `false`, content is rendered as a React fragment | `false \| 'span' \| 'div' \| 'i' \| 'pre' \| (string & {})` | `false` |
| `className` | CSS class of the DOM node. Ignored when `tagName` is `false`                               | `string`                                                    | -       |

## Notes

When `tagName` is `false` (default), the content is returned as a fragment with `<br/>` between segments, so it can be embedded inline.
