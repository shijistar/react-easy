## API

### 函数

| 成员                  | 说明                                                         | 签名                                                      |
| --------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| `encryptAES`          | 通用 AES-256-CBC 加密；同时支持 Node.js 与浏览器环境         | `(text: string, key: string) => Promise<string>`          |
| `decryptAES`          | 解密 `encryptAES` 的输出；解密失败时返回 `''`                | `(encryptedText: string, key: string) => Promise<string>` |
| `encryptWithCryptoJS` | 基于 crypto-js 的 AES 加密（同样输出 `iv:encrypted`）        | `(text: string, key: string) => Promise<string>`          |
| `decryptWithCryptoJS` | 基于 crypto-js 的解密，用于还原 `encryptWithCryptoJS` 的输出 | `(encryptedText: string, key: string) => Promise<string>` |
| `advancedEncrypt`     | 高级加密：内部随机插入一次性密钥并二次 AES 加密              | `(plainText: string, key: string) => Promise<string>`     |
| `advancedDecrypt`     | `advancedEncrypt` 的逆操作                                   | `(encryptedText: string, key: string) => Promise<string>` |

### 参数

| 参数               | 说明                           | 类型     | 默认值 |
| ------------------ | ------------------------------ | -------- | ------ |
| `text`/`plainText` | 待加密的明文                   | `string` | -      |
| `encryptedText`    | 待解密的密文（`iv:encrypted`） | `string` | -      |
| `key`              | 加密 / 解密密钥                | `string` | -      |

所有函数均返回 `Promise<string>`。加密输出格式为 `ivBase64:encryptedBase64`（CryptoJS 一对为 `iv:encrypted`）。`decryptAES` 在解密失败时返回空字符串。
