Runs a debounced version of a callback with two complementary trigger mechanisms: the classic trailing debounce (executes after the configured wait period without new calls) and a `maxWait` cap (forces execution even when calls keep arriving). The returned function additionally exposes `cancel`, `disable`, `enable`, and `isDisabled` for runtime control.

## When to use

- Search-as-you-type inputs where every keystroke would otherwise fire a request.
- Window `resize` / `scroll` handlers, form validation, or auto-save that must throttle bursts of events.
- Any flow where a slow operation must only run after the user pauses (trailing edge) or at a guaranteed interval (max wait).

## Key features

- **Dual trigger** — classic debounce plus a `maxWait` force-execution cap, so long-running bursts still make progress.
- **Leading execution** — `leading: true` fires immediately on the first call in a burst.
- **Runtime control** — `cancel()` drops pending execution, `disable()`/`enable()` toggle the debounce, `isDisabled()` reports state.
- **Dependency-driven recreation** — the debounced function is re-created when `deps` change, like `useCallback`.

## Usage notes

- `wait: 0` (default) disables debouncing entirely — calls execute immediately.
- The returned function keeps the latest callback via a ref, so the `fn` identity does not need to be stable across renders.
- `disable()` is not the same as `cancel()`: cancel only drops the pending timer, while disable makes subsequent calls no-ops until `enable()` is called.
- `maxWait` is measured from the last actual execution; it is only applied when `maxWait > 0`.
