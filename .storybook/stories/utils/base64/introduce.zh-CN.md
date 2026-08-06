Base64 工具函数在标准或 URL 安全格式下完成 UTF-8 字符串与 Base64 之间的转换，并打通 `ArrayBuffer` 与 Base64，让二进制数据可以以纯字符串的形式传输。它们与环境无关：Node 环境优先使用 `Buffer`，浏览器环境回退到 `btoa`/`atob` 配合 `TextEncoder`/`TextDecoder`。

## 适用场景

- 将用户生成的 UTF-8 文本（emoji、中文、带重音字符）编码为 Base64，以便安全传输或存储。
- 在浏览器、服务器或 Web Worker 之间以 Base64 字符串的形式交换二进制数据（例如文件字节）。
- 需要 URL 安全变体，让编码结果可以出现在查询参数、路径片段或令牌中。

## 核心特性

- **UTF-8 感知** —— 非 ASCII 文本可无损编解码。
- **双格式** —— 默认输出标准 Base64；传入 `{ urlSafe: true }` 切换到 URL 安全字母表（`+`/`/` → `-`/`_`，并去掉 `=` 填充）。
- **字符串 ↔ ArrayBuffer** —— 四个函数覆盖文本与二进制两个方向的往返转换。
- **环境无关** —— 存在 `Buffer` 时优先使用，否则回退到浏览器 API。

## 示例代码

```ts
import { base64ToString, stringToBase64 } from '@tiny-codes/react-easy';

const encoded = stringToBase64('hello, react-easy');
// 'aGVsbG8sIHJlYWN0LWVhc3k='

const decoded = base64ToString(encoded);
// 'hello, react-easy'

// URL 安全变体：'+'/'/' 变为 '-'/'_' 并去掉 '=' 填充
const urlSafe = stringToBase64('https://example.com/a?b=1&c=2', { urlSafe: true });
```

## 使用注意

- 编码函数将空字符串或 `null`/`undefined` 输入视为空字符串。
- 解码要求输入是合法的 Base64 字符串；格式非法的输入（例如长度对 4 取模为 1）会抛出如 `Failed to decode Base64: ...` 的错误。
- 编码与解码的 `urlSafe` 标志必须一致 —— 只有 `urlSafe: true` 时 `-`/`_` 才会被还原为 `+`/`/`。
- `arrayBufferToBase64` 始终输出带填充的标准 Base64；`base64ToArrayBuffer` 对空输入返回空的 `ArrayBuffer(0)`。
