AES encryption utility module for Node.js and browser environments. `encryptAES` / `decryptAES` provide standard AES-256-CBC encryption backed by the Web Crypto API (or Node `crypto`), with a CryptoJS fallback for non-secure contexts. `advancedEncrypt` / `advancedDecrypt` add a random one-time inner key and a second AES pass for extra obfuscation.

## When to use

- Encrypting sensitive strings (tokens, drafts, config values) before persisting or transmitting them.
- Decrypting data previously produced by these functions — or by any AES-256-CBC producer sharing the same `iv:encrypted` (base64) output format.
- Adding an extra layer of obfuscation on top of standard AES when the key might be exposed (advanced functions).

## Key features

- **Cross-platform** — AES-256-CBC via the Web Crypto API in browsers and `crypto` in Node.js, with a unified `ivBase64:encryptedBase64` output format.
- **CryptoJS fallback** — `encryptWithCryptoJS` / `decryptWithCryptoJS` keep encryption working in insecure (HTTP) contexts.
- **Random IV per run** — every encryption embeds a fresh random IV, so the same input produces different ciphertext each time.
- **Advanced double pass** — `advancedEncrypt` splices a random one-time key into the ciphertext and re-encrypts it with the user key.

## Sample code

```tsx
import { advancedDecrypt, advancedEncrypt, decryptAES, encryptAES } from '@tiny-codes/react-easy';

async function demo() {
  const key = 'my-secret-key';

  const cipherText = await encryptAES('Hello, React Easy!', key);
  // e.g. "hGq9...U8w==:a8Z1...=="  (ivBase64:encryptedBase64)

  const plainText = await decryptAES(cipherText, key);
  console.log(plainText); // "Hello, React Easy!"

  const wrapped = await advancedEncrypt('Hello, React Easy!', key);
  const unwrapped = await advancedDecrypt(wrapped, key);
  console.log(unwrapped); // "Hello, React Easy!"
}
```

## Usage notes

- The output format is `ivBase64:encryptedBase64` (or `iv:encrypted` for the CryptoJS pair); keep the two parts intact when decrypting.
- `decryptAES` resolves to an empty string when the input is malformed, the key is wrong, or the ciphertext is invalid.
- `advancedDecrypt` is the inverse of `advancedEncrypt` only — do not mix it with the standard functions.
- The same `key` must be used for encryption and decryption; keys are hashed with SHA-256 before use.
