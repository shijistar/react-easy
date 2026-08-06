展示加载状态，既可作为覆盖层（在子内容外包裹 spinner），也可作为独立视觉占位填充父容器。

## 适用场景

当需要表达"进行中"状态时：用覆盖模式为某区域包裹旋转 spinner，或以独立动画作为数据加载时的居中占位，使用 `Loading`。

## 核心特性

- **两种使用方式**
  1. **Spin** —— 当组件包裹 `children` 时，在它们之上叠加 Ant Design 的 `Spin`。
  2. **独立** —— 无 children 时，渲染一个自动填满并居中于父容器的加载动画。
- **继承 Spin** —— 扩展 Ant Design `SpinProps`，因此 `tip`、`size`、`indicator`、`spinning` 等均可用。
- **独立模式增强** —— `mode`（`absolute` | `flex`）控制独立定位；`rootClassName` / `rootStyle` 设置遮罩容器样式。

## 示例代码

```tsx
import { Loading } from '@tiny-codes/react-easy';

export function Demo() {
  return (
    <div style={{ position: 'relative', height: 120 }}>
      <Loading mode="absolute" />
    </div>
  );
}
```

## 使用注意

- Spin 模式下子内容仍保留在 DOM 中，只是被覆盖；独立模式下没有 children。
- `mode` 仅对独立变体有意义：`absolute` 通过绝对定位居中，`flex` 填满父容器。
- 由于扩展自 `SpinProps`，多数样式与行为都与 Ant Design 的 `Spin` 一致。
