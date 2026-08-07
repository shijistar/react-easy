## API

### Functions

| Function            | Description                               | Signature                   |
| ------------------- | ----------------------------------------- | --------------------------- |
| `getColorLuminance` | Compute the relative luminance of a color | `(color: string) => number` |

### getColorLuminance(color)

| Name    | Description                                                 | Type     | (Default) |
| ------- | ----------------------------------------------------------- | -------- | --------- |
| `color` | Color string in `#rgb`, `#rrggbb`, or `rgb(r, g, b)` format | `string` | -         |

### Return

| Member   | Description                                                                                     | Signature |
| -------- | ----------------------------------------------------------------------------------------------- | --------- |
| (result) | WCAG relative luminance in the range `(0, 1)` — below `0.5` is dark, at or above `0.5` is light | `number`  |
