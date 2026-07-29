import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useProcessingText from '../../src/hooks/useProcessingText';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useProcessingText', () => {
  it('animates dots and wraps around maxDots', () => {
    const { result } = renderHook(() =>
      useProcessingText({ prefixText: 'Loading', dotText: '.', interval: 100, maxDots: 2 }),
    );

    expect(result.current).toBe('Loading');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('Loading.');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('Loading..');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('Loading');
  });

  it('resets text and clears timers when disabled', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { result, rerender, unmount } = renderHook(
      ({ enabled }) => useProcessingText({ enabled, prefixText: 'Work', dotText: '*', interval: 100, maxDots: 3 }),
      { initialProps: { enabled: true } },
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('Work**');

    rerender({ enabled: false });

    expect(result.current).toBe('Work');
    expect(clearIntervalSpy).toHaveBeenCalled();

    unmount();
  });

  it('uses default props and leaves timers untouched when initially disabled', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { result, unmount } = renderHook(() => useProcessingText({ enabled: false }));

    expect(result.current).toBe('');
    expect(clearIntervalSpy).not.toHaveBeenCalled();

    unmount();
    expect(clearIntervalSpy).not.toHaveBeenCalled();
  });

  it('supports calling the hook with no props', () => {
    const { result } = renderHook(() => useProcessingText());

    expect(result.current).toBe('');
  });
});
