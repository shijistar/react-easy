可拖拽、可调整大小的边缘抽屉，可停靠在父容器的任意一侧。与模态框不同，它与父布局共存，可在内容之上保持打开。

## 适用场景

当需要一个常驻的侧边面板——筛选器、检查器、工具面板、聊天/助手——应贴附屏幕边缘、可被用户调整大小，且不像模态框那样遮挡底层内容时，使用 `FloatDrawer`。

## 核心特性

- **四边停靠** —— `position` 选择 `left` / `right` / `top` / `bottom`；`edgeOffset` 可将其从边缘微调。
- **可缩放与开合** —— `resizable` 允许用户拖动手柄；`showToggle` 显示展开/收起按钮。
- **尺寸约束** —— `defaultSize` / `minSize` / `maxSize` 限定尺寸（侧边抽屉为宽度，上下抽屉为高度）。
- **持久化** —— `cacheKey` 在 `localStorage` 中记忆尺寸。
- **继承 antd Card** —— 面板表面接受 `CardProps`，可配置 header/footer/extra。

## 使用注意

- 它相对父容器定位，因此父容器需为 `position: relative`（或非 static）才能正确摆放。
- `destroyOnClose` 控制关闭时是否卸载内部内容；保持 `false` 可保留状态。
- 完全收起时会隐藏到父边缘之外；若父容器有 padding/border，请调整 `edgeOffset` 使其完全收纳。
