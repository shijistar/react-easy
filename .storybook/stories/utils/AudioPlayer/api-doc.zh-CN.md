## API

### 类：`AudioPlayer`

| 成员                  | 描述                                           | 签名                                                                                     |
| --------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `constructor`         | 创建音频播放器实例                             | `new AudioPlayer(options?: AudioPlayerInit): AudioPlayer`                                |
| `isPlaying`           | 检查音频是否正在播放                           | `get isPlaying: boolean`                                                                 |
| `currentTime`         | 获取当前播放时间(秒)                           | `get currentTime: number`                                                                |
| `duration`            | 获取音频总时长(秒)                             | `get duration: number`                                                                   |
| `volume`              | 获取当前音量值(0-1)                            | `get volume: number`                                                                     |
| `play`                | 播放音频；如果之前暂停过，将从暂停位置继续播放 | `play(): Promise<void>`                                                                  |
| `pause`               | 暂停音频播放；再次播放时将从当前位置继续       | `pause(): void`                                                                          |
| `stop`                | 停止音频播放；进度会重置到开始位置             | `stop(): void`                                                                           |
| `seek`                | 设置当前播放时间（以秒为单位）                 | `seek(time: number): void`                                                               |
| `seekForward`         | 向前跳转一定秒数                               | `seekForward(seconds: number): void`                                                     |
| `seekBackward`        | 向后跳转一定秒数                               | `seekBackward(seconds: number): void`                                                    |
| `setAudioSource`      | 更新音频源（URL 或流数据）                     | `setAudioSource(source?: AudioSource): Promise<{ stopLoading: () => void }>`             |
| `setVolume`           | 将音量设置为特定值（0-1）                      | `setVolume(value: number): void`                                                         |
| `volumeUp`            | 增加音量（每次默认增加10%）                    | `volumeUp(percent?: number): void`                                                       |
| `volumeDown`          | 降低音量（每次默认降低10%）                    | `volumeDown(percent?: number): void`                                                     |
| `addEventListener`    | 添加音频事件监听器                             | `addEventListener(event: string, listener: EventListenerOrEventListenerObject): void`    |
| `removeEventListener` | 移除音频事件监听器                             | `removeEventListener(event: string, listener: EventListenerOrEventListenerObject): void` |
| `dispose`             | 释放资源（暂停、关闭 AudioContext、移除监听）  | `dispose(): void`                                                                        |

### 类型：`AudioSource`

| 名称   | 描述                            | 类型                                                                                     |
| ------ | ------------------------------- | ---------------------------------------------------------------------------------------- |
| (联合) | URL 字符串或流式/二进制音频数据 | `string \| ReadableStreamDefaultReader<Uint8Array> \| ArrayBuffer \| Uint8Array \| Blob` |

### 接口：`AudioPlayerInit`

| 名称          | 描述                                              | 类型                                                         | (默认值) |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------ | -------- |
| `source`      | 音频源（URL或流数据）；可以是惰性 getter          | `AudioSource \| (() => AudioSource \| Promise<AudioSource>)` | -        |
| `mimeType`    | 音频的MIME类型（例如，`audio/mpeg`，`audio/wav`） | `string`                                                     | -        |
| `volume`      | 初始音量级别（0-1）                               | `number`                                                     | `0.5`    |
| `crossOrigin` | 音频元素的跨域设置                                | `HTMLMediaElement['crossOrigin']`                            | -        |
| `onPlay`      | 音频开始播放时的回调                              | `() => void`                                                 | -        |
| `onPause`     | 音频暂停时的回调                                  | `() => void`                                                 | -        |
| `onStop`      | 音频停止时的回调                                  | `() => void`                                                 | -        |
| `onPlayEnd`   | 音频播放结束时的回调                              | `() => void`                                                 | -        |
| `onError`     | 发生错误时的回调                                  | `(error: any) => void`                                       | -        |
