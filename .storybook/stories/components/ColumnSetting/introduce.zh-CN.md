帮助用户管理表格列——显示状态、排序，以及"全选/重置"操作——并可通过 storage key 持久化偏好。它渲染一个由按钮触发的下拉面板。

## 适用场景

当表格需要提供列自定义能力时：数据网格、管理后台列表、报表构建器等——只要用户能从中受益于隐藏、重排或重新显示列，并希望该选择被记住，就使用 `ColumnSetting`。

## 核心特性

- **可见性与顺序** —— `columns` 携带每列的显示状态、顺序与 `disabled` 标记；组件通过 `onChange` 输出更新后的数组。
- **持久化** —— `storageKey` 将选择保存到 `localStorage`，使偏好在刷新后保留。
- **自定义标题** —— `renderColumnTitle` 覆盖面板中每列的标签渲染。
- **可组合触发器** —— `triggerProps` / `dropdownProps` / `popupProps` / `checkAllProps` / `resetProps` 分别定制按钮、下拉、弹出层与操作按钮。
- **继承 Ant Design** —— 列项遵循 `ColumnType`，你现有的列定义可直接接入。

## 使用注意

- 至少保留一列可见（最后一个可见复选框会被禁用），以防止全部隐藏。
- 设置 `storageKey` 时，选择会在挂载时读取、并在每次 `onChange` 时写入。
- 将某列标记为 `disabled` 可将其锁定为始终可见，同时仍列在面板中。
