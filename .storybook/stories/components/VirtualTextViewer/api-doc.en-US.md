## API

`VirtualTextViewerProps` extends `Omit<HTMLAttributes<HTMLDivElement>, 'children'>`, so all standard div attributes (except `children`) apply. Key props are listed below.

| Prop                                | Description                                                                       | Type                       | Default          |
| ----------------------------------- | --------------------------------------------------------------------------------- | -------------------------- | ---------------- |
| `value`                             | Large plain-text content to render.                                               | `string \| null`           | -                |
| `height`                            | Height of the scroll viewport.                                                    | `CSSProperties['height']`  | `'100%'`         |
| `lineHeight`                        | Fixed line height used by both Pretext layout and row projection.                 | `number`                   | `22`             |
| `overscan`                          | Extra rows rendered before and after the viewport.                                | `number`                   | `8`              |
| `font`                              | Canvas font shorthand passed to Pretext; keep in sync with the rendered CSS font. | `string`                   | monospace preset |
| `letterSpacing`                     | Letter spacing in CSS pixels, forwarded to Pretext and CSS.                       | `number`                   | `0`              |
| `wordBreak`                         | Word-break mode forwarded to Pretext.                                             | `WordBreakMode`            | `'normal'`       |
| `tabSize`                           | CSS tab-size for preserved tab characters.                                        | `number`                   | `8`              |
| `empty`                             | Content shown when the input is empty.                                            | `ReactNode`                | -                |
| `contentClassName` / `contentStyle` | Class / style for the absolute content canvas.                                    | `string` / `CSSProperties` | -                |
| `lineClassName` / `lineStyle`       | Class / style for each projected row.                                             | `string` / `CSSProperties` | -                |
