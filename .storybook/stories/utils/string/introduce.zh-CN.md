字符串工具函数，提供随机生成与编码宽容的文本读取能力。`randomChars` 生成指定长度的随机字母数字字符串（`A-Za-z0-9`）；`readTextAnyEncoding` 从 `Blob` / `ArrayBuffer` / `Uint8Array` 中读取文本并自动检测编码——先检测 BOM（utf-8 / utf-16le / utf-16be），再做 utf-8 校验，最后回退到 gb18030。

## 适用场景

- 生成固定长度的随机验证码、令牌或测试字符串。
- 读取编码未知的上传文件或二进制响应数据。
- 读取可能以 UTF-8、UTF-16（带 BOM）或 GB18030（如旧版中文文件）编码的文本。

## 核心特性

- **纯粹简单** —— `randomChars(length)` 返回 `A-Za-z0-9` 字符串；无依赖、无副作用。
- **多种输入来源** —— `readTextAnyEncoding` 接受 `Blob`、`ArrayBuffer` 或 `Uint8Array`；传入 `undefined` 返回 `''`。
- **编码自动检测** —— BOM 检测（utf-8 / utf-16le / utf-16be）→ utf-8 校验 → gb18030 回退。
- **与框架无关** —— 可在浏览器、Worker 及任何提供 `TextDecoder` 的 JS 运行时中使用。

## 示例代码

```ts
import { randomChars, readTextAnyEncoding } from '@tiny-codes/react-easy';

const token = randomChars(16); // 例如 "K3fA9xQ2mZ7pL5wR"

const text = await readTextAnyEncoding(new Blob(['你好，React Easy'], { type: 'text/plain' }));
console.log(text); // "你好，React Easy"
```

## 使用注意

- `randomChars` 基于 `Math.random()`，不适用于密码学场景；敏感信息请使用 `encryptAES` 或专门的加密随机源。
- `readTextAnyEncoding` 优先识别 BOM；否则字节必须是合法 UTF-8，否则回退为 `gb18030`。
- 传入 `undefined` 时返回空字符串而不是抛错。
- `gb18030` 回退依赖运行时的 ICU 支持，如有硬性需求请先确认目标环境。
