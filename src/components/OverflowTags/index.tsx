import type { ReactNode } from 'react';
import { useCallback, useContext, useMemo } from 'react';
import type { DropdownProps, TagProps } from 'antd';
import { ConfigProvider, Dropdown, Tag, theme } from 'antd';
import { PresetColors } from 'antd/es/theme/internal';
import classNames from 'classnames';
import type { OverflowProps } from 'rc-overflow';
import Overflow from 'rc-overflow';
import { random } from '../../utils/math';
import useStyle from './style';

export interface OverflowTagsProps<T> extends Omit<OverflowProps<T>, 'renderItem'> {
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
   * **EN**: Custom properties for the tag component
   *
   * **CN**: 自定义标签的组件属性
   */
  tagProps?: TagProps | ((tag: T, options: { tags: T[] }) => TagProps);
  /**
   * **EN**: When the number of tags exceeds the maximum display count, an ellipsis tag will be
   * shown. This property is used to set the style of the ellipsis tag.
   *
   * **CN**: 当标签数量超过最大显示数量时，会显示省略号的标签，此属性用于设置省略号标签的样式
   */
  ellipsisTagProps?: TagProps | ((tag: T, options: { omittedItems: T[]; allTags: T[] }) => TagProps);
  /**
   * **EN**: Custom properties for the dropdown component when tags are overflowed
   *
   * **CN**: 当标签溢出时，下拉菜单的自定义属性
   */
  ellipsisDropdownProps?: DropdownProps;
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
const OverflowTags = <T,>(props: OverflowTagsProps<T>) => {
  const {
    tags = [],
    randomColors,
    getTagName: getTagNameInProps,
    getTagKey,
    tagProps,
    ellipsisTagProps,
    ellipsisDropdownProps,
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
  const getValue = useCallback((tag: T | undefined, field: string) => {
    if (tag != null && typeof tag === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const record = tag as Record<string, any>;
      return record[field];
    }
    return undefined;
  }, []);
  const getTagName = useCallback(
    (tag: T) => {
      return getTagNameInProps
        ? getTagNameInProps(tag)
        : (getValue(tag, 'label') ?? getValue(tag, 'name') ?? tag?.toString());
    },
    [getTagNameInProps, getValue]
  );
  const renderTag = (item: T) => {
    return (
      <Tag
        icon={getValue(item, 'icon')}
        color={randomColors ? colors[random(0, colors.length - 1)] : getValue(item, 'color') || 'default'}
        {...(typeof tagProps === 'function' ? tagProps(item, { tags }) : tagProps)}
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
          {...ellipsisDropdownProps}
          menu={{
            items: omittedItems.map((tag) => ({
              type: 'item',
              key: getTagKey ? getTagKey(tag) : (getValue(tag, 'value') ?? getValue(tag, 'id') ?? getTagName(tag)),
              label: getTagName(tag),
            })),
            ...ellipsisDropdownProps?.menu,
          }}
        >
          <Tag
            {...(typeof ellipsisTagProps === 'function'
              ? ellipsisTagProps(omittedItems[0], { omittedItems, allTags: tags })
              : ellipsisTagProps)}
          >
            + {omittedItems.length}...
          </Tag>
        </Dropdown>
      )}
      {...restProps}
    />
  );
};

export default OverflowTags;
