`AudioPlayer` is a UI-less audio playback class that accepts either a URL or a streaming source. It exposes an imperative API — play, pause, stop, seek, and volume control — so you can build your own player UI on top of it, or drive audio purely from logic. It supports three source forms: a URL string, raw binary data (`ArrayBuffer` / `Uint8Array` / `Blob`), or a `ReadableStreamDefaultReader` that is progressively appended into a `MediaSource` as data arrives.

## When to use

- You need a headless audio engine and want to build a fully custom player UI.
- You receive audio over a streaming interface (for example WebSocket chunks or a fetch response body reader) and want playback to start before the whole file is available.
- You need volume management through the Web Audio API for smoother gain control.
- You want playback driven programmatically (auto-play, queueing, or AI-triggered playback) without DOM or React state coupling.

## Key features

- **Multiple source types** — URL string, `Blob`, `ArrayBuffer`, `Uint8Array`, or a `ReadableStreamDefaultReader` for progressive playback.
- **Streaming support** — reader chunks are appended into a `MediaSource`/`SourceBuffer`; falls back to one-time `Blob` buffering when `MediaSource` is unsupported.
- **Full transport control** — `play()`, `pause()`, `stop()`, `seek()`, `seekForward()`, `seekBackward()`.
- **Volume management** — `setVolume()`, `volumeUp()`, `volumeDown()`, wired through a `GainNode` for smooth changes.
- **Lifecycle callbacks** — `onPlay`, `onPause`, `onStop`, `onPlayEnd`, `onError` in the constructor options.
- **Event bridge** — `addEventListener` / `removeEventListener` proxy the native `HTMLAudioElement` events.
- **Resource cleanup** — `dispose()` pauses playback, closes the `AudioContext`, and releases sources.

## Sample code

```tsx
import { useEffect } from 'react';
import { AudioPlayer } from '@tiny-codes/react-easy';

function PlayerDemo({ url }: { url: string }) {
  useEffect(() => {
    const player = new AudioPlayer({
      source: url,
      volume: 0.6,
      onPlay: () => console.log('playing'),
      onPause: () => console.log('paused'),
      onError: (error) => console.error('playback error', error),
    });

    void player.play();
    return () => player.dispose();
  }, [url]);

  return null; // AudioPlayer renders no UI; drive it programmatically
}
```

## Usage notes

- `AudioPlayer` renders nothing — it is a programming interface only. Build your own UI or control it from logic.
- URL sources must support cross-origin access, otherwise playback may be silent.
- Default volume is `0.5`; `setVolume` clamps to `[0, 1]`.
- When the source is a stream reader, the browser must support `MediaSource` and the provided MIME type; otherwise the player falls back to buffering the entire stream into a `Blob` before playback.
- Call `dispose()` when the player is no longer needed to release the `AudioContext` and event listeners.
