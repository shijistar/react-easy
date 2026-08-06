## API

### Functions

| Member                | Description                                                                              | Signature                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `randomChars`         | Generate a random alphanumeric string (`A-Za-z0-9`) of the given length                  | `(length: number) => string`                                                |
| `readTextAnyEncoding` | Read text from a `Blob` / `ArrayBuffer` / `Uint8Array` with automatic encoding detection | `(blob: Blob \| ArrayBuffer \| Uint8Array \| undefined) => Promise<string>` |

### Parameters

| Name     | Description                                       | Type                                             | (Default) |
| -------- | ------------------------------------------------- | ------------------------------------------------ | --------- |
| `length` | Length of the random string                       | `number`                                         | -         |
| `blob`   | Text source; passing `undefined` resolves to `''` | `Blob \| ArrayBuffer \| Uint8Array \| undefined` | -         |

Encoding detection order: BOM (`utf-8` / `utf-16le` / `utf-16be`) → valid UTF-8 → fallback `gb18030`.
