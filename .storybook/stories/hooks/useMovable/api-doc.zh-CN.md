## API

### 参数 —— UseMovableProps

| 参数              | 说明                                                   | 类型                               | 默认值 |
| ----------------- | ------------------------------------------------------ | ---------------------------------- | ------ |
| `enabled`         | 是否启用拖动                                           | `boolean`                          | `true` |
| `containerRef`    | 容器元素的 ref                                         | `RefObject<HTMLElement>`           | -      |
| `viewPortRef`     | 视口元素的 ref（仅在 `inContainer` 为 `true` 时使用）  | `RefObject<HTMLElement>`           | -      |
| `ignoreSelectors` | 不应触发拖动的元素选择器（如交互控件）                 | `string[]`                         | -      |
| `storageKey`      | 用于在 `localStorage` 中存储位置的 key；省略则不持久化 | `string`                           | -      |
| `onMove`          | 拖动事件回调函数；在拖动时触发，接收当前位置           | `(position: MovePosition) => void` | -      |

### 类型

`MovePosition = { left: number; top: number }`
