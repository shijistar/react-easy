## API

### Functions

| Function | Description                                                                           | Signature                                                        |
| -------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `random` | Generate a random decimal in `[0, 1)`, or an inclusive random integer in `[min, max]` | `random(): number`<br>`random(min: number, max: number): number` |

### random() — no arguments

| Name | Description   | Type | (Default) |
| ---- | ------------- | ---- | --------- |
| -    | No parameters | -    | -         |

### random(min, max)

| Name  | Description                                             | Type     | (Default) |
| ----- | ------------------------------------------------------- | -------- | --------- |
| `min` | The minimum value (inclusive); must be a finite integer | `number` | -         |
| `max` | The maximum value (inclusive); must be a finite integer | `number` | -         |

### Return

| Member   | Description                                                                                         | Signature |
| -------- | --------------------------------------------------------------------------------------------------- | --------- |
| (result) | Decimal in `[0, 1)` for `random()`; integer in `[min, max]` (both inclusive) for `random(min, max)` | `number`  |
