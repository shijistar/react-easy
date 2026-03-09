import { type CSSProperties, useContext, useEffect, useState } from 'react';
import names from 'classnames';
import { ConfigProvider } from '../components';
import useStyle from './style/useSplitter';
import useRefValue from './useRefValue';

export interface UseSplitterProps {
  /**
   * - **EN:** Split direction. vertical = left/right; horizontal = top/bottom.
   * - **CN:** 分割方向。vertical 表示左右分割；horizontal 表示上下分割。
   *
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * - **EN:** Parent container element. If not specified, the parent container of the `dom` element
   *   will be used automatically.
   * - **CN:** 父容器元素，如果不指定，则自动使用 `dom` 元素的父容器
   */
  container?: HTMLDivElement | null | undefined;
  /**
   * - **EN:** Default ratio of the left/top pane (0~1).
   * - **CN:** 左侧/顶部面板的默认比例 (0~1)。
   *
   * @default 0.32
   */
  defaultRatio?: number;
  /**
   * - **EN:** Minimum ratio of the left/top pane (0~1).
   * - **CN:** 左侧/顶部面板的最小比例 (0~1)。
   *
   * @default 0.15
   */
  minRatio?: number;
  /**
   * - **EN:** Maximum ratio of the left/top pane (0~1).
   * - **CN:** 左侧/顶部面板的最大比例 (0~1)。
   *
   * @default 0.85
   */
  maxRatio?: number;
  /**
   * - **EN:** Width of the splitter in pixels.
   * - **CN:** 分割条的宽度，单位为像素。
   *
   * @default 2
   */
  splitterWidth?: number;
  /** Additional class name for the splitter element */
  className?: string;
  /** Additional style for the splitter element */
  style?: CSSProperties;
  /**
   * - **EN:** Custom prefix for the component's CSS class.
   * - **CN:** 组件的自定义 CSS 类前缀。
   */
  prefixCls?: string;
  /**
   * - **EN:** Semantic class names
   * - **CN:** 语义化类名
   */
  classNames?: {
    /**
     * - **EN:** Class name applied when the splitter is hovered.
     * - **CN:** 分割条悬停时应用的类名。
     */
    hover?: string;
    /**
     * - **EN:** Class name applied when the splitter is being dragged.
     * - **CN:** 分割条拖动时应用的类名。
     */
    dragging?: string;
    /**
     * - **EN:** Class name applied to the splitter handle.
     * - **CN:** 分割条手柄的类名。
     */
    handle?: string;
  };
  /**
   * - **EN:** Semantic styles
   * - **CN:** 语义化样式
   */
  styles?: {
    /**
     * - **EN:** Custom styles for the splitter handle.
     * - **CN:** 分割条手柄的自定义样式。
     */
    handle?: CSSProperties;
  };
  /**
   * - **EN:** Callback function when the splitter ratio changes.
   * - **CN:** 分割比例变化时的回调函数。
   */
  onChange?: (ratio?: number) => void;
}

const useSplitter = (props: UseSplitterProps) => {
  const {
    container: containerFromProps,
    defaultRatio,
    minRatio = 0.15,
    maxRatio = 1 - minRatio,
    direction = 'vertical',
    splitterWidth = 1,
    className,
    classNames,
    styles,
    prefixCls: prefixClsInProps,
    style,
    onChange,
  } = props || {};
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('splitter', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const directionRef = useRefValue(direction);
  const [splitterRef, setSplitterRef] = useState<HTMLDivElement | null>(null);
  const [container, setContainer] = useState(containerFromProps);
  const [percent, setPercent] = useState(defaultRatio);
  const percentRef = useRefValue(percent);
  const onChangeRef = useRefValue(onChange);
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
        onChangeRef.current?.(ratio);
      } else {
        const y = e.clientY - rect.top;
        const ratio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, y / rect.height));
        setPercent(ratio);
        setWidth(y);
        onChangeRef.current?.(ratio);
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

  useEffect(() => {
    const containerDom = containerFromProps ?? (splitterRef?.parentElement as HTMLDivElement | undefined) ?? undefined;
    setContainer(containerDom);
  }, [containerFromProps, splitterRef]);

  // Initialize percent and width on mount
  useEffect(() => {
    if (defaultRatio && container && percentRef.current == null) {
      const rect = container.getBoundingClientRect();
      setPercent(defaultRatio);
      if (directionRef.current === 'vertical') {
        setWidth(rect.width * defaultRatio);
        onChangeRef.current?.(defaultRatio);
      } else {
        setWidth(rect.height * defaultRatio);
        onChangeRef.current?.(defaultRatio);
      }
    }
  }, [defaultRatio, container]);

  const vertical = direction === 'vertical';
  const dom = wrapCSSVar(
    <div
      ref={setSplitterRef}
      className={names(
        hashId,
        cssVarCls,
        prefixCls,
        className,
        isOver ? names(`${prefixCls}-hover`, classNames?.hover) : undefined,
        dragging ? names(`${prefixCls}-dragging`, classNames?.dragging) : undefined,
        {
          [`${prefixCls}-vertical`]: vertical,
          [`${prefixCls}-horizontal`]: !vertical,
        }
      )}
      style={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [`--splitter-width` as any]: splitterWidth ? `${splitterWidth}px` : undefined,
        ...style,
      }}
      onMouseDown={() => setDragging(true)}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label="Resize"
    >
      <div className={names(`${prefixCls}-handle`, classNames?.handle)} style={styles?.handle}></div>
    </div>
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
