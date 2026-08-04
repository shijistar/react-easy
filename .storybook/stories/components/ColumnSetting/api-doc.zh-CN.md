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

## 说明

至少会保留一列可见：最后一列可见项的勾选框会被禁用，避免把所有列都隐藏掉。
设置 `storageKey` 后，挂载时会从 `localStorage` 读取选择，并在每次变更时写回。
