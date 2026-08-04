## API

`OverflowTagsProps<T>` extends `rc-overflow`'s `OverflowProps<T>` (minus `renderItem`) and adds:

| Prop                    | Type                                                         | Default                   | Description                                                           |
| ----------------------- | ------------------------------------------------------------ | ------------------------- | --------------------------------------------------------------------- |
| `tags`                  | `T[]`                                                        | `[]`                      | Tag data collection                                                   |
| `getTagName`            | `(tag: T) => ReactNode`                                      | `tag.label` or `tag.name` | Resolve the tag display name                                          |
| `getTagKey`             | `(tag: T) => React.Key`                                      | `tag.value` or `tag.id`   | Resolve the tag unique key                                            |
| `renderTag`             | `OverflowProps<T>['renderItem']`                             | -                         | Custom tag renderer                                                   |
| `tagProps`              | `TagProps \| ((tag: T, { tags }) => TagProps)`               | -                         | Props for the `Tag` component                                         |
| `ellipsisTagProps`      | `TagProps \| ((tag, { omittedItems, allTags }) => TagProps)` | -                         | Props for the ellipsis ("+N") tag                                     |
| `ellipsisDropdownProps` | `DropdownProps`                                              | -                         | Props for the overflow dropdown                                       |
| `randomColors`          | `boolean`                                                    | `false`                   | Use random preset colors. A `color` field on the tag takes precedence |

## Notes | 说明

- **EN:** The overflow threshold is controlled by `maxCount` (from `rc-overflow`, default `'responsive'`), which you can pass through the base props.
- **CN:** 溢出阈值由 `maxCount`（来自 `rc-overflow`，默认 `'responsive'`）控制，可通过基础属性透传。
- **EN:** If a tag carries its own `color`, that color wins over `randomColors`.
- **CN:** 若 tag 自身带 `color` 字段，则其优先级高于 `randomColors`。
