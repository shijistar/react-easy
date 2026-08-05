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

`RuleRegExpFlags`：`letter`、`lowerLetter`、`upperLetter`、`chineseCharacter`、`chinesePunctuation`、`number`、`hyphen`、`underscore`、`special: string[]`、`min: number`、`max: number`。
