`AudioPlayer` 是一个无 UI 的音频播放类，支持 URL 或流式数据输入。它只提供编程接口——播放、暂停、停止、跳转与音量控制——你可以基于它构建自己的播放器界面，或纯粹用逻辑驱动音频播放。它支持三种数据源：URL 字符串、原始二进制数据（`ArrayBuffer` / `Uint8Array` / `Blob`），或 `ReadableStreamDefaultReader`（数据到达时逐步写入 `MediaSource`，实现边下边播）。

## 适用场景

- 需要一个无界面的音频引擎，并希望完全自定义播放器 UI。
- 通过流式接口接收音频（如 WebSocket 分片或 fetch 响应体 reader），希望在完整文件下载前就开始播放。
- 需要通过 Web Audio API 进行更平滑的音量增益控制。
- 希望完全以编程方式驱动播放（自动播放、队列、AI 触发播放），不依赖 DOM 或 React 状态。

## 核心特性

- **多种数据源** — URL 字符串、`Blob`、`ArrayBuffer`、`Uint8Array` 或 `ReadableStreamDefaultReader`（支持渐进式播放）。
- **流式支持** — reader 分片写入 `MediaSource`/`SourceBuffer`；当 `MediaSource` 不可用时自动回退为一次性 `Blob` 缓冲。
- **完整播放控制** — `play()`、`pause()`、`stop()`、`seek()`、`seekForward()`、`seekBackward()`。
- **音量管理** — `setVolume()`、`volumeUp()`、`volumeDown()`，通过 `GainNode` 平滑调节。
- **生命周期回调** — 构造参数中的 `onPlay`、`onPause`、`onStop`、`onPlayEnd`、`onError`。
- **事件桥接** — `addEventListener` / `removeEventListener` 代理原生 `HTMLAudioElement` 事件。
- **资源释放** — `dispose()` 暂停播放、关闭 `AudioContext` 并释放数据源。

## 示例代码

```tsx
import { useEffect } from 'react';
import { AudioPlayer } from '@tiny-codes/react-easy';

function PlayerDemo({ url }: { url: string }) {
  useEffect(() => {
    const player = new AudioPlayer({
      source: url,
      volume: 0.6,
      onPlay: () => console.log('playing'),
      onPause: () => console.log('paused'),
      onError: (error) => console.error('playback error', error),
    });

    void player.play();
    return () => player.dispose();
  }, [url]);

  return null; // AudioPlayer 不渲染任何 UI，请以编程方式控制
}
```

## 使用注意

- `AudioPlayer` 不渲染任何界面——它只是编程接口。请自行构建 UI 或用逻辑控制。
- URL 数据源必须支持跨域访问，否则可能没有声音。
- 默认音量为 `0.5`；`setVolume` 会将值限制在 `[0, 1]`。
- 当数据源为流 reader 时，浏览器必须支持 `MediaSource` 且 MIME 类型可用；否则播放器会回退为先把整个流缓冲成 `Blob` 再播放。
- 不再需要播放器时请调用 `dispose()`，以释放 `AudioContext` 与事件监听器。
