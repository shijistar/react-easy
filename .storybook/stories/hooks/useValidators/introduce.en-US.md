Get a map of **built-in validation rules** for common data formats. The rules are compatible with Ant Design form rules (`{ pattern, message }`), so they can be passed directly to `Form.Item` rules.

## When to use

- Validating common inputs: numbers, emails, IPs, Chinese mobile numbers, passwords, codes, and names.
- Building forms quickly without writing regexes by hand.
- Combining preset rules with custom `useValidator` rules for special cases.

## Key features

- **Ready to use** — each rule is an antd-compatible `{ pattern, message }` object.
- **Common formats** — `number`, `floatNumber`, `email`, `ip`, `cnMobile`, `password`, plus `code` / `name` / `strongName` families.
- **Length variants** — `codeMax20/64/128` and `nameMax20/64/128` presets; `*WithMax` functions for custom limits.
- **i18n messages** — failure messages are localized through the library's translation system.

## Sample code

```tsx
import { useValidators } from '@tiny-codes/react-easy';
import { Form, Input } from 'antd';

export function Demo() {
  const { email, cnMobile, password } = useValidators();

  return (
    <Form>
      <Form.Item name="email" label="Email" rules={[{ validator: email }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Phone" rules={[{ validator: cnMobile }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ validator: password }]}>
        <Input.Password />
      </Form.Item>
    </Form>
  );
}
```

## Usage notes

- The map is memoized; all rules are stable across renders.
- `password` requires 8–16 characters with at least two of numbers, letters, and symbols.
- `cnMobile` only covers Chinese mobile numbers; use `useValidator` for other formats.
- `code` rules allow letters, numbers, and `_`, starting with a letter.
