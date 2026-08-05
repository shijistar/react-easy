Get a **validation rule builder** that constructs Ant-Design-compatible regex rules from declarative character flags. It composes an allowed-character class, optional `startsWith` constraints, and regex `flags` into a `ValidatorRule` with a human-readable, localized failure message.

## When to use

- Building custom validation rules without writing regexes by hand.
- Reusing a rule-building function across a component (memoized).
- Constructing rules with fine-grained control over allowed/special/min/max characters.

## Key features

- **Declarative flags** — compose booleans (`letter`, `number`, `chineseCharacter`, `hyphen`, `underscore`, `special`, …) into a character class.
- **startsWith support** — constrain the first character separately via `RuleRegExpFlags`.
- **Localized messages** — error messages are assembled from i18n tokens describing each allowed set.
- **antd-compatible** — the result is a `{ pattern, message, allowedOptions, startsWithOptions, flags }` rule.

## Usage notes

- At least one allowed flag must be `true`; otherwise it throws a localized error.
- `min` / `max` set length bounds; when `startsWith` is present the length limits are reduced by one for the leading char.
- The builder function is memoized and stable across renders.
- `special` takes an array of allowed special characters (e.g. `['@', '#']`).
