## API

### Functions

| Function | Description                                                                           | Signature                                                        |
| -------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `random` | Generate a random decimal in `[0, 1)`, or an inclusive random integer in `[min, max]` | `random(): number`<br>`random(min: number, max: number): number` |

### random() — no arguments

| Name | Description   | Type | (Default) |
| ---- | ------------- | ---- | --------- |
| -    | No parameters | -    | -         |

**Note**: The no-argument `random()` is a secure replacement for `Math.random()`. `Math.random()` is not a cryptographically secure random number generator (CSPRNG), and static code scanners report it as a security warning; switching to `random()` keeps the `[0, 1)` return semantics while clearing those warnings.

### random(min, max)

| Name  | Description                                             | Type     | (Default) |
| ----- | ------------------------------------------------------- | -------- | --------- |
| `min` | The minimum value (inclusive); must be a finite integer | `number` | -         |
| `max` | The maximum value (inclusive); must be a finite integer | `number` | -         |

### Return

| Member   | Description                                                                                         | Signature |
| -------- | --------------------------------------------------------------------------------------------------- | --------- |
| (result) | Decimal in `[0, 1)` for `random()`; integer in `[min, max]` (both inclusive) for `random(min, max)` | `number`  |
