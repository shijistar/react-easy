## API

### Params

No parameters.

### Return — ValidatorRuleMap

| Member              | Description                                                           | Type                              |
| ------------------- | --------------------------------------------------------------------- | --------------------------------- |
| `number`            | Number                                                                | `Validator`                       |
| `floatNumber`       | Floating point number                                                 | `Validator`                       |
| `email`             | Email address (supports Chinese names)                                | `Validator`                       |
| `ip`                | IP address                                                            | `Validator`                       |
| `cnMobile`          | Chinese mobile phone number                                           | `Validator`                       |
| `password`          | 8–16 chars, at least two of numbers/letters/symbols                   | `Validator`                       |
| `code`              | Letters, numbers, `_`; starts with a letter                           | `ValidatorRule`                   |
| `codeMax20`         | Same as `code`, up to 20 chars                                        | `ValidatorRule`                   |
| `codeMax64`         | Same as `code`, up to 64 chars                                        | `ValidatorRule`                   |
| `codeMax128`        | Same as `code`, up to 128 chars                                       | `ValidatorRule`                   |
| `codeWithMax`       | Same as `code` with custom max length                                 | `(max?: number) => ValidatorRule` |
| `name`              | Letters, Chinese chars, numbers, `-`, `_`                             | `ValidatorRule`                   |
| `nameMax20`         | Same as `name`, up to 20 chars                                        | `ValidatorRule`                   |
| `nameMax64`         | Same as `name`, up to 64 chars                                        | `ValidatorRule`                   |
| `nameMax128`        | Same as `name`, up to 128 chars                                       | `ValidatorRule`                   |
| `nameWithMax`       | Same as `name` with custom max length                                 | `(max?: number) => ValidatorRule` |
| `strongName`        | Letters, Chinese chars, numbers, `-`, `_`; starts with Chinese/letter | `ValidatorRule`                   |
| `strongNameMax64`   | Same as `strongName`, up to 64 chars                                  | `ValidatorRule`                   |
| `strongNameMax128`  | Same as `strongName`, up to 128 chars                                 | `ValidatorRule`                   |
| `strongNameWithMax` | Same as `strongName` with custom max length                           | `(max?: number) => ValidatorRule` |

### Types

`Validator = { pattern: RegExp; message: string }`

`ValidatorRule extends Validator { allowedOptions: RuleRegExpFlags; startsWithOptions?: StartsWithRegExpFlags; flags?: string }`
