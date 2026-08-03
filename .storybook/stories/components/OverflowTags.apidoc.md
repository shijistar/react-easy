# OverflowTags

- **EN:** Renders a tag collection with overflow collapsing, suitable for dense metadata or filter summaries. When the number of tags exceeds the maximum count, an ellipsis tag is shown; custom tag rendering and per-tag props are supported.
- **CN:** 用于渲染可折叠溢出的标签集合，适合密集元信息或筛选条件摘要场景。当标签数量超过最大显示数时，会显示省略号标签，并支持自定义标签渲染与属性。

## When to use | 适用场景

- **EN:** You show many tags in a tight space and want the extras collapsed into a "+N" popover instead of wrapping or scrolling.
- **CN:** 在有限空间内展示大量标签，希望多余的标签折叠成 "+N" 弹出层，而不是换行或滚动。

## API

`OverflowTagsProps<T>` extends `rc-overflow`'s `OverflowProps<T>` (minus `renderItem`) and adds:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tags` | `T[]` | `[]` | Tag data collection |
| `getTagName` | `(tag: T) => ReactNode` | `tag.label` or `tag.name` | Resolve the tag display name |
| `getTagKey` | `(tag: T) => React.Key` | `tag.value` or `tag.id` | Resolve the tag unique key |
| `renderTag` | `OverflowProps<T>['renderItem']` | - | Custom tag renderer |
| `tagProps` | `TagProps \| ((tag: T, { tags }) => TagProps)` | - | Props for the `Tag` component |
| `ellipsisTagProps` | `TagProps \| ((tag, { omittedItems, allTags }) => TagProps)` | - | Props for the ellipsis ("+N") tag |
| `ellipsisDropdownProps` | `DropdownProps` | - | Props for the overflow dropdown |
| `randomColors` | `boolean` | `false` | Use random preset colors. A `color` field on the tag takes precedence |

## Notes | 说明

- **EN:** The overflow threshold is controlled by `maxCount` (from `rc-overflow`, default `'responsive'`), which you can pass through the base props.
- **CN:** 溢出阈值由 `maxCount`（来自 `rc-overflow`，默认 `'responsive'`）控制，可通过基础属性透传。
- **EN:** If a tag carries its own `color`, that color wins over `randomColors`.
- **CN:** 若 tag 自身带 `color` 字段，则其优先级高于 `randomColors`。
