import { useEffect } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import usePropState from '../../src/hooks/usePropState';

describe('usePropState', () => {
  it('syncs the state when the prop changes', () => {
    const { result, rerender } = renderHook(({ value }) => usePropState(value), {
      initialProps: { value: 'a' },
    });

    expect(result.current[0]).toBe('a');

    rerender({ value: 'b' });

    expect(result.current[0]).toBe('b');
  });

  it('commits each value exactly once', () => {
    const committed: string[] = [];
    const { rerender } = renderHook(
      ({ value }) => {
        const [state] = usePropState(value);
        useEffect(() => {
          committed.push(state);
        }, [state]);
        return state;
      },
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    rerender({ value: 'c' });

    expect(committed).toEqual(['a', 'b', 'c']);
  });

  it('keeps the internal state while the prop stays the same', () => {
    const { result, rerender } = renderHook(({ value }) => usePropState(value), {
      initialProps: { value: 'a' },
    });

    act(() => {
      result.current[1]('internal');
    });
    rerender({ value: 'a' });

    expect(result.current[0]).toBe('internal');
  });

  it('does not sync while enabled is false, but still tracks the prop', () => {
    const { result, rerender } = renderHook(
      ({ value, enabled }: { value: string; enabled: boolean }) => usePropState(value, { enabled }),
      { initialProps: { value: 'a', enabled: true } },
    );

    rerender({ value: 'b', enabled: false });
    expect(result.current[0]).toBe('a');

    // The prop changed while disabled, so re-enabling syncs the latest value.
    rerender({ value: 'c', enabled: true });
    expect(result.current[0]).toBe('c');
  });

  it('keeps the internal state when the prop is re-enabled without changing', () => {
    const { result, rerender } = renderHook(
      ({ value, enabled }: { value: string; enabled: boolean }) => usePropState(value, { enabled }),
      { initialProps: { value: 'a', enabled: false } },
    );

    act(() => {
      result.current[1]('internal');
    });
    rerender({ value: 'a', enabled: true });

    expect(result.current[0]).toBe('internal');
  });

  it('uses isEqual to avoid resetting on a new object identity', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: { id: number; name?: string } }) =>
        usePropState(value, { isEqual: (a, b) => a.id === b.id }),
      { initialProps: { value: { id: 1 } } },
    );

    act(() => {
      result.current[1]({ id: 1, name: 'internal' });
    });
    rerender({ value: { id: 1 } });

    expect(result.current[0]).toEqual({ id: 1, name: 'internal' });

    rerender({ value: { id: 2 } });
    expect(result.current[0]).toEqual({ id: 2 });
  });

  it('stores a function prop value instead of calling it as an initializer', () => {
    const fn = () => 'x';
    const { result } = renderHook(() => usePropState(fn));

    expect(result.current[0]).toBe(fn);
  });

  it('supports the controlled/uncontrolled pattern with an optional prop', () => {
    const { result, rerender } = renderHook(
      ({ open }: { open?: boolean }) => usePropState<boolean>(open, { fallback: false, enabled: open !== undefined }),
      { initialProps: { open: undefined as boolean | undefined } },
    );

    expect(result.current[0]).toBe(false);

    // Uncontrolled: the internal state can be changed freely.
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Controlled: switching the prop from `undefined` to `false` must be detected.
    rerender({ open: false });
    expect(result.current[0]).toBe(false);

    rerender({ open: true });
    expect(result.current[0]).toBe(true);
  });

  it('keeps the current state when the prop goes back to undefined and is not enabled', () => {
    const { result, rerender } = renderHook(
      ({ open }: { open?: boolean }) => usePropState<boolean>(open, { fallback: false, enabled: open !== undefined }),
      { initialProps: { open: false as boolean | undefined } },
    );

    rerender({ open: true });
    expect(result.current[0]).toBe(true);

    // Controlled -> uncontrolled: the last controlled value is kept.
    rerender({ open: undefined });
    expect(result.current[0]).toBe(true);
  });

  it('treats undefined as a regular state value when no fallback is given', () => {
    const { result, rerender } = renderHook(({ value }: { value: string | undefined }) => usePropState(value), {
      initialProps: { value: 'a' as string | undefined },
    });

    expect(result.current[0]).toBe('a');

    rerender({ value: undefined });
    expect(result.current[0]).toBeUndefined();
  });
});
