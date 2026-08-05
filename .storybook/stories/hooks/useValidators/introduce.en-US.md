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

## Usage notes

- The map is memoized; all rules are stable across renders.
- `password` requires 8–16 characters with at least two of numbers, letters, and symbols.
- `cnMobile` only covers Chinese mobile numbers; use `useValidator` for other formats.
- `code` rules allow letters, numbers, and `_`, starting with a letter.
