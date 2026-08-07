## API

### 参数 —— UseProcessingTextProps

| 参数         | 说明                      | 类型      | 默认值 |
| ------------ | ------------------------- | --------- | ------ |
| `enabled`    | 是否启用动画              | `boolean` | `true` |
| `prefixText` | 前缀文本（例如 "处理中"） | `string`  | `''`   |
| `dotText`    | 点文本（例如 "."）        | `string`  | `'.'`  |
| `interval`   | 动画间隔（毫秒）          | `number`  | `300`  |
| `maxDots`    | 最大点数                  | `number`  | `3`    |

### 返回值

| 成员   | 说明             | 类型     |
| ------ | ---------------- | -------- |
| `text` | 处理中的动画文本 | `string` |
