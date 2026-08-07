## API

### Options — AudioPlayerInit

| Name          | Description                                                                 | Type                                                         | Default |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ | ------- |
| `source`      | Audio source (URL or streaming data), optionally provided as a lazy factory | `AudioSource \| (() => AudioSource \| Promise<AudioSource>)` | -       |
| `mimeType`    | MIME type of the audio (e.g. `audio/mpeg`, `audio/wav`)                     | `string`                                                     | -       |
| `volume`      | Initial volume level (0-1)                                                  | `number`                                                     | `0.5`   |
| `crossOrigin` | Cross-origin setting for the audio element                                  | `HTMLMediaElement['crossOrigin']`                            | -       |
| `onPlay`      | Callback when audio starts playing                                          | `() => void`                                                 | -       |
| `onPause`     | Callback when audio is paused                                               | `() => void`                                                 | -       |
| `onStop`      | Callback when audio is stopped                                              | `() => void`                                                 | -       |
| `onPlayEnd`   | Callback when audio playback ends                                           | `() => void`                                                 | -       |
| `onError`     | Callback when an error occurs                                               | `(error: any) => void`                                       | -       |

### Return — AudioPlayer instance

| Method                | Description                                                   | Signature                                                        |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `isPlaying`           | Whether audio is currently playing (getter)                   | `boolean`                                                        |
| `currentTime`         | Current playback time in seconds (getter)                     | `number`                                                         |
| `duration`            | Total audio duration in seconds (getter)                      | `number`                                                         |
| `volume`              | Current volume value 0-1 (getter)                             | `number`                                                         |
| `play`                | Play audio; resumes from the pause position                   | `() => Promise<void>`                                            |
| `pause`               | Pause playback; resumes from the current position             | `() => void`                                                     |
| `stop`                | Stop playback; progress resets to the beginning               | `() => void`                                                     |
| `seek`                | Set current playback time (seconds)                           | `(time: number) => void`                                         |
| `seekForward`         | Seek forward by a number of seconds                           | `(seconds: number) => void`                                      |
| `seekBackward`        | Seek backward by a number of seconds                          | `(seconds: number) => void`                                      |
| `setAudioSource`      | Update the audio source (URL or streaming data)               | `(source?: AudioSource) => Promise<{ stopLoading: () => void }>` |
| `volumeUp`            | Increase volume (default 10% per call)                        | `(percent?: number) => void`                                     |
| `volumeDown`          | Decrease volume (default 10% per call)                        | `(percent?: number) => void`                                     |
| `setVolume`           | Set volume to a specific value (0-1)                          | `(value: number) => void`                                        |
| `addEventListener`    | Add audio event listener (delegated to `HTMLAudioElement`)    | `HTMLAudioElement['addEventListener']`                           |
| `removeEventListener` | Remove audio event listener                                   | `HTMLAudioElement['removeEventListener']`                        |
| `dispose`             | Release resources (pause, clear source, close `AudioContext`) | `() => void`                                                     |

> `AudioSource = string \| ReadableStreamDefaultReader<Uint8Array> \| ArrayBuffer \| Uint8Array \| Blob`
