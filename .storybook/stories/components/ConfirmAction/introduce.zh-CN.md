对触发器组件进行封装，在真正执行操作前弹出确认对话框，可切换 Button、Switch、Link 三种触发方式。

## 适用场景

当用户操作具有破坏性、不可逆，或值得"再确认一次"时——删除记录、重置配置、提交付费订单等——都应使用 `ConfirmAction`。它将确认框绑定到触发器，只有在用户明确确认后才会真正执行操作。

## 核心特性

- **触发器无关** —— 通过 `triggerComponent` + `triggerProps` 将任意组件作为触发器（`Button`、`Switch`、`Link` 或自定义组件），并用 `triggerEvent` 选择触发对话框的事件。
- **双向确认流程** —— `onOk` 执行真正的操作且可异步；`afterOk` 仅在 `onOk` 成功 resolve 后触发，适合做后续跳转或状态刷新。
- **危险模式** —— `danger`（`DeleteConfirmAction` 默认为 `true`）会将标题、图标与确认按钮染红；`titleColor` / `contentColor` / `iconColor` 可微调配色并覆盖危险样式。
- **命令式打开** —— 通过 ref 调用 `show(props?)` 以命令式打开对话框，例如来自表格行的处理函数。
- **全局默认值** —— 默认标题/内容等可通过 `ConfigProvider` 统一注入，无需在每个实例重复。
- **继承 antd** —— antd 的 `ModalFuncProps`（title、content、okText、cancelText、okButtonProps 等）均可使用。

## 示例代码

```tsx
import { ConfirmAction } from '@tiny-codes/react-easy';

export function DangerZone() {
  return (
    <ConfirmAction.Button
      title="确定执行？"
      content="该操作无法撤销。"
      danger
      onOk={async () => {
        await api.remove();
      }}
    >
      删除项目
    </ConfirmAction.Button>
  );
}
```

## 使用注意

- `onBeforeOpen` 返回（或 reject）值会阻止对话框打开，可用于权限或前置条件校验。
- 当 `onOk` 返回 Promise 时，确认按钮会自动进入加载态直到其完成；`onOk` 抛错会中断流程，`afterOk` 不会执行。
- `afterOk` 是成功回调——不要把实际操作逻辑放在这里，逻辑应写在 `onOk` 中。
- 对话框默认标题/内容取自 `ConfigProvider`（`defaultConfirmTitle` / `defaultConfirmContent`），除非在实例上覆盖。
