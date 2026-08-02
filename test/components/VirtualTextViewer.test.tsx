import type { LayoutCursor } from '@chenglou/pretext';
import { act, fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VirtualTextViewer from '../../src/components/VirtualTextViewer';

// --- hoisted deterministic layout engine ---
const pretextStore = vi.hoisted(() => {
  const state: {
    lineCount: number;
    maxLineWidth: number;
    rangeQueue: ({ end: LayoutCursor } | null)[];
    materialQueue: { text: string; width: number }[];
  } = {
    lineCount: 0,
    maxLineWidth: 0,
    rangeQueue: [],
    materialQueue: [],
  };
  return {
    state,
    prepareWithSegments: vi.fn((_text: string, _font: string) => ({ segments: [] })),
    measureLineStats: vi.fn(() => ({ lineCount: state.lineCount, maxLineWidth: state.maxLineWidth })),
    layoutNextLineRange: vi.fn((): { end: LayoutCursor } | null => {
      const next = state.rangeQueue.shift();
      if (next === undefined) {
        return { end: { segmentIndex: 0, graphemeIndex: 0 } };
      }
      return next;
    }),
    materializeLineRange: vi.fn((): { text: string; width: number } => {
      const next = state.materialQueue.shift();
      if (next === undefined) {
        return { text: '', width: 0 };
      }
      return next;
    }),
  };
});

vi.mock('@chenglou/pretext', () => ({
  prepareWithSegments: pretextStore.prepareWithSegments,
  measureLineStats: pretextStore.measureLineStats,
  layoutNextLineRange: pretextStore.layoutNextLineRange,
  materializeLineRange: pretextStore.materializeLineRange,
}));

// --- capture-style ResizeObserver ---
type ROCallback = ResizeObserverCallback;
const roState = vi.hoisted(() => ({ callback: undefined as ROCallback | undefined }));
class CapturingRO implements ResizeObserver {
  static instances: CapturingRO[] = [];
  callback: ROCallback;
  constructor(callback: ROCallback) {
    this.callback = callback;
    CapturingRO.instances.push(this);
  }
  observe(target: Element) {
    roState.callback = this.callback;
  }
  disconnect() {
    roState.callback = undefined;
  }
  unobserve() {
    // noop
  }
  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
}

// --- geometry stub helpers ---
const setMetrics = (el: HTMLElement, width: number, height: number) => {
  Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
};

const triggerRO = (target: HTMLElement) => {
  act(() => {
    roState.callback?.(
      [
        {
          target,
          contentRect: { width: target.clientWidth, height: target.clientHeight },
        } as unknown as ResizeObserverEntry,
      ],
      CapturingRO.instances.at(-1)!,
    );
  });
};

const Wrapper = undefined;

beforeEach(() => {
  pretextStore.state.lineCount = 0;
  pretextStore.state.maxLineWidth = 0;
  pretextStore.state.rangeQueue.length = 0;
  pretextStore.state.materialQueue.length = 0;
  pretextStore.prepareWithSegments.mockClear();
  pretextStore.measureLineStats.mockClear();
  pretextStore.layoutNextLineRange.mockClear();
  pretextStore.materializeLineRange.mockClear();
  roState.callback = undefined;
  CapturingRO.instances.length = 0;
  vi.stubGlobal('ResizeObserver', CapturingRO);
});

describe('VirtualTextViewer', () => {
  it('renders empty state when value is empty', () => {
    const { container } = render(<VirtualTextViewer value="" />);
    expect(container.querySelector('.vtv-content')).toBeNull();
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('falls back to empty string when value is nullish (?? fallback)', () => {
    const { container } = render(<VirtualTextViewer value={null} />);
    expect(container.querySelector('div')).toBeTruthy();
    expect(container.querySelector('.vtv-content')).toBeNull();
  });

  it('renders the empty prop when value is empty', () => {
    const { container } = render(<VirtualTextViewer value="" empty={<span>No content</span>} />, {
      wrapper: Wrapper,
    });
    expect(container.textContent).toContain('No content');
  });

  it('renders no lines while viewport width is unknown (defensive branch)', () => {
    const { container } = render(
      <VirtualTextViewer value="hello" lineClassName="vtv-line" contentClassName="vtv-content" />,
      { wrapper: Wrapper },
    );
    // clientWidth defaults to 0 in jsdom -> lineWidth=0 -> lineCount=0 -> no rows
    const content = container.querySelector('.vtv-content');
    expect(content).toBeTruthy();
    expect(container.querySelectorAll('.vtv-line')).toHaveLength(0);
  });

  it('measures the viewport on mount and renders visible lines', () => {
    pretextStore.state.lineCount = 3;
    pretextStore.state.materialQueue = [
      { text: 'line one', width: 60 },
      { text: 'line two', width: 80 },
      { text: 'line three', width: 120 },
    ];
    const { container } = render(<VirtualTextViewer value="hello" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    const lines = container.querySelectorAll('.vtv-line');
    expect(lines).toHaveLength(3);
    expect(lines[0].textContent).toBe('line one');
    expect(lines[1].textContent).toBe('line two');
    expect(lines[2].textContent).toBe('line three');
  });

  it('sets content height to lineCount * lineHeight', () => {
    pretextStore.state.lineCount = 5;
    pretextStore.state.materialQueue = Array.from({ length: 5 }, (_, i) => ({ text: `l${i}`, width: 10 }));
    const { container } = render(<VirtualTextViewer value="x" lineHeight={20} contentClassName="vtv-content" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    const content = container.querySelector('.vtv-content') as HTMLElement;
    expect(content.style.height).toBe('100px');
  });

  it('applies font, letterSpacing, tabSize and line style to projected rows', () => {
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: 'tab\ttext', width: 30 }];
    const { container } = render(
      <VirtualTextViewer
        value="x"
        font="400 14px monospace"
        letterSpacing={1}
        tabSize={4}
        lineClassName="vtv-line"
        lineStyle={{ color: 'red' }}
      />,
      { wrapper: Wrapper },
    );
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    const line = container.querySelector('.vtv-line') as HTMLElement;
    // CSSOM normalizes the font shorthand together with lineHeight (set to 22px
    // by the component), so assert the composed value.
    expect(line.style.font).toBe('400 14px / 22px monospace');
    expect(line.style.letterSpacing).toBe('1px');
    expect(line.style.tabSize).toBe('4');
    expect(line.style.color).toBe('red');
  });

  it('adds a title attribute when a line exceeds the viewport width', () => {
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: 'long line', width: 500 }];
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    expect(container.querySelector('.vtv-line')?.getAttribute('title')).toBe('long line');
  });

  it('renders a non-breaking space for empty line text', () => {
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: '', width: 0 }];
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    expect(container.querySelector('.vtv-line')?.textContent).toBe('\u00a0');
  });

  it('updates the visible window when scrolling', () => {
    pretextStore.state.lineCount = 100;
    pretextStore.state.materialQueue = Array.from({ length: 40 }, (_, i) => ({ text: `line-${i}`, width: 10 }));
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />);
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 44);
    triggerRO(scrollContainer);
    // jsdom: fireEvent.scroll does not mutate el.scrollTop, but the component
    // reads event.currentTarget.scrollTop — set the DOM property first.
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 220, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    // scrollTop=220, lineHeight=22, overscan=8:
    // start = floor(220/22)-8 = 2, end = ceil((220+44)/22)+8 = 20
    // The materialize queue is consumed sequentially, so assert the window size
    // and each row's top offset (line.index * lineHeight) rather than text.
    const lines = container.querySelectorAll('.vtv-line');
    expect(lines).toHaveLength(18);
    expect((lines[0] as HTMLElement).style.top).toBe('44px');
    expect((lines[17] as HTMLElement).style.top).toBe('418px');
  });

  it('clamps scrollTop beyond maxScrollTop after content shrinks', () => {
    pretextStore.state.lineCount = 3;
    pretextStore.state.materialQueue = Array.from({ length: 20 }, (_, i) => ({ text: `l${i}`, width: 5 }));
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    // Simulate a previously large scroll position before metrics are known:
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 9999, writable: true, configurable: true });
    triggerRO(scrollContainer);
    // totalHeight = 3*22 = 66, maxScrollTop = 66-22 = 44 -> clamp to 44
    expect(scrollContainer.scrollTop).toBe(44);
  });

  it('passes rest props to the container and applies custom height', () => {
    const { container } = render(<VirtualTextViewer value="" height={300} aria-label="viewer" data-testid="vtv" />, {
      wrapper: Wrapper,
    });
    const root = container.querySelector('[data-testid="vtv"]') as HTMLElement;
    expect(root.style.height).toBe('300px');
    expect(root.getAttribute('aria-label')).toBe('viewer');
  });

  it('stores checkpoints every CHECKPOINT_INTERVAL lines', () => {
    pretextStore.state.lineCount = 300;
    pretextStore.state.materialQueue = Array.from({ length: 100 }, (_, i) => ({ text: `l${i}`, width: 5 }));
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />);
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 44);
    triggerRO(scrollContainer);
    // Step 1: start=100 -> getCheckpointCursor's while loop passes 100 and
    // stores checkpoint 100 (window 100..118 does NOT contain index 99, so
    // collectVisibleLines does not pre-store it).
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 2376, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(container.querySelectorAll('.vtv-line').length).toBeGreaterThan(0);
    // Step 2: start=191 -> collectVisibleLines window 191..209 contains index
    // 199, storing checkpoint 200 (a different key than step 1).
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 4202, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(container.querySelectorAll('.vtv-line').length).toBeGreaterThan(0);
    // Step 3: scroll back to the top: getCheckpointCursor's forEach now
    // iterates stored checkpoints {0, 100, 200} while targetLineIndex=0 ->
    // lineIndex > target false branch.
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(container.querySelectorAll('.vtv-line').length).toBeGreaterThan(0);
    expect(pretextStore.layoutNextLineRange).toHaveBeenCalled();
  });

  it('renders empty window when scrollTop exceeds content (end <= start)', () => {
    pretextStore.state.lineCount = 3;
    pretextStore.state.materialQueue = Array.from({ length: 20 }, (_, i) => ({ text: `l${i}`, width: 5 }));
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />);
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    // Scroll beyond the content: start = floor(9999/22)-8 = 446 > lineCount=3,
    // so endLineIndex (min(3,...)=3) <= startLineIndex -> visibleLines = [].
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 9999, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(container.querySelectorAll('.vtv-line')).toHaveLength(0);
  });

  it('returns terminal cursor when layoutNextLineRange returns null (while walking)', () => {
    pretextStore.state.lineCount = 50;
    // Initial window (start=0, end=10) consumes 10 normal ranges; the next
    // layout call happens inside getCheckpointCursor's while loop after
    // scrolling, and that call returns null -> terminal cursor fallback.
    pretextStore.state.rangeQueue = (
      Array.from({ length: 10 }, () => ({
        end: { segmentIndex: 0, graphemeIndex: 0 },
      })) as ({ end: LayoutCursor } | null)[]
    ).concat([null]);
    pretextStore.state.materialQueue = Array.from({ length: 11 }, (_, i) => ({ text: `x${i}`, width: 5 }));
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />);
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 44);
    triggerRO(scrollContainer);
    expect(container.querySelectorAll('.vtv-line')).toHaveLength(10);
    // Scroll so startLineIndex > 0 -> getCheckpointCursor walks lines and hits
    // the null range -> falls back to the terminal cursor.
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 220, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(container.querySelector('.vtv-line')).toBeTruthy();
  });

  it('breaks the visible line loop when layoutNextLineRange returns null mid-window', () => {
    pretextStore.state.lineCount = 10;
    pretextStore.state.rangeQueue = [null]; // first call (startLineIndex=0) returns null
    pretextStore.state.materialQueue = [{ text: 'x', width: 5 }];
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    expect(container.querySelectorAll('.vtv-line')).toHaveLength(0);
  });

  it('re-prepares text when font changes', () => {
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: 'a', width: 5 }];
    const { container, rerender } = render(<VirtualTextViewer value="x" font="400 14px a" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    const callsBefore = pretextStore.prepareWithSegments.mock.calls.length;
    rerender(<VirtualTextViewer value="x" font="400 14px b" />);
    expect(pretextStore.prepareWithSegments.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('re-renders after document.fonts.ready resolves', async () => {
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    let resolveFonts!: () => void;
    Object.defineProperty(document, 'fonts', {
      value: { ready: new Promise<void>((resolve) => (resolveFonts = resolve)) },
      configurable: true,
    });
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: 'a', width: 5 }];
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    const callsBefore = pretextStore.prepareWithSegments.mock.calls.length;
    await act(async () => {
      resolveFonts();
      await Promise.resolve();
    });
    expect(pretextStore.prepareWithSegments.mock.calls.length).toBeGreaterThan(callsBefore);
    if (fontsDescriptor) {
      Object.defineProperty(document, 'fonts', fontsDescriptor);
    } else {
      delete (document as Omit<Document, 'fonts'> & { fonts?: unknown }).fonts;
    }
  });

  it('ignores ResizeObserver entries whose target is not a div', () => {
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: 'a', width: 5 }];
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />);
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    expect(container.querySelectorAll('.vtv-line')).toHaveLength(1);
    // Non-div target: RO callback returns early without updating viewport.
    act(() => {
      roState.callback?.(
        [{ target: document.body, contentRect: { width: 999, height: 999 } } as unknown as ResizeObserverEntry],
        CapturingRO.instances.at(-1)!,
      );
    });
    // Viewport metrics unchanged (still 400 wide -> 1 line).
    expect(container.querySelectorAll('.vtv-line')).toHaveLength(1);
  });

  it('skips fontEpoch bump when the component unmounts before fonts.ready resolves', async () => {
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    let resolveFonts!: () => void;
    Object.defineProperty(document, 'fonts', {
      value: { ready: new Promise<void>((resolve) => (resolveFonts = resolve)) },
      configurable: true,
    });
    pretextStore.state.lineCount = 1;
    pretextStore.state.materialQueue = [{ text: 'a', width: 5 }];
    const { container, unmount } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />);
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    const callsBefore = pretextStore.prepareWithSegments.mock.calls.length;
    unmount(); // cleanup sets cancelled=true before the promise resolves
    await act(async () => {
      resolveFonts();
      await Promise.resolve();
    });
    // cancelled=true -> setFontEpoch not called -> prepared not re-computed.
    expect(pretextStore.prepareWithSegments.mock.calls.length).toBe(callsBefore);
    if (fontsDescriptor) {
      Object.defineProperty(document, 'fonts', fontsDescriptor);
    } else {
      Reflect.deleteProperty(document, 'fonts');
    }
  });

  it('keeps a stable checkpoint cache per width and resets when text changes', () => {
    pretextStore.state.lineCount = 5;
    pretextStore.state.materialQueue = Array.from({ length: 5 }, (_, i) => ({ text: `l${i}`, width: 5 }));
    const { container } = render(<VirtualTextViewer value="x" lineClassName="vtv-line" />, {
      wrapper: Wrapper,
    });
    const scrollContainer = container.querySelector('div')!;
    setMetrics(scrollContainer, 400, 22);
    triggerRO(scrollContainer);
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 22 } });
    expect(container.querySelectorAll('.vtv-line').length).toBeGreaterThan(0);
  });
});
