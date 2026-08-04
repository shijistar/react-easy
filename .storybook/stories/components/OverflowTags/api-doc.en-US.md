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

## Notes

The overflow threshold is controlled by `maxCount` (from `rc-overflow`, default `'responsive'`), which you can pass through the base props.

If a tag carries its own `color`, that color wins over `randomColors`.
