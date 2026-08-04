## API

`VirtualTextViewerProps` 扩展自 `Omit<HTMLAttributes<HTMLDivElement>, 'children'>`，因此除 `children` 外的所有标准 div 属性均可用。主要属性如下。

| 属性                                | 说明                                                             | 类型                       | 默认值     |
| ----------------------------------- | ---------------------------------------------------------------- | -------------------------- | ---------- |
| `value`                             | 要渲染的超大纯文本内容。                                         | `string \| null`           | -          |
| `height`                            | 滚动视口的高度。                                                 | `CSSProperties['height']`  | `'100%'`   |
| `lineHeight`                        | 同时用于 Pretext 布局与行投影的固定行高。                        | `number`                   | `22`       |
| `overscan`                          | 视口前后额外渲染的缓冲行数。                                     | `number`                   | `8`        |
| `font`                              | 传给 Pretext 的 Canvas font 简写，需与实际渲染的 CSS font 一致。 | `string`                   | 等宽预设   |
| `letterSpacing`                     | 字间距（CSS 像素），同时传给 Pretext 与 CSS。                    | `number`                   | `0`        |
| `wordBreak`                         | 透传给 Pretext 的断词模式。                                      | `WordBreakMode`            | `'normal'` |
| `tabSize`                           | 用于渲染保留制表符的 CSS tab-size。                              | `number`                   | `8`        |
| `empty`                             | 输入为空时显示的内容。                                           | `ReactNode`                | -          |
| `contentClassName` / `contentStyle` | 绝对定位内容画布的类名 / 样式。                                  | `string` / `CSSProperties` | -          |
| `lineClassName` / `lineStyle`       | 每一条投影行的类名 / 样式。                                      | `string` / `CSSProperties` | -          |
