Get a **mutable ref object** that automatically stays in sync with the latest value. Unlike `useRef(value)` which keeps the initial value, `useRefValue` overwrites `ref.current` on every render so the ref always reflects current state.

## When to use

- Implementing stable-callback patterns such as `useRefFunction`.
- Reading the latest state/props inside `setTimeout`, `setInterval`, or event listeners without re-subscribing.
- Reading the latest value of a variable inside `useEffect` without adding it to the dependency array.
- Excluding a dependency from `useEffect`.

## Key features

- **Auto-sync** — `ref.current` is updated to the latest value on every render.
- **Stable reference** — the ref object itself never changes, safe for dependencies.
- **Type-safe** — generic signature preserves the wrapped value type.

## Sample code

```tsx
import { useRefValue } from '@tiny-codes/react-easy';

export function Demo(props) {
  const { enabled } = props;
  const enabledRef = useRefValue(enabled);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (enabledRef.current) {
      console.log(count);
    }
  }, [count]);

  const capture = () => setCount(count + 1);

  return <button onClick={capture}>Capture {count}</button>;
}
```
