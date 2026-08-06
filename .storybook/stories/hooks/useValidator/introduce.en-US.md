Build a single **Ant-Design-compatible validation rule** once, from declarative character flags. Unlike `useValidatorBuilder` (which returns a reusable builder function), `useValidator` returns the final `ValidatorRule` object directly for the given `BuilderOptions`.

## When to use

- Creating a one-off rule with a specific allowed-character set and max length.
- Validating an input directly via `{ pattern, message }` in antd `Form.Item` rules.
- When you only need one rule and don't want to keep a builder function around.

## Key features

- **Declarative flags** — compose booleans (`letter`, `number`, `chineseCharacter`, `hyphen`, `underscore`, `special`, …) into a character class.
- **Memoized** — the rule is recomputed only when the relevant options change.
- **Localized messages** — failure message is assembled from i18n tokens.
- **antd-compatible** — returns `{ pattern, message, allowedOptions, startsWithOptions, flags }`.

## Sample code

```tsx
import { type RuleRegExpFlags, useValidator } from '@tiny-codes/react-easy';
import { Form, Input } from 'antd';

export function Demo() {
  const allowed: RuleRegExpFlags = {
    letter: true,
    number: true,
    underscore: true,
    min: 6,
    max: 20,
  };

  const rule = useValidator({ allowed });

  return (
    <Form>
      <Form.Item name="username" label="Username" rules={[rule]}>
        <Input />
      </Form.Item>
    </Form>
  );
}
```

## Usage notes

- At least one allowed flag must be `true`; otherwise it throws a localized error.
- Set `min` / `max` to bound length; with `startsWith`, length limits shrink by one for the leading char.
- `special` takes an array of allowed special characters.
