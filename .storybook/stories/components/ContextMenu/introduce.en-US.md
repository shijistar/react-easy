Renders a configurable context menu with support for shortcuts, separators, and nested submenu items.

## When to use

You need a right-click (or other trigger) menu on an element, with keyboard shortcuts, separators and multi-level submenus. Typical cases: a grid/canvas context menu, a row action menu in a table, or any "secondary actions" surface that should appear on demand without cluttering the layout.

## Key features

- **Multiple triggers** — open on `contextMenu` (default), `click`, `doubleClick`, or `hover` via the `trigger` prop; combine several if needed.
- **Declarative items** — describe the whole menu with the `items` array (`ContextMenuItem` / `ContextMenuSeparator` / `ContextMenuSubmenu`), including icons, shortcuts, and labels.
- **Shortcuts** — each item can declare a `shortcutKey` matcher so the action fires from the keyboard even when the menu is closed.
- **Nested submenus & separators** — build hierarchy with `ContextMenuSubmenu` and visually group with `ContextMenuSeparator`.
- **Imperative control** — use a ref to call `show(event, options?)` and open the menu at an arbitrary position, or `hideAll()` to close every open menu.
- **Theming** — integrates with antd `ConfigProvider` for prefix/class customization via `prefixCls`.

## Usage notes

- The menu is rendered through `react-contexify`; its `MenuProps` (except `renderItem`) are forwarded, so you can rely on that library's item model.
- `items` is required — an empty or `undefined` value yields no menu.
- `shortcutKey` works globally; avoid binding the same shortcut to multiple items to prevent ambiguous triggers.
- `trigger='hover'` pairs `onPointerEnter` with `onPointerLeave`; make sure the trigger element has enough hit area for a stable hover.
