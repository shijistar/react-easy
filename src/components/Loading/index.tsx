import { type CSSProperties, type FC, useContext } from 'react';
import type { SpinProps } from 'antd';
import { ConfigProvider, Spin } from 'antd';
import classNames from 'classnames';
import useStyle from './style';

export type LoadingProps = SpinProps & {
  /**
   * - **EN:** When used independently, the positioning method of the animation:
   * - **absolute** - Uses absolute positioning, and the animation will automatically center itself
   *   within the parent container.
   * - **flex** - Uses flexbox layout, and the animation will automatically fill the parent container
   *   and center itself.
   * - **CN:** 独立使用时，动画的定位方式：
   * - **absolute** - 使用绝对定位，动画会自动居中显示在父容器中。
   * - **flex** - 使用弹性布局，动画会自动填充父容器并居中显示。
   *
   * @default `flex`
   */
  mode?: 'absolute' | 'flex';
  /**
   * - **EN:** When used independently, set the class name for the mask parent container of the
   *   animation
   * - **CN:** 在独立使用时，设置动画遮罩父容器的样式类名
   */
  rootClassName?: string;
  /**
   * - **EN:** When used independently, set the style for the mask parent container of the animation
   * - **CN:** 在独立使用时，设置动画遮罩父容器的样式
   */
  rootStyle?: CSSProperties;
};

/**
 * **EN:** Page loading animation component, providing two usage methods:
 *
 * - **Spin** - When the component wraps children, it wraps the `Spin` component around the children
 *   to provide animation effects.
 * - **Independent** - Directly render a loading animation that automatically fills the parent
 *   container and is centered.
 *
 * **CN:** 页面加载动画组件，提供两种使用方式：
 *
 * - **Spin** - 组件包裹children时，在children外层包裹 `Spin` 组件，提供动画效果。
 * - **独立使用** - 直接渲染一个加载动画，自动撑满父容器，且显示在居中位置。
 *
 * @example
 *   1. Spin surrounding children
 *
 *   ```tsx
 *   <PageLoading spinning={loading}>
 *   <div>This is content</div>
 *   </PageLoading>;
 *   ```
 *
 *   2. Independent usage (inline layout)
 *
 *   ```tsx
 *   <PageLoading />;
 *   ```
 *
 *   3. Centered display within container (absolute layout)
 *
 *   ```tsx
 *   <div className="container" style={{ position: 'relative' }}>
 *   <PageLoading absolute />
 *   </div>;
 *   ```
 */
const Loading: FC<LoadingProps> = (props) => {
  const {
    prefixCls: prefixClsInProps,
    mode = 'flex',
    rootClassName,
    rootStyle,
    children,
    spinning = true,
    className,
    ...spinProps
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('easy-loading', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);

  return children
    ? // Use spin to wrap children when children is provided,
      // and control the animation display with the spinning prop.
      wrapCSSVar(
        <Spin className={classNames(hashId, cssVarCls, prefixCls, className)} spinning={spinning} {...spinProps}>
          {children}
        </Spin>
      )
    : // Show the loading animation in a wrapper that fills the parent container and centers the animation,
      // and hides the entire component when the animation is off.
      spinning &&
        wrapCSSVar(
          <div
            className={classNames(
              hashId,
              cssVarCls,
              prefixCls,
              rootClassName,
              mode === 'absolute' ? `${prefixCls}-absolute` : `${prefixCls}-flex`
            )}
            style={rootStyle}
          >
            <Spin className={className} spinning={spinning} {...spinProps} />
          </div>
        );
};

export default Loading;
