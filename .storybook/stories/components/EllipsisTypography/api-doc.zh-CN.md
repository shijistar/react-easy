## API

`EllipsisText`、`EllipsisParagraph`、`EllipsisTitle`、`EllipsisLink` 分别是对应 Ant Design Typography 组件的轻量封装，额外提供自动省略号 + tooltip。它们**接受底层 Ant Design 排版组件的相同 props**，并补充以下 `ellipsis` 增强。

| 属性               | 说明                                                                                      | 类型                        | 默认值  |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------------- | ------- |
| `ellipsis`         | 开启省略号。`true` / `ellipsis.tooltip` / `ellipsis.tooltip.title` 均可开启自动 tooltip。 | `boolean \| EllipsisConfig` | `false` |
| `ellipsis.tooltip` | 溢出时以 tooltip 展示完整内容。                                                           | `boolean \| TooltipProps`   | -       |
| `ellipsis.rows`    | 截断前的最大行数（段落/标题）。                                                           | `number`                    | -       |
| `children`         | 文本内容。若省略，`children` 可作为兜底。                                                 | `ReactNode`                 | -       |
| `level`            | 标题级别（用于 `EllipsisTitle`）。                                                        | `1\|2\|3\|4\|5`             | `1`     |
| `href`             | 链接跳转地址（用于 `EllipsisLink`）。                                                     | `string`                    | -       |

> 继承 Ant Design `Typography.Text` / `Paragraph` / `Title` / `Link` 的全部 props（如 `style`、`className`、`strong`、`code`、`copyable`）。
