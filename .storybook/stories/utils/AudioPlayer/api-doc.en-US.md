## API

### Class: `AudioPlayer`

| Member                | Description                                                      | Signature                                                                                |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `constructor`         | Create an audio player instance                                  | `new AudioPlayer(options?: AudioPlayerInit): AudioPlayer`                                |
| `isPlaying`           | Check if audio is currently playing                              | `get isPlaying: boolean`                                                                 |
| `currentTime`         | Get current playback time (seconds)                              | `get currentTime: number`                                                                |
| `duration`            | Get total audio duration (seconds)                               | `get duration: number`                                                                   |
| `volume`              | Get current volume value (0-1)                                   | `get volume: number`                                                                     |
| `play`                | Play audio; resumes from the pause position if previously paused | `play(): Promise<void>`                                                                  |
| `pause`               | Pause audio playback; resumes from the current position          | `pause(): void`                                                                          |
| `stop`                | Stop audio playback; progress resets to the beginning            | `stop(): void`                                                                           |
| `seek`                | Set current playback time (seconds)                              | `seek(time: number): void`                                                               |
| `seekForward`         | Seek forward by a certain number of seconds                      | `seekForward(seconds: number): void`                                                     |
| `seekBackward`        | Seek backward by a certain number of seconds                     | `seekBackward(seconds: number): void`                                                    |
| `setAudioSource`      | Update the audio source (URL or streaming data)                  | `setAudioSource(source?: AudioSource): Promise<{ stopLoading: () => void }>`             |
| `setVolume`           | Set volume to a specific value (0-1)                             | `setVolume(value: number): void`                                                         |
| `volumeUp`            | Increase volume (default 10% per call)                           | `volumeUp(percent?: number): void`                                                       |
| `volumeDown`          | Decrease volume (default 10% per call)                           | `volumeDown(percent?: number): void`                                                     |
| `addEventListener`    | Add an audio event listener                                      | `addEventListener(event: string, listener: EventListenerOrEventListenerObject): void`    |
| `removeEventListener` | Remove an audio event listener                                   | `removeEventListener(event: string, listener: EventListenerOrEventListenerObject): void` |
| `dispose`             | Release resources (pause, close AudioContext, remove listeners)  | `dispose(): void`                                                                        |

### Type: `AudioSource`

| Name    | Description                               | Type                                                                                     |
| ------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| (union) | URL string or streaming/binary audio data | `string \| ReadableStreamDefaultReader<Uint8Array> \| ArrayBuffer \| Uint8Array \| Blob` |

### Interface: `AudioPlayerInit`

| Name          | Description                                                | Type                                                         | (Default) |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | --------- |
| `source`      | Audio source (URL or streaming data); may be a lazy getter | `AudioSource \| (() => AudioSource \| Promise<AudioSource>)` | -         |
| `mimeType`    | MIME type of the audio (e.g., `audio/mpeg`, `audio/wav`)   | `string`                                                     | -         |
| `volume`      | Initial volume level (0-1)                                 | `number`                                                     | `0.5`     |
| `crossOrigin` | Cross-origin setting for the audio element                 | `HTMLMediaElement['crossOrigin']`                            | -         |
| `onPlay`      | Callback when audio starts playing                         | `() => void`                                                 | -         |
| `onPause`     | Callback when audio is paused                              | `() => void`                                                 | -         |
| `onStop`      | Callback when audio is stopped                             | `() => void`                                                 | -         |
| `onPlayEnd`   | Callback when audio playback ends                          | `() => void`                                                 | -         |
| `onError`     | Callback when an error occurs                              | `(error: any) => void`                                       | -         |
