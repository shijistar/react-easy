## API

Extends Ant Design `SpinProps` and adds:

| Prop            | Description                                                                                                                | Type                   | Default  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------- |
| `mode`          | Positioning of the standalone animation. `absolute` centers via absolute positioning; `flex` fills the parent with flexbox | `'absolute' \| 'flex'` | `'flex'` |
| `rootClassName` | Class name for the mask parent container (standalone mode)                                                                 | `string`               | -        |
| `rootStyle`     | Style for the mask parent container (standalone mode)                                                                      | `CSSProperties`        | -        |

## 说明

独立使用时组件会撑满父容器，因此父容器应为 `position: relative`（或具备确定尺寸）才能正确布局。
