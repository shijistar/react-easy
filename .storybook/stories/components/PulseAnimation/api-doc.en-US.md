## API

| Prop        | Description                                                                         | Type                               | Default     |
| ----------- | ----------------------------------------------------------------------------------- | ---------------------------------- | ----------- |
| `bars`      | Number of animated bars.                                                            | `number`                           | `8`         |
| `barGap`    | Gap between bars.                                                                   | `CSSProperties['gap']`             | `4px`       |
| `barColor`  | Background color of the bars; defaults to the theme's `colorFillSecondary`.         | `CSSProperties['backgroundColor']` | theme token |
| `duration`  | Animation duration in seconds.                                                      | `number`                           | `1.6`       |
| `delayRate` | Delay offset rate; bar delay = `(index) * delayRate` for the traveling-wave effect. | `number`                           | `0.09`      |
| `barStyle`  | Extra styles applied to each bar.                                                   | `CSSProperties`                    | -           |
| `className` | Root element class name.                                                            | `string`                           | -           |
| `style`     | Root element inline style.                                                          | `CSSProperties`                    | -           |
| `prefixCls` | Custom CSS class prefix.                                                            | `string`                           | -           |

> Use the `token.AnimationPulse` theme token to globally configure `barMinSize` / `barMaxSize`.
