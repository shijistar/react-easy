Provides a stable `AudioPlayer` class instance for controlling audio playback without any UI. The instance is created once per mounted lifecycle and reused across renders, so imperative methods (`play`, `pause`, `seek`, `setVolume`, …) can be called from event handlers without recreating the player.

## When to use

- Building a fully custom player UI (buttons, sliders, progress bar) on top of a headless audio engine.
- Playing audio from streaming sources (`ReadableStreamDefaultReader<Uint8Array>`), `ArrayBuffer`, `Uint8Array`, or `Blob`, not just URLs.
- Cases where you need Web Audio gain-based volume control, fine-grained seek, or audio event listeners.

## Key features

- **Stable instance** — the player is memoized for the component lifetime and auto-disposed on unmount.
- **Multiple source types** — URL string or streaming data (`ReadableStreamDefaultReader`, `ArrayBuffer`, `Uint8Array`, `Blob`), including a lazy factory function.
- **Full transport control** — `play` / `pause` / `stop` / `seek` / `seekForward` / `seekBackward` / `setAudioSource`.
- **Volume management** — `setVolume` / `volumeUp` / `volumeDown` with Web Audio `GainNode` when available.
- **Event hooks** — `addEventListener` / `removeEventListener` delegate to the underlying `HTMLAudioElement`.

## Usage notes

- If the source is a URL, the audio source must support cross-origin access, otherwise there may be no sound.
- The player is created lazily with `useRef` and disposed in a cleanup effect; passing a new `source` prop does not recreate the instance — call `setAudioSource()` to swap sources.
- Streaming sources use `MediaSource` under the hood; when `MediaSource` is unsupported, playback falls back to one-time `Blob` buffering.
- Volume is clamped to `[0, 1]`; the default initial volume is `0.5`.
