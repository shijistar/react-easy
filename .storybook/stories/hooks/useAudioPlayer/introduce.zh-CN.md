提供稳定的 `AudioPlayer` 类实例用于控制音频播放，无任何 UI。实例在组件挂载期间只创建一次并在渲染间复用，因此可以直接在事件处理器中调用命令式方法（`play`、`pause`、`seek`、`setVolume` 等），无需反复重建播放器。

## 适用场景

- 基于无头音频引擎自建播放器 UI（按钮、滑块、进度条）。
- 播放流式数据源（`ReadableStreamDefaultReader<Uint8Array>`）、`ArrayBuffer`、`Uint8Array` 或 `Blob`，而不只是 URL。
- 需要 Web Audio gain 音量控制、精细 seek 或音频事件监听的场景。

## 核心特性

- **实例稳定** —— 播放器在组件生命周期内复用，卸载时自动 dispose。
- **多种数据源** —— URL 字符串或流式数据（`ReadableStreamDefaultReader`、`ArrayBuffer`、`Uint8Array`、`Blob`），也支持惰性工厂函数。
- **完整播放控制** —— `play` / `pause` / `stop` / `seek` / `seekForward` / `seekBackward` / `setAudioSource`。
- **音量管理** —— `setVolume` / `volumeUp` / `volumeDown`，可用时基于 Web Audio `GainNode`。
- **事件钩子** —— `addEventListener` / `removeEventListener` 委托给底层 `HTMLAudioElement`。

## 使用注意

- 若音频源是 URL，需要音频源支持跨域访问，否则可能没有声音。
- 播放器通过 `useRef` 惰性创建并在清理 effect 中释放；更换 `source` prop 不会重建实例，需调用 `setAudioSource()`。
- 流式源底层使用 `MediaSource`；不支持时会退化为一次性 `Blob` 缓冲播放。
- 音量被限制在 `[0, 1]`，默认初始音量为 `0.5`。
