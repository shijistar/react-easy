## API

`EllipsisText`, `EllipsisParagraph`, `EllipsisTitle`, and `EllipsisLink` are thin wrappers over the corresponding Ant Design Typography components, adding automatic ellipsis + tooltip. They accept the **same props as the underlying Ant Design typography component** plus the `ellipsis` enhancements below.

| Prop               | Description                                                                                            | Type                        | Default |
| ------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------- | ------- |
| `ellipsis`         | Enables ellipsis. `true` / `ellipsis.tooltip` / `ellipsis.tooltip.title` all turn on the auto tooltip. | `boolean \| EllipsisConfig` | `false` |
| `ellipsis.tooltip` | Show a tooltip with the full content when overflowing.                                                 | `boolean \| TooltipProps`   | -       |
| `ellipsis.rows`    | Maximum number of lines before clamping (paragraphs/titles).                                           | `number`                    | -       |
| `children`         | Text content. If omitted, `children` can be used as fallback.                                          | `ReactNode`                 | -       |
| `level`            | Title level (for `EllipsisTitle`).                                                                     | `1\|2\|3\|4\|5`             | `1`     |
| `href`             | Link target URL (for `EllipsisLink`).                                                                  | `string`                    | -       |

> Inherits all props of Ant Design `Typography.Text` / `Paragraph` / `Title` / `Link` (e.g. `style`, `className`, `strong`, `code`, `copyable`).
