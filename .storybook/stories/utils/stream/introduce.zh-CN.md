`StreamTimeSlicerClass` 将输入的 PCM 音频流按固定条件切分为片段。向其中推入多声道帧后，它会累积采样，直到达到配置的阈值（按时间毫秒或按采样总数），然后调用 `onSlice`，传入合并后的 `Float32Array[]` 与该片段实际时长。它适用于音频数据以小分片到达、下游阶段（语音识别、音频分析或网络上传）需要合并片段的场景。

## 适用场景

- 以小分片接收音频帧（例如来自 `getUserMedia`、WebSocket 或 `ReadableStream`），需要将其合并为固定片段。
- 需要按经过时间（`sliceMode: 'time'`）或按累计采样数（`sliceMode: 'size'`）切片。
- 需要在会话结束时用 `flush()` 强制输出当前累积的不足片段。
- 需要清空累积且不输出任何内容（`reset()`）。

## 核心特性

- **两种切片模式** — `'time'` 按毫秒切片；`'size'` 按累计采样总数切片。
- **多声道感知** — 每帧是 `Float32Array` 数组（每声道一个）；切片保留声道结构。
- **合并输出** — 触发 `onSlice` 前，各声道累积的分片会拼接为单个 `Float32Array`。
- **立即模式** — 当 `value <= 0` 时，每次 `push()` 立即输出一个切片。
- **按需控制** — `flush()` 强制输出当前累积；`reset()` 清空缓存不输出；`duration()` 报告已累积时长。

## 示例代码

```ts
import { StreamTimeSlicerClass } from '@tiny-codes/react-easy';

const slicer = new StreamTimeSlicerClass({
  sliceMode: 'size',
  value: 2048, // 每声道累计 2048 个采样时输出
  onSlice: (channels, sliceDurationMs) => {
    // channels: Float32Array[] — 每声道一个合并后的数组
    // sliceDurationMs: number — 该切片的实际时长
    sendToServer(channels, sliceDurationMs);
  },
});

// 在每次来自 getUserMedia / WebSocket / 流的音频帧上：
function onAudioFrame(frame: Float32Array[]) {
  slicer.push(frame);
}

// 会话结束时，强制输出剩余数据：
slicer.flush();
```

## 使用注意

- `sliceMode: 'time'` 比较的是当前切片首次 `push()` 以来 `performance.now()` 的经过时间；`'size'` 比较累计采样数。
- `value <= 0` 为立即输出模式：每次 `push()` 都会立刻输出一个切片。
- `flush()` 在未达阈值时也会输出，并清空累积；`reset()` 清空但不输出。
- 传给 `onSlice` 的切片时长是从该切片首次 `push()` 到输出时刻的毫秒数。
- 帧是完整单元：单帧大于剩余额度时会整体保留，待下一帧一起在超阈值时输出。
