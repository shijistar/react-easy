基于 Ant Design 的 `IconFont` 加载器，渲染来自 iconfont.cn 脚本的图标。指向脚本 URL 后，按名称引用图标即可。

## 适用场景

当项目的图标集托管在 iconfont.cn（或自托管的 iconfont 脚本）而非内置的 Ant Design 图标库时——团队自定义字形、品牌图标或精选图标集——使用 `Iconfont`。

## 核心特性

- **基于脚本** —— `scriptUrl` 加载一次 iconfont 脚本；该脚本中的全部图标即可通过 `type` 使用。
- **标准 props** —— 继承 Ant Design `IconFontProps`（`spin`、`rotate`、`style`、`onClick` 等），用法与常规 `Icon` 组件一致。
- **尺寸与颜色** —— `size`（`control`）与 `color` 调整字形；`rotate`（`control`）设定固定角度。
- **前缀处理** —— `iconPrefix`（演示辅助）会在 `type` 前自动拼接，除非 `type` 已包含该前缀。

## 示例代码

```tsx
import { createIconfont } from '@tiny-codes/react-easy';

const IconFont = createIconfont('//at.alicdn.com/t/font_xxx.js');

export function Demo() {
  return (
    <>
      <IconFont type="icon-tuichu" size={32} color="#1677ff" />
      <IconFont type="icon-facebook" spin />
    </>
  );
}
```

## 使用注意

- 图标渲染前需通过 `scriptUrl` 加载脚本；URL 错误或缺失会导致字形空白。
- `type` 为 iconfont 项目中的图标名；必要时 `iconPrefix` 会自动前置。
- 由于透传 Ant Design 图标 props，`spin`/`rotate`/`style` 的行为与 `<Icon />` 完全一致。
