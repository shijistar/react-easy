渲染可折叠溢出的标签集合——标签过多时，多余部分收拢为一个省略号标签，点击展开下拉。专为密集元信息或筛选条件摘要场景设计。

## 适用场景

当需要在有限空间内展示数量可变的标签（已选筛选、分配标签、技能、分类）时，用 `OverflowTags` 优雅收拢溢出部分，而非尴尬地换行或溢出。

## 核心特性

- **溢出折叠** —— 标签数量超过可见上限后，其余收拢为一个省略号标签，点击在下拉中展开。
- **灵活数据** —— `tags` 为泛型 `T[]`；`getTagName` / `getTagKey` 将每项映射为标签/键（默认取 `label`/`name` 与 `value`/`id`）。
- **自定义渲染** —— `renderTag` 覆盖标签本身，`tagProps` / `ellipsisTagProps` 分别设置普通与省略号标签样式，`ellipsisDropdownProps` 设置溢出下拉样式。
- **配色** —— `randomColors` 分配预设颜色；单个标签的 `color` 优先级更高。
- **继承 rc-overflow** —— `OverflowProps`（除 `renderItem` 外）均被透传，尺寸/间距遵循该库。

## 示例代码

```tsx
import { OverflowTags } from '@tiny-codes/react-easy';

const tags = [
  { id: 1, label: 'React' },
  { id: 2, label: 'TypeScript' },
  { id: 3, label: 'Ant Design' },
  // …
];

export function Demo() {
  return <OverflowTags tags={tags} getTagKey={(tag) => tag.id} renderTag={(tag) => tag.label} />;
}
```

## 使用注意

- 请提供稳定的 `getTagKey`，以便列表变化时 React 协调与下拉表现正确。
- `renderTag` 会整体替换默认标签；若仅需改样式，优先使用 `tagProps`。
- `randomColors` 适合无语义的集合；对有明确含义的分类，建议逐标签设置 `color`。
