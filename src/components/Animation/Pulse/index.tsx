import type { CSSProperties, FC } from 'react';
import { useContext, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import useStyle from './style';

export interface PulseAnimationProps {
  className?: string;
  style?: CSSProperties;
  barStyle?: CSSProperties;
  prefixCls?: string;
  /**
   * - **EN:** Number of bars, default is `24`
   * - **CN:** 心跳柱子数量，默认`24`
   */

  bars?: number;
  /**
   * - **EN:** Gap between bars, default is `4px`
   * - **CN:** 心跳柱子间隙，默认`4px`
   */
  barGap?: CSSProperties['gap'];
  /**
   * - **EN:** Background color of the bars, default is theme's `colorFillSecondary`
   * - **CN:** 心跳柱子背景色，默认主题的 `colorFillSecondary`
   */
  barColor?: CSSProperties['backgroundColor'];
  /**
   * - **EN:** Minimum height of the bar, default is `10%`
   * - **CN:** 心跳柱子最小高度，默认`10%`
   */
  // barMinSize?: CSSProperties['height'];
  /**
   * - **EN:** Maximum height of the bar, default is `90%`
   * - **CN:** 心跳柱子最大高度，默认`90%`
   */
  // barMaxSize?: CSSProperties['height'];
  /**
   * - **EN:** Animation duration in seconds, default is `1.6` seconds
   * - **CN:** 动画持续时间，单位秒，默认`1.6`秒
   */
  duration?: number;
  /**
   * - **EN:** Animation delay rate, the delay between bars is calculated based on `{bars *
   *   delayRate}`, default is `0.09`
   * - **CN:** 动画延迟的百分比，根据 `{bars * delayRate}` 计算柱子之间的延迟，默认 `0.09`
   */
  delayRate?: number;
}

/**
 * - **EN:** Pulse animation component, used to indicate loading or processing state
 *
 * > Use `token.AnimationPulse` to globally configure `barMinSize` and `barMaxSize` properties
 *
 * - **CN:** 脉动动画组件，用于表示加载或处理状态
 *
 * > 使用 `token.AnimationPulse` 来全局配置 `barMinSize` 和 `barMaxSize` 属性
 */
const PulseAnimation: FC<PulseAnimationProps> = (props) => {
  const {
    bars = 8,
    barGap,
    barColor,
    duration,
    delayRate = 0.09,
    prefixCls: prefixClsInProps,
    className,
    style,
    barStyle,
  } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('animation-pulse', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const array = useMemo(() => Array.from({ length: bars }), [bars]);

  return wrapCSSVar(
    <div
      className={classNames(prefixCls, hashId, cssVarCls, className)}
      style={{
        gridTemplateColumns: `repeat(${array.length}, 1fr)`,
        gap: barGap,
        ...style,
      }}
    >
      {array.map((_, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${prefixCls}-bar`}
          style={{
            animationDuration: duration != null ? `${duration}s` : undefined,
            animationDelay: `${(i % array.length) * delayRate}s`,
            backgroundColor: barColor != null ? barColor : undefined,
            ...barStyle,
          }}
        />
      ))}
    </div>
  );
};

export default PulseAnimation;
