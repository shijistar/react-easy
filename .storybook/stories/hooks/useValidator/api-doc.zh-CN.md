## API

### 参数 —— BuilderOptions

| 名称         | 说明                         | 类型                                    |
| ------------ | ---------------------------- | --------------------------------------- |
| `allowed`    | 允许字符的规则               | `RuleRegExpFlags`                       |
| `startsWith` | 开头字符的规则               | `Omit<RuleRegExpFlags, 'min' \| 'max'>` |
| `flags`      | 正则表达式的标志（如 `'i'`） | `string`                                |

### 返回值 —— ValidatorRule

| 成员                | 说明                 | 类型                    |
| ------------------- | -------------------- | ----------------------- |
| `pattern`           | 校验正则表达式       | `RegExp`                |
| `message`           | 校验失败时的提示信息 | `string`                |
| `allowedOptions`    | 允许字符的规则设置   | `RuleRegExpFlags`       |
| `startsWithOptions` | 开头字符的规则设置   | `StartsWithRegExpFlags` |
| `flags`             | 正则表达式的标志     | `string`                |

### 类型

- RuleRegExpFlags

| Name                 | Description                                                                  | Type       |
| -------------------- | ---------------------------------------------------------------------------- | ---------- |
| `letter`             | 包含大小写拉丁字符。如果设置为true，则`lowerLetter`和`upperLetter`属性不生效 | `boolean`  |
| `lowerLetter`        | 包含小写英文字符                                                             | `boolean`  |
| `upperLetter`        | 包含大写英文字符                                                             | `boolean`  |
| `chineseCharacter`   | 包含中文字符                                                                 | `boolean`  |
| `chinesePunctuation` | 包含中文（全角）标点符号                                                     | `boolean`  |
| `number`             | 包含数字                                                                     | `boolean`  |
| `hyphen`             | 包含连字符(-)                                                                | `boolean`  |
| `underscore`         | 包含下划线(\_)                                                               | `boolean`  |
| `special`            | 包含指定的特殊字符                                                           | `string[]` |
| `min`                | 最小字符数量                                                                 | `number`   |
| `max`                | 最大字符数量                                                                 | `number`   |
