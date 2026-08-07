## API

### Params

| Name | Description                     | Type             | (Default) |
| ---- | ------------------------------- | ---------------- | --------- |
| `fn` | Function body; must be provided | `T \| undefined` | -         |

### Return

| Member | Description                                                           | Type |
| ------ | --------------------------------------------------------------------- | ---- |
| `fn`   | A function with immutable reference; calls the latest `fn` internally | `T`  |

> `T extends (...args: any[]) => any`.
