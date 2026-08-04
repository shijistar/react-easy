## API

**Factory API**

| Parameter            | Description                                                                       | Type     | Default |
| -------------------- | --------------------------------------------------------------------------------- | -------- | ------- |
| `scriptUrl`          | iconfont script URL generated from iconfont.cn                                    | `string` | -       |
| `options.iconPrefix` | Prefix automatically prepended to `type` unless it already starts with the prefix | `string` | `''`    |

**Component props**

| Prop     | Description                                          | Type                        | Default |
| -------- | ---------------------------------------------------- | --------------------------- | ------- |
| `type`   | Icon name. Find it in iconfont and click `Copy Code` | `T`                         | -       |
| `size`   | Alias of `style.fontSize`                            | `CSSProperties['fontSize']` | -       |
| `spin`   | Whether the icon spins continuously                  | `boolean`                   | `false` |
| `rotate` | Fixed clockwise rotation angle                       | `number`                    | `0`     |
