import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { theme } from 'antd';
import useRefValue from './useRefValue';

export interface UseSplitterProps {
  /**
   * - **EN:** Split direction. vertical = left/right; horizontal = top/bottom.
   * - **ZH:** 分割方向。vertical 表示左右分割；horizontal 表示上下分割。
   *
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * - **EN:** The container element reference.
   * - **ZH:** 容器元素的引用。
   */
  containerRef: RefObject<HTMLDivElement>;
  /**
   * - **EN:** Default ratio of the left/top pane (0~1).
   * - **ZH:** 左侧/顶部面板的默认比例 (0~1)。
   *
   * @default 0.32
   */
  defaultRatio?: number;
  /**
   * - **EN:** Minimum ratio of the left/top pane (0~1).
   * - **ZH:** 左侧/顶部面板的最小比例 (0~1)。
   *
   * @default 0.15
   */
  minRatio?: number;
  /**
   * - **EN:** Maximum ratio of the left/top pane (0~1).
   * - **ZH:** 左侧/顶部面板的最大比例 (0~1)。
   *
   * @default 0.85
   */
  maxRatio?: number;
}

const useSplitter = (props: UseSplitterProps) => {
  const {
    containerRef,
    defaultRatio = 0.32,
    minRatio = 0.15,
    maxRatio = 1 - minRatio,
    direction = 'vertical',
  } = props || {};
  const { token } = theme.useToken();
  const [percent, setPercent] = useState(defaultRatio);
  const [width, setWidth] = useState((containerRef.current?.clientWidth || 0) * defaultRatio);
  const [dragging, setDragging] = useState(false);
  const minRatioRef = useRefValue(minRatio);
  const maxRatioRef = useRefValue(maxRatio);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (direction === 'vertical') {
        const x = e.clientX - rect.left;
        const ratio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, x / rect.width));
        setPercent(ratio);
        setWidth(x);
      } else {
        const y = e.clientY - rect.top;
        const ratio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, y / rect.height));
        setPercent(ratio);
        setWidth(y);
      }
      // prevent text selection while dragging
      e.preventDefault();
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp, { once: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [containerRef, dragging, direction, minRatioRef, maxRatioRef]);

  const vertical = direction === 'vertical';
  const dom = (
    <div
      style={{
        flex: 'none',
        width: vertical ? 2 : '100%',
        height: vertical ? 'auto' : 2,
        cursor: vertical ? 'col-resize' : 'row-resize',
        background: dragging ? token.colorPrimaryHover : token.colorBorder,
        margin: vertical ? '0 4px' : '4px 0',
        borderRadius: 4,
        userSelect: 'none',
      }}
      onMouseDown={() => setDragging(true)}
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label="Resize"
    />
  );

  return {
    dom,
    percent,
    width,
    dragging,
    direction,
  };
};

export default useSplitter;
