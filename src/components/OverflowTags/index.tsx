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
  extends OverflowProps<T> {
  /**
   * **CN**: 标签集合的数据
   *
   * **EN**: Data collection of tags
   */
  tags: T[] | undefined;
  /**
   * **EN**: Function to get the tag name, default is `tag.name`
   *
   * **CN**: 获取标签名称的函数，默认取`tag.name`
   */
  getTagName?: (tag: T) => ReactNode;
  /**
   * **EN**: Function to get the unique identifier of the tag, default is `tag.id`
   *
   * **CN**: 获取标签唯一标识的函数，默认取`tag.id`
   */
  getTagKey?: (tag: T) => React.Key;
  /**
   * **EN**: Function to render the tag, returns `TagProps`
   *
   * **CN**: 渲染标签的函数，返回`TagProps`
   */
  renderTag?: (tag: T, tags: T[]) => TagProps;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OverflowTags = <T extends Record<string, any>>(props: OverflowTagsProps<T>) => {
  const {
    tags = [],
    randomColors,
    getTagName: getTagNameInProps,
    getTagKey,
    renderTag: renderTagInProps,
    tagProps,
    ellipsisTagProps,
    className,
    ...restProps
  } = props;
  const { token } = theme.useToken();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('easy-float-drawer');
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);

  const colors = useMemo(
    () => PresetColors.filter((c) => !['lime', 'yellow', 'magenta'].includes(c)).map((color) => token[`${color}-3`]),
    [token]
  );
  const getTagName = useCallback(
    (tag: T) => {
      return getTagNameInProps ? getTagNameInProps(tag) : tag.name;
    },
    [getTagNameInProps]
  );
  const renderTag = (item: T) => {
    const customProps = renderTagInProps?.(item, tags);
    return (
      <Tag
        {...tagProps}
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
              key: getTagKey ? getTagKey(tag) : (tag.id ?? getTagName(tag)),
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
