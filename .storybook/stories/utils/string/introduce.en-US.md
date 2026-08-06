String utility functions for random generation and encoding-tolerant text reading. `randomChars` produces random alphanumeric strings (`A-Za-z0-9`) of a given length, and `readTextAnyEncoding` reads text from a `Blob` / `ArrayBuffer` / `Uint8Array` while auto-detecting the encoding — BOM first (utf-8 / utf-16le / utf-16be), then utf-8 validation, falling back to gb18030.

## When to use

- Generating random codes, tokens, or test strings of a fixed length.
- Reading uploaded files or fetched binary payloads whose encoding is unknown.
- Reading text that may be encoded as UTF-8, UTF-16 (with BOM), or GB18030 (e.g. legacy Chinese files).

## Key features

- **Pure and simple** — `randomChars(length)` returns a string of `A-Za-z0-9`; no dependencies, no side effects.
- **Multi-source input** — `readTextAnyEncoding` accepts a `Blob`, `ArrayBuffer`, or `Uint8Array`; passing `undefined` resolves to `''`.
- **Encoding auto-detection** — BOM detection (utf-8 / utf-16le / utf-16be) → utf-8 validation → gb18030 fallback.
- **Framework-agnostic** — works in the browser, workers, and any JS runtime that provides `TextDecoder`.

## Sample code

```ts
import { randomChars, readTextAnyEncoding } from '@tiny-codes/react-easy';

const token = randomChars(16); // e.g. "K3fA9xQ2mZ7pL5wR"

const text = await readTextAnyEncoding(new Blob(['Hello, React Easy!'], { type: 'text/plain' }));
console.log(text); // "Hello, React Easy!"
```

## Usage notes

- `randomChars` is based on `Math.random()` and is not suitable for cryptographic use — use `encryptAES` or a dedicated secure random source for secrets.
- `readTextAnyEncoding` honors a BOM first; otherwise the bytes must be valid UTF-8 or they fall back to `gb18030`.
- Passing `undefined` resolves to an empty string instead of throwing.
- The `gb18030` fallback relies on runtime ICU support; verify your target environment if it is a hard requirement.
