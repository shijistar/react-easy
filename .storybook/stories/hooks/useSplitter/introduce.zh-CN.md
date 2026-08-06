让任意双面板布局通过可拖动的分割条调整尺寸。hook 为你渲染分割条 `dom` 元素，实时跟踪比例，并支持垂直/水平方向与可配置的最小/最大边界。与库的 CSS 变量和前缀类系统无缝集成。

## 适用场景

- 左右或上下可调整的分栏布局（文件管理器、代码编辑器、仪表盘）。
- 需要用户调整两个区域占比的任何布局。
- 希望分割条样式跟随主题 token 与 `prefixCls` 约定。

## 核心特性

- **开箱即用** —— 返回可直接放置的 `dom` 分割条元素，放在两个面板之间即可。
- **边界可控** —— `minRatio` / `maxRatio` 限制拖动范围；`defaultRatio` 设置初始比例。
- **双向布局** —— `vertical`（左右）或 `horizontal`（上下）。
- **实时反馈** —— 暴露 `percent`、`width`、`dragging` 供自定义 UI 使用。
- **主题感知** —— 使用 `ConfigProvider` 前缀与 CSS 变量；支持 hover/dragging/handle 类名钩子。

## 示例代码

```tsx
import { useSplitter } from '@tiny-codes/react-easy';

export function Demo() {
  const { dom, percent, dragging } = useSplitter({
    direction: 'vertical',
    defaultRatio: 0.32,
    minRatio: 0.15,
    maxRatio: 0.85,
  });

  return (
    <div style={{ display: 'flex', height: 400 }}>
      <div style={{ width: `${(percent ?? 0.32) * 100}%` }}>左侧面板</div>
      {dom}
      <div style={{ flex: 1 }}>右侧面板</div>
    </div>
  );
}
```

## 使用注意

- 分割条默认自动解析容器（`dom` 的父元素），也可通过 `container` 显式指定。
- 未提供 `maxRatio` 时默认取 `1 - minRatio`。
- 拖动期间监听器挂在 `window` 上，指针离开容器后拖动仍然有效。
- `onChange` 中的比例是左侧/上方面板占容器的份额（0~1）。
