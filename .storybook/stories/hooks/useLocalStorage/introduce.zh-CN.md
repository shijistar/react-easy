将 React 状态持久化到 `localStorage`，API 与 `useState` 类似。hook 惰性读取初始值，每次更新时写入存储，并可选地通过 `storage` 事件保持浏览器标签页间状态同步。

## 适用场景

- 跨页面刷新持久化用户偏好、表单草稿或 UI 设置。
- 在多个标签页之间共享状态（如主题、语言、面板布局）。
- 用状态式 API 替代手动 `localStorage.getItem` / `setItem`。

## 核心特性

- **useState 风格 API** —— 返回 `[value, setValue, remove]`；`setValue` 支持函数式更新。
- **跨标签页同步** —— `sync` 开启（默认）时监听 `storage` 事件。
- **自定义序列化** —— 通过 `serialize` / `deserialize` 支持非 JSON 值。
- **安全降级** —— 空 key 时退化为 `useState` 且不触碰存储；读写错误被静默吞掉。

## 使用注意

- `key` 会被去空格；空 key 完全禁用存储。
- `remove()` 将状态重置为初始值并删除存储项。
- `key` 变化时会从存储重新初始化状态。
- 存储访问对非浏览器环境做了保护。
