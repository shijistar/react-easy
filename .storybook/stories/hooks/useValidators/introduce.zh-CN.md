获取常见数据格式的**内置校验规则**映射。规则与 Ant Design 表单规则兼容（`{ pattern, message }`），可直接传给 `Form.Item` 的 `rules`。

## 适用场景

- 校验常见输入：数字、邮箱、IP、中国手机号、密码、编码与名称。
- 快速构建表单，无需手写正则。
- 将预设规则与 `useValidator` 自定义规则组合使用。

## 核心特性

- **开箱即用** —— 每条规则都是 antd 兼容的 `{ pattern, message }` 对象。
- **常见格式** —— `number`、`floatNumber`、`email`、`ip`、`cnMobile`、`password`，以及 `code` / `name` / `strongName` 系列。
- **长度变体** —— `codeMax20/64/128`、`nameMax20/64/128` 预设；`*WithMax` 函数支持自定义长度。
- **i18n 消息** —— 校验失败提示通过库的翻译系统本地化。

## 示例代码

```tsx
import { useValidators } from '@tiny-codes/react-easy';
import { Form, Input } from 'antd';

export function Demo() {
  const { email, cnMobile, password } = useValidators();

  return (
    <Form>
      <Form.Item name="email" label="邮箱" rules={[{ validator: email }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="手机号" rules={[{ validator: cnMobile }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="密码" rules={[{ validator: password }]}>
        <Input.Password />
      </Form.Item>
    </Form>
  );
}
```

## 使用注意

- 映射经过记忆化，所有规则在渲染间保持稳定。
- `password` 要求 8–16 位，且数字、字母、符号至少包含两种。
- `cnMobile` 仅覆盖中国手机号；其他格式请使用 `useValidator` 自定义。
- `code` 系列规则允许字母、数字与 `_`，且以字母开头。
