具备增强省略号与自动 tooltip 能力的排版组件族（`Text` / `Paragraph` / `Title` / `Link`）。当内容溢出时自动以 tooltip 展示全文，未溢出则不显示 tooltip。

## 适用场景

当长文本可能超出容器、且希望提供"悬停查看完整内容"的优雅体验时（单行标签、多行段落、标题或链接），用这些组件替代普通 Ant Design Typography。

## 核心特性

- **智能 tooltip** —— 三种等价方式开启自动省略+tooltip：`ellipsis={true}`、`ellipsis.tooltip={true}` 或 `ellipsis.tooltip.title={true}`。仅当文本真正溢出时才渲染 tooltip。
- **四种变体** —— `EllipsisText`、`EllipsisParagraph`、`EllipsisTitle`、`EllipsisLink` 分别对应 Ant Design 的相应排版元素。
- **丰富的省略配置** —— 支持行数（`rows`）、tooltip 标题/内容，以及 Ant Design 的全部 `ellipsis` 选项。
- **即插即用** —— 接受底层 Ant Design 排版组件的相同 props，迁移通常只需替换一行。

## 示例代码

```tsx
import { EllipsisParagraph, EllipsisText } from '@tiny-codes/react-easy';

export function Demo() {
  return (
    <>
      <EllipsisText ellipsis={{ tooltip: true }} style={{ maxWidth: 240 }}>
        这是一段超长文本，超出后将被截断并显示 tooltip…
      </EllipsisText>
      <EllipsisParagraph ellipsis={{ rows: 2, tooltip: true }}>多行段落，最多展示两行。</EllipsisParagraph>
    </>
  );
}
```

## 使用注意

- 内容未溢出时会自动抑制 tooltip，无需自行写条件逻辑。
- 段落/标题的多行截断优先使用 `rows`；单行使用默认行为即可。
- 由于透传 Ant Design 排版 props，通过 `style`/`className` 设置样式与预期一致。
