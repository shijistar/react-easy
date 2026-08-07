import type { RefObject } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useMovable from '../../src/hooks/useMovable';

// Global polyfills for jsdom (jsdom does not implement ResizeObserver).
if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {
      // stub method
    }
    unobserve() {
      // stub method
    }
    disconnect() {
      // stub method
    }
  }
  globalThis.ResizeObserver = ResizeObserverMock;
}

function defineRect(element: HTMLElement, rect: { left: number; top: number; width: number; height: number }) {
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

function createMovableElement(rect: { left: number; top: number; width: number; height: number }) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  defineRect(el, rect);
  Object.defineProperty(el, 'offsetWidth', { configurable: true, value: rect.width });
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: rect.height });
  return el;
}

function dispatchPointerMove(clientX: number, clientY: number, target?: HTMLElement) {
  const event = new PointerEvent('pointermove', { clientX, clientY });
  if (target) {
    Object.defineProperty(event, 'target', { value: target });
  }
  window.dispatchEvent(event);
}

function pointerDownArgs(
  el: HTMLElement,
  overrides: {
    target?: HTMLElement;
    clientX?: number;
    clientY?: number;
    pointerId?: number;
    preventDefault?: () => void;
  } = {},
) {
  return {
    target: overrides.target ?? el,
    currentTarget: el,
    clientX: overrides.clientX ?? 10,
    clientY: overrides.clientY ?? 10,
    pointerId: overrides.pointerId ?? 1,
    preventDefault:
      overrides.preventDefault ??
      (() => {
        // default no-op; tests pass their own mock when they need to assert calls
      }),
  } as never;
}

afterEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
});

describe('useMovable', () => {
  it('moves and clamps within the viewport, persists position and triggers onMove', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const el = createMovableElement({ left: 0, top: 0, width: 100, height: 50 });
    el.setPointerCapture = vi.fn();
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useMovable({ enabled: true, movableDomRef, storageKey: 'movable-pos', onMove }),
    );
    const preventDefault = vi.fn();

    act(() => {
      result.current.onPointerDown(pointerDownArgs(el, { clientX: 20, clientY: 20, pointerId: 7, preventDefault }));
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(el.setPointerCapture).toHaveBeenCalledWith(7);

    act(() => {
      // newLeft = 240 - 0 - 20 = 220 -> clamped to boundLeft = 300 - 100 = 200
      // newTop  = 190 - 0 - 20 = 170 -> clamped to boundTop  = 200 - 50  = 150
      dispatchPointerMove(240, 190, el);
    });

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 200, top: 150 });
    });
    expect(el.style.left).toBe('200px');
    expect(el.style.top).toBe('150px');
    expect(window.localStorage.getItem('movable-pos')).toBe(JSON.stringify({ left: 200, top: 150 }));
    expect(onMove).toHaveBeenLastCalledWith({ left: 200, top: 150 });

    // Shrink the window: position must be clamped back into the viewport.
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 20, top: 40 });
    });
    expect(el.style.left).toBe('20px');
    expect(el.style.top).toBe('40px');
    expect(window.localStorage.getItem('movable-pos')).toBe(JSON.stringify({ left: 20, top: 40 }));
    expect(onMove).toHaveBeenLastCalledWith({ left: 20, top: 40 });

    // A second resize while the position already fits must be a no-op.
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.position).toEqual({ left: 20, top: 40 });

    // pointerup stops dragging; further pointermove events are ignored.
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
      dispatchPointerMove(300, 300, el);
      window.dispatchEvent(new PointerEvent('pointercancel'));
    });

    expect(result.current.position).toEqual({ left: 20, top: 40 });
    expect(onMove).toHaveBeenCalledTimes(2);
  });

  it('clamps a saved position on mount when it exceeds the viewport', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });
    window.localStorage.setItem('movable-saved', JSON.stringify({ left: 300, top: 200 }));

    const el = createMovableElement({ left: 0, top: 0, width: 100, height: 50 });
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useMovable({ enabled: true, movableDomRef, storageKey: 'movable-saved', onMove }),
    );

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 20, top: 40 });
    });
    expect(el.style.left).toBe('20px');
    expect(el.style.top).toBe('40px');
    expect(window.localStorage.getItem('movable-saved')).toBe(JSON.stringify({ left: 20, top: 40 }));
    expect(onMove).toHaveBeenCalledWith({ left: 20, top: 40 });
  });

  it('does not attach move handlers when disabled and does not persist without storageKey', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const el = createMovableElement({ left: 0, top: 0, width: 100, height: 50 });
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: false, movableDomRef }));

    act(() => {
      result.current.onPointerDown(pointerDownArgs(el));
      dispatchPointerMove(150, 150, el);
    });

    // Even though onPointerDown is invoked manually, the window listeners are
    // never attached when `enabled` is false, so position stays untouched.
    expect(result.current.position).toBeUndefined();
    expect(window.localStorage.length).toBe(0);
  });

  it('ignores configured selectors and safely handles missing movable dom refs', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const movableDomRef = { current: null } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: true, movableDomRef, ignoreSelectors: ['button'] }));
    const button = document.createElement('button');
    const div = document.createElement('div');
    const preventDefault = vi.fn();

    act(() => {
      result.current.onPointerDown(pointerDownArgs(div, { target: button, preventDefault }));
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.position).toBeUndefined();

    // A non-ignored target starts dragging even without a dom ref; the move
    // handler updates state but skips style writes and persistence.
    act(() => {
      result.current.onPointerDown(pointerDownArgs(div, { preventDefault }));
      dispatchPointerMove(220, 170, div);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    // div has no defined offsetWidth/offsetHeight (jsdom returns 0), so bounds
    // stay at the window size: newLeft = 220 - 0 - 10 = 210, newTop = 170 - 10 = 160.
    expect(result.current.position).toEqual({ left: 210, top: 160 });
    expect(window.localStorage.length).toBe(0);

    // Shrink the window: the clamp runs with a position but without a dom ref
    // or storageKey, exercising the fallback branches.
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      // rect?.width ?? 0 -> maxLeft = 120 - 0 = 120, maxTop = 90 - 0 = 90
      expect(result.current.position).toEqual({ left: 120, top: 90 });
    });
    expect(window.localStorage.length).toBe(0);
  });

  it('uses viewPortRef as the bounds container and observes it', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 999 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 999 });

    const observe = vi.fn();
    const disconnect = vi.fn();
    globalThis.ResizeObserver = class {
      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;
    } as unknown as typeof ResizeObserver;

    const viewPort = document.createElement('div');
    document.body.appendChild(viewPort);
    defineRect(viewPort, { left: 50, top: 30, width: 200, height: 150 });
    Object.defineProperty(viewPort, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(viewPort, 'clientHeight', { configurable: true, value: 150 });
    const viewPortRef = { current: viewPort } as unknown as RefObject<HTMLElement>;

    const el = createMovableElement({ left: 0, top: 0, width: 50, height: 30 });
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;

    const { result, unmount } = renderHook(() => useMovable({ enabled: true, movableDomRef, viewPortRef }));
    expect(observe).toHaveBeenCalledWith(viewPort);

    act(() => {
      result.current.onPointerDown(pointerDownArgs(el, { clientX: 60, clientY: 50, pointerId: 3 }));
      dispatchPointerMove(130, 100, el);
    });

    // newLeft = clientX - viewPort.x - offsetX = 130 - 50 - 60 = 20
    // newTop  = clientY - viewPort.y - offsetY = 100 - 30 - 50 = 20
    expect(result.current.position).toEqual({ left: 20, top: 20 });
    expect(el.style.left).toBe('20px');
    expect(el.style.top).toBe('20px');

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('tolerates pointer capture failure', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const el = createMovableElement({ left: 0, top: 0, width: 100, height: 50 });
    el.setPointerCapture = vi.fn(() => {
      throw new Error('capture failed');
    });
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: true, movableDomRef }));
    const preventDefault = vi.fn();

    act(() => {
      result.current.onPointerDown(pointerDownArgs(el, { preventDefault }));
      dispatchPointerMove(220, 170, el);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.position).toEqual({ left: 200, top: 150 });
  });

  it('ignores pointermove when not dragging', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });

    const el = createMovableElement({ left: 0, top: 0, width: 100, height: 50 });
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;
    const { result } = renderHook(() => useMovable({ enabled: true, movableDomRef }));

    act(() => {
      dispatchPointerMove(220, 170, el);
    });

    expect(result.current.position).toBeUndefined();
  });

  it('falls back when the viewport rect lacks x/y coordinates', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 999 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 999 });
    globalThis.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;

    const viewPort = document.createElement('div');
    document.body.appendChild(viewPort);
    // rect without x/y -> getViewPortSize must fall back to 0 for the offset.
    Object.defineProperty(viewPort, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, width: 200, height: 150 }),
    });
    Object.defineProperty(viewPort, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(viewPort, 'clientHeight', { configurable: true, value: 150 });
    const viewPortRef = { current: viewPort } as unknown as RefObject<HTMLElement>;

    const el = createMovableElement({ left: 0, top: 0, width: 50, height: 30 });
    const movableDomRef = { current: el } as unknown as RefObject<HTMLElement>;

    const { result } = renderHook(() => useMovable({ enabled: true, movableDomRef, viewPortRef }));

    act(() => {
      result.current.onPointerDown(pointerDownArgs(el, { clientX: 30, clientY: 30, pointerId: 4 }));
      dispatchPointerMove(120, 100, el);
    });

    // viewPortSize = { x: 0, y: 0, width: 200, height: 150 }
    // newLeft = 120 - 0 - 30 = 90, newTop = 100 - 0 - 30 = 70 (within bounds)
    expect(result.current.position).toEqual({ left: 90, top: 70 });
  });

  it('clamps without a dom ref, still persisting and calling onMove', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 120 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 90 });
    window.localStorage.setItem('movable-noref', JSON.stringify({ left: 300, top: 200 }));

    const movableDomRef = { current: null } as unknown as RefObject<HTMLElement>;
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useMovable({ enabled: true, movableDomRef, storageKey: 'movable-noref', onMove }),
    );

    await waitFor(() => {
      expect(result.current.position).toEqual({ left: 120, top: 90 });
    });
    expect(window.localStorage.getItem('movable-noref')).toBe(JSON.stringify({ left: 120, top: 90 }));
    expect(onMove).toHaveBeenCalledWith({ left: 120, top: 90 });
  });
});
