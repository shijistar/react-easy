Create an animated "processing" text that cycles through dots — e.g. `Processing.` → `Processing..` → `Processing...` — using a simple `setInterval`. Returns a plain string you can render anywhere.

## When to use

- Loading indicators with a textual "Processing" message.
- Placeholder status text while a task is running.
- Lightweight animation without adding a spinner component.

## Key features

- **Zero-dependency** — a plain string return value; no DOM or effect wiring needed.
- **Configurable rhythm** — `interval` controls speed, `maxDots` controls the dot count ceiling.
- **Custom text** — `prefixText` and `dotText` let you adapt the message to your language/UI.
- **Pausable** — `enabled: false` freezes the text at the prefix (no dots).

## Usage notes

- The animation starts when `enabled` is `true` (default).
- Changing `interval` or `maxDots` restarts the animation loop.
- The returned value is a plain string; compose it with other text as needed.
