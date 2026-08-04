面向超大文本文档的虚拟化处理只读文本查看器。它使用基于 canvas 的排版引擎（Pretext）测量文本，仅渲染可见行，因此在数十万行规模下依然流畅。

## 适用场景

当需要展示超大的只读文本——日志、源码文件、SQL dump、生成产物——而用普通元素渲染整段字符串会让浏览器卡死时，使用 `VirtualTextViewer`。

## 核心特性

- **Canvas 排版** —— 借助 Pretext 以真实字体度量计算换行，使行投影与浏览器实际绘制一致。
- **窗口化** —— 仅挂载可见行及 `overscan` 缓冲，滚动时 DOM 节点数为 O(1)。
- **排版可控** —— `lineHeight`、`font`、`letterSpacing`、`tabSize`、`wordBreak` 调整渲染，并与 canvas 度量保持同步。
- **逐行样式** —— `lineClassName` / `lineStyle` / `contentClassName` / `contentStyle` 可对整体与单行进行主题定制。

## 使用注意

- 请让 `font` 与实际 CSS 字体保持一致；不一致会导致 canvas 度量与绘制文本错位。
- `value` 为 `null`/`undefined` 时显示 `empty` 占位而非报错。
- 为获得最佳性能，请固定 `height`（视口）与 `lineHeight`，并避免在每次渲染时改动 `font`。
