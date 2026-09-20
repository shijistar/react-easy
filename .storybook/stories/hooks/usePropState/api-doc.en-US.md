## API

### Params

| Name      | Description                    | Type                     | Default |
| --------- | ------------------------------ | ------------------------ | ------- |
| `value`   | The prop that drives the state | `T \| undefined`         | -       |
| `options` | Configuration options          | `UsePropStateOptions<T>` | `{}`    |

### Options — UsePropStateOptions\<T\>

| Name       | Description                                                                                                                                                           | Type                            | Default     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| `fallback` | Value used while the prop is `undefined`. It is also the initial state, so the controlled/uncontrolled pattern (`open` + `defaultOpen`) is supported                  | `T`                             | `undefined` |
| `isEqual`  | Custom equality check used to detect prop changes. Pass a shallow/deep comparator when the prop is an object that is re-created on every render                       | `(prev: T, next: T) => boolean` | `Object.is` |
| `enabled`  | Whether the prop is allowed to drive the internal state. While `false` the prop is still tracked, so a later change is still detected, but it is not written to state | `boolean`                       | `true`      |

### Return

| Member     | Description                                    | Type                          |
| ---------- | ---------------------------------------------- | ----------------------------- |
| `state`    | The internal state, kept in sync with the prop | `T`                           |
| `setState` | Same setter shape as `useState`                | `Dispatch<SetStateAction<T>>` |
