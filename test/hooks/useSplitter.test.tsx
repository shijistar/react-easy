import type { PropsWithChildren } from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import ReactEasyContext, { defaultContextValue, type ReactEasyContextProps } from '../../src/components/ConfigProvider/context';
import useSplitter, { type UseSplitterProps } from '../../src/hooks/useSplitter';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/hooks/style/useSplitter', () => ({
  default: vi.fn(() => ({
    wrapCSSVar: (node: React.ReactNode) => node,
    hashId: 'hash-id',
    cssVarCls: 'css-var-cls',
  })),
}));

function createWrapper(value?: Partial<ReactEasyContextProps>) {
  const contextValue: ReactEasyContextProps = {
    ...defaultContextValue,
    getPrefixCls: (suffixCls: string, customizePrefixCls?: string) => customizePrefixCls ?? `easy-${suffixCls}`,
    ...value,
  };

  return function Wrapper({ children }: PropsWithChildren) {
    return <ReactEasyContext.Provider value={contextValue}>{children}</ReactEasyContext.Provider>;
  };
}

function defineRect(
  element: HTMLDivElement,
  rect: { left: number; top: number; width: number; height: number },
) {
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
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: rect.width });
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: rect.height });
}

function SplitterHarness(props: UseSplitterProps) {
  const splitter = useSplitter(props);
  return (
    <div data-testid="parent">
      {splitter.dom}
      <span data-testid="percent">{String(splitter.percent)}</span>
      <span data-testid="width">{String(splitter.width)}</span>
      <span data-testid="dragging">{String(splitter.dragging)}</span>
      <span data-testid="direction">{splitter.direction}</span>
    </div>
  );
}

describe('useSplitter', () => {
  it('initializes vertical splitter, toggles hover/dragging classes, and clamps ratio changes', async () => {
    const container = document.createElement('div');
    defineRect(container, { left: 0, top: 0, width: 200, height: 100 });
    const onChange = vi.fn();

    render(<SplitterHarness
      container={container}
      defaultRatio={0.25}
      minRatio={0.2}
      maxRatio={0.6}
      splitterWidth={4}
      className="custom-root"
      classNames={{ hover: 'hovered', dragging: 'dragging-extra', handle: 'handle-extra' }}
      styles={{ handle: { color: 'red' } }}
      onChange={onChange}
    />, {
      wrapper: createWrapper(),
    });

    const separator = screen.getByRole('separator', { name: 'Resize' });

    await waitFor(() => {
      expect(screen.getByTestId('percent').textContent).toBe('0.25');
      expect(screen.getByTestId('width').textContent).toBe('50');
    });

    expect(separator.className).toContain('easy-splitter-vertical');
    expect(separator.className).toContain('custom-root');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator.style.getPropertyValue('--splitter-width')).toBe('4px');
    expect(screen.getByTestId('direction').textContent).toBe('vertical');

    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
    expect(screen.getByTestId('percent').textContent).toBe('0.25');

    fireEvent.mouseEnter(separator);
    expect(separator.className).toContain('easy-splitter-hover');
    expect(separator.className).toContain('hovered');

    fireEvent.mouseDown(separator);

    await waitFor(() => {
      expect(screen.getByTestId('dragging').textContent).toBe('true');
    });
    expect(separator.className).toContain('easy-splitter-dragging');
    expect(separator.className).toContain('dragging-extra');

    fireEvent.mouseMove(window, { clientX: 150, clientY: 10 });

    await waitFor(() => {
      expect(screen.getByTestId('percent').textContent).toBe('0.6');
      expect(screen.getByTestId('width').textContent).toBe('150');
    });
    expect(onChange).toHaveBeenLastCalledWith(0.6);

    fireEvent.mouseUp(window);
    await waitFor(() => {
      expect(screen.getByTestId('dragging').textContent).toBe('false');
    });

    fireEvent.mouseLeave(separator);
    expect(separator.className).not.toContain('easy-splitter-hover');
    const handle = separator.querySelector('.easy-splitter-handle.handle-extra') as HTMLDivElement;
    expect(handle.style.color).toBe('red');
  });

  it('supports horizontal direction and auto-detects parent container', async () => {
    render(<SplitterHarness direction="horizontal" defaultRatio={0.5} minRatio={0.1} maxRatio={0.7} />, {
      wrapper: createWrapper({ getPrefixCls: (suffixCls) => `ctx-${suffixCls}` }),
    });

    const parent = screen.getByTestId('parent') as HTMLDivElement;
    defineRect(parent, { left: 10, top: 20, width: 300, height: 240 });

    const separator = screen.getByRole('separator', { name: 'Resize' });

    await waitFor(() => {
      expect(screen.getByTestId('percent').textContent).toBe('0.5');
      expect(screen.getByTestId('width').textContent).toBe('undefined');
    });

    expect(separator.className).toContain('ctx-splitter-horizontal');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');

    fireEvent.mouseDown(separator);
    fireEvent.mouseMove(window, { clientX: 0, clientY: 400 });

    await waitFor(() => {
      expect(screen.getByTestId('percent').textContent).toBe('0.7');
      expect(screen.getByTestId('width').textContent).toBe('380');
    });
  });

  it('initializes width and triggers onChange when defaultRatio is introduced after mount', async () => {
    const verticalContainer = document.createElement('div');
    defineRect(verticalContainer, { left: 0, top: 0, width: 200, height: 120 });
    const verticalOnChange = vi.fn();
    const verticalView = render(<SplitterHarness container={verticalContainer} onChange={verticalOnChange} />, {
      wrapper: createWrapper(),
    });

    verticalView.rerender(<SplitterHarness container={verticalContainer} defaultRatio={0.4} onChange={verticalOnChange} />);

    await waitFor(() => {
      expect(screen.getByTestId('width').textContent).toBe('80');
    });
    expect(verticalOnChange).toHaveBeenCalledWith(0.4);

    verticalView.unmount();

    const horizontalContainer = document.createElement('div');
    defineRect(horizontalContainer, { left: 0, top: 0, width: 300, height: 180 });
    const horizontalOnChange = vi.fn();
    const horizontalView = render(<SplitterHarness container={horizontalContainer} direction="horizontal" onChange={horizontalOnChange} />, {
      wrapper: createWrapper(),
    });

    horizontalView.rerender(
      <SplitterHarness container={horizontalContainer} direction="horizontal" defaultRatio={0.5} onChange={horizontalOnChange} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('width').textContent).toBe('90');
    });
    expect(horizontalOnChange).toHaveBeenCalledWith(0.5);
  });

  it('supports undefined props, missing container during drag, and splitterWidth=0', async () => {
    const hookView = renderHook(() => useSplitter(undefined as never), {
      wrapper: createWrapper(),
    });

    expect(hookView.result.current.direction).toBe('vertical');

    const element = hookView.result.current.dom as React.ReactElement;
    expect(element.props.style['--splitter-width']).toBe('1px');

    act(() => {
      element.props.onMouseDown();
    });

    act(() => {
      fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });
    });

    await waitFor(() => {
      expect(hookView.result.current.dragging).toBe(true);
      expect(hookView.result.current.width).toBeUndefined();
    });

    act(() => {
      fireEvent.mouseUp(window);
    });

    const zeroWidthView = renderHook(() => useSplitter({ splitterWidth: 0 }), {
      wrapper: createWrapper(),
    });
    const zeroElement = zeroWidthView.result.current.dom as React.ReactElement;

    expect(zeroElement.props.style['--splitter-width']).toBeUndefined();
  });
});
