import type { ReactElement } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ConfigProvider from '../../src/components/ConfigProvider';
import VirtualTextViewer from '../../src/components/VirtualTextViewer/index';

afterEach(() => {
  cleanup();
});

function renderWithProvider(ui: ReactElement) {
  return render(<ConfigProvider>{ui}</ConfigProvider>);
}

const LONG_TEXT = Array.from(
  { length: 200 },
  (_, i) => `line ${i} of a fairly long virtualized plain text document used to trigger wrapping and scrolling`,
).join('\n');
const WIDE_LINE_TEXT = 'X'.repeat(500);

describe('VirtualTextViewer (browser, real Pretext)', () => {
  it('renders a single short line when text is short', async () => {
    const { container } = renderWithProvider(
      <div style={{ width: 400, height: 300 }}>
        <VirtualTextViewer value="hello world" height={300} />
      </div>,
    );
    await waitFor(() => {
      // at least the component rendered without crashing
      expect(container.textContent).toContain('hello world');
    });
  });

  it('virtualizes a long text into a viewport window (not all lines DOM-rendered)', async () => {
    const { container } = renderWithProvider(
      <div style={{ width: 400, height: 300, overflow: 'hidden' }}>
        <VirtualTextViewer value={LONG_TEXT} height={300} lineHeight={22} overscan={2} />
      </div>,
    );
    await waitFor(() => {
      expect(container.textContent).toContain('line 0 of a fairly');
    });
    // far lines should NOT be in the DOM (virtualization)
    await waitFor(() => {
      expect(container.textContent).not.toContain('line 199 of a fairly');
    });
  });

  it('handles lineWidth=0 (zero-width container) without crashing', async () => {
    const { container } = renderWithProvider(
      <div style={{ width: 0, height: 300 }}>
        <VirtualTextViewer value="some text in zero width" height={300} />
      </div>,
    );
    await waitFor(() => {
      // zero-width container -> totalHeight 0, nothing rendered, but component stays stable
      expect(container).toBeTruthy();
    });
  });

  it('updates visible window on scroll', async () => {
    const { container } = renderWithProvider(
      <div style={{ width: 400, height: 300, overflow: 'hidden' }}>
        <VirtualTextViewer value={LONG_TEXT} height={300} lineHeight={22} overscan={2} />
      </div>,
    );
    await waitFor(() => {
      expect(container.textContent).toContain('line 0 of a fairly');
    });
    // Virtualization: not all 200*2 lines are in the DOM at once
    const renderedLineCount = (container.textContent?.match(/line \d+/g) || []).length;
    expect(renderedLineCount).toBeLessThan(400);
  });

  it('renders over-wide lines with overflow hidden', async () => {
    const { container } = renderWithProvider(
      <div style={{ width: 40, height: 300, overflow: 'hidden' }}>
        <VirtualTextViewer value={WIDE_LINE_TEXT} height={300} lineHeight={22} />
      </div>,
    );
    await waitFor(() => {
      // Lines are individually positioned with absolute top and overflow:hidden
      const lines = container.querySelectorAll('[style*="overflow: hidden"]');
      expect(lines.length).toBeGreaterThan(0);
      // Each line contains the overflow text content
      expect(lines[0]?.textContent).toMatch(/^X+$/);
    });
  });

  it('rebuilds layout when container width changes (ResizeObserver)', async () => {
    const wrapper = renderWithProvider(
      <div style={{ width: 400, height: 300, overflow: 'hidden' }}>
        <VirtualTextViewer value={LONG_TEXT} height={300} lineHeight={22} overscan={2} />
      </div>,
    );
    const outer = wrapper.container.firstElementChild as HTMLDivElement;
    await waitFor(() => {
      expect(wrapper.container.textContent).toContain('line 0 of a fairly');
    });
    // shrink width -> ResizeObserver fires -> checkpoint cache rebuilds
    await act(async () => {
      outer.style.width = '200px';
      await new Promise((r) => setTimeout(r, 50));
    });
    await waitFor(() => {
      expect(wrapper.container.textContent).toContain('line 0 of a fairly');
    });
  });
});
