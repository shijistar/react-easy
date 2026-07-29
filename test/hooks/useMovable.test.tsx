import type { RefObject } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useMovable from '../../src/hooks/useMovable';

function defineRect(element: HTMLDivElement, rect: { left: number; top: number; width: number; height: number }) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }),
  });
}

afterEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
});

describe('useMovable', () => {
  it('ignores configured selectors and safely handles missing container refs', () => {
    const containerRef = { current: null } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: true, containerRef, ignoreSelectors: ['button'] }));
    const button = document.createElement('button');
    const div = document.createElement('div');
    const preventDefault = vi.fn();

    act(() => {
      result.current.onPointerDown({
        target: button,
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        preventDefault,
      } as never);
      result.current.onPointerDown({
        target: div,
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        preventDefault,
      } as never);
      window.dispatchEvent(new Event('pointermove'));
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.position).toBeUndefined();
  });

  it('updates, clamps and persists position during dragging and resize', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const container = document.createElement('div');
    document.body.appendChild(container);
    let rect = { left: 10, top: 20, width: 100, height: 50 };
    defineRect(container, rect);
    container.setPointerCapture = vi.fn(() => {
      throw new Error('capture failed');
    });

    const containerRef = { current: container } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: true, containerRef, storageKey: 'movable-pos' }));
    const preventDefault = vi.fn();

    act(() => {
      result.current.onPointerDown({
        target: container,
        clientX: 30,
        clientY: 40,
        pointerId: 7,
        preventDefault,
      } as never);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 220, clientY: 170 }));
    });

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 200, top: 150 });
    });
    expect(window.localStorage.getItem('movable-pos')).toBe(JSON.stringify({ left: 200, top: 150 }));

    rect = { left: 10, top: 20, width: 100, height: 50 };
    defineRect(container, rect);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 20, top: 40 });
    });
    expect(window.localStorage.getItem('movable-pos')).toBe(JSON.stringify({ left: 20, top: 40 }));

    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 300, clientY: 300 }));
      window.dispatchEvent(new PointerEvent('pointercancel'));
    });

    expect(result.current.position).toEqual({ left: 20, top: 40 });
  });

  it('does not attach move handlers when disabled and does not persist without storageKey', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const container = document.createElement('div');
    document.body.appendChild(container);
    defineRect(container, { left: 0, top: 0, width: 100, height: 50 });
    container.setPointerCapture = vi.fn();

    const containerRef = { current: container } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: false, containerRef }));

    act(() => {
      result.current.onPointerDown({
        target: container,
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        preventDefault: vi.fn(),
      } as never);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, clientY: 150 }));
    });

    expect(result.current.position).toBeUndefined();
    expect(window.localStorage.length).toBe(0);
  });

  it('clamps saved position immediately on mount when it exceeds the viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });
    window.localStorage.setItem('movable-saved', JSON.stringify({ left: 300, top: 200 }));

    const container = document.createElement('div');
    document.body.appendChild(container);
    defineRect(container, { left: 0, top: 0, width: 100, height: 50 });
    const containerRef = { current: container } as unknown as RefObject<HTMLElement>;

    const { result } = renderHook(() => useMovable({ enabled: true, containerRef, storageKey: 'movable-saved' }));

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 20, top: 40 });
    });
    expect(window.localStorage.getItem('movable-saved')).toBe(JSON.stringify({ left: 20, top: 40 }));
  });

  it('moves and clamps without persisting when storageKey is absent', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 250 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 180 });

    const container = document.createElement('div');
    document.body.appendChild(container);
    defineRect(container, { left: 0, top: 0, width: 100, height: 50 });
    container.setPointerCapture = vi.fn();
    const containerRef = { current: container } as unknown as RefObject<HTMLElement>;

    const { result } = renderHook(() => useMovable({ enabled: true, containerRef }));

    act(() => {
      result.current.onPointerDown({
        target: container,
        clientX: 20,
        clientY: 20,
        pointerId: 9,
        preventDefault: vi.fn(),
      } as never);
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 170, clientY: 120 }));
    });

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 150, top: 100 });
    });

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 20, top: 40 });
    });
    expect(window.localStorage.length).toBe(0);

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.position).toEqual({ left: 20, top: 40 });
  });
});
