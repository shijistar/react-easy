- **EN:** `createIconfont` is a factory that turns an iconfont script URL into a ready-to-use icon component. It wraps Ant Design's `createFromIconfontCN` and adds an `iconPrefix` option plus a `size` alias for `style.fontSize`.

**Factory API**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `scriptUrl` | `string` | - | iconfont script URL generated from iconfont.cn |
| `options.iconPrefix` | `string` | `''` | Prefix automatically prepended to `type` unless it already starts with the prefix |

**Component props**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `T` | - | Icon name. Find it in iconfont and click `Copy Code` |
| `size` | `CSSProperties['fontSize']` | - | Alias of `style.fontSize` |
| `spin` | `boolean` | `false` | Whether the icon spins continuously |
| `rotate` | `number` | `0` | Fixed clockwise rotation angle |

- **CN:** `createIconfont` 是一个工厂函数：传入 iconfont 脚本地址，返回一个可直接使用的图标组件。它封装了 Ant Design 的 `createFromIconfontCN`，额外提供 `iconPrefix` 选项与 `size`（`style.fontSize` 的别名）属性。

**工厂 API**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `scriptUrl` | `string` | - | 在 iconfont.cn 上生成的脚本地址 |
| `options.iconPrefix` | `string` | `''` | 自动拼接到 `type` 的前缀，若 `type` 已包含该前缀则不再拼接 |

**组件 props**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `T` | - | 图标名称。在 iconfont 中找到某个图标，点击`复制代码` |
| `size` | `CSSProperties['fontSize']` | - | `style.fontSize` 的别名 |
| `spin` | `boolean` | `false` | 图标是否持续旋转 |
| `rotate` | `number` | `0` | 图标顺时针旋转一个固定角度 |
