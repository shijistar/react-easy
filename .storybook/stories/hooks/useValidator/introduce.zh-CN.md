根据声明式的字符标志，一次性构建**单个与 Ant Design 兼容的校验规则**。与返回可复用构建函数的 `useValidatorBuilder` 不同，`useValidator` 直接返回给定 `BuilderOptions` 的最终 `ValidatorRule` 对象。

## 适用场景

- 为特定的允许字符集合与最大长度创建一次性规则。
- 通过 `{ pattern, message }` 在 antd `Form.Item` 的 `rules` 中直接校验输入。
- 只需要一条规则、无需长期保留构建函数时。

## 核心特性

- **声明式标志** —— 用布尔值（`letter`、`number`、`chineseCharacter`、`hyphen`、`underscore`、`special` 等）组合字符类。
- **记忆化** —— 仅在相关选项变化时重新计算规则。
- **本地化消息** —— 校验失败提示由 i18n token 组装。
- **antd 兼容** —— 返回 `{ pattern, message, allowedOptions, startsWithOptions, flags }`。

## 使用注意

- 至少一个允许标志必须为 `true`；否则抛出本地化错误。
- 用 `min` / `max` 限制长度；存在 `startsWith` 时长度限制为前导字符减一。
- `special` 接收允许的特殊字符数组。
