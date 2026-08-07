## API

### 参数 —— UseSplitterProps

| 参数            | 说明                                                 | 类型                                                     | 默认值       |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------ |
| `direction`     | 分割方向；`vertical` 表示左右，`horizontal` 表示上下 | `'vertical' \| 'horizontal'`                             | `'vertical'` |
| `container`     | 父容器元素；不指定时自动使用 `dom` 元素的父容器      | `HTMLDivElement \| null \| undefined`                    | -            |
| `defaultRatio`  | 左侧/上方面板的默认比例（0~1）                       | `number`                                                 | `0.32`       |
| `minRatio`      | 左侧/上方面板的最小比例（0~1）                       | `number`                                                 | `0.15`       |
| `maxRatio`      | 左侧/上方面板的最大比例（0~1）                       | `number`                                                 | `0.85`       |
| `splitterWidth` | 分割条的宽度（像素）                                 | `number`                                                 | `1`          |
| `className`     | 分割条元素的额外类名                                 | `string`                                                 | -            |
| `style`         | 分割条元素的额外样式                                 | `CSSProperties`                                          | -            |
| `prefixCls`     | 自定义 CSS 类前缀                                    | `string`                                                 | -            |
| `classNames`    | 语义化类名（`hover` / `dragging` / `handle`）        | `{ hover?: string; dragging?: string; handle?: string }` | -            |
| `styles`        | 语义化样式（`handle`）                               | `{ handle?: CSSProperties }`                             | -            |
| `onChange`      | 分割比例变化时的回调                                 | `(ratio?: number) => void`                               | -            |

### 返回值

| 成员        | 说明                           | 签名                         |
| ----------- | ------------------------------ | ---------------------------- |
| `dom`       | 放置在两个面板之间的分割条元素 | `ReactElement`               |
| `percent`   | 左侧/上方面板的当前比例（0~1） | `number \| undefined`        |
| `width`     | 左侧/上方面板的当前像素宽度    | `number \| undefined`        |
| `dragging`  | 分割条是否正在拖动             | `boolean`                    |
| `direction` | 当前分割方向                   | `'vertical' \| 'horizontal'` |
