## API

### Params

| Name           | Description                                    | Type                        | (Default) |
| -------------- | ---------------------------------------------- | --------------------------- | --------- |
| `key`          | Storage key; empty/null disables persistence   | `string \| null`            | -         |
| `initialValue` | Initial value; function form is evaluated once | `T \| (() => T)`            | -         |
| `options`      | Optional behavior options                      | `UseLocalStorageOptions<T>` | -         |

### Options — UseLocalStorageOptions\<T\>

| Name          | Description                                     | Type                   | (Default)        |
| ------------- | ----------------------------------------------- | ---------------------- | ---------------- |
| `sync`        | Listen to `storage` events and sync across tabs | `boolean`              | `true`           |
| `serialize`   | Custom serializer                               | `(value: T) => string` | `JSON.stringify` |
| `deserialize` | Custom deserializer                             | `(raw: string) => T`   | `JSON.parse`     |

### Return

| Member     | Description                               | Signature                                 |
| ---------- | ----------------------------------------- | ----------------------------------------- |
| `value`    | Current state value                       | `T`                                       |
| `setValue` | Update the value and persist to storage   | `(action: T \| ((prev: T) => T)) => void` |
| `remove`   | Reset to initial value and remove the key | `() => void`                              |
