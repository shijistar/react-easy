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

## Usage notes

- At least one allowed flag must be `true`; otherwise it throws a localized error.
- Set `min` / `max` to bound length; with `startsWith`, length limits shrink by one for the leading char.
- `special` takes an array of allowed special characters.
