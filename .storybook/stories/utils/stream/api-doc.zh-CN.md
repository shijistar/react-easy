## API

### 类：`StreamTimeSlicerClass`

| 成员          | 描述                                        | 签名                                                                                 |
| ------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `constructor` | 创建数据流时间切片器                        | `new StreamTimeSlicerClass(options: StreamTimeSlicerOptions): StreamTimeSlicerClass` |
| `sliceMode`   | 切片模式（`'time'` 毫秒 / `'size'` 采样数） | `StreamTimeSlicerOptions['sliceMode']`                                               |
| `value`       | 切片值（毫秒或字节）                        | `StreamTimeSlicerOptions['value']`                                                   |
| `push`        | 推入一帧（同一次回调得到的多声道数据）      | `push(channels: Float32Array[]): void`                                               |
| `flush`       | 强制输出当前累积（不足阈值也输出）          | `flush(): void`                                                                      |
| `reset`       | 清空缓存（不输出）                          | `reset(): void`                                                                      |
| `duration`    | 获取从开始到当前已累计的时长(ms)            | `duration(): number`                                                                 |

### 接口：`StreamTimeSlicerOptions`

| 名称        | 描述                                                        | 类型                                                        | (默认值) |
| ----------- | ----------------------------------------------------------- | ----------------------------------------------------------- | -------- |
| `sliceMode` | 切片模式：`'time'`（按时间，ms）或 `'size'`（按大小，字节） | `'time' \| 'size'`                                          | -        |
| `value`     | 切片值（ms 或字节数）；`<= 0` 表示立即输出                  | `number`                                                    | -        |
| `onSlice`   | 达到分片时回调                                              | `(channels: Float32Array[], sliceDuration: number) => void` | -        |

### 接口：`StreamTimeSlicer`

| 成员        | 描述                                      | 签名                                 |
| ----------- | ----------------------------------------- | ------------------------------------ |
| `sliceMode` | 切片模式（只读）                          | `'time' \| 'size'`                   |
| `value`     | 切片值（ms 或字节数）                     | `number`                             |
| `push`      | 推入一帧（同一次回调得到的多通道数据）    | `(channels: Float32Array[]) => void` |
| `flush`     | 强制输出当前累积（不足 timeSlice 也输出） | `() => void`                         |
| `reset`     | 清空缓存（不输出）                        | `() => void`                         |
| `duration`  | 获取从开始到当前已累计的时长(ms)          | `() => number`                       |
