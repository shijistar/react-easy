import type { CSSProperties, ReactNode } from 'react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Flex, Typography } from 'antd';
import type { EllipsisConfig } from 'antd/es/typography/Base';
import type { LinkProps } from 'antd/es/typography/Link';
import type { ParagraphProps } from 'antd/es/typography/Paragraph';
import type { TextProps } from 'antd/es/typography/Text';
import type { TitleProps } from 'antd/es/typography/Title';
import names from 'classnames';
import { EditOutlined } from '@ant-design/icons';
import useT from '../../hooks/useT';
import EditableTextForm, { type EditableFormProps, type RenderInputInterface } from './form';
import useStyle from './style';

const getEllipsisConfig = (content: ReactNode | undefined): EllipsisConfig => ({
  tooltip: {
    title: content,
    overlayStyle: { maxWidth: 500 },
  },
});

export interface EditableTextProps<
  V = string,
  TT extends 'Text' | 'Paragraph' | 'Title' | 'Link' = 'Text',
  IT extends 'Input' | 'TextArea' | RenderInputInterface = 'Input',
> extends Omit<EditableFormProps<V, IT>, 'block'> {
  /**
   * - **EN:** Custom prefix for the component's CSS class.
   * - **CN:** 组件的自定义 CSS 类前缀。
   */
  prefixCls?: string;
  /**
   * - **EN:** Custom read-only display text, replacing `value` display
   * - **CN:** 自定义只读显示文本，替代`value`显示
   *
   * @default true
   */
  displayText?: boolean | ReactNode | ((value: V | undefined) => ReactNode);
  /**
   * - **EN:** Another way to customize read-only display text, with higher priority than
   *   `displayText`. This method does not support text truncation.
   * - **CN:** 另外一种方式自定义只读显示文本，优先级高于`displayText`，这种方式无文本省略效果
   */
  children?: ReactNode;
  /**
   * - **EN:** Whether to allow editing. If set to `false`, the edit button will not be displayed.
   * - **CN:** 是否允许编辑，如果设置为`false`，则不显示编辑按钮
   *
   * @default true
   */
  editable?: boolean;
  /**
   * - **EN:** Whether to open edit mode.
   * - **CN:** 是否打开编辑模式
   *
   * @default false
   */
  editing?: boolean;
  /**
   * - **EN:** Whether to display as a block-level element, with width 100%
   * - **CN:** 是否显示为块级元素，宽度100%
   *
   * @default false
   */
  block?:
    | boolean
    | {
        /**
         * - **EN:** Whether to display as a block-level element in view mode, with width 100%
         * - **CN:** 只读模式是否显示为块级元素，宽度100%
         *
         * @default false
         */
        view?: boolean;
        /**
         * - **EN:** Whether to display as a block-level element in edit mode, with width 100%
         * - **CN:** 编辑模式是否显示为块级元素，宽度100%
         *
         * @default false
         */
        editing?: boolean;
      };
  /**
   * - **EN:** Component container class name.
   * - **CN:** 组件容器类名
   */
  className?: string;
  /**
   * - **EN:** Component container style.
   * - **CN:** 组件容器样式
   */
  style?: CSSProperties;
  /**
   * - **EN:** Semantic class names.
   * - **CN:** 语义化类名
   */
  classNames?: {
    /**
     * - **EN:** Read-only text class name
     * - **CN:** 只读文本类名
     */
    text?: string;
    /**
     * - **EN:** Edit button class name
     * - **CN:** 编辑按钮类名
     */
    editIcon?: string;
  } & EditableFormProps<V, IT>['classNames'];
  /**
   * - **EN:** After saving with `onOk`, the modified value is passed out through `onChange`
   * - **CN:** 在`onOk`保存后，通过`onChange`把修改后的值传递出去
   */
  onChange?: (value: V | undefined) => void;
  /**
   * - **EN:** Event triggered when the editing state changes
   * - **CN:** 编辑状态改变事件
   */
  onEditingChange?: (editing: boolean) => void;
  /**
   * - **EN:** Whether to display as a block-level element, with width 100%
   * - **CN:** 语义化样式
   */
  styles?: {
    /**
     * - **EN:** Read-only text class name
     * - **CN:** 只读文本类名
     */
    text?: CSSProperties;
    /**
     * - **EN:** Edit button style
     * - **CN:** 编辑按钮样式
     */
    editIcon?: CSSProperties;
  } & EditableFormProps<V, IT>['styles'];

  /**
   * - **EN:** Custom component type for rendering the text
   * - **CN:** 自定义设置渲染文本组件的组件类型
   *
   * @default Typography.Text
   */
  textComp?: TT;
  /**
   * - **EN:** Text component props
   * - **CN:** 文本组件属性
   */
  textProps?: TT extends 'Text'
    ? TextProps
    : TT extends 'Paragraph'
      ? ParagraphProps
      : TT extends 'Title'
        ? TitleProps
        : TT extends 'Link'
          ? LinkProps
          : never;
  /**
   * - **EN:** Custom edit icon
   * - **CN:** 自定义编辑图标
   */
  editIcon?: ReactNode;
  /**
   * **EN:** Edit button vertical alignment
   *
   * **CN:** 编辑按钮垂直对齐方式
   *
   * - `start` - align to the top | 顶部对齐
   * - `center` - align to the center | 居中对齐
   * - `end` - align to the bottom | 底部对齐
   * - `baseline` - align to the text baseline, useful when the text has line height set |
   *   与文本基线对齐，在文本设置了行高时会非常有用
   *
   * @default 'center'
   */
  editIconAlign?: CSSProperties['alignItems'];
}

/**
 * - **EN:** Editable text component, providing a read-only display and an edit mode.
 * - **CN:** 可编辑文本组件，提供只读显示和编辑模式。
 *
 * @example
 *   <EditableText value="Editable Text" onOk={(value) => console.log('Saved value:', value)} />;
 */
const EditableText = <
  V,
  TT extends 'Text' | 'Paragraph' | 'Title' | 'Link',
  IT extends 'Input' | 'TextArea' | RenderInputInterface,
>(
  props: EditableTextProps<V, TT, IT>
) => {
  const {
    prefixCls: prefixClsInProps,
    value: valueInProps,
    displayText: displayTextInProps,
    editable = true,
    editing = false,
    className = '',
    style = {},
    classNames,
    styles: styleNames,
    block: blockInProps,
    textComp = 'Text',
    textProps,
    editIcon,
    editIconAlign = 'center',
    children,
    formProps,
    formItemProps,
    inputComp: inputCompInProps,
    inputProps,
    required,
    actionAlign,
    submitProps,
    cancelProps,
    onOk,
    onCancel,
    onChange,
    onEditingChange,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('easy-editable-text', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const t = useT();
  const [isEditing, setIsEditing] = useState<boolean>(editing);
  const TypographyComponent = Typography[textComp];
  const [value, setValue] = useState(valueInProps);
  const inputComp = inputCompInProps ?? (textComp === 'Paragraph' ? 'TextArea' : 'Input');
  const viewBlock = typeof blockInProps === 'boolean' ? blockInProps : blockInProps?.view;
  const editingBlock = typeof blockInProps === 'boolean' ? blockInProps : blockInProps?.editing;
  const editableRef = React.useRef(editable);
  editableRef.current = editable;
  const displayText = useMemo(() => {
    if (typeof displayTextInProps === 'function') {
      return displayTextInProps(value);
    }
    return displayTextInProps ?? value?.toString();
  }, [displayTextInProps, value]);

  // value受控
  useEffect(() => {
    setValue(valueInProps);
  }, [valueInProps]);
  // editing受控
  useEffect(() => {
    if (editableRef.current) {
      setIsEditing(editing);
    }
  }, [editing]);

  // 编辑状态改变
  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    onEditingChange?.(editing);
  };
  // 提交编辑
  const handleOk = async (val: V | undefined) => {
    try {
      await onOk?.(val);
      onChange?.(val);
      setValue(val);
      handleEditingChange(false);
    } catch (error) {
      console.error(error);
    }
  };
  // 取消编辑
  const handleCancel = async () => {
    handleEditingChange(false);
    await onCancel?.();
  };

  return wrapCSSVar(
    <div className={names(prefixCls, hashId, cssVarCls, className)} style={style}>
      {isEditing ? (
        <div className={`${prefixCls}-edit-mode`}>
          <EditableTextForm
            prefixCls={prefixCls}
            value={value}
            required={required}
            formProps={formProps}
            formItemProps={formItemProps}
            inputComp={inputComp}
            inputProps={inputProps}
            block={editingBlock}
            classNames={classNames}
            styles={styleNames}
            actionAlign={actionAlign}
            submitProps={submitProps}
            cancelProps={cancelProps}
            onOk={handleOk}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <Flex
          className={names(`${prefixCls}-view-mode`, {
            [`${prefixCls}-single-line`]: textComp !== 'Paragraph',
            [`${prefixCls}-has-children`]: !!children,
            [`${prefixCls}-view-mode-block`]: viewBlock,
          })}
          align={editIconAlign}
        >
          <div className={`${prefixCls}-text-content`}>
            {children ?? (
              <TypographyComponent
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(textProps as any)}
                className={names(classNames?.text, classNames?.text, textProps?.className)}
                style={{
                  marginBottom: textComp === 'Title' ? 0 : undefined, // 去掉标题组件的默认下边距
                  ...(textProps?.style ?? styleNames?.text),
                }}
                ellipsis={textProps?.ellipsis ?? getEllipsisConfig(displayText)}
              >
                {displayText}
              </TypographyComponent>
            )}
          </div>
          {/* 编辑按钮 */}
          {editable && (
            <div
              className={names(`${prefixCls}-edit-icon`, classNames?.editIcon)}
              style={styleNames?.editIcon}
              title={t('components.EditableText.edit')}
              onClick={() => handleEditingChange(true)}
            >
              {editIcon ?? <EditOutlined />}
            </div>
          )}
        </Flex>
      )}
    </div>
  );
};

type EditableTextInterface = typeof EditableText & {
  getEllipsisConfig: typeof getEllipsisConfig;
};

EditableText.getEllipsisConfig = getEllipsisConfig;

export default EditableText as EditableTextInterface;
