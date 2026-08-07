提供可配置的右键菜单能力，支持快捷键、分隔线和嵌套子菜单。

## 适用场景

你需要在元素上提供右键（或其它触发方式）菜单，并支持快捷键、分隔线与多级子菜单。典型场景：画布/网格的右键菜单、表格行的操作菜单，或任何"按需出现、不占用布局"的次级操作面板。

## 核心特性

- **多种触发方式** —— 通过 `trigger` 属性可选择 `contextMenu`（默认）、`click`、`doubleClick` 或 `hover` 打开，也可组合多种触发。
- **声明式菜单项** —— 使用 `items` 数组（`ContextMenuItem` / `ContextMenuSeparator` / `ContextMenuSubmenu`）描述整个菜单，包含图标、快捷键与标签。
- **快捷键** —— 每个菜单项可声明 `shortcutKey` 匹配器，即使菜单未打开也能通过键盘触发对应操作。
- **嵌套子菜单与分隔线** —— 通过 `ContextMenuSubmenu` 构建层级，用 `ContextMenuSeparator` 做视觉分组。
- **命令式控制** —— 通过 ref 调用 `show(event, options?)` 在任意位置打开菜单，或 `hideAll()` 关闭所有已打开的菜单。
- **主题定制** —— 借助 antd `ConfigProvider`，可通过 `prefixCls` 自定义类名前缀。

## 示例代码

```tsx
import { ContextMenu, type ContextMenuItem } from '@tiny-codes/react-easy';
import { Button } from 'antd';

const items: ContextMenuItem[] = [
  { key: 'copy', label: '复制' },
  { key: 'rename', label: '重命名' },
  { key: 'delete', label: '删除', danger: true },
];

export function Demo() {
  return (
    <ContextMenu items={items}>
      <Button>右键点击我</Button>
    </ContextMenu>
  );
}
```

## 使用注意

- 菜单基于 `react-contexify` 渲染，其 `MenuProps`（除 `renderItem` 外）均被透传，可直接沿用该库的菜单项模型。
- `items` 为必填——为空或 `undefined` 时不会渲染任何菜单。
- `shortcutKey` 为全局生效；避免将同一快捷键绑定到多个菜单项，以免造成触发歧义。
- 当 `trigger='hover'` 时，会同时绑定 `onPointerEnter` 与 `onPointerLeave`；请确保触发器元素有足够的命中区域以获得稳定的悬停体验。
