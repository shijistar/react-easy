## API

### Functions

| Function              | Description                                              | Signature                                                       |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `stringToBase64`      | Encode a UTF-8 string into Base64 (standard or URL-safe) | `(content: string, opts?: { urlSafe?: boolean }) => string`     |
| `base64ToString`      | Decode a Base64 string back into UTF-8 text              | `(content: string, opts?: { urlSafe?: boolean }) => string`     |
| `arrayBufferToBase64` | Convert an ArrayBuffer to a Base64 string                | `(buf: ArrayBuffer) => string`                                  |
| `base64ToArrayBuffer` | Decode a Base64 string into an ArrayBuffer               | `(base64: string, opts?: { urlSafe?: boolean }) => ArrayBuffer` |

### stringToBase64(content, opts?)

| Name           | Description                                                        | Type                    | (Default) |
| -------------- | ------------------------------------------------------------------ | ----------------------- | --------- |
| `content`      | Input text to encode                                               | `string`                | -         |
| `opts`         | Optional encoding options                                          | `{ urlSafe?: boolean }` | `{}`      |
| `opts.urlSafe` | Use URL-safe Base64 if true (replace `+`/`/` with `-_`, strip `=`) | `boolean`               | `false`   |

### base64ToString(content, opts?)

| Name           | Description                                                   | Type                    | (Default) |
| -------------- | ------------------------------------------------------------- | ----------------------- | --------- |
| `content`      | Base64 encoded string to decode                               | `string`                | -         |
| `opts`         | Optional decoding options                                     | `{ urlSafe?: boolean }` | `{}`      |
| `opts.urlSafe` | Normalize URL-safe Base64 if true (replace `-_` back to `+/`) | `boolean`               | `false`   |

### arrayBufferToBase64(buf)

| Name  | Description                | Type          | (Default) |
| ----- | -------------------------- | ------------- | --------- |
| `buf` | The ArrayBuffer to convert | `ArrayBuffer` | -         |

### base64ToArrayBuffer(base64, opts?)

| Name           | Description                                                   | Type                    | (Default) |
| -------------- | ------------------------------------------------------------- | ----------------------- | --------- |
| `base64`       | The Base64 encoded string to decode                           | `string`                | -         |
| `opts`         | Optional decoding options                                     | `{ urlSafe?: boolean }` | `{}`      |
| `opts.urlSafe` | Normalize URL-safe Base64 if true (replace `-_` back to `+/`) | `boolean`               | `false`   |
