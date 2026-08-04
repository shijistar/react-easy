轻量的脉冲柱状动画组件，适合音频活动态可视化或细微的加载反馈。它渲染一排高度按错峰波形起伏的柱子。

## 适用场景

当想用无文字的方式提示"某事物正在活动"时——录音/播放指示、实时数据流，或觉得 spinner 过重时的极简加载占位——使用 `PulseAnimation`。

## 核心特性

- **可配置柱条** —— `bars` 设置数量，`barGap` 设置间距，`barColor` 设置填充色。
- **错峰波形** —— `delayRate` 为每个柱子的动画添加偏移，使整体呈现行进的脉冲感。
- **节奏控制** —— `duration` 控制单周期时长（秒）。
- **主题化** —— `barStyle` 与 `token.AnimationPulse` token 可全局微调外观。
- **无依赖** —— 纯 CSS 动画，挂载大量实例也很廉价。

## 使用注意

- `bars`、`barGap`、`duration`、`delayRate` 均有合理默认值，裸 `<PulseAnimation />` 即可动起来。
- 需要自定义配色时，可在实例上设 `barColor`，或通过 `token.AnimationPulse` 全局统一配置。
- 组件通过 CSS grid 填满父容器宽度；请给父容器一个高度，否则柱子会塌陷。
