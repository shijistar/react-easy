import type { CSSProperties, FC, ReactNode } from 'react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CardProps } from 'antd';
import { Card, ConfigProvider } from 'antd';
import classNames from 'classnames';
import { DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons';
import useRefFunction from '../../hooks/useRefFunction';
import useStyle from './style';

export interface FloatDrawerProps {
  /**
   * **EN:** Whether the drawer is open
   *
   * **CN:** 抽屉是否打开
   */
  open?: boolean;
  /**
   * **EN:** Position of the drawer
   *
   * **CN:** 抽屉的位置
   *
   * @default 'right'
   */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * **EN:** Default size of the drawer. If the drawer is placed on the left or right, this is the
   * width, otherwise it is the height.
   *
   * **CN:** 抽屉的默认宽度。如果抽屉放在左侧或右侧，则为宽度，否则为高度。
   *
   * @default 300
   */
  defaultSize?: number;
  /**
   * **EN:** Minimum size of the drawer
   *
   * **CN:** 抽屉的最小宽度
   *
   * @default 0
   */
  minSize?: number;
  /**
   * **EN:** Maximum size of the drawer
   *
   * **CN:** 抽屉的最大宽度
   *
   * @default Infinity
   */
  maxSize?: number;
  /**
   * **EN:** Cache key for storing the drawer size in localStorage. If not set, the size will not be
   * cached.
   *
   * **CN:** 指定一个localStorage缓存键，用于记忆抽屉宽度。如果不设置，则不使用缓存。
   */
  cacheKey?: string;
  /**
   * **EN:** Custom class name for the root element
   *
   * **CN:** 根元素的自定义类名
   */
  className?: string;
  /**
   * **EN:** Custom class names for specific elements
   *
   * **CN:** 特定元素的自定义类名
   */
  classNames?: {
    /**
     * **EN:** Class name for the drawer element
     *
     * **CN:** 抽屉元素的类名
     */
    drawer?: string;
    /**
     * **EN:** Class name for the expand handle
     *
     * **CN:** 展开手柄的类名
     */
    expandHandle?: string;
    /**
     * **EN:** Class name for the resize handle
     *
     * **CN:** 调整大小手柄的类名
     */
    resizeHandle?: string;
    /**
     * **EN:** Class name for the handle icon
     *
     * **CN:** 手柄图标的类名
     */
    handleIcon?: string;
    /**
     * **EN:** Class name for the content area
     *
     * **CN:** 内容区域的类名
     */
    content?: string;
    /**
     * **EN:** Class name for the card element
     *
     * **CN:** 卡片元素的类名
     */
    card?: string;
  };
  /**
   * **EN:** Custom styles for the root element
   *
   * **CN:** 根元素的自定义样式
   */
  style?: CSSProperties;
  /**
   * **EN:** Custom styles for specific elements
   *
   * **CN:** 特定元素的自定义样式
   */
  styles?: {
    /**
     * **EN:** Styles for the drawer element
     *
     * **CN:** 抽屉元素的样式
     */
    drawer?: CSSProperties;
    /**
     * **EN:** Styles for the expand handle
     *
     * **CN:** 展开手柄的样式
     */
    expandHandle?: CSSProperties;
    /**
     * **EN:** Styles for the resize handle
     *
     * **CN:** 调整大小手柄的样式
     */
    resizeHandle?: CSSProperties;
    /**
     * **EN:** Styles for the handle icon
     *
     * **CN:** 手柄图标的样式
     */
    handleIcon?: CSSProperties;
    /**
     * **EN:** Styles for the content area
     *
     * **CN:** 内容区域的样式
     */
    content?: CSSProperties;
    /**
     * **EN:** Styles for the card element
     *
     * **CN:** 卡片元素的样式
     */
    card?: CSSProperties;
  };
  /**
   * **EN:** Custom properties for the card element
   *
   * **CN:** 卡片元素的自定义属性
   */
  cardProps?: Omit<CardProps, 'children'>;
  /**
   * **EN:** Content to be rendered inside the drawer
   *
   * **CN:** 抽屉内容
   */
  children?: ReactNode;
  /**
   * **EN:** Callback function when the open state changes
   *
   * **CN:** 打开状态变化时的回调函数
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * **EN:** Callback function when the drawer is resized
   *
   * **CN:** 抽屉调整大小时的回调函数
   */
  onResize?: (size: number) => void;
}

/**
 * **EN:** FloatDrawer component for creating a draggable, resizable drawer
 *
 * **CN:** FloatDrawer组件，用于创建可拖动、可调整大小的抽屉
 */
const FloatDrawer: FC<FloatDrawerProps> = (props) => {
  const {
    open,
    position = 'right',
    cardProps,
    children,
    className,
    classNames: classNamesInProps,
    style,
    styles,
    cacheKey,
    defaultSize = 300,
    minSize = 0,
    maxSize = +Infinity,
    onOpenChange,
    onResize,
  } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('easy-float-drawer');
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const [isOpen, setIsOpen] = useState<boolean>();
  const [size, setSize] = useState(
    cacheKey && localStorage.getItem(cacheKey) ? Number(localStorage.getItem(cacheKey)) || defaultSize : defaultSize
  );
  const sizeMap = useMemo(() => {
    const type = position === 'left' || position === 'right' ? 'width' : 'height';
    return {
      [type]: size,
    };
  }, [position, size]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<number>(0);
  const dragStartSize = useRef<number>(size);
  const classString = classNames(
    prefixCls,
    className,
    {
      [`${prefixCls}-open`]: isOpen,
      [`${prefixCls}-closed`]: !isOpen,
      [`${prefixCls}-${position}`]: position,
    },
    hashId,
    cssVarCls
  );
  const closeIcon = useMemo(() => {
    return position === 'left' ? (
      <RightOutlined />
    ) : position === 'top' ? (
      <DownOutlined />
    ) : position === 'bottom' ? (
      <UpOutlined />
    ) : (
      <LeftOutlined />
    );
  }, [position]);
  const openIcon = useMemo(() => {
    return position === 'left' ? (
      <LeftOutlined />
    ) : position === 'top' ? (
      <UpOutlined />
    ) : position === 'bottom' ? (
      <DownOutlined />
    ) : (
      <RightOutlined />
    );
  }, [position]);

  // Handle drawer visibility
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    onOpenChange?.(!isOpen);
  };

  // Handle resize events
  const handleResizeStart = useRefFunction((e: React.MouseEvent) => {
    setIsDragging(true);
    if (position === 'top' || position === 'bottom') {
      dragStartPos.current = e.clientY;
    } else {
      dragStartPos.current = e.clientX;
    }
    dragStartSize.current = size;
    e.preventDefault();
  });
  const handleResize = useRefFunction((e: MouseEvent) => {
    if (isDragging) {
      let newSize: number;
      if (position === 'left') {
        newSize = dragStartSize.current - (dragStartPos.current - e.clientX);
      } else if (position === 'top') {
        newSize = dragStartSize.current - (dragStartPos.current - e.clientY);
      } else if (position === 'bottom') {
        newSize = dragStartSize.current - (e.clientY - dragStartPos.current);
      } else {
        newSize = dragStartSize.current - (e.clientX - dragStartPos.current);
      }
      if (newSize >= minSize && newSize <= maxSize) {
        setSize(newSize);
        if (cacheKey) {
          localStorage.setItem(cacheKey, String(newSize));
        }
        onResize?.(newSize);
      }
    }
  });
  const handleResizeEnd = useRefFunction(() => {
    setIsDragging(false);
  });

  // Controlled open state
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Handle global events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    } else {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging]);

  return wrapCSSVar(
    <div className={classString} style={style}>
      <div
        className={classNames(`${prefixCls}-drawer`, classNamesInProps?.drawer)}
        style={{ ...sizeMap, ...styles?.drawer }}
      >
        <div
          className={classNames(
            `${prefixCls}-resize-handle`,
            isDragging && `${prefixCls}-resize-handle-dragging`,
            classNamesInProps?.resizeHandle
          )}
          style={styles?.resizeHandle}
          onMouseDown={handleResizeStart}
        />
        <div className={classNames(`${prefixCls}-content`, classNamesInProps?.content)} style={styles?.content}>
          <Card
            bordered={false}
            variant="borderless"
            className={classNames(`${prefixCls}-card`, classNamesInProps?.card)}
            style={styles?.card}
            {...cardProps}
          >
            {children}
          </Card>
        </div>
        <div
          className={classNames(`${prefixCls}-expand-handle`, classNamesInProps?.expandHandle)}
          style={styles?.expandHandle}
          onClick={toggleDrawer}
        >
          <div
            className={classNames(`${prefixCls}-handle-icon`, classNamesInProps?.handleIcon)}
            style={styles?.handleIcon}
          >
            {isOpen ? openIcon : closeIcon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatDrawer;
