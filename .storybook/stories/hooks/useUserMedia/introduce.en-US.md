Record **audio/video media streams** from the user's devices (`getUserMedia`) with a `MediaRecorder` wrapper. The hook handles permission prompts, chunk delivery, optional PCM audio capture, and a sound-detection fallback that lets users re-select an audio device when silence is detected.

## When to use

- Recording microphone audio or camera video in the browser.
- Uploading streamed chunks (via `onStreamChunk`) to a server while recording.
- Capturing raw PCM audio data (via `onPcmStreamChunk`) for speech or audio processing.

## Key features

- **Full recording lifecycle** — `startRecording()` / `stopRecording()` manage the stream and recorder.
- **Chunk streaming** — `onStreamChunk` delivers `Blob` chunks (MIME `audio/webm;codecs=opus`) per time/size slice.
- **PCM capture** — optional AudioWorklet-based PCM output through `onPcmStreamChunk`.
- **Permission handling** — detects denied/prompt states and shows guided popups with device-reset instructions.
- **Silence detection** — when no sound arrives within `soundDetectionTimeout`, prompts the user to re-select the microphone.

## Usage notes

- Requires `navigator.mediaDevices.getUserMedia` and `navigator.permissions.query`; unsupported browsers throw a readable error.
- `streamSliceMode` is `time` (milliseconds) or `size` (bytes) and is passed to `MediaRecorder.start`.
- `soundDetectionThreshold` (0~1, default `0`) sets the RMS threshold below which audio is considered silent.
- Recording is stopped automatically on unmount and when `disabled` becomes `true`.
