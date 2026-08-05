获取一个**可变的 ref 对象**，并自动与最新值保持同步。与只保留初始值的 `useRef(value)` 不同，`useRefValue` 会在每次渲染时覆盖 `ref.current`，使 ref 始终反映当前状态。

## 适用场景

- 在 `setTimeout`、`setInterval` 或事件监听中读取最新 state/props，而无需重新订阅。
- 向子组件传递稳定的 ref，同时保持 `.current` 始终最新。
- 实现 `useRefFunction` 等稳定回调模式。

## 核心特性

- **自动同步** —— 每次渲染都会将 `ref.current` 更新为最新值。
- **引用稳定** —— ref 对象本身永不变化，可安全用于依赖数组。
- **类型安全** —— 泛型签名保留包装值的类型。

## 使用注意

- 修改 `ref.current` **不会**触发重新渲染。
- 它是本库 `useRefFunction` 的底层实现。
- 适用于在长期存活的回调中读取最新值，而无需将其加入依赖数组。
