## API

### 函数

| 函数                  | 说明                                                | 签名                                                            |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| `stringToBase64`      | 将 UTF-8 字符串编码为 Base64（标准或 URL 安全格式） | `(content: string, opts?: { urlSafe?: boolean }) => string`     |
| `base64ToString`      | 将 Base64 字符串解码为 UTF-8 文本                   | `(content: string, opts?: { urlSafe?: boolean }) => string`     |
| `arrayBufferToBase64` | 将 ArrayBuffer 转换为 Base64 字符串                 | `(buf: ArrayBuffer) => string`                                  |
| `base64ToArrayBuffer` | 将 Base64 字符串解码为 ArrayBuffer                  | `(base64: string, opts?: { urlSafe?: boolean }) => ArrayBuffer` |

### stringToBase64(content, opts?)

| 参数           | 说明                                                            | 类型                    | 默认值  |
| -------------- | --------------------------------------------------------------- | ----------------------- | ------- |
| `content`      | 要编码的输入文本                                                | `string`                | -       |
| `opts`         | 可选编码配置                                                    | `{ urlSafe?: boolean }` | `{}`    |
| `opts.urlSafe` | 为 true 时使用 URL 安全 Base64（`+`/`/` 替换为 `-_`，去掉 `=`） | `boolean`               | `false` |

### base64ToString(content, opts?)

| 参数           | 说明                                                       | 类型                    | 默认值  |
| -------------- | ---------------------------------------------------------- | ----------------------- | ------- |
| `content`      | 要解码的 Base64 字符串                                     | `string`                | -       |
| `opts`         | 可选解码配置                                               | `{ urlSafe?: boolean }` | `{}`    |
| `opts.urlSafe` | 为 true 时按 URL 安全 Base64 规范化（将 `-_` 还原为 `+/`） | `boolean`               | `false` |

### arrayBufferToBase64(buf)

| 参数  | 说明                 | 类型          | 默认值 |
| ----- | -------------------- | ------------- | ------ |
| `buf` | 要转换的 ArrayBuffer | `ArrayBuffer` | -      |

### base64ToArrayBuffer(base64, opts?)

| 参数           | 说明                                                       | 类型                    | 默认值  |
| -------------- | ---------------------------------------------------------- | ----------------------- | ------- |
| `base64`       | 要解码的 Base64 字符串                                     | `string`                | -       |
| `opts`         | 可选解码配置                                               | `{ urlSafe?: boolean }` | `{}`    |
| `opts.urlSafe` | 为 true 时按 URL 安全 Base64 规范化（将 `-_` 还原为 `+/`） | `boolean`               | `false` |
