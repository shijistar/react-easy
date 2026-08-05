## API

### Params

No parameters.

### Return

| Member  | Description                                   | Type                                       |
| ------- | --------------------------------------------- | ------------------------------------------ |
| `build` | Build a validation rule from `BuilderOptions` | `(props: BuilderOptions) => ValidatorRule` |

### Types

`BuilderOptions`:

| Name         | Description                           | Type                                    |
| ------------ | ------------------------------------- | --------------------------------------- |
| `allowed`    | The rule of allowed characters        | `RuleRegExpFlags`                       |
| `startsWith` | The rule of the starting character    | `Omit<RuleRegExpFlags, 'min' \| 'max'>` |
| `flags`      | Regular expression flags (e.g. `'i'`) | `string`                                |

`RuleRegExpFlags`:

| Name                 | Description                              | Type       |
| -------------------- | ---------------------------------------- | ---------- |
| `letter`             | Lowercase and uppercase Latin characters | `boolean`  |
| `lowerLetter`        | Lowercase English letters                | `boolean`  |
| `upperLetter`        | Uppercase English letters                | `boolean`  |
| `chineseCharacter`   | Chinese characters                       | `boolean`  |
| `chinesePunctuation` | Chinese (full-width) punctuation         | `boolean`  |
| `number`             | Numbers                                  | `boolean`  |
| `hyphen`             | Hyphen `-`                               | `boolean`  |
| `underscore`         | Underscore `_`                           | `boolean`  |
| `special`            | Specific special characters              | `string[]` |
| `min`                | Minimum number of characters             | `number`   |
| `max`                | Maximum number of characters             | `number`   |

`ValidatorRule`:

| Member              | Description                | Type                    |
| ------------------- | -------------------------- | ----------------------- |
| `pattern`           | The regex for verification | `RegExp`                |
| `message`           | Failure message            | `string`                |
| `allowedOptions`    | Allowed characters options | `RuleRegExpFlags`       |
| `startsWithOptions` | Starting character options | `StartsWithRegExpFlags` |
| `flags`             | Regular expression flags   | `string`                |
