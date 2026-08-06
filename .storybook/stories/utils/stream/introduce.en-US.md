`StreamTimeSlicerClass` splits an incoming PCM audio stream into fixed-size slices. You push multi-channel frames into it, and it accumulates the samples until the configured threshold (either elapsed time in milliseconds or total sample count) is reached, then calls `onSlice` with the merged `Float32Array[]` and the actual duration of that slice. It is designed for scenarios where audio data arrives in small chunks and downstream stages (speech recognition, audio analysis, or network upload) need consolidated segments.

## When to use

- You receive audio frames in small chunks (for example from `getUserMedia`, WebSocket, or a `ReadableStream`) and need to batch them into fixed segments.
- You need to slice by elapsed time (`sliceMode: 'time'`) or by accumulated sample count (`sliceMode: 'size'`).
- You want to force out a partial segment on demand with `flush()` — for example at the end of a session.
- You want to reset the accumulator without emitting anything (`reset()`).

## Key features

- **Two slice modes** — `'time'` slices by milliseconds; `'size'` slices by total sample count.
- **Multi-channel aware** — each frame is an array of `Float32Array` (one per channel); slices preserve channel structure.
- **Merged output** — accumulated chunks per channel are concatenated into a single `Float32Array` before `onSlice` fires.
- **Immediate mode** — when `value <= 0`, every `push()` emits immediately.
- **On-demand control** — `flush()` force-emits the current accumulation; `reset()` clears the cache without emitting; `duration()` reports accumulated time.

## Sample code

```ts
import { StreamTimeSlicerClass } from '@tiny-codes/react-easy';

const slicer = new StreamTimeSlicerClass({
  sliceMode: 'size',
  value: 2048, // emit when 2048 samples have accumulated per channel
  onSlice: (channels, sliceDurationMs) => {
    // channels: Float32Array[] — one merged array per channel
    // sliceDurationMs: number — actual duration of this slice
    sendToServer(channels, sliceDurationMs);
  },
});

// On every audio frame from getUserMedia / WebSocket / stream:
function onAudioFrame(frame: Float32Array[]) {
  slicer.push(frame);
}

// When the session ends, force out whatever is left:
slicer.flush();
```

## Usage notes

- `sliceMode: 'time'` compares against `performance.now()` elapsed time since the first `push()` of the current slice; `'size'` compares the accumulated sample count.
- `value <= 0` enables immediate output mode: every `push()` emits a slice right away.
- `flush()` outputs even when the threshold is not reached, and clears the accumulator; `reset()` clears without output.
- The slice duration reported to `onSlice` is measured from the first `push()` of that slice to the moment it is emitted (milliseconds).
- Frames are treated as complete units: a single frame larger than the remaining budget is kept whole and emitted together with the next frame when the threshold is exceeded.
