import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useDebounce from '../../src/hooks/useDebounce';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('runs trailing execution with the latest args and supports cancel', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn, [], { wait: 50 }));

    act(() => {
      result.current.cancel();
      result.current('first');
      result.current('second');
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      result.current('third');
      vi.advanceTimersByTime(50);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('supports leading mode and uses the latest callback after rerender', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useDebounce(fn, [fn], { wait: 50, leading: true }), {
      initialProps: { fn: first },
    });

    act(() => {
      vi.setSystemTime(100);
      result.current('now');
    });

    expect(first).toHaveBeenCalledWith('now');

    rerender({ fn: second });

    act(() => {
      vi.setSystemTime(110);
      result.current('later');
      vi.advanceTimersByTime(50);
    });

    expect(second).toHaveBeenCalledWith('later');
  });

  it('executes immediately when maxWait is exceeded', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn, [], { wait: 500, maxWait: 100 }));

    act(() => {
      result.current('first');
    });
    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
      result.current('second');
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('supports disable and enable toggles', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn, [], { wait: 50 }));

    expect(result.current.isDisabled()).toBe(false);

    act(() => {
      result.current.disable();
      result.current('ignored');
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isDisabled()).toBe(true);
    expect(fn).not.toHaveBeenCalled();

    act(() => {
      result.current.enable();
      result.current('works');
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isDisabled()).toBe(false);
    expect(fn).toHaveBeenCalledWith('works');
  });

  it('cleans up pending timers on unmount', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce(fn, [], { wait: 50 }));

    act(() => {
      result.current('pending');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(fn).not.toHaveBeenCalled();
  });
});
