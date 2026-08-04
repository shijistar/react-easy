## API

| Prop                | Description                                                                         | Type                                                   | Default |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ | ------- |
| `columns`           | Column definitions including visibility, ordering, and `disabled` state             | `ColumnSettingItem<T>[]`                               | -       |
| `onChange`          | Called when the selected columns change; returns columns with `hidden` updated      | `(nextColumns: T[]) => void`                           | -       |
| `storageKey`        | Local storage key for persisting column settings. If unset, persistence is disabled | `string`                                               | -       |
| `renderColumnTitle` | Custom renderer for column titles                                                   | `(col: ColumnSettingItem, index: number) => ReactNode` | -       |
| `triggerProps`      | Props for the button that opens the dropdown                                        | `ButtonProps`                                          | -       |
| `dropdownProps`     | Props for the dropdown component                                                    | `DropdownProps`                                        | -       |
| `popupProps`        | Props for the dropdown popup container                                              | `React.HTMLAttributes<HTMLDivElement>`                 | -       |
| `checkAllProps`     | Props for the "Check All" button                                                    | `ButtonProps`                                          | -       |
| `resetProps`        | Props for the "Reset" button                                                        | `ButtonProps`                                          | -       |
| `prefixCls`         | Custom CSS class prefix                                                             | `string`                                               | -       |

### `ColumnSettingItem`

Extends Ant Design `ColumnType<T>` and adds:

| Field      | Description                                 | Type      |
| ---------- | ------------------------------------------- | --------- |
| `disabled` | Disable toggling visibility for this column | `boolean` |

## Notes

At least one column always remains visible — the last visible column's checkbox is disabled to prevent hiding everything.
When `storageKey` is set, the selection is read from `localStorage` on mount and written back on every change.
