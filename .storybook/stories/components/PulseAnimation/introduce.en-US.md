A lightweight pulse-bar animation component, ideal for audio activity visualization or subtle loading feedback. It renders a row of bars whose heights animate in a staggered wave.

## When to use

Use `PulseAnimation` to hint "something is active" without text — audio recording/playing indicators, live data streams, or a minimal loading placeholder where a spinner feels too heavy.

## Key features

- **Configurable bars** — `bars` sets the count, `barGap` the spacing, `barColor` the fill color.
- **Staggered wave** — `delayRate` offsets each bar's animation so the group reads as a traveling pulse.
- **Timing** — `duration` controls the cycle length in seconds.
- **Themable** — `barStyle` and the `token.AnimationPulse` token tune the look globally.
- **No deps** — pure CSS animation, cheap to mount many instances.

## Sample code

```tsx
import { PulseAnimation } from '@tiny-codes/react-easy';

export function Demo() {
  return <PulseAnimation bars={24} barGap={3} style={{ width: '100%', height: 40 }} />;
}
```

## Usage notes

- `bars`, `barGap`, `duration`, `delayRate` all have sensible defaults, so a bare `<PulseAnimation />` already animates.
- For a custom palette, set `barColor` per instance or configure `token.AnimationPulse` once for the whole app.
- It fills its parent's width via CSS grid; give the parent a height or the bars will collapse.
