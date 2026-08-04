## API

`OverflowTagsProps<T>` extends `rc-overflow`'s `OverflowProps<T>` (minus `renderItem`) and adds:

| Prop                    | Description                                                           | Type                                                         | Default                   |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| `tags`                  | Tag data collection                                                   | `T[]`                                                        | `[]`                      |
| `getTagName`            | Resolve the tag display name                                          | `(tag: T) => ReactNode`                                      | `tag.label` or `tag.name` |
| `getTagKey`             | Resolve the tag unique key                                            | `(tag: T) => React.Key`                                      | `tag.value` or `tag.id`   |
| `renderTag`             | Custom tag renderer                                                   | `OverflowProps<T>['renderItem']`                             | -                         |
| `tagProps`              | Props for the `Tag` component                                         | `TagProps \| ((tag: T, { tags }) => TagProps)`               | -                         |
| `ellipsisTagProps`      | Props for the ellipsis ("+N") tag                                     | `TagProps \| ((tag, { omittedItems, allTags }) => TagProps)` | -                         |
| `ellipsisDropdownProps` | Props for the overflow dropdown                                       | `DropdownProps`                                              | -                         |
| `randomColors`          | Use random preset colors. A `color` field on the tag takes precedence | `boolean`                                                    | `false`                   |

## Notes

The overflow threshold is controlled by `maxCount` (from `rc-overflow`, default `'responsive'`), which you can pass through the base props.

If a tag carries its own `color`, that color wins over `randomColors`.
