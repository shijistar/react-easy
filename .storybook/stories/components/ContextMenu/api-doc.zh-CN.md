## API

| Prop           | Type                                                                | Default           | Description                   |
| -------------- | ------------------------------------------------------------------- | ----------------- | ----------------------------- |
| `items`        | `(ContextMenuItem \| ContextMenuSeparator \| ContextMenuSubmenu)[]` | -                 | Menu items to display         |
| `trigger`      | `('click' \| 'doubleClick' \| 'hover' \| 'contextMenu')[]`          | `['contextMenu']` | How the menu is triggered     |
| `triggerProps` | `{ className?: string; style?: CSSProperties }`                     | -                 | Props for the trigger element |
| `prefixCls`    | `string`                                                            | -                 | Custom CSS class prefix       |

> Other `MenuProps` (from `react-contexify`) are forwarded to the underlying `<Menu>`.

### `ContextMenuItem`

| Field         | Type                                   | Description                               |
| ------------- | -------------------------------------- | ----------------------------------------- |
| `key`         | `string`                               | Unique key                                |
| `label`       | `ReactNode`                            | Item label                                |
| `icon`        | `ReactNode`                            | Leading icon                              |
| `shortcutKey` | `Partial<KeyboardEvent> \| keyMatcher` | Keyboard shortcut matcher                 |
| `children`    | `ReactNode`                            | Custom content (overrides `label`/`icon`) |

### `ContextMenuSubmenu`

| Field   | Type                                                                | Description   |
| ------- | ------------------------------------------------------------------- | ------------- |
| `key`   | `string`                                                            | Unique key    |
| `type`  | `'submenu'`                                                         | Discriminator |
| `items` | `(ContextMenuItem \| ContextMenuSeparator \| ContextMenuSubmenu)[]` | Nested items  |

### `ContextMenuSeparator`

| Field  | Type          | Description   |
| ------ | ------------- | ------------- |
| `type` | `'separator'` | Discriminator |

### Ref — `ContextMenuRef`

| Method    | Signature                           | Description                         |
| --------- | ----------------------------------- | ----------------------------------- |
| `show`    | `(event: React.MouseEvent) => void` | Open the menu at the event position |
| `hideAll` | `() => void`                        | Close all context menus             |

## 说明

`show` / `hideAll` 通过 `ref` 暴露，便于以编程方式控制菜单。
