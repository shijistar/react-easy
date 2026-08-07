## API

### Props — UseUserMediaProps

| Name                      | Description                                                | Type                                                                               | (Default) |
| ------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------- |
| `media`                   | Media constraints for the audio and video stream           | `Pick<MediaStreamConstraints, 'audio' \| 'video'>`                                 | -         |
| `pcmAudioOptions`         | Audio context / worklet options for PCM output             | `{ audioContext?: AudioContextOptions; workletOptions?: AudioWorkletNodeOptions }` | -         |
| `onStartRecording`        | Callback when recording starts; provides the media stream  | `(stream: MediaStream) => void`                                                    | -         |
| `onStopRecording`         | Callback when recording stops                              | `() => void`                                                                       | -         |
| `onStreamChunk`           | Callback per media chunk (MIME: `audio/webm;codecs=opus`)  | `(chunk: Blob) => void`                                                            | -         |
| `onPcmStreamChunk`        | Callback with raw PCM float data per render quantum        | `(channels: Float32Array[], sampleRate: number) => void`                           | -         |
| `disabled`                | Whether to disable this hook                               | `boolean`                                                                          | -         |
| `streamSliceMode`         | Slicing mode (`time` or `size`)                            | `StreamTimeSlicerOptions['sliceMode']`                                             | `'time'`  |
| `streamSliceValue`        | Slicing value (ms or bytes)                                | `StreamTimeSlicerOptions['value']`                                                 | -         |
| `soundDetectionThreshold` | Silence detection threshold (0~1)                          | `number`                                                                           | `0`       |
| `soundDetectionTimeout`   | Silence timeout in ms before prompting device re-selection | `number`                                                                           | `3000`    |

### Return — UseUserMediaResult

| Member           | Description                                          | Signature                      |
| ---------------- | ---------------------------------------------------- | ------------------------------ |
| `isRecording`    | Whether the media stream is currently being recorded | `boolean`                      |
| `startRecording` | Start recording; resolves with the `MediaRecorder`   | `() => Promise<MediaRecorder>` |
| `stopRecording`  | Stop recording and release tracks                    | `() => void`                   |
| `mediaStream`    | The stream being recorded, if recording              | `MediaStream \| undefined`     |
