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

- RuleRegExpFlags

| Name                 | Description                                                                                                                | Type       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `letter`             | Include lowercase and uppercase Latin characters. If set to true, `lowerLetter` and `upperLetter` option are not effective | `boolean`  |
| `lowerLetter`        | Include lowercase English letters                                                                                          | `boolean`  |
| `upperLetter`        | Include uppercase English letters                                                                                          | `boolean`  |
| `chineseCharacter`   | Include Chinese characters                                                                                                 | `boolean`  |
| `chinesePunctuation` | Include Chinese (full-width) punctuation                                                                                   | `boolean`  |
| `number`             | Include numbers                                                                                                            | `boolean`  |
| `hyphen`             | Include hyphens (-)                                                                                                        | `boolean`  |
| `underscore`         | Include underscores (\_)                                                                                                   | `boolean`  |
| `special`            | Include specified special characters                                                                                       | `string[]` |
| `min`                | Minimum number of characters                                                                                               | `number`   |
| `max`                | Maximum number of characters                                                                                               | `number`   |
