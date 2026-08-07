## API

### 参数

无参数。

### 返回值 —— ValidatorRuleMap

| 成员                | 说明                                         | 类型                              |
| ------------------- | -------------------------------------------- | --------------------------------- |
| `number`            | 数字                                         | `Validator`                       |
| `floatNumber`       | 浮点数                                       | `Validator`                       |
| `email`             | 邮箱正则表达式（支持中文名称）               | `Validator`                       |
| `ip`                | IP 地址正则表达式                            | `Validator`                       |
| `cnMobile`          | 中国手机号正则表达式                         | `Validator`                       |
| `password`          | 8–16 位，数字、字母、符号至少包含两种        | `Validator`                       |
| `code`              | 字母、数字、`_`；以字母开头                  | `ValidatorRule`                   |
| `codeMax20`         | 同 `code`，最多 20 字符                      | `ValidatorRule`                   |
| `codeMax64`         | 同 `code`，最多 64 字符                      | `ValidatorRule`                   |
| `codeMax128`        | 同 `code`，最多 128 字符                     | `ValidatorRule`                   |
| `codeWithMax`       | 同 `code`，可自定义最大字符数                | `(max?: number) => ValidatorRule` |
| `name`              | 字母、汉字、数字、`-`、`_`                   | `ValidatorRule`                   |
| `nameMax20`         | 同 `name`，最多 20 字符                      | `ValidatorRule`                   |
| `nameMax64`         | 同 `name`，最多 64 字符                      | `ValidatorRule`                   |
| `nameMax128`        | 同 `name`，最多 128 字符                     | `ValidatorRule`                   |
| `nameWithMax`       | 同 `name`，可自定义最大字符数                | `(max?: number) => ValidatorRule` |
| `strongName`        | 字母、汉字、数字、`-`、`_`；以汉字或字母开头 | `ValidatorRule`                   |
| `strongNameMax64`   | 同 `strongName`，最多 64 字符                | `ValidatorRule`                   |
| `strongNameMax128`  | 同 `strongName`，最多 128 字符               | `ValidatorRule`                   |
| `strongNameWithMax` | 同 `strongName`，可自定义最大字符数          | `(max?: number) => ValidatorRule` |

### 类型

`Validator = { pattern: RegExp; message: string }`

`ValidatorRule extends Validator { allowedOptions: RuleRegExpFlags; startsWithOptions?: StartsWithRegExpFlags; flags?: string }`
