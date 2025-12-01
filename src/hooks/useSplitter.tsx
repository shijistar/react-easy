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
  container: HTMLDivElement | null | undefined;
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
  /**
   * - **EN:** Width of the splitter in pixels.
   * - **ZH:** 分割条的宽度，单位为像素。
   *
   * @default 2
   */
  splitterWidth?: number;
}

const useSplitter = (props: UseSplitterProps) => {
  const {
    container,
    defaultRatio,
    minRatio = 0.15,
    maxRatio = 1 - minRatio,
    direction = 'vertical',
    splitterWidth = 2,
  } = props || {};
  const { token } = theme.useToken();
  const directionRef = useRefValue(direction);
  const [percent, setPercent] = useState(defaultRatio);
  const percentRef = useRefValue(percent);
  const [width, setWidth] = useState(
    container && defaultRatio ? (container?.clientWidth || 0) * defaultRatio : undefined
  );
  const [dragging, setDragging] = useState(false);
  const minRatioRef = useRefValue(minRatio);
  const maxRatioRef = useRefValue(maxRatio);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = container;
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
  }, [container, dragging, direction, minRatioRef, maxRatioRef]);

  // Initialize percent and width on mount
  useEffect(() => {
    if (defaultRatio && container && percentRef.current == null) {
      const rect = container.getBoundingClientRect();
      setPercent(defaultRatio);
      if (directionRef.current === 'vertical') {
        setWidth(rect.width * defaultRatio);
      } else {
        setWidth(rect.height * defaultRatio);
      }
    }
  }, [defaultRatio, container]);

  const vertical = direction === 'vertical';
  const dom = (
    <div
      style={{
        flex: 'none',
        width: vertical ? splitterWidth : '100%',
        height: vertical ? 'auto' : splitterWidth,
        cursor: vertical ? 'col-resize' : 'row-resize',
        background: dragging ? token.colorPrimaryHover : isOver ? token.colorPrimaryActive : token.colorBorder,
        margin: vertical ? '0 4px' : '4px 0',
        borderRadius: 4,
        userSelect: 'none',
      }}
      onMouseDown={() => setDragging(true)}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
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
