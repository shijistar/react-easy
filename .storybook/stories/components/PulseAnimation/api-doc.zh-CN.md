## API

| 属性        | 说明                                                                 | 类型                               | 默认值     |
| ----------- | -------------------------------------------------------------------- | ---------------------------------- | ---------- |
| `bars`      | 动画柱条数量。                                                       | `number`                           | `8`        |
| `barGap`    | 柱条之间的间距。                                                     | `CSSProperties['gap']`             | `4px`      |
| `barColor`  | 柱条背景色，默认主题的 `colorFillSecondary`。                        | `CSSProperties['backgroundColor']` | 主题 token |
| `duration`  | 动画时长，单位为秒。                                                 | `number`                           | `1.6`      |
| `delayRate` | 延迟百分比系数；柱条延迟 = `(index) * delayRate`，形成行进波形效果。 | `number`                           | `0.09`     |
| `barStyle`  | 应用于每根柱条的额外样式。                                           | `CSSProperties`                    | -          |
| `className` | 根元素类名。                                                         | `string`                           | -          |
| `style`     | 根元素内联样式。                                                     | `CSSProperties`                    | -          |
| `prefixCls` | 自定义 CSS 类前缀。                                                  | `string`                           | -          |

> 通过 `token.AnimationPulse` 主题 token 可全局配置 `barMinSize` / `barMaxSize`。
