## API

| Prop                | Type                                                   | Default | Description                                                                         |
| ------------------- | ------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `columns`           | `ColumnSettingItem<T>[]`                               | -       | Column definitions including visibility, ordering, and `disabled` state             |
| `onChange`          | `(nextColumns: T[]) => void`                           | -       | Called when the selected columns change; returns columns with `hidden` updated      |
| `storageKey`        | `string`                                               | -       | Local storage key for persisting column settings. If unset, persistence is disabled |
| `renderColumnTitle` | `(col: ColumnSettingItem, index: number) => ReactNode` | -       | Custom renderer for column titles                                                   |
| `triggerProps`      | `ButtonProps`                                          | -       | Props for the button that opens the dropdown                                        |
| `dropdownProps`     | `DropdownProps`                                        | -       | Props for the dropdown component                                                    |
| `popupProps`        | `React.HTMLAttributes<HTMLDivElement>`                 | -       | Props for the dropdown popup container                                              |
| `checkAllProps`     | `ButtonProps`                                          | -       | Props for the "Check All" button                                                    |
| `resetProps`        | `ButtonProps`                                          | -       | Props for the "Reset" button                                                        |
| `prefixCls`         | `string`                                               | -       | Custom CSS class prefix                                                             |

### `ColumnSettingItem`

Extends Ant Design `ColumnType<T>` and adds:

| Field      | Type      | Description                                 |
| ---------- | --------- | ------------------------------------------- |
| `disabled` | `boolean` | Disable toggling visibility for this column |

## Notes

At least one column always remains visible — the last visible column's checkbox is disabled to prevent hiding everything.
When `storageKey` is set, the selection is read from `localStorage` on mount and written back on every change.
