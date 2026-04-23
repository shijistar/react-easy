import type { CSSProperties, FC, HTMLAttributes, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutCursor, PreparedTextWithSegments, WordBreakMode } from '@chenglou/pretext';
import { layoutNextLineRange, materializeLineRange, measureLineStats, prepareWithSegments } from '@chenglou/pretext';
import { useRefFunction } from '../../hooks';
import type { CursorCheckpointCache, VisibleLine } from './types';

const DEFAULT_HEIGHT = 320;
const DEFAULT_LINE_HEIGHT = 22;
const DEFAULT_OVERSCAN = 8;
const DEFAULT_TAB_SIZE = 8;
const CHECKPOINT_INTERVAL = 100;
const DEFAULT_FONT = '400 14px SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace';

export interface VirtualTextViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * - **EN:** Large plain-text content to render.
   * - **CN:** 要渲染的超大纯文本内容。
   */
  value?: string | null;
  /**
   * - **EN:** Height of the scroll viewport.
   * - **CN:** 滚动视口的高度。
   *
   * @default 320
   */
  height?: CSSProperties['height'];
  /**
   * - **EN:** Fixed line height used by both Pretext layout and row projection.
   * - **CN:** 同时用于 Pretext 布局和行投影的固定行高。
   *
   * @default 22
   */
  lineHeight?: number;
  /**
   * - **EN:** Extra rows rendered before and after the viewport.
   * - **CN:** 视口前后额外渲染的缓冲行数。
   *
   * @default 8
   */
  overscan?: number;
  /**
   * - **EN:** Canvas font shorthand passed to Pretext. Keep it in sync with the rendered CSS font.
   * - **CN:** 传给 Pretext 的 Canvas font 简写，需要与实际渲染的 CSS font 保持一致。
   *
   * @default '400 14px SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
   */
  font?: string;
  /**
   * - **EN:** Letter spacing in CSS pixels, passed through to Pretext and CSS.
   * - **CN:** 字间距，单位为 CSS 像素，会同时传给 Pretext 和 CSS。
   *
   * @default 0
   */
  letterSpacing?: number;
  /**
   * - **EN:** Word-break mode forwarded to Pretext.
   * - **CN:** 透传给 Pretext 的断词模式。
   *
   * @default 'normal'
   */
  wordBreak?: WordBreakMode;
  /**
   * - **EN:** CSS tab-size used for rendering preserved tab characters.
   * - **CN:** 用于渲染保留制表符的 CSS tab-size。
   *
   * @default 8
   */
  tabSize?: number;
  /**
   * - **EN:** Content shown when the input is empty.
   * - **CN:** 输入为空时显示的内容。
   */
  empty?: ReactNode;
  /**
   * - **EN:** Class name for the absolute content canvas.
   * - **CN:** 绝对定位内容画布的类名。
   */
  contentClassName?: string;
  /**
   * - **EN:** Style for the absolute content canvas.
   * - **CN:** 绝对定位内容画布的样式。
   */
  contentStyle?: CSSProperties;
  /**
   * - **EN:** Class name for each projected row.
   * - **CN:** 每一条投影行的类名。
   */
  lineClassName?: string;
  /**
   * - **EN:** Style for each projected row.
   * - **CN:** 每一条投影行的样式。
   */
  lineStyle?: CSSProperties;
}

function cloneCursor(cursor: LayoutCursor): LayoutCursor {
  return {
    segmentIndex: cursor.segmentIndex,
    graphemeIndex: cursor.graphemeIndex,
  };
}

function getTerminalCursor(prepared: PreparedTextWithSegments): LayoutCursor {
  return {
    segmentIndex: prepared.segments.length,
    graphemeIndex: 0,
  };
}

function createCheckpointCache(width: number): CursorCheckpointCache {
  return {
    width,
    checkpoints: new Map<number, LayoutCursor>([[0, { segmentIndex: 0, graphemeIndex: 0 }]]),
  };
}

function getCheckpointCursor(
  prepared: PreparedTextWithSegments,
  lineWidth: number,
  targetLineIndex: number,
  cache: CursorCheckpointCache
): LayoutCursor {
  let closestLineIndex = 0;
  let closestCursor = cache.checkpoints.get(0) ?? { segmentIndex: 0, graphemeIndex: 0 };

  cache.checkpoints.forEach((cursor, lineIndex) => {
    if (lineIndex <= targetLineIndex && lineIndex >= closestLineIndex) {
      closestLineIndex = lineIndex;
      closestCursor = cursor;
    }
  });

  let currentLineIndex = closestLineIndex;
  let cursor = cloneCursor(closestCursor);
  while (currentLineIndex < targetLineIndex) {
    const range = layoutNextLineRange(prepared, cursor, lineWidth);
    if (range === null) {
      return getTerminalCursor(prepared);
    }
    currentLineIndex += 1;
    cursor = cloneCursor(range.end);
    if (currentLineIndex % CHECKPOINT_INTERVAL === 0 && !cache.checkpoints.has(currentLineIndex)) {
      cache.checkpoints.set(currentLineIndex, cloneCursor(cursor));
    }
  }

  return cursor;
}

function collectVisibleLines(
  prepared: PreparedTextWithSegments,
  lineWidth: number,
  startLineIndex: number,
  endLineIndex: number,
  cache: CursorCheckpointCache
): VisibleLine[] {
  if (endLineIndex <= startLineIndex) {
    return [];
  }

  let cursor = getCheckpointCursor(prepared, lineWidth, startLineIndex, cache);
  const lines: VisibleLine[] = [];

  for (let index = startLineIndex; index < endLineIndex; index++) {
    const range = layoutNextLineRange(prepared, cursor, lineWidth);
    if (range === null) {
      break;
    }

    const line = materializeLineRange(prepared, range);
    lines.push({
      index,
      text: line.text,
      width: line.width,
    });

    cursor = cloneCursor(range.end);
    if ((index + 1) % CHECKPOINT_INTERVAL === 0 && !cache.checkpoints.has(index + 1)) {
      cache.checkpoints.set(index + 1, cloneCursor(cursor));
    }
  }

  return lines;
}

/**
 * - **EN:** Virtualized plain-text viewer powered by Pretext. It predicts the wrapped line count
 *   without DOM text measurement, then only materializes and renders the visible line window.
 * - **CN:** 基于 Pretext 的纯文本虚拟查看组件。它先在不依赖 DOM 文本测量的前提下预测换行结果，再只物化并渲染视口可见的那部分行。
 *
 * @example
 *   <VirtualTextViewer value={hugeText} height={420} />;
 */
const VirtualTextViewer: FC<VirtualTextViewerProps> = (props) => {
  const {
    value,
    height = DEFAULT_HEIGHT,
    lineHeight = DEFAULT_LINE_HEIGHT,
    overscan = DEFAULT_OVERSCAN,
    font = DEFAULT_FONT,
    letterSpacing,
    wordBreak = 'normal',
    tabSize = DEFAULT_TAB_SIZE,
    empty,
    className,
    style,
    contentClassName,
    contentStyle,
    lineClassName,
    lineStyle,
    onScroll,
    ...restProps
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const checkpointCacheRef = useRef<CursorCheckpointCache | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [fontEpoch, setFontEpoch] = useState(0);
  const text = value ?? '';

  const prepared = useMemo(() => {
    void fontEpoch;
    return prepareWithSegments(text, font, { letterSpacing, whiteSpace: 'pre-wrap', wordBreak });
  }, [font, fontEpoch, letterSpacing, text, wordBreak]);
  const lineWidth = viewportWidth;

  const { lineCount } = useMemo(() => {
    return lineWidth > 0 ? measureLineStats(prepared, lineWidth) : { lineCount: 0, maxLineWidth: 0 };
  }, [lineWidth, prepared]);

  const startLineIndex = Math.max(0, Math.floor(scrollTop / lineHeight) - overscan);
  const endLineIndex = Math.min(lineCount, Math.ceil((scrollTop + viewportHeight) / lineHeight) + overscan);
  const totalHeight = lineWidth > 0 ? lineCount * lineHeight : 0;

  const visibleLines = useMemo(() => {
    if (lineWidth <= 0 || lineCount === 0) {
      return [] as VisibleLine[];
    }

    if (checkpointCacheRef.current === null || checkpointCacheRef.current.width !== lineWidth) {
      checkpointCacheRef.current = createCheckpointCache(lineWidth);
    }

    return collectVisibleLines(prepared, lineWidth, startLineIndex, endLineIndex, checkpointCacheRef.current);
  }, [endLineIndex, lineCount, lineWidth, prepared, startLineIndex]);

  const handleScroll = useRefFunction((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    onScroll?.(event);
  });

  useEffect(() => {
    checkpointCacheRef.current = null;
  }, [prepared]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const metrics = getViewportMetrics(container);
    setViewportWidth(metrics.width);
    setViewportHeight(metrics.height);

    const observer = new ResizeObserver(([entry]) => {
      if (!(entry.target instanceof HTMLDivElement)) {
        return;
      }

      const nextMetrics = getViewportMetrics(entry.target);
      setViewportWidth(nextMetrics.width);
      setViewportHeight(nextMetrics.height);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (typeof document === 'undefined' || !('fonts' in document)) {
      return;
    }

    document.fonts.ready.then(() => {
      if (!cancelled) {
        setFontEpoch((value) => value + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [font]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const maxScrollTop = Math.max(0, totalHeight - container.clientHeight);
    if (container.scrollTop > maxScrollTop) {
      container.scrollTop = maxScrollTop;
      setScrollTop(maxScrollTop);
    }
  }, [totalHeight]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
      {...restProps}
    >
      {text.length === 0 ? (
        (empty ?? null)
      ) : (
        <div
          className={contentClassName}
          style={{
            height: totalHeight,
            minWidth: '100%',
            position: 'relative',
            ...contentStyle,
          }}
        >
          {visibleLines.map((line) => (
            <div
              key={line.index}
              className={lineClassName}
              style={{
                boxSizing: 'border-box',
                font,
                height: lineHeight,
                insetInline: 0,
                letterSpacing,
                lineHeight: `${lineHeight}px`,
                overflow: 'hidden',
                position: 'absolute',
                tabSize,
                top: line.index * lineHeight,
                whiteSpace: 'pre',
                width: '100%',
                ...lineStyle,
              }}
              title={line.width > lineWidth ? line.text : undefined}
            >
              {line.text.length > 0 ? line.text : '\u00a0'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getViewportMetrics(element: HTMLDivElement): { height: number; width: number } {
  return {
    height: element.clientHeight,
    width: element.clientWidth,
  };
}

export default VirtualTextViewer;
