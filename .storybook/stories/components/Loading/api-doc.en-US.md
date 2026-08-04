## API

Extends Ant Design `SpinProps` and adds:

| Prop            | Type                   | Default  | Description                                                                                                                |
| --------------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `mode`          | `'absolute' \| 'flex'` | `'flex'` | Positioning of the standalone animation. `absolute` centers via absolute positioning; `flex` fills the parent with flexbox |
| `rootClassName` | `string`               | -        | Class name for the mask parent container (standalone mode)                                                                 |
| `rootStyle`     | `CSSProperties`        | -        | Style for the mask parent container (standalone mode)                                                                      |

## Notes

In standalone mode the component fills its parent, so the parent should be `position: relative` (or otherwise sized) for correct layout.
