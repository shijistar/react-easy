颜色工具函数用于计算单一颜色的亮度，从而判断其深浅。`getColorLuminance` 从 `#hex`（三位或六位）或 `rgb()` 颜色字符串返回 `(0, 1)` 范围内的 WCAG 相对亮度。

## 适用场景

- 根据背景色自动确定文字颜色，使浅色背景使用深色文字、深色背景使用浅色文字。
- 基于对比度做动态决策，例如决定图标或徽章使用哪种变体。
- 将多种颜色输入（hex 与 `rgb()`）统一归一为一个"深/浅"判断，再做进一步处理。

## 核心特性

- **深浅判断** —— 亮度低于 `0.5` 视为深色，高于等于 `0.5` 视为浅色。
- **多格式支持** —— 兼容 `#rrggbb`、`#rgb` 与 `rgb(r, g, b)` 字符串。
- **标准算法** —— 遵循带 sRGB 伽马校正的 WCAG 相对亮度计算公式。
- **返回 `(0, 1)` 范围** —— 便于直接做阈值判断或参与进一步的对比度计算。

## 示例代码

```ts
import { getColorLuminance } from '@tiny-codes/react-easy';

getColorLuminance('#ffffff'); // 约 1（浅色）
getColorLuminance('#000000'); // 0（深色）
getColorLuminance('rgb(255, 87, 34)'); // 约 0.21（深色）

const luminance = getColorLuminance(candidate);
const textColor = luminance < 0.5 ? '#fff' : '#000';
```

## 使用注意

- 仅识别 `#hex`（带或不带前导 `#`）与 `rgb(r, g, b)` 字符串；其他格式回退为 `(0, 0, 0)`。
- 忽略 alpha 通道 —— `rgba()` 只会取其 RGB 分量。
- 返回值为 `[0, 1]`；选取文字颜色时可将 `0.5` 作为浅色基准。
