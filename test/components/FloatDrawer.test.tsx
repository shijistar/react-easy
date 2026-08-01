import type { PropsWithChildren } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import ReactEasyContext, {
  defaultContextValue,
  type ReactEasyContextProps,
} from '../../src/components/ConfigProvider/context';
import FloatDrawer from '../../src/components/FloatDrawer';

// Global polyfills for jsdom (needed by antd css-in-js)
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

// antd v6 responsiveObserver / useBreakpoint require matchMedia in jsdom
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // stub method (deprecated API)
    },
    removeListener: () => {
      // stub method (deprecated API)
    },
    addEventListener: () => {
      // stub method
    },
    removeEventListener: () => {
      // stub method
    },
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

function createWrapper(value?: Partial<ReactEasyContextProps>) {
  const contextValue: ReactEasyContextProps = {
    ...defaultContextValue,
    getPrefixCls: (suffixCls, customizePrefixCls?) => customizePrefixCls ?? `easy-${suffixCls}`,
    ...value,
  };
  return function Wrapper({ children }: PropsWithChildren) {
    return <ReactEasyContext.Provider value={contextValue}>{children}</ReactEasyContext.Provider>;
  };
}

function renderDrawer(props: Parameters<typeof FloatDrawer>[0]) {
  return render(<FloatDrawer {...props} />, { wrapper: createWrapper() });
}

// Drive a full resize drag: mousedown on the handle, then move on window,
// then mouseup. The drag listeners are attached in an effect after
// setIsDragging(true), so we wait for that before dispatching moves.
async function dragResize(handle: Element, from: { x: number; y: number }, to: { x: number; y: number }) {
  fireEvent.mouseDown(handle, { clientX: from.x, clientY: from.y });
  await waitFor(() => {
    expect(document.body.className).toBe(document.body.className); // effect flush point
  });
  await act(async () => {
    fireEvent.mouseMove(window, { clientX: to.x, clientY: to.y });
  });
  await act(async () => {
    fireEvent.mouseUp(window);
  });
}

describe('FloatDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders default right position with drawer, content and toggle', () => {
    const { container } = renderDrawer({ children: <span>Drawer Content</span> });
    expect(container.querySelector('.easy-float-drawer')).toBeTruthy();
    expect(container.querySelector('.easy-float-drawer-drawer')).toBeTruthy();
    expect(container.querySelector('.easy-float-drawer-toggle')).toBeTruthy();
    expect(container.querySelector('.easy-float-drawer-right')).toBeTruthy();
    // isOpen starts undefined -> closed class
    expect(container.querySelector('.easy-float-drawer-closed')).toBeTruthy();
  });

  it('renders each position class', () => {
    const { container, rerender } = renderDrawer({ position: 'left' });
    expect(container.querySelector('.easy-float-drawer-left')).toBeTruthy();
    rerender(<FloatDrawer position="top" />);
    expect(container.querySelector('.easy-float-drawer-top')).toBeTruthy();
    rerender(<FloatDrawer position="bottom" />);
    expect(container.querySelector('.easy-float-drawer-bottom')).toBeTruthy();
  });

  it('renders open and closed classes from controlled open prop', async () => {
    const { container, rerender } = renderDrawer({ open: true });
    await waitFor(() => {
      expect(container.querySelector('.easy-float-drawer-open')).toBeTruthy();
    });
    rerender(<FloatDrawer open={false} />);
    await waitFor(() => {
      expect(container.querySelector('.easy-float-drawer-closed')).toBeTruthy();
    });
  });

  it('toggles open state and fires onOpenChange when uncontrolled', async () => {
    const onOpenChange = vi.fn();
    const { container } = renderDrawer({ onOpenChange, children: <span>Content</span> });
    const toggle = container.querySelector('.easy-float-drawer-toggle')!;
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(container.querySelector('.easy-float-drawer-open')).toBeTruthy();
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('renders position-specific close/open icons', () => {
    // right: close icon is LeftOutlined (anticon-left), open icon RightOutlined
    const { container } = renderDrawer({ position: 'right' });
    expect(container.querySelector('.easy-float-drawer-handle-icon .anticon-left')).toBeTruthy();
    const { container: leftContainer } = renderDrawer({ position: 'left' });
    expect(leftContainer.querySelector('.easy-float-drawer-handle-icon .anticon-right')).toBeTruthy();
    const { container: topContainer } = renderDrawer({ position: 'top' });
    expect(topContainer.querySelector('.easy-float-drawer-handle-icon .anticon-down')).toBeTruthy();
    const { container: bottomContainer } = renderDrawer({ position: 'bottom' });
    expect(bottomContainer.querySelector('.easy-float-drawer-handle-icon .anticon-up')).toBeTruthy();
  });

  it('shows open icon when open (toggle icon switches)', async () => {
    const { container } = renderDrawer({ position: 'right' });
    const toggle = container.querySelector('.easy-float-drawer-toggle')!;
    fireEvent.click(toggle); // now open
    await waitFor(() => {
      expect(container.querySelector('.easy-float-drawer-handle-icon .anticon-right')).toBeTruthy();
    });
  });

  it('does not render toggle when showToggle=false', () => {
    const { container } = renderDrawer({ showToggle: false });
    expect(container.querySelector('.easy-float-drawer-toggle')).toBeNull();
  });

  it('does not render resize handle when resizable=false', () => {
    const { container } = renderDrawer({ resizable: false });
    expect(container.querySelector('.easy-float-drawer-resize-handle')).toBeNull();
  });

  it('renders resize handle when resizable (default)', () => {
    const { container } = renderDrawer({});
    expect(container.querySelector('.easy-float-drawer-resize-handle')).toBeTruthy();
  });

  it('unmounts content when destroyOnClose and closed', async () => {
    const { container, rerender } = renderDrawer({ destroyOnClose: true, open: true, children: <span>Secret</span> });
    await waitFor(() => {
      expect(container.textContent).toContain('Secret');
    });
    rerender(<FloatDrawer destroyOnClose open={false} children={<span>Secret</span>} />);
    await waitFor(() => {
      expect(container.textContent).not.toContain('Secret');
    });
  });

  it('keeps content mounted when destroyOnClose is false', () => {
    const { container } = renderDrawer({ open: false, children: <span>Kept</span> });
    expect(container.textContent).toContain('Kept');
  });

  it('applies defaultSize as width for left/right positions', () => {
    const { container } = renderDrawer({ defaultSize: 320 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('320px');
  });

  it('applies defaultSize as height for top/bottom positions', () => {
    const { container } = renderDrawer({ position: 'top', defaultSize: 180 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.height).toBe('180px');
  });

  it('reads cached size from localStorage when cacheKey matches', () => {
    localStorage.setItem('float-size', '260');
    const { container } = renderDrawer({ cacheKey: 'float-size' });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('260px');
  });

  it('resizes right drawer on drag and fires onResize', async () => {
    const onResize = vi.fn();
    const { container } = renderDrawer({ defaultSize: 300, onResize });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    // right: newSize = 300 - (clientX - startX); move right 50 -> 250
    await dragResize(handle, { x: 100, y: 10 }, { x: 150, y: 10 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('250px');
    expect(onResize).toHaveBeenCalledWith(250);
  });

  it('resizes left drawer with inverted delta', async () => {
    const { container } = renderDrawer({ position: 'left', defaultSize: 300 });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    // left: newSize = size - (startX - clientX) = size + (clientX - startX);
    // move right 50 (clientX increases) -> 350
    await dragResize(handle, { x: 50, y: 10 }, { x: 100, y: 10 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('350px');
  });

  it('resizes top drawer by clientY delta', async () => {
    const { container } = renderDrawer({ position: 'top', defaultSize: 200 });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    // top: newSize = size - (startY - clientY) = size + (clientY - startY);
    // move down 40 (clientY increases) -> 240
    await dragResize(handle, { x: 10, y: 60 }, { x: 10, y: 100 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.height).toBe('240px');
  });

  it('resizes bottom drawer by clientY delta', async () => {
    const { container } = renderDrawer({ position: 'bottom', defaultSize: 200 });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    // bottom: newSize = 200 - (clientY - startY); move down 40 -> 160
    await dragResize(handle, { x: 10, y: 100 }, { x: 10, y: 140 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.height).toBe('160px');
  });

  it('clamps size to minSize and maxSize', async () => {
    const { container } = renderDrawer({ defaultSize: 300, minSize: 200, maxSize: 400 });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    // right: move right 200 -> 100 (< min, clamped: no update)
    await dragResize(handle, { x: 100, y: 10 }, { x: 300, y: 10 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('300px'); // unchanged
    // move left 150 -> 450 (> max, no update)
    await dragResize(handle, { x: 100, y: 10 }, { x: -50, y: 10 });
    expect(drawer.style.width).toBe('300px');
    // move left 50 -> 350 (within range, updates)
    await dragResize(handle, { x: 100, y: 10 }, { x: 50, y: 10 });
    expect(drawer.style.width).toBe('350px');
  });

  it('persists resized size to localStorage when cacheKey set', async () => {
    const { container } = renderDrawer({ cacheKey: 'persist-size', defaultSize: 300 });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    await dragResize(handle, { x: 100, y: 10 }, { x: 150, y: 10 }); // -> 250
    expect(localStorage.getItem('persist-size')).toBe('250');
  });

  it('measures initial size from getBoundingClientRect when size is undefined', async () => {
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 360,
      height: 240,
      top: 0,
      left: 0,
      right: 360,
      bottom: 240,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const { container } = renderDrawer({ position: 'right' });
    await waitFor(() => {
      const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
      expect(drawer.style.width).toBe('360px');
    });
    rectSpy.mockRestore();
  });

  it('renders edgeOffset number as px string and string as-is', () => {
    const { container: numContainer } = renderDrawer({ edgeOffset: 8 });
    expect(
      (numContainer.querySelector('.easy-float-drawer') as HTMLElement).style.getPropertyValue('--edge-offset'),
    ).toBe('8px');
    const { container: strContainer } = renderDrawer({ edgeOffset: '2rem' });
    expect(
      (strContainer.querySelector('.easy-float-drawer') as HTMLElement).style.getPropertyValue('--edge-offset'),
    ).toBe('2rem');
  });

  it('forwards onClick callback', () => {
    const onClick = vi.fn();
    const { container } = renderDrawer({ onClick });
    fireEvent.click(container.querySelector('.easy-float-drawer')!);
    expect(onClick).toHaveBeenCalled();
  });

  it('forwards cardProps, classNames and styles', () => {
    const { container } = renderDrawer({
      cardProps: { title: 'Card Title' },
      classNames: { drawer: 'my-drawer', toggle: 'my-toggle', content: 'my-content' },
      styles: { drawer: { background: 'red' } },
    });
    expect(container.querySelector('.my-drawer')).toBeTruthy();
    expect(container.querySelector('.my-toggle')).toBeTruthy();
    expect(container.querySelector('.my-content')).toBeTruthy();
    expect((container.querySelector('.easy-float-drawer-drawer') as HTMLElement).style.background).toBe('red');
    expect(container.textContent).toContain('Card Title');
  });

  it('supports custom prefixCls', () => {
    const { container } = renderDrawer({ prefixCls: 'my-float' });
    expect(container.querySelector('.my-float')).toBeTruthy();
  });

  it('marks handle as dragging while resizing', async () => {
    const { container } = renderDrawer({ defaultSize: 300 });
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    fireEvent.mouseDown(handle, { clientX: 100, clientY: 10 });
    await waitFor(() => {
      expect(handle.classList.contains('easy-float-drawer-resize-handle-dragging')).toBe(true);
    });
    await act(async () => {
      fireEvent.mouseUp(window);
    });
    expect(handle.classList.contains('easy-float-drawer-resize-handle-dragging')).toBe(false);
  });

  it('does not resize when starting size is falsy (dragStartSize guard)', async () => {
    // No defaultSize and no cacheKey: the measure effect (L323-328) sets size
    // from getBoundingClientRect, which jsdom reports as 0. dragStartSize.current
    // becomes 0 (falsy), so handleResize's `isDragging && dragStartSize.current`
    // guard takes the false branch and no size update happens.
    const { container } = renderDrawer({});
    const handle = container.querySelector('.easy-float-drawer-resize-handle')!;
    fireEvent.mouseDown(handle, { clientX: 100, clientY: 10 });
    await waitFor(() => {
      expect(handle.classList.contains('easy-float-drawer-resize-handle-dragging')).toBe(true);
    });
    await act(async () => {
      fireEvent.mouseMove(window, { clientX: 150, clientY: 10 });
    });
    // Guard false branch: size stays 0 (jsdom measurement), width remains 0px.
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('0px');
    await act(async () => {
      fireEvent.mouseUp(window);
    });
  });

  it('falls back to defaultSize when cached value is invalid (NaN)', () => {
    // cacheKey is set but the stored value is not numeric: Number(...) is NaN,
    // so `Number(...) || defaultSize` falls through to defaultSize.
    localStorage.setItem('bad-size', 'not-a-number');
    const { container } = renderDrawer({ cacheKey: 'bad-size', defaultSize: 280 });
    const drawer = container.querySelector('.easy-float-drawer-drawer') as HTMLElement;
    expect(drawer.style.width).toBe('280px');
  });
});
