获取一个**校验规则生成器**，根据声明式的字符标志构建与 Ant Design 兼容的正则校验规则。它将允许字符类、可选的 `startsWith` 约束以及正则 `flags` 组合成一个带可读本地化错误消息的 `ValidatorRule`。

## 适用场景

- 无需手写正则即可构建自定义校验规则。
- 在组件内复用规则构建函数（已记忆化）。
- 需要对允许/特殊/最小/最大字符做精细控制时构建规则。

## 核心特性

- **声明式标志** —— 用布尔值（`letter`、`number`、`chineseCharacter`、`hyphen`、`underscore`、`special` 等）组合字符类。
- **startsWith 支持** —— 通过 `RuleRegExpFlags` 单独约束首字符。
- **本地化消息** —— 错误消息由描述每个允许集合的 i18n token 组装。
- **antd 兼容** —— 结果是 `{ pattern, message, allowedOptions, startsWithOptions, flags }` 规则。

## 使用注意

- 至少一个允许标志必须为 `true`；否则抛出本地化错误。
- `min` / `max` 设置长度边界；当存在 `startsWith` 时，长度限制会为前导字符减一。
- 构建函数已记忆化，渲染间保持稳定。
- `special` 接收允许的特殊字符数组（如 `['@', '#']`）。
