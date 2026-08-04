## API

| Prop           | Description                   | Type                                                                | Default           |
| -------------- | ----------------------------- | ------------------------------------------------------------------- | ----------------- |
| `items`        | Menu items to display         | `(ContextMenuItem \| ContextMenuSeparator \| ContextMenuSubmenu)[]` | -                 |
| `trigger`      | How the menu is triggered     | `('click' \| 'doubleClick' \| 'hover' \| 'contextMenu')[]`          | `['contextMenu']` |
| `triggerProps` | Props for the trigger element | `{ className?: string; style?: CSSProperties }`                     | -                 |
| `prefixCls`    | Custom CSS class prefix       | `string`                                                            | -                 |

> Other `MenuProps` (from `react-contexify`) are forwarded to the underlying `<Menu>`.

### `ContextMenuItem`

| Field         | Description                               | Type                                   |
| ------------- | ----------------------------------------- | -------------------------------------- |
| `key`         | Unique key                                | `string`                               |
| `label`       | Item label                                | `ReactNode`                            |
| `icon`        | Leading icon                              | `ReactNode`                            |
| `shortcutKey` | Keyboard shortcut matcher                 | `Partial<KeyboardEvent> \| keyMatcher` |
| `children`    | Custom content (overrides `label`/`icon`) | `ReactNode`                            |

### `ContextMenuSubmenu`

| Field   | Description   | Type                                                                |
| ------- | ------------- | ------------------------------------------------------------------- |
| `key`   | Unique key    | `string`                                                            |
| `type`  | Discriminator | `'submenu'`                                                         |
| `items` | Nested items  | `(ContextMenuItem \| ContextMenuSeparator \| ContextMenuSubmenu)[]` |

### `ContextMenuSeparator`

| Field  | Description   | Type          |
| ------ | ------------- | ------------- |
| `type` | Discriminator | `'separator'` |

### Ref — `ContextMenuRef`

| Method    | Description                         | Signature                           |
| --------- | ----------------------------------- | ----------------------------------- |
| `show`    | Open the menu at the event position | `(event: React.MouseEvent) => void` |
| `hideAll` | Close all context menus             | `() => void`                        |

## Notes

The `show`/`hideAll` methods are exposed via `ref`, useful for programmatic control.
