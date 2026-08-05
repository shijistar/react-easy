## API

### Options — UseDebounceOptions

| Name      | Description                                                      | Type      | Default |
| --------- | ---------------------------------------------------------------- | --------- | ------- |
| `leading` | Whether to execute at the start of the wait period               | `boolean` | `false` |
| `wait`    | Regular debounce interval in milliseconds; `0` means no debounce | `number`  | `0`     |
| `maxWait` | Maximum wait time in milliseconds; `0` means no maximum          | `number`  | `0`     |

### Return — DebouncedFunc\<T\>

| Method       | Description                                                            | Signature                                   |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------- |
| `fn`         | The debounced function itself                                          | `(...args: Parameters<T>) => ReturnType<T>` |
| `cancel`     | Cancel any pending execution of the debounced function                 | `() => void`                                |
| `disable`    | Disable the debounce; subsequent calls have no effect until re-enabled | `() => void`                                |
| `enable`     | Re-enable the debounce after it has been disabled                      | `() => void`                                |
| `isDisabled` | Check whether the debounce is currently disabled                       | `() => boolean`                             |
