面向 Node.js 与浏览器环境的 AES 加密工具模块。`encryptAES` / `decryptAES` 提供基于 Web Crypto API（或 Node `crypto`）的标准 AES-256-CBC 加密，并在非安全上下文中回退到 CryptoJS。`advancedEncrypt` / `advancedDecrypt` 通过随机一次性内部密钥与二次 AES 加密增加额外混淆。

## 适用场景

- 在持久化或传输前加密敏感字符串（如令牌、草稿、配置值）。
- 解密由这些函数——或任何共享 `iv:encrypted`（base64）输出格式的 AES-256-CBC 生产者——加密的数据。
- 在标准 AES 之上叠加额外混淆层（高级函数），以应对密钥可能暴露的场景。

## 核心特性

- **跨平台** —— 浏览器端使用 Web Crypto API、Node.js 端使用 `crypto` 模块实现 AES-256-CBC，输出格式统一为 `ivBase64:encryptedBase64`。
- **CryptoJS 回退** —— `encryptWithCryptoJS` / `decryptWithCryptoJS` 在非安全（HTTP）上下文中仍可正常工作。
- **每次加密随机 IV** —— 每次加密都嵌入全新的随机 IV，因此相同输入每次产生的密文都不同。
- **高级双重加密** —— `advancedEncrypt` 将随机一次性密钥拼入密文，再用用户密钥二次加密。

## 示例代码

```tsx
import { advancedDecrypt, advancedEncrypt, decryptAES, encryptAES } from '@tiny-codes/react-easy';

async function demo() {
  const key = 'my-secret-key';

  const cipherText = await encryptAES('Hello, React Easy!', key);
  // 例如 "hGq9...U8w==:a8Z1...==" （ivBase64:encryptedBase64）

  const plainText = await decryptAES(cipherText, key);
  console.log(plainText); // "Hello, React Easy!"

  const wrapped = await advancedEncrypt('Hello, React Easy!', key);
  const unwrapped = await advancedDecrypt(wrapped, key);
  console.log(unwrapped); // "Hello, React Easy!"
}
```

## 使用注意

- 输出格式为 `ivBase64:encryptedBase64`（CryptoJS 一对为 `iv:encrypted`）；解密时必须保持两部分完整。
- 当输入格式错误、密钥不正确或密文无效时，`decryptAES` 返回空字符串。
- `advancedDecrypt` 只能作为 `advancedEncrypt` 的逆操作，不要与标准函数混用。
- 加解密必须使用相同的 `key`；密钥在使用前会经过 SHA-256 哈希。
