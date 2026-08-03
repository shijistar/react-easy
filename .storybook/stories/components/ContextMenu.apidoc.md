# ContextMenu

- **EN:** Renders a configurable context menu with support for shortcuts, separators, and nested submenu items.
- **CN:** 提供可配置的右键菜单能力，支持快捷键、分隔线和嵌套子菜单。

## When to use | 适用场景

- **EN:** You need a right-click (or other trigger) menu on an element, with keyboard shortcuts, separators and multi-level submenus.
- **CN:** 你需要在元素上提供右键（或其它触发方式）菜单，并支持快捷键、分隔线与多级子菜单。

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `(ContextMenuItem \| ContextMenuSeparator \| ContextMenuSubmenu)[]` | - | Menu items to display |
| `trigger` | `('click' \| 'doubleClick' \| 'hover' \| 'contextMenu')[]` | `['contextMenu']` | How the menu is triggered |
| `triggerProps` | `{ className?: string; style?: CSSProperties }` | - | Props for the trigger element |
| `prefixCls` | `string` | - | Custom CSS class prefix |

> Other `MenuProps` (from `react-contexify`) are forwarded to the underlying `<Menu>`.

### `ContextMenuItem`

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Unique key |
| `label` | `ReactNode` | Item label |
| `icon` | `ReactNode` | Leading icon |
| `shortcutKey` | `Partial<KeyboardEvent> \| keyMatcher` | Keyboard shortcut matcher |
| `children` | `ReactNode` | Custom content (overrides `label`/`icon`) |

### `ContextMenuSubmenu`

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string` | Unique key |
| `type` | `'submenu'` | Discriminator |
| `items` | `(ContextMenuItem \| ContextMenuSeparator \| ContextMenuSubmenu)[]` | Nested items |

### `ContextMenuSeparator`

| Field | Type | Description |
| --- | --- | --- |
| `type` | `'separator'` | Discriminator |

### Ref — `ContextMenuRef`

| Method | Signature | Description |
| --- | --- | --- |
| `show` | `(event: React.MouseEvent) => void` | Open the menu at the event position |
| `hideAll` | `() => void` | Close all context menus |

## Notes | 说明

- **EN:** The `show`/`hideAll` methods are exposed via `ref`, useful for programmatic control.
- **CN:** `show` / `hideAll` 通过 `ref` 暴露，便于以编程方式控制菜单。
