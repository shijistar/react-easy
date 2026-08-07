## API

### Functions

| Member                | Description                                                                | Signature                                                 |
| --------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| `encryptAES`          | Generic AES-256-CBC encryption; works in both Node.js and browsers         | `(text: string, key: string) => Promise<string>`          |
| `decryptAES`          | Decrypt the output of `encryptAES`; returns `''` when decryption fails     | `(encryptedText: string, key: string) => Promise<string>` |
| `encryptWithCryptoJS` | AES encryption implemented with crypto-js (same `iv:encrypted` output)     | `(text: string, key: string) => Promise<string>`          |
| `decryptWithCryptoJS` | crypto-js based decryption for `encryptWithCryptoJS` output                | `(encryptedText: string, key: string) => Promise<string>` |
| `advancedEncrypt`     | Advanced encryption: embeds a random one-time key and re-encrypts with AES | `(plainText: string, key: string) => Promise<string>`     |
| `advancedDecrypt`     | Inverse operation of `advancedEncrypt`                                     | `(encryptedText: string, key: string) => Promise<string>` |

### Parameters

| Name               | Description                                    | Type     | (Default) |
| ------------------ | ---------------------------------------------- | -------- | --------- |
| `text`/`plainText` | The plain text to encrypt                      | `string` | -         |
| `encryptedText`    | The encrypted text (`iv:encrypted`) to decrypt | `string` | -         |
| `key`              | The encryption / decryption key                | `string` | -         |

All functions return `Promise<string>`. The encrypted output uses the `ivBase64:encryptedBase64` format (`iv:encrypted` for the CryptoJS pair). `decryptAES` resolves to an empty string when decryption fails.
