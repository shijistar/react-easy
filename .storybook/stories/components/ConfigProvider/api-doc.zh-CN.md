## API

`ConfigProvider` 扩展自 ReactEasy 上下文属性（`ReactEasyContextProps`），因此接受语言、默认确认/删除确认标题与内容、组件默认值等全局设置。以下属性为 Provider 外层包装所特有。

| 属性        | 说明                                                          | 类型                        | 默认值  |
| ----------- | ------------------------------------------------------------- | --------------------------- | ------- |
| `children`  | 被 Provider 包裹的子元素。                                    | `ReactNode`                 | -       |
| `lang`      | 当前界面语言（如 `en-US`、`zh-CN`）。修改即运行时切换国际化。 | `string`                    | `en-US` |
| `locales`   | 自定义本地化资源包；覆盖已有语言或注册新语言。                | `Partial<typeof localesEn>` | -       |
| `prefixCls` | 根元素的自定义 CSS 类前缀。                                   | `string`                    | -       |
| `className` | 根元素的类名。                                                | `string`                    | -       |
| `style`     | 根元素的内联样式。                                            | `CSSProperties`             | -       |

> 继承 `ReactEasyContextProps`（如 `defaultConfirmTitle`、`defaultConfirmContent`、`ConfirmAction`、`DeletionConfirmAction` 等）——完整集合见上下文定义。
