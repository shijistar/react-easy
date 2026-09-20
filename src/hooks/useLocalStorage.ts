import { useCallback, useEffect, useMemo, useState } from 'react';
import useRefValue from './useRefValue';

type SetStateAction<T> = T | ((prev: T) => T);
type InitialValue<T> = T | (() => T) | undefined;

export interface UseLocalStorageOptions<T> {
  /** When true, listen to `storage` events and keep state in sync across tabs. Defaults to true. */
  sync?: boolean;
  /** Custom serializer. Defaults to JSON.stringify. */
  serialize?: (value: T) => string;
  /** Custom deserializer. Defaults to JSON.parse. */
  deserialize?: (raw: string) => T;
}

/**
 * useLocalStorage
 *
 * - If `key` is empty/falsy, behaves like useState and does not touch localStorage.
 */
function useLocalStorage<T>(
  key?: string | null,
  initialValue?: T | (() => T),
  options?: UseLocalStorageOptions<T>,
): [T, (action: SetStateAction<T>) => void, () => void] {
  const storageKey = (key ?? '').trim();
  const enabled = storageKey.length > 0;
  const sync = options?.sync ?? true;
  const serialize = options?.serialize ?? defaultSerialize;
  const deserialize = options?.deserialize ?? defaultDeserialize;

  const [value, setValueState] = useState<T>(() => readInitialValue(initialValue, enabled, storageKey, deserialize));

  // Keep state updated if the key changes. Adjusting during render instead of in an effect avoids an
  // extra render pass with a stale value.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);
  if (prevStorageKey !== storageKey) {
    setPrevStorageKey(storageKey);
    setValueState(readInitialValue(initialValue, enabled, storageKey, deserialize));
  }

  // The ref keeps the callbacks below stable no matter how `initialValue` is passed (a new inline
  // object/function on every render must not invalidate them). It is only read outside of render.
  const initialValueRef = useRefValue(initialValue);
  const getInitial = useCallback(
    (): T => readInitialValue(initialValueRef.current, enabled, storageKey, deserialize),
    [deserialize, enabled, storageKey],
  );

  const writeStorage = useCallback(
    (nextValue: T) => {
      if (!enabled || !isBrowser()) return;
      try {
        window.localStorage.setItem(storageKey, serialize(nextValue));
      } catch {
        // ignore write errors (e.g., quota exceeded, blocked storage)
      }
    },
    [enabled, serialize, storageKey],
  );

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      setValueState((prev) => {
        const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action;
        writeStorage(next);
        return next;
      });
    },
    [writeStorage],
  );

  const remove = useCallback(() => {
    // Reset to the initial value. The stored value is deliberately not read here, because the key is
    // about to be removed and reading it back would restore the value instead of resetting it.
    setValueState(resolveInitialValue(initialValueRef.current));

    if (!enabled || !isBrowser()) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [enabled, storageKey]);

  // Cross-tab sync.
  useEffect(() => {
    if (!enabled || !sync || !isBrowser()) return;

    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== storageKey) return;

      // When removed, fall back to initial.
      if (e.newValue == null) {
        setValueState(getInitial());
        return;
      }

      try {
        setValueState(deserialize(e.newValue));
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [deserialize, enabled, getInitial, storageKey, sync]);

  // Stable tuple identity.
  return useMemo(() => [value, setValue, remove] as const, [remove, setValue, value]);
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function defaultSerialize<T>(value: T) {
  return JSON.stringify(value);
}

function defaultDeserialize<T>(raw: string) {
  return JSON.parse(raw) as T;
}

/** Resolve the `initialValue`, calling it when it is a factory function. */
function resolveInitialValue<T>(initialValue: InitialValue<T>): T {
  return (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue) as T;
}

/**
 * Read the initial value: the stored value when there is one, otherwise the `initialValue`
 * fallback.
 *
 * Declared at module level and fed with plain arguments so it never captures a ref, which keeps it
 * safe to call during render.
 */
function readInitialValue<T>(
  initialValue: InitialValue<T>,
  enabled: boolean,
  storageKey: string,
  deserialize: (raw: string) => T,
): T {
  if (enabled && isBrowser()) {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw != null) return deserialize(raw);
    } catch {
      // Ignore read/parse errors and fall back to the initial value.
    }
  }
  return resolveInitialValue(initialValue);
}

export default useLocalStorage;
