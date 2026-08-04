## API

`OverflowTagsProps<T>` 继承自 `rc-overflow` 的 `OverflowProps<T>`（不包括 `renderItem`）并增加了：

| 属性                    | 类型                                                         | 默认值                    | 说明                                              |
| ----------------------- | ------------------------------------------------------------ | ------------------------- | ------------------------------------------------- |
| `tags`                  | `T[]`                                                        | `[]`                      | 标签数据集合                                      |
| `getTagName`            | `(tag: T) => ReactNode`                                      | `tag.label` or `tag.name` | 获取标签显示的内容                                |
| `getTagKey`             | `(tag: T) => React.Key`                                      | `tag.value` or `tag.id`   | 获取标签的唯一 key                                |
| `renderTag`             | `OverflowProps<T>['renderItem']`                             | -                         | 自定义标签渲染器                                  |
| `tagProps`              | `TagProps \| ((tag: T, { tags }) => TagProps)`               | -                         | `Tag` 组件的属性                                  |
| `ellipsisTagProps`      | `TagProps \| ((tag, { omittedItems, allTags }) => TagProps)` | -                         | 省略号（"+N"）标签的属性                          |
| `ellipsisDropdownProps` | `DropdownProps`                                              | -                         | 溢出下拉菜单的属性                                |
| `randomColors`          | `boolean`                                                    | `false`                   | 使用随机预设颜色。标签上的 `color` 字段优先级更高 |

## 说明

溢出阈值由 `maxCount`（来自 `rc-overflow`，默认 `'responsive'`）控制，可通过基础属性透传。
若 tag 自身带 `color` 字段，则其优先级高于 `randomColors`。
