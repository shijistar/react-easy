为 Ant Design Table 生成 `rowSelection` 配置，**支持跨页选中**。与内置 `TableRowSelection` 不同，`onChange` 回调返回的是选中的**行对象**（而非行 key），且内部会缓存已选中的行对象，翻页后选择不丢失。

## 适用场景

- 分页表格需要跨页保留选中项。
- 回调中需要拿到选中的行对象（而不只是 key）。
- 选中状态放在 Table 外部管理（受控 `value`）。

## 核心特性

- **跨页选中** —— 内部缓存保留所有已选中的行对象，切换页码不会丢失之前的选中。
- **行对象回调** —— `onChange(value)` 接收 `T[]` 行对象数组，而非 key 数组。
- **自动行 key** —— 未提供 `rowKey` 时自动使用 `id` 或 `code` 字段。
- **可恢复缓存** —— 传入 `cache` 可在 Table 重新挂载时恢复选中（例如从 `localStorage` 或微前端主应用读取）。

## 使用注意

- 将返回值直接传给 Table 的 `rowSelection`；当 `checkable` 为 `false` 时返回 `undefined`。
- hook 只负责选中状态，Table 自身仍需渲染复选框列。
- `value` 是唯一数据源：放在 `useState` 中并传回，实现受控选中。
