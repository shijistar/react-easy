## API

### Props — UseProcessingTextProps

| Name         | Description                        | Type      | (Default) |
| ------------ | ---------------------------------- | --------- | --------- |
| `enabled`    | Whether the animation is enabled   | `boolean` | `true`    |
| `prefixText` | Prefix text (e.g. "Processing")    | `string`  | `''`      |
| `dotText`    | Dot text (e.g. ".")                | `string`  | `'.'`     |
| `interval`   | Animation interval in milliseconds | `number`  | `300`     |
| `maxDots`    | Maximum number of dots             | `number`  | `3`       |

### Return

| Member | Description                     | Type     |
| ------ | ------------------------------- | -------- |
| `text` | Animated processing text string | `string` |
