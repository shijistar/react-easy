## API

### 参数

无参数。

### 返回值

| 成员    | 说明                             | 类型                                       |
| ------- | -------------------------------- | ------------------------------------------ |
| `build` | 从 `BuilderOptions` 构建校验规则 | `(props: BuilderOptions) => ValidatorRule` |

### 类型

`BuilderOptions`：

| 名称         | 说明                         | 类型                                    |
| ------------ | ---------------------------- | --------------------------------------- |
| `allowed`    | 允许字符的规则               | `RuleRegExpFlags`                       |
| `startsWith` | 开头字符的规则               | `Omit<RuleRegExpFlags, 'min' \| 'max'>` |
| `flags`      | 正则表达式的标志（如 `'i'`） | `string`                                |

`RuleRegExpFlags`：

| 名称                 | 说明                                                                            | 类型       |
| -------------------- | ------------------------------------------------------------------------------- | ---------- |
| `letter`             | 包含大小写拉丁字符。如果设置为 true，则 `lowerLetter` 和 `upperLetter` 选项无效 | `boolean`  |
| `lowerLetter`        | 小写英文字符                                                                    | `boolean`  |
| `upperLetter`        | 大写英文字符                                                                    | `boolean`  |
| `chineseCharacter`   | 中文字符                                                                        | `boolean`  |
| `chinesePunctuation` | 中文（全角）标点符号                                                            | `boolean`  |
| `number`             | 数字                                                                            | `boolean`  |
| `hyphen`             | 连字符 `-`                                                                      | `boolean`  |
| `underscore`         | 下划线 `_`                                                                      | `boolean`  |
| `special`            | 指定的特殊字符                                                                  | `string[]` |
| `min`                | 最小字符数量                                                                    | `number`   |
| `max`                | 最大字符数量                                                                    | `number`   |

`ValidatorRule`：

| 成员                | 说明                 | 类型                    |
| ------------------- | -------------------- | ----------------------- |
| `pattern`           | 校验正则表达式       | `RegExp`                |
| `message`           | 校验失败时的提示信息 | `string`                |
| `allowedOptions`    | 允许字符的规则设置   | `RuleRegExpFlags`       |
| `startsWithOptions` | 开头字符的规则设置   | `StartsWithRegExpFlags` |
| `flags`             | 正则表达式的标志     | `string`                |
