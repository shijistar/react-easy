Get a **mutable ref object** that automatically stays in sync with the latest value. Unlike `useRef(value)` which keeps the initial value, `useRefValue` overwrites `ref.current` on every render so the ref always reflects current state.

## When to use

- Reading the latest state/props inside `setTimeout`, `setInterval`, or event listeners without re-subscribing.
- Passing a stable ref to child components while keeping its `.current` fresh.
- Implementing stable-callback patterns such as `useRefFunction`.

## Key features

- **Auto-sync** — `ref.current` is updated to the latest value on every render.
- **Stable reference** — the ref object itself never changes, safe for dependencies.
- **Type-safe** — generic signature preserves the wrapped value type.

## Sample code

```tsx
import { useRefValue } from '@tiny-codes/react-easy';

export function Demo() {
  const countRef = useRefValue(count);

  // Read the latest value from inside a stable callback without
  // re-creating it when `count` changes.
  const capture = () => setCaptured(countRef.current);

  return <button onClick={capture}>Capture {countRef.current}</button>;
}
```

## Usage notes

- Mutating `ref.current` does **not** trigger a re-render.
- It is the building block for `useRefFunction` in this library.
- Use it to read fresh values inside long-lived callbacks without including them in dependency arrays.
