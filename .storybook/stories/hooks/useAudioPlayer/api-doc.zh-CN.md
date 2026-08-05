## API

### 参数 —— AudioPlayerInit

| 参数          | 说明                                             | 类型                                                         | 默认值 |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------ | ------ |
| `source`      | 音频源（URL 或流数据），也可传入惰性工厂函数     | `AudioSource \| (() => AudioSource \| Promise<AudioSource>)` | -      |
| `mimeType`    | 音频的 MIME 类型（如 `audio/mpeg`、`audio/wav`） | `string`                                                     | -      |
| `volume`      | 初始音量（0-1）                                  | `number`                                                     | `0.5`  |
| `crossOrigin` | 音频元素的跨域设置                               | `HTMLMediaElement['crossOrigin']`                            | -      |
| `onPlay`      | 音频开始播放时的回调                             | `() => void`                                                 | -      |
| `onPause`     | 音频暂停时的回调                                 | `() => void`                                                 | -      |
| `onStop`      | 音频停止时的回调                                 | `() => void`                                                 | -      |
| `onPlayEnd`   | 音频播放结束时的回调                             | `() => void`                                                 | -      |
| `onError`     | 发生错误时的回调                                 | `(error: any) => void`                                       | -      |

### 返回值 —— AudioPlayer 实例

| 方法                  | 说明                                            | 签名                                                             |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `isPlaying`           | 音频是否正在播放（getter）                      | `boolean`                                                        |
| `currentTime`         | 当前播放时间（秒，getter）                      | `number`                                                         |
| `duration`            | 音频总时长（秒，getter）                        | `number`                                                         |
| `volume`              | 当前音量值 0-1（getter）                        | `number`                                                         |
| `play`                | 播放音频；暂停后从暂停位置继续                  | `() => Promise<void>`                                            |
| `pause`               | 暂停播放；再次播放时从当前位置继续              | `() => void`                                                     |
| `stop`                | 停止播放；进度重置到开始位置                    | `() => void`                                                     |
| `seek`                | 设置当前播放时间（秒）                          | `(time: number) => void`                                         |
| `seekForward`         | 向前跳转一定秒数                                | `(seconds: number) => void`                                      |
| `seekBackward`        | 向后跳转一定秒数                                | `(seconds: number) => void`                                      |
| `setAudioSource`      | 更新音频源（URL 或流数据）                      | `(source?: AudioSource) => Promise<{ stopLoading: () => void }>` |
| `volumeUp`            | 增加音量（每次默认 10%）                        | `(percent?: number) => void`                                     |
| `volumeDown`          | 降低音量（每次默认 10%）                        | `(percent?: number) => void`                                     |
| `setVolume`           | 将音量设置为特定值（0-1）                       | `(value: number) => void`                                        |
| `addEventListener`    | 添加音频事件监听器（委托给 `HTMLAudioElement`） | `HTMLAudioElement['addEventListener']`                           |
| `removeEventListener` | 移除音频事件监听器                              | `HTMLAudioElement['removeEventListener']`                        |
| `dispose`             | 释放资源（暂停、清空源、关闭 `AudioContext`）   | `() => void`                                                     |

> `AudioSource = string \| ReadableStreamDefaultReader<Uint8Array> \| ArrayBuffer \| Uint8Array \| Blob`
