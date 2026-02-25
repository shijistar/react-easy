import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SetStateAction<T> = T | ((prev: T) => T);

export interface UseLocalStorageOptions<T> {
  /** When true, listen to `storage` events and keep state in sync across tabs. Defaults to true. */
  sync?: boolean;
  /** Custom serializer. Defaults to JSON.stringify. */
  serialize?: (value: T) => string;
  /** Custom deserializer. Defaults to JSON.parse. */
  deserialize?: (raw: string) => T;
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

/**
 * useLocalStorage
 *
 * - If `key` is empty/falsy, behaves like useState and does not touch localStorage.
 */
function useLocalStorage<T>(
  key?: string | null,
  initialValue?: T | (() => T),
  options?: UseLocalStorageOptions<T>
): [T, (action: SetStateAction<T>) => void, () => void] {
  const storageKey = (key ?? '').trim();
  const enabled = storageKey.length > 0;
  const sync = options?.sync ?? true;
  const serialize = options?.serialize ?? defaultSerialize;
  const deserialize = options?.deserialize ?? defaultDeserialize;

  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const getInitial = useCallback((): T => {
    const fallback = (() => {
      const v = initialValueRef.current;
      return (typeof v === 'function' ? (v as () => T)() : (v as T)) as T;
    })();

    if (!enabled || !isBrowser()) return fallback;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw == null) return fallback;
      return deserialize(raw);
    } catch {
      return fallback;
    }
  }, [deserialize, enabled, storageKey]);

  const [value, setValueState] = useState<T>(getInitial);

  const writeStorage = useCallback(
    (nextValue: T) => {
      if (!enabled || !isBrowser()) return;
      try {
        window.localStorage.setItem(storageKey, serialize(nextValue));
      } catch {
        // ignore write errors (e.g., quota exceeded, blocked storage)
      }
    },
    [enabled, serialize, storageKey]
  );

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      setValueState((prev) => {
        const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action;
        writeStorage(next);
        return next;
      });
    },
    [writeStorage]
  );

  const remove = useCallback(() => {
    // If key is empty/falsy, just reset to initial value.
    const next = (() => {
      const v = initialValueRef.current;
      return (typeof v === 'function' ? (v as () => T)() : (v as T)) as T;
    })();

    setValueState(next);

    if (!enabled || !isBrowser()) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [enabled, storageKey]);

  // Keep state updated if key changes.
  useEffect(() => {
    setValueState(getInitial());
  }, [getInitial]);

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

export default useLocalStorage;
