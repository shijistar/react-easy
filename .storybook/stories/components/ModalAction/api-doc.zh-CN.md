## API

`ModalActionProps<FormData, P, TriggerProp, Event, Ref>` 继承 antd `ModalProps`（去掉 `onOk`）并附加触发器定义。它渲染一个承载你表单组件的弹窗。主要属性如下。

| 属性               | 说明                                                                     | 类型                                                 | 默认值      |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------- | ----------- |
| `formComp`         | 你的表单组件；父组件创建 `Form` 实例并注入 `form` 与保存处理函数。       | `ComponentType<P & RefAttributes<Ref>>`              | -           |
| `formProps`        | 传给 `formComp` 的属性（不含自动注入的表单契约）。                       | `Omit<P, keyof FormCompPropsConstraint<FormData>>`   | -           |
| `triggerComponent` | 用作触发器、点击后打开弹窗的组件。                                       | `ComponentType<TriggerProp>`                         | `Button`    |
| `triggerProps`     | 传给触发器组件的属性。                                                   | `TriggerProp`                                        | -           |
| `triggerEvent`     | 触发器上打开弹窗的事件。                                                 | `keyof TriggerProp`                                  | `'onClick'` |
| `onOk`             | 确认时以 `formData` 调用；返回 `SubmitWithoutClosingSymbol` 可保持打开。 | `(formData, ...args) => unknown \| Promise<unknown>` | -           |
| `afterOk`          | `onOk` 成功后调用，接收其返回值。                                        | `(data?) => void`                                    | -           |
| `onBeforeOpen`     | 打开前执行；抛错或 reject 会阻止弹窗。                                   | `() => Promise<unknown> \| unknown`                  | -           |

> 继承全部 antd `ModalProps`（title、width、okText、open、`modalRender` 等）。表单组件通过 `FormCompPropsConstraint` 接收 `form`、`onSave`、`onOpenChange`。
