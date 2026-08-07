通过 `getUserMedia` 录制用户的**音视频媒体流**，并用 `MediaRecorder` 封装。hook 处理权限提示、分片回调、可选的 PCM 音频采集，以及静音检测回退（检测到长时间静音时引导用户重新选择音频设备）。

## 适用场景

- 在浏览器中录制麦克风音频或摄像头视频。
- 录制过程中通过 `onStreamChunk` 将分片上传到服务端。
- 通过 `onPcmStreamChunk` 采集原始 PCM 音频数据，用于语音或音频处理。

## 核心特性

- **完整录制生命周期** —— `startRecording()` / `stopRecording()` 管理媒体流与录制器。
- **分片回调** —— `onStreamChunk` 按时间/大小分片返回 `Blob`（MIME：`audio/webm;codecs=opus`）。
- **PCM 采集** —— 基于 AudioWorklet 的可选 PCM 输出，通过 `onPcmStreamChunk` 回调。
- **权限处理** —— 识别 denied/prompt 状态，弹出带设备重置指引的引导弹窗。
- **静音检测** —— 在 `soundDetectionTimeout` 内未检测到声音时，提示用户重新选择麦克风。

## 示例代码

```tsx
import { useUserMedia } from '@tiny-codes/react-easy';

export function Recorder() {
  const { isRecording, startRecording, stopRecording } = useUserMedia({
    media: { audio: true, video: false },
    onStreamChunk: (chunk) => uploadChunk(chunk),
  });

  return (
    <>
      <button onClick={() => startRecording()} disabled={isRecording}>
        录制
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        停止
      </button>
    </>
  );
}
```

## 使用注意

- 依赖 `navigator.mediaDevices.getUserMedia` 与 `navigator.permissions.query`；不支持的浏览器会抛出可读错误。
- `streamSliceMode` 为 `time`（毫秒）或 `size`（字节），会传给 `MediaRecorder.start`。
- `soundDetectionThreshold`（0~1，默认 `0`）为静音判定的 RMS 阈值。
- 卸载时以及 `disabled` 变为 `true` 时会自动停止录制。
