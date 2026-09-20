A `useState` that stays in sync with a prop. It is the drop-in replacement for the `useState(prop)` + `useEffect(() => setState(prop), [prop])` anti-pattern: the adjustment happens **during render**, so there is no extra render pass with a stale value, and no `react-hooks/set-state-in-effect` (React Compiler) violation.

## When to use

- A component that mirrors a prop into local state which the user can also edit (inline editors, filter panels, drafts).
- Controlled/uncontrolled components, where a prop is optional and a default value is needed when it is absent.
- Anywhere an external value must be adopted only when it actually changes, while local edits in between must survive.

## Key features

- **Render-phase sync** — the state is corrected in the same render that observes the new prop, so the stale value is never committed.
- **Change detection on the raw prop** — a transition such as `undefined` → `false` is still detected; `fallback` only decides which value is used while the prop is `undefined`.
- **`enabled` switch** — the prop keeps being tracked while `false`, so a later change is still picked up, but nothing is written to state in the meantime.
- **`isEqual` comparator** — avoids resetting the state when the prop is an object that is re-created on every render.
- **Same shape as `useState`** — returns `[state, setState]`, so migrating is a one-line change.

## Sample code

Simplest form — take the `title` prop directly, with no options at all:

```tsx
import { usePropState } from '@tiny-codes/react-easy';

export function TitleEditor({ title }: { title: string }) {
  // When the title changes, the draft will be automatically updated
  const [draft, setDraft] = usePropState(title);

  return <input value={draft} onChange={(e) => setDraft(e.target.value)} />;
}
```

With options — for an optional object prop that is re-created on every render:

```tsx
import { useState } from 'react';
import { usePropState } from '@tiny-codes/react-easy';

interface Draft {
  title: string;
}

export function TitleEditor({ value }: { value?: Draft }) {
  // Controlled/uncontrolled: the prop wins when provided, otherwise `{ title: '' }` is the default.
  const [draft, setDraft] = usePropState<Draft>(value, {
    fallback: { title: '' },
    enabled: value !== undefined,
    // Compare by content: a re-created but equal object must not reset local edits.
    isEqual: (prev, next) => prev.title === next.title,
  });

  return <input value={draft.title} onChange={(e) => setDraft({ title: e.target.value })} />;
}
```

## Usage notes

- **Pass `isEqual` for object/array props that are created inline.** With the default `Object.is`, such a prop looks changed on every render, which resets the state repeatedly (and can loop forever).
- **`enabled` is not a one-shot switch.** While it is `false` the prop is still tracked, so re-enabling it does _not_ resync the current prop value — the state is only written on the next actual prop change.
- **`fallback` does not affect change detection.** Passing `openInProps ?? false` as the prop would swallow the `undefined` → `false` transition; use `fallback` for the default value instead.
- The returned setter has a stable identity, but `eslint-plugin-react-hooks` cannot know that for a custom hook, so include it in `useCallback` / `useEffect` dependency arrays.
