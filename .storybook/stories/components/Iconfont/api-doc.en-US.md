## API

**Factory API**

| Parameter            | Type     | Default | Description                                                                       |
| -------------------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `scriptUrl`          | `string` | -       | iconfont script URL generated from iconfont.cn                                    |
| `options.iconPrefix` | `string` | `''`    | Prefix automatically prepended to `type` unless it already starts with the prefix |

**Component props**

| Prop     | Type                        | Default | Description                                          |
| -------- | --------------------------- | ------- | ---------------------------------------------------- |
| `type`   | `T`                         | -       | Icon name. Find it in iconfont and click `Copy Code` |
| `size`   | `CSSProperties['fontSize']` | -       | Alias of `style.fontSize`                            |
| `spin`   | `boolean`                   | `false` | Whether the icon spins continuously                  |
| `rotate` | `number`                    | `0`     | Fixed clockwise rotation angle                       |
