## API

### Props — BuilderOptions

| Name         | Description                           | Type                                    |
| ------------ | ------------------------------------- | --------------------------------------- |
| `allowed`    | The rule of allowed characters        | `RuleRegExpFlags`                       |
| `startsWith` | The rule of the starting character    | `Omit<RuleRegExpFlags, 'min' \| 'max'>` |
| `flags`      | Regular expression flags (e.g. `'i'`) | `string`                                |

### Return — ValidatorRule

| Member              | Description                | Type                    |
| ------------------- | -------------------------- | ----------------------- |
| `pattern`           | The regex for verification | `RegExp`                |
| `message`           | Failure message            | `string`                |
| `allowedOptions`    | Allowed characters options | `RuleRegExpFlags`       |
| `startsWithOptions` | Starting character options | `StartsWithRegExpFlags` |
| `flags`             | Regular expression flags   | `string`                |

### Types

`RuleRegExpFlags`: `letter`, `lowerLetter`, `upperLetter`, `chineseCharacter`, `chinesePunctuation`, `number`, `hyphen`, `underscore`, `special: string[]`, `min: number`, `max: number`.
