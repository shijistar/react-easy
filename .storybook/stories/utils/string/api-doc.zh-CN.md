## API

### 函数

| 成员                  | 说明                                                            | 签名                                                                        |
| --------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `randomChars`         | 生成指定长度的随机字母数字字符串（`A-Za-z0-9`）                 | `(length: number) => string`                                                |
| `readTextAnyEncoding` | 从 `Blob` / `ArrayBuffer` / `Uint8Array` 读取文本并自动检测编码 | `(blob: Blob \| ArrayBuffer \| Uint8Array \| undefined) => Promise<string>` |

### 参数

| 参数     | 说明                                 | 类型                                             | 默认值 |
| -------- | ------------------------------------ | ------------------------------------------------ | ------ |
| `length` | 随机字符串的长度                     | `number`                                         | -      |
| `blob`   | 文本来源；传入 `undefined` 返回 `''` | `Blob \| ArrayBuffer \| Uint8Array \| undefined` | -      |

编码检测顺序：BOM（`utf-8` / `utf-16le` / `utf-16be`）→ 合法 UTF-8 → 回退 `gb18030`。
