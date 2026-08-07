Generate a function with an **immutable reference**. The function body keeps reading the latest closure through a ref, but the function itself never changes between renders — ideal for dependencies of `useEffect` or memoized callbacks.

## When to use

- Passing callbacks into `useEffect` dependency arrays without re-triggering effects on every render.
- Wrapping handlers that must remain referentially stable while still seeing fresh state.
- Building library APIs where the returned function's identity should be stable.

## Key features

- **Immutable identity** — the returned function reference never changes across re-renders.
- **Fresh closure** — internal ref keeps the latest `fn`, so state/props are always current when called.
- **Type-preserving** — generic signature returns a function typed as the input `T`.

## Sample code

```tsx
import { useRefFunction } from '@tiny-codes/react-easy';

export function Demo() {
  const stableLog = useRefFunction(() => {
    console.log('latest value:', count);
  });

  // stableLog's reference never changes, safe to use in a deps array.
  useEffect(() => {
    window.addEventListener('resize', stableLog);
    return () => window.removeEventListener('resize', stableLog);
  }, [stableLog]);

  return null;
}
```

## Usage notes

- The hook only wraps the _latest_ function; do not call it as a normal `useCallback` with a dependency list.
- `useRefValue` is the underlying primitive used to keep the latest closure.
- It is safe to pass the returned function to `useEffect` deps, memoized components, or event handlers.
