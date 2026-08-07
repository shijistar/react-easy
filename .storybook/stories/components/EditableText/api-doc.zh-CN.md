## API

`EditableTextProps<V, TT, IT>` 扩展自 `EditableFormProps<V, IT>`（后者携带 `value`、`required`、`textComp`、`onOk`、`afterOk` 及渲染钩子）。主要属性如下。

| 属性              | 说明                                                                  | 类型                                                | 默认值   |
| ----------------- | --------------------------------------------------------------------- | --------------------------------------------------- | -------- |
| `value`           | 组件当前展示和编辑的文本值。                                          | `V`                                                 | -        |
| `editable`        | 是否显示编辑入口。设为 `false` 可禁用编辑。                           | `boolean`                                           | `true`   |
| `editing`         | 外部受控地将组件切换到编辑状态。                                      | `boolean`                                           | `false`  |
| `required`        | 在确认修改时将输入视为必填。                                          | `boolean`                                           | `false`  |
| `textComp`        | 只读文本态所使用的排版组件类型（`Text`/`Paragraph`/`Title`/`Link`）。 | `'Text' \| 'Paragraph' \| 'Title' \| 'Link'`        | `'Text'` |
| `displayText`     | 自定义只读文本，替代 `value` 的展示。                                 | `boolean \| ReactNode \| ((value: V) => ReactNode)` | `true`   |
| `block`           | 只读/编辑态是否显示为块级（整行宽度）。                               | `boolean \| { view?: boolean; editing?: boolean }`  | `false`  |
| `onChange`        | 在 `onOk` 保存成功后，以新值调用。                                    | `(value: V \| undefined) => void`                   | -        |
| `onEditingChange` | 编辑状态改变时调用。                                                  | `(editing: boolean) => void`                        | -        |

> `renderView` / `renderEdit` / `renderInput`（来自 `EditableFormProps`）可定制各阶段；`className` / `style` / `classNames` 用于样式定制。
