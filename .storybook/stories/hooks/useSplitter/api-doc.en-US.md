## API

### Props — UseSplitterProps

| Name            | Description                                                         | Type                                                     | (Default)    |
| --------------- | ------------------------------------------------------------------- | -------------------------------------------------------- | ------------ |
| `direction`     | Split direction; `vertical` = left/right, `horizontal` = top/bottom | `'vertical' \| 'horizontal'`                             | `'vertical'` |
| `container`     | Parent container element; defaults to the `dom` element's parent    | `HTMLDivElement \| null \| undefined`                    | -            |
| `defaultRatio`  | Default ratio of the left/top pane (0~1)                            | `number`                                                 | `0.32`       |
| `minRatio`      | Minimum ratio of the left/top pane (0~1)                            | `number`                                                 | `0.15`       |
| `maxRatio`      | Maximum ratio of the left/top pane (0~1)                            | `number`                                                 | `0.85`       |
| `splitterWidth` | Width of the splitter in pixels                                     | `number`                                                 | `1`          |
| `className`     | Additional class name for the splitter element                      | `string`                                                 | -            |
| `style`         | Additional style for the splitter element                           | `CSSProperties`                                          | -            |
| `prefixCls`     | Custom CSS class prefix                                             | `string`                                                 | -            |
| `classNames`    | Semantic class names (`hover` / `dragging` / `handle`)              | `{ hover?: string; dragging?: string; handle?: string }` | -            |
| `styles`        | Semantic styles (`handle`)                                          | `{ handle?: CSSProperties }`                             | -            |
| `onChange`      | Callback when the splitter ratio changes                            | `(ratio?: number) => void`                               | -            |

### Return

| Member      | Description                                     | Signature                    |
| ----------- | ----------------------------------------------- | ---------------------------- |
| `dom`       | The splitter element to place between the panes | `ReactElement`               |
| `percent`   | Current ratio of the left/top pane (0~1)        | `number \| undefined`        |
| `width`     | Current pixel width of the left/top pane        | `number \| undefined`        |
| `dragging`  | Whether the splitter is being dragged           | `boolean`                    |
| `direction` | The active split direction                      | `'vertical' \| 'horizontal'` |
