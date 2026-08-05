## API

### 参数 —— UseMovableProps

| 参数              | 说明                                                   | 类型                     | 默认值 |
| ----------------- | ------------------------------------------------------ | ------------------------ | ------ |
| `enabled`         | 是否启用拖动                                           | `boolean`                | `true` |
| `containerRef`    | 容器元素的 ref                                         | `RefObject<HTMLElement>` | -      |
| `ignoreSelectors` | 不应触发拖动的元素选择器（如交互控件）                 | `string[]`               | -      |
| `storageKey`      | 用于在 `localStorage` 中存储位置的 key；省略则不持久化 | `string`                 | -      |

### 返回值

| 成员            | 说明                             | 签名                                              |
| --------------- | -------------------------------- | ------------------------------------------------- |
| `onPointerDown` | 按下事件处理器；绑定到可拖拽元素 | `(e: React.PointerEvent<HTMLDivElement>) => void` |
| `position`      | 当前位置 `{ left, top }`（像素） | `MovePosition \| undefined`                       |

### 类型

`MovePosition = { left: number; top: number }`
