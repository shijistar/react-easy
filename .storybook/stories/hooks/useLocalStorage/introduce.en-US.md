Persist React state to `localStorage` with an API shaped like `useState`. The hook reads the initial value lazily, writes on every update, and optionally keeps state in sync across browser tabs via the `storage` event.

## When to use

- Persisting user preferences, form drafts, or UI settings across page reloads.
- Sharing state between browser tabs (e.g. theme, locale, panel layout).
- Replacing manual `localStorage.getItem` / `setItem` pairs with a stateful API.

## Key features

- **useState-like API** — returns `[value, setValue, remove]`; `setValue` accepts a function updater.
- **Cross-tab sync** — listens to `storage` events when `sync` is enabled (default).
- **Custom (de)serialization** — override `serialize` / `deserialize` for non-JSON values.
- **Safe fallbacks** — empty keys behave like `useState` and never touch storage; read/write errors are swallowed.

## Sample code

```tsx
import { useLocalStorage } from '@tiny-codes/react-easy';

export function ThemeSwitcher() {
  const [theme, setTheme, remove] = useLocalStorage<string>('app.theme', 'light', { sync: true });

  return (
    <>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={remove}>Reset</button>
    </>
  );
}
```

## Usage notes

- The `key` is trimmed; an empty key disables storage entirely.
- `remove()` resets to the initial value and removes the stored key.
- When the `key` changes, state is re-initialized from storage.
- Storage access is guarded for non-browser environments.
