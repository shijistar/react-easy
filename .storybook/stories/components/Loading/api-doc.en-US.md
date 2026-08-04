## API

Extends Ant Design `SpinProps` and adds:

| Prop            | Description                                                                                                                | Type                   | Default  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------- |
| `mode`          | Positioning of the standalone animation. `absolute` centers via absolute positioning; `flex` fills the parent with flexbox | `'absolute' \| 'flex'` | `'flex'` |
| `rootClassName` | Class name for the mask parent container (standalone mode)                                                                 | `string`               | -        |
| `rootStyle`     | Style for the mask parent container (standalone mode)                                                                      | `CSSProperties`        | -        |

## Notes

In standalone mode the component fills its parent, so the parent should be `position: relative` (or otherwise sized) for correct layout.
