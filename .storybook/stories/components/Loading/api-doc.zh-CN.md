## API

Extends Ant Design `SpinProps` and adds:

| Prop            | Type                   | Default  | Description                                                                                                                |
| --------------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `mode`          | `'absolute' \| 'flex'` | `'flex'` | Positioning of the standalone animation. `absolute` centers via absolute positioning; `flex` fills the parent with flexbox |
| `rootClassName` | `string`               | -        | Class name for the mask parent container (standalone mode)                                                                 |
| `rootStyle`     | `CSSProperties`        | -        | Style for the mask parent container (standalone mode)                                                                      |

## 说明

独立使用时组件会撑满父容器，因此父容器应为 `position: relative`（或具备确定尺寸）才能正确布局。
