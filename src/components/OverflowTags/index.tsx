import type { ReactNode } from 'react';
import { useCallback, useContext, useMemo } from 'react';
import type { TagProps } from 'antd';
import { ConfigProvider, Dropdown, Tag, theme } from 'antd';
import { PresetColors } from 'antd/es/theme/internal';
import classNames from 'classnames';
import type { OverflowProps } from 'rc-overflow';
import Overflow from 'rc-overflow';
import { random } from '../../utils/math';
import useStyle from './style';

export interface OverflowTagsProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<OverflowProps<T>, 'renderItem'> {
  /**
   * **CN**: 标签集合的数据
   *
   * **EN**: Data collection of tags
   */
  tags: T[] | undefined;
  /**
   * **EN**: Function to get the tag name, default is `tag.label` or `tag.name`
   *
   * **CN**: 获取标签名称的函数，默认取`tag.label`或`tag.name`
   */
  getTagName?: (tag: T) => ReactNode;
  /**
   * **EN**: Function to get the unique identifier of the tag, default is `tag.value` or `tag.id`
   *
   * **CN**: 获取标签唯一标识的函数，默认取`tag.value`或`tag.id`
   */
  getTagKey?: (tag: T) => React.Key;

  /**
   * **EN**: Custom tag rendering function
   *
   * **CN**: 标签渲染函数
   */
  renderTag?: OverflowProps<T>['renderItem'];
  /**
   * **EN**: Custom properties for the default tag rendering function, returning `TagProps`
   *
   * **CN**: 对于默认的标签渲染函数，自定义标签的属性，返回`TagProps`
   */
  getTagProps?: (tag: T, tags: T[]) => TagProps;
  /**
   * **EN**: Custom properties for the tag component, if `renderTag` is also specified, the latter
   * will override the former
   *
   * **CN**: 自定义标签的组件属性，如果同时指定了`renderTag`，则后者会覆盖前者
   */
  tagProps?: TagProps;
  /**
   * **EN**: When the number of tags exceeds the maximum display count, an ellipsis tag will be
   * shown. This property is used to set the style of the ellipsis tag.
   *
   * **CN**: 当标签数量超过最大显示数量时，会显示省略号的标签，此属性用于设置省略号标签的样式
   */
  ellipsisTagProps?: TagProps;
  /**
   * **EN**: Whether to use random colors, default is `false`. Note that the tag object can also
   * contain a `color` property to specify the color, and the latter takes precedence.
   *
   * **CN**: 是否使用随机颜色，默认`false`。注意，tag对象还可以包含`color`属性来指定颜色，而且后者优先级更高。
   */
  randomColors?: boolean;
}

/**
 * - **EN:** Overflow tags component, used to display a collection of tags that can overflow and be
 *   truncated. It supports displaying tags in a dropdown when the number of tags exceeds the
 *   maximum display count. It also supports custom tag rendering and properties.
 * - **CN:** 溢出标签组件，用于显示一组可以溢出和截断的标签集合。当标签数量超过最大显示数量时，支持在下拉菜单中显示标签。还支持自定义标签渲染和属性。
 *
 * @example
 *   <OverflowTags
 *     tags={[
 *       { value: 1, label: 'Tag1', icon: <Icon1 /> },
 *       { value: 2, label: 'Tag2', icon: <Icon2 /> },
 *     ]}
 *     tagProps={{ color: 'blue' }}
 *     ellipsisTagProps={{ color: 'grey' }}
 *   />;
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OverflowTags = <T extends Record<string, any>>(props: OverflowTagsProps<T>) => {
  const {
    tags = [],
    randomColors,
    getTagName: getTagNameInProps,
    getTagKey,
    getTagProps: getTagPropsInProps,
    tagProps,
    ellipsisTagProps,
    className,
    prefixCls: prefixClsInProps,
    ...restProps
  } = props;
  const { token } = theme.useToken();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('easy-overflow-tags', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);

  const colors = useMemo(
    () => PresetColors.filter((c) => !['lime', 'yellow', 'magenta'].includes(c)).map((color) => token[`${color}-3`]),
    [token]
  );
  const getTagName = useCallback(
    (tag: T) => {
      return getTagNameInProps ? getTagNameInProps(tag) : (tag.label ?? tag.name);
    },
    [getTagNameInProps]
  );
  const renderTag = (item: T) => {
    const customProps = getTagPropsInProps?.(item, tags);
    return (
      <Tag
        {...tagProps}
        icon={item.icon}
        color={randomColors ? colors[random(0, colors.length - 1)] : (item.color ?? 'default')}
        {...customProps}
      >
        {getTagName(item)}
      </Tag>
    );
  };

  return wrapCSSVar(
    <Overflow<T>
      className={classNames(hashId, cssVarCls, prefixCls, className)}
      data={tags}
      maxCount="responsive"
      renderItem={renderTag}
      renderRest={(omittedItems) => (
        <Dropdown
          menu={{
            items: omittedItems.map((tag) => ({
              type: 'item',
              key: getTagKey ? getTagKey(tag) : (tag.value ?? tag.id ?? getTagName(tag)),
              label: getTagName(tag),
            })),
          }}
        >
          <Tag {...ellipsisTagProps}>+ {omittedItems.length}...</Tag>
        </Dropdown>
      )}
      {...restProps}
    />
  );
};

export default OverflowTags;
