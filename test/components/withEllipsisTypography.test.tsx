import type React from 'react';
import type { ComponentType } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import withEllipsisTypography from '../../src/components/EllipsisTypography/withEllipsisTypography';

// ResizeObserver is not part of this component's functionality, but a dependency of the underlying library.
// Therefore, no callback is needed, just mock the type to avoid errors.
// Global polyfills for jsdom (needed by antd css-in-js / rc-component resize observer)
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

// Provide a controllable resize trigger instead of relying on the real
// react-resize-detector (jsdom has no real layout, so detectEllipsis must be
// driven manually after stubbing element geometry).
const { resizeStore } = vi.hoisted(() => ({
  resizeStore: { onResize: undefined as (() => void) | undefined },
}));

vi.mock('react-resize-detector', () => ({
  useResizeDetector: (options: { onResize?: () => void }) => {
    resizeStore.onResize = options.onResize;
    return {};
  },
}));

// A simple Typography-like component for testing the HOC
const MockTypography: ComponentType<{
  children?: React.ReactNode;
  ellipsis?: unknown;
  ref?: React.Ref<HTMLElement>;
}> = (props) => {
  const { children, ...rest } = props;
  return (
    <span data-testid="mock-type" {...rest}>
      {children}
    </span>
  );
};

const EllipsisTypography = withEllipsisTypography(MockTypography);

function stubOverflow(element: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
}

describe('withEllipsisTypography', () => {
  it('renders text prop content', () => {
    const { container } = render(<EllipsisTypography text="Hello World" />);
    expect(container.textContent).toContain('Hello World');
  });

  it('renders children when text is not provided', () => {
    const { container } = render(<EllipsisTypography>Child Content</EllipsisTypography>);
    expect(container.textContent).toContain('Child Content');
  });

  it('text prop takes precedence over children', () => {
    const { container } = render(<EllipsisTypography text="Text Prop">Children</EllipsisTypography>);
    expect(container.textContent).toContain('Text Prop');
  });

  it('renders with ellipsis as true (isAutoEllipsis)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={true} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with tooltip true (isAutoTooltip)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={{ tooltip: true } as never} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with tooltip.title true (isAutoTooltipTitle)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={{ tooltip: { title: true } } as never} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with custom ellipsis object (no auto)', () => {
    const { container } = render(<EllipsisTypography text="Test" ellipsis={{ rows: 2 }} />);
    expect(container.textContent).toContain('Test');
  });

  it('renders with watchResize set to false', () => {
    const { container } = render(<EllipsisTypography text="Test" watchResize={false} />);
    expect(container.textContent).toContain('Test');
  });

  it('handles isAuto=false when ellipsis is a plain object without tooltip', () => {
    const { container } = render(
      <EllipsisTypography text="Test" ellipsis={{ rows: 3, tooltip: { title: 'custom' } } as never} />,
    );
    expect(container.textContent).toContain('Test');
  });

  it('sets tooltip title to text when ellipsis overflow is detected (isEllipsis=true branch)', async () => {
    const { container } = render(<EllipsisTypography text="Very Long Text" ellipsis={true} />);
    const span = container.querySelector('[data-testid="mock-type"]') as HTMLElement;
    expect(span).toBeTruthy();

    // Simulate real overflow: scrollWidth > clientWidth.
    stubOverflow(span, 200, 100);

    // Drive the resize detector callback inside act so the state update applies.
    await act(async () => {
      resizeStore.onResize?.();
    });

    // Hover the tooltip trigger and verify the title content appears in the portal.
    const trigger = container.firstChild as Element;
    fireEvent.mouseOver(trigger);
    await waitFor(() => {
      const tooltip = document.querySelector('.ant-tooltip');
      expect(tooltip?.textContent ?? '').toContain('Very Long Text');
    });
  });

  it('keeps tooltip title undefined when no overflow is detected (isEllipsis=false branch)', async () => {
    const { container } = render(<EllipsisTypography text="Short" ellipsis={true} />);
    const span = container.querySelector('[data-testid="mock-type"]') as HTMLElement;
    expect(span).toBeTruthy();

    // No overflow: scrollWidth <= clientWidth.
    stubOverflow(span, 100, 200);

    await act(async () => {
      resizeStore.onResize?.();
    });

    const trigger = container.firstChild as Element;
    fireEvent.mouseOver(trigger);
    // Tooltip must not render when there is no ellipsis.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.querySelector('.ant-tooltip')?.textContent ?? '').not.toContain('Short');
  });
});
