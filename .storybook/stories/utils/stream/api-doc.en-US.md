## API

### Class: `StreamTimeSlicerClass`

| Member        | Description                                                          | Signature                                                                            |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `constructor` | Create a stream time slicer                                          | `new StreamTimeSlicerClass(options: StreamTimeSlicerOptions): StreamTimeSlicerClass` |
| `sliceMode`   | Mode of slicing (`'time'` by milliseconds, `'size'` by sample count) | `StreamTimeSlicerOptions['sliceMode']`                                               |
| `value`       | Value for slicing (ms or bytes)                                      | `StreamTimeSlicerOptions['value']`                                                   |
| `push`        | Push a frame (multi-channel data from the same callback)             | `push(channels: Float32Array[]): void`                                               |
| `flush`       | Force output the current accumulation (even if below the threshold)  | `flush(): void`                                                                      |
| `reset`       | Clear the cache (do not output)                                      | `reset(): void`                                                                      |
| `duration`    | Get accumulated duration from start to current (ms)                  | `duration(): number`                                                                 |

### Interface: `StreamTimeSlicerOptions`

| Name        | Description                                                          | Type                                                        | (Default) |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------------------- | --------- |
| `sliceMode` | Mode of slicing: `'time'` (by time, ms) or `'size'` (by size, bytes) | `'time' \| 'size'`                                          | -         |
| `value`     | Value for slicing (ms or bytes); `<= 0` means immediate output       | `number`                                                    | -         |
| `onSlice`   | Callback when a slice is reached                                     | `(channels: Float32Array[], sliceDuration: number) => void` | -         |

### Interface: `StreamTimeSlicer`

| Member      | Description                                                       | Signature                            |
| ----------- | ----------------------------------------------------------------- | ------------------------------------ |
| `sliceMode` | Mode of slicing (read-only)                                       | `'time' \| 'size'`                   |
| `value`     | Value for slicing (ms or bytes)                                   | `number`                             |
| `push`      | Push a frame (multi-channel data from the same callback)          | `(channels: Float32Array[]) => void` |
| `flush`     | Force output the current accumulation (output even if not enough) | `() => void`                         |
| `reset`     | Clear the cache (do not output)                                   | `() => void`                         |
| `duration`  | Get accumulated duration from start to current (ms)               | `() => number`                       |
