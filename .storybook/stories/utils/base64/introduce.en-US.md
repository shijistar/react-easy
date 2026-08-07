The Base64 utilities convert between UTF-8 strings and Base64 in standard or URL-safe format, and bridge `ArrayBuffer` and Base64 so binary payloads can travel as plain strings. They are environment-agnostic: Node's `Buffer` is used when available, otherwise the browser `btoa`/`atob` pair combined with `TextEncoder`/`TextDecoder`.

## When to use

- Encoding user-generated UTF-8 text (emoji, CJK, accented characters) into Base64 for safe transmission or storage.
- Exchanging binary data (for example file bytes) as a Base64 string between the browser, a server, or a Web Worker.
- When a URL-safe variant is required so the encoded value can appear in query strings, path segments, or tokens.

## Key features

- **UTF-8 aware** — non-ASCII text is encoded and decoded losslessly.
- **Dual formats** — standard Base64 by default; pass `{ urlSafe: true }` to switch to the URL-safe alphabet (`+`/`/` → `-`/`_`, padding stripped).
- **String ↔ ArrayBuffer** — four functions cover text and binary round-trips in both directions.
- **Environment agnostic** — uses `Buffer` when present and falls back to browser APIs.

## Sample code

```ts
import { base64ToString, stringToBase64 } from '@tiny-codes/react-easy';

const encoded = stringToBase64('hello, react-easy');
// 'aGVsbG8sIHJlYWN0LWVhc3k='

const decoded = base64ToString(encoded);
// 'hello, react-easy'

// URL-safe variant: '+'/'/' become '-'/'_' and padding is stripped
const urlSafe = stringToBase64('https://example.com/a?b=1&c=2', { urlSafe: true });
```

## Usage notes

- Encode functions treat empty or `null`/`undefined` input as an empty string.
- Decoding requires a valid Base64 string; malformed input (for example a length congruent to 1 mod 4) throws an error such as `Failed to decode Base64: ...`.
- The `urlSafe` flag must match on both encode and decode — `-`/`_` are only normalized back to `+`/`/` when `urlSafe: true`.
- `arrayBufferToBase64` always emits standard Base64 with padding; `base64ToArrayBuffer` returns an empty `ArrayBuffer(0)` for empty input.
