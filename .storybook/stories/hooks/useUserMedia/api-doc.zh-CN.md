## API

### 参数 —— UseUserMediaProps

| 参数                      | 说明                                               | 类型                                                                               | 默认值   |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| `media`                   | 媒体流的媒体约束                                   | `Pick<MediaStreamConstraints, 'audio' \| 'video'>`                                 | -        |
| `pcmAudioOptions`         | PCM 输出的音频上下文/工作线程选项                  | `{ audioContext?: AudioContextOptions; workletOptions?: AudioWorkletNodeOptions }` | -        |
| `onStartRecording`        | 开始录制时触发，提供媒体流                         | `(stream: MediaStream) => void`                                                    | -        |
| `onStopRecording`         | 停止录制时触发                                     | `() => void`                                                                       | -        |
| `onStreamChunk`           | 每个媒体分片回调（MIME：`audio/webm;codecs=opus`） | `(chunk: Blob) => void`                                                            | -        |
| `onPcmStreamChunk`        | 每个渲染量子返回原始 PCM 浮点数据                  | `(channels: Float32Array[], sampleRate: number) => void`                           | -        |
| `disabled`                | 是否禁用此工具                                     | `boolean`                                                                          | -        |
| `streamSliceMode`         | 切片模式（`time` 或 `size`）                       | `StreamTimeSlicerOptions['sliceMode']`                                             | `'time'` |
| `streamSliceValue`        | 切片值（毫秒或字节）                               | `StreamTimeSlicerOptions['value']`                                                 | -        |
| `soundDetectionThreshold` | 静音检测阈值（0~1）                                | `number`                                                                           | `0`      |
| `soundDetectionTimeout`   | 静音超时（毫秒），超时提示重新选择音频设备         | `number`                                                                           | `3000`   |

### 返回值 —— UseUserMediaResult

| 成员             | 说明                                     | 签名                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| `isRecording`    | 是否正在录制媒体流                       | `boolean`                      |
| `startRecording` | 开始录制；返回 `MediaRecorder` 实例      | `() => Promise<MediaRecorder>` |
| `stopRecording`  | 停止录制并释放轨道                       | `() => void`                   |
| `mediaStream`    | 正在录制的媒体流；未录制时为 `undefined` | `MediaStream \| undefined`     |
