import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useLocalStorage from '../../src/hooks/useLocalStorage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

function createStorageEvent(
  key: string | null,
  newValue: string | null,
  storageArea: Storage | object = window.localStorage,
) {
  const event = new Event('storage') as StorageEvent;
  Object.defineProperties(event, {
    key: { value: key },
    newValue: { value: newValue },
    storageArea: { value: storageArea },
  });
  return event;
}

describe('useLocalStorage', () => {
  it('behaves like useState when key is empty and remove resets to initial value', () => {
    const initialFactory = vi.fn(() => 1);
    const { result } = renderHook(() => useLocalStorage('', initialFactory));

    expect(result.current[0]).toBe(1);
    expect(initialFactory).toHaveBeenCalledTimes(2);

    act(() => {
      result.current[1]((prev) => prev + 2);
    });

    expect(result.current[0]).toBe(3);
    expect(window.localStorage.length).toBe(0);

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(1);
    expect(initialFactory).toHaveBeenCalledTimes(3);
  });

  it('supports null keys and direct initial values', () => {
    const { result } = renderHook(() => useLocalStorage<string>(null, 'seed'));

    expect(result.current[0]).toBe('seed');

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('seed');
  });

  it('reads, writes and refreshes state when key changes', () => {
    window.localStorage.setItem('alpha', JSON.stringify({ value: 1 }));
    window.localStorage.setItem('beta', JSON.stringify({ value: 9 }));
    const serialize = vi.fn((value: { value: number }) => JSON.stringify({ value: value.value * 2 }));
    const deserialize = vi.fn((raw: string) => JSON.parse(raw) as { value: number });

    const { result, rerender } = renderHook(
      ({ keyName }) => useLocalStorage<{ value: number }>(keyName, () => ({ value: 0 }), { serialize, deserialize }),
      {
        initialProps: { keyName: 'alpha' },
      },
    );

    expect(result.current[0]).toEqual({ value: 1 });

    act(() => {
      result.current[1]({ value: 5 });
    });

    expect(window.localStorage.getItem('alpha')).toBe(JSON.stringify({ value: 10 }));

    rerender({ keyName: 'beta' });

    expect(result.current[0]).toEqual({ value: 9 });
    expect(deserialize).toHaveBeenCalled();
    expect(serialize).toHaveBeenCalledWith({ value: 5 });
  });

  it('falls back on read and write errors and handles remove errors', () => {
    window.localStorage.setItem('broken', '{not-json');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const { result } = renderHook(() => useLocalStorage('broken', () => 'fallback'));

    expect(result.current[0]).toBe('fallback');

    act(() => {
      result.current[1]('next');
    });

    expect(result.current[0]).toBe('next');
    expect(setItemSpy).toHaveBeenCalled();

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('fallback');
    expect(removeItemSpy).toHaveBeenCalledTimes(1);
  });

  it('syncs across storage events and ignores unrelated events', () => {
    window.localStorage.setItem('sync-key', JSON.stringify({ value: 1 }));
    const deserialize = vi.fn((raw: string) => {
      if (raw === 'bad') {
        throw new Error('parse failed');
      }
      return JSON.parse(raw) as { value: number };
    });

    const { result } = renderHook(() => useLocalStorage<{ value: number }>('sync-key', { value: 0 }, { deserialize }));

    act(() => {
      window.dispatchEvent(createStorageEvent('other-key', JSON.stringify({ value: 2 })));
      window.dispatchEvent(createStorageEvent('sync-key', JSON.stringify({ value: 3 }), {}));
    });

    expect(result.current[0]).toEqual({ value: 1 });

    act(() => {
      window.dispatchEvent(createStorageEvent('sync-key', JSON.stringify({ value: 4 })));
    });

    expect(result.current[0]).toEqual({ value: 4 });

    act(() => {
      window.localStorage.removeItem('sync-key');
      window.dispatchEvent(createStorageEvent('sync-key', null));
    });

    expect(result.current[0]).toEqual({ value: 0 });

    act(() => {
      window.dispatchEvent(createStorageEvent('sync-key', 'bad'));
    });

    expect(result.current[0]).toEqual({ value: 0 });
    expect(deserialize).toHaveBeenCalled();
  });

  it('can disable cross-tab sync entirely', () => {
    window.localStorage.setItem('nosync', JSON.stringify('stored'));
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const { result } = renderHook(() => useLocalStorage('nosync', 'init', { sync: false }));

    expect(result.current[0]).toBe('stored');
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
