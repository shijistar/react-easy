import { type CSSProperties, type FC, useContext } from 'react';
import classNames from 'classnames';
import { createFromIconfontCN } from '@ant-design/icons';
import type { IconFontProps as AntIconFontProps } from '@ant-design/icons/es/components/IconFont';
import ConfigProvider from '../ConfigProvider';

/**
 * - **EN:** Props for the Iconfont component
 * - **CN:** Iconfont 组件的props
 */
export interface IconfontProps<T extends string = string>
  extends Omit<AntIconFontProps<T>, 'type' | 'size' | 'spin' | 'rotate'> {
  /**
   * - **EN:** Icon name. Find an icon in iconfont and click `Copy Code`
   * - **CN:** 图标名称。在 iconfont 中找到某个图标，点击`复制代码`
   */
  type: T;
  /**
   * - **EN:** Whether the icon should spin continuously, can be used to indicate loading
   * - **CN:** 图标是否持续旋转，可以实现 loading 的效果
   *
   * @default false
   */
  spin?: boolean;
  /**
   * - **EN:** Rotate the icon by a fixed angle clockwise
   * - **CN:** 图标顺时针旋转一个固定角度
   *
   * @default 0
   */
  rotate?: number;
  /**
   * - **EN:** Icon size, an alias for `style.fontSize`
   * - **CN:** 图标尺寸，是 `style.fontSize` 的别名
   */
  size?: CSSProperties['fontSize'];
}

/**
 * - **EN:** Create an Iconfont component with a specified iconfont script URL.
 * - **CN:** 创建一个Iconfont组件，指定iconfont的脚本地址
 *
 * @param scriptUrl - Path to the iconfont script | 字体图标的路径
 */
export const createIconfont = <T extends string = string>(
  scriptUrl: string,
  options?: {
    /** Icon name prefix | 图标名称前缀 */
    iconPrefix?: string;
  }
): FC<IconfontProps<T>> => {
  const { iconPrefix = '' } = options || {};
  const AntdIconfont = createFromIconfontCN({ scriptUrl });
  /**
   * - **EN:** Render an iconfont icon, setting the `type` prop to the iconfont icon name.
   * - **CN:** 渲染一个 iconfont 的图标，把 `type` 属性设置为 iconfont 字体的图标名
   */
  const Iconfont: FC<IconfontProps<T>> = (props) => {
    const { type, className, size, style, ...iconProps } = props;
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const iconType = type.startsWith(iconPrefix) ? type : `${iconPrefix}-${type}`;

    return (
      <AntdIconfont
        type={iconType}
        className={classNames(getPrefixCls('iconfont'), className)}
        style={{
          ...style,
          fontSize: style?.fontSize ?? size,
        }}
        {...iconProps}
      />
    );
  };
  return Iconfont;
};
