import type { CSSProperties } from 'react';
import type React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import type { ButtonProps, FormItemProps, FormProps, InputProps, SpaceProps } from 'antd';
import { Button, ConfigProvider, Form, Input, Space } from 'antd';
import type { InputRef, TextAreaProps } from 'antd/es/input';
import names from 'classnames';
import { CheckSquareFilled, CloseSquareFilled } from '@ant-design/icons';
import useT from '../../hooks/useT';

const defaultInputActionGap = 8;
export interface EditableFormProps<IT extends 'Input' | 'TextArea'> {
  prefixCls?: string;
  /**
   * - **EN:** The value to edit
   * - **CN:** 编辑的值
   */
  value: string | undefined;
  /**
   * - **EN:** Whether the text is required when editing, default is `true`, if `formItemProps.rules`
   *   is set, it will override this value
   * - **CN:** 编辑文本时是否必填，默认值为`true`，如果设置了`formItemProps.rules`，将会覆盖此值
   *
   * @default true
   */
  required?: boolean;
  /**
   * - **EN:** Form properties
   * - **CN:** 表单属性
   */
  formProps?: FormProps;
  /**
   * - **EN:** Form item properties
   * - **CN:** 表单项属性
   */
  formItemProps?: FormItemProps;
  /**
   * - **EN:** Custom component type for rendering the input box
   * - **CN:** 自定义设置渲染输入框的组件类型
   *
   * @default 'Input'
   */
  inputComp?: IT;
  /**
   * - **EN:** Input component properties
   * - **CN:** 输入框组件属性
   */
  inputProps?: IT extends 'TextArea' ? TextAreaProps : InputProps;
  /**
   * - **EN:** Whether to display as a block-level element, with width 100%
   * - **CN:** 是否显示为块级元素，宽度100%
   *
   * @default false
   */
  block?: boolean;
  /**
   * - **EN:** Semantic class names
   * - **CN:** 语义化类名
   */
  classNames?: {
    /**
     * - **EN:** Edit mode parent container class name
     * - **CN:** 编辑模式父容器类名
     */
    wrapper?: string;
    /**
     * - **EN:** Submit button class name
     * - **CN:** 提交按钮类名
     */
    submitButton?: string;
    /**
     * - **EN:** Cancel button class name
     * - **CN:** 取消按钮类名
     */
    cancelButton?: string;
    /**
     * - **EN:** Submit button icon class name
     * - **CN:** 提交按钮图标类名
     */
    submitIcon?: string;
    /**
     * - **EN:** Cancel button icon class name
     * - **CN:** 取消按钮图标类名
     */
    cancelIcon?: string;
  };
  /**
   * - **EN:** Semantic styles
   * - **CN:** 语义化样式
   */
  styles?: {
    /**
     * - **EN:** Edit mode parent container style
     * - **CN:** 编辑模式父容器样式
     */
    wrapper?: CSSProperties;
    /**
     * - **EN:** Submit button style
     * - **CN:** 提交按钮样式
     */
    submitButton?: CSSProperties;
    /**
     * - **EN:** Cancel button style
     * - **CN:** 取消按钮样式
     */
    cancelButton?: CSSProperties;
    /**
     * - **EN:** Submit button icon style
     * - **CN:** 提交按钮图标样式
     */
    submitIcon?: CSSProperties;
    /**
     * - **EN:** Cancel button icon style
     * - **CN:** 取消按钮图标样式
     */
    cancelIcon?: CSSProperties;
  };
  /**
   * **EN:** Submit and cancel action button alignment
   *
   * **CN:** 提交、取消操作按钮的对齐方式
   *
   * - `start` - align to the top | 顶部对齐
   * - `center` - align to the center | 居中对齐
   * - `end` - align to the bottom | 底部对齐
   *
   * @default 'center'
   */
  actionAlign?: SpaceProps['align'];
  /**
   * - **EN:** Submit button properties
   * - **CN:** 提交操作按钮属性
   */
  submitProps?: ButtonProps;
  /**
   * - **EN:** Cancel button properties
   * - **CN:** 取消操作按钮属性
   */
  cancelProps?: ButtonProps;
  /**
   * - **EN:** Confirm button click event, supports asynchronous operations
   * - **CN:** 确认按钮点击事件，支持异步操作
   */
  onOk: (value: string) => void | Promise<void>;
  /**
   * - **EN:** Cancel button click event, supports asynchronous operations
   * - **CN:** 取消按钮点击事件，支持异步操作
   */
  onCancel?: () => void | Promise<void>;
}

const EditableTextForm = <IT extends 'Input' | 'TextArea'>({
  prefixCls,
  value,
  required = true,
  classNames,
  styles: styleNames,
  inputComp = 'Input' as IT,
  block: blockInProps = false,
  formProps,
  formItemProps,
  inputProps,
  actionAlign = 'center',
  submitProps,
  cancelProps,
  onOk,
  onCancel,
}: EditableFormProps<IT>) => {
  const t = useT();
  const { getPrefixCls: getAntPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const [form] = Form.useForm<{ value?: string }>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const detectorRef = useRef<HTMLSpanElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number>();
  const [visibility, setVisibility] = useState<CSSProperties['visibility']>('hidden');
  const [forceBlock, setForceBlock] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputActionGapRef = useRef<number>(0);
  inputActionGapRef.current =
    pxToNumber(formItemProps?.style?.marginRight ?? formItemProps?.style?.marginInlineEnd) || defaultInputActionGap;
  const block = blockInProps || forceBlock;
  const InputComp = inputComp === 'TextArea' ? Input.TextArea : Input;

  // Update form value when `value` prop changes
  useEffect(() => {
    form.setFieldsValue({ value });
  }, [form, value]);

  // Detect the width of the text and dynamically adjust the input width
  useEffect(() => {
    let contentWidth = 0;
    if (detectorRef.current && inputRef.current?.input) {
      const inputStyle = getComputedStyle(inputRef.current.input);
      contentWidth =
        detectorRef.current.offsetWidth +
        pxToNumber(inputStyle.paddingLeft) +
        pxToNumber(inputStyle.paddingRight) +
        pxToNumber(inputStyle.borderLeftWidth) +
        pxToNumber(inputStyle.borderRightWidth);
      setInputWidth(contentWidth);
    }
    const actionWidth = actionRef.current?.offsetWidth || 0; // Width of action buttons
    const gap = inputActionGapRef.current; // Gap between input box and action buttons
    setVisibility('visible');
    // Listen to the width of the wrapper container, if the input box width is greater than the wrapper container width,
    const observer = new ResizeObserver(([entity]) => {
      const wrapperWidth = entity.contentRect.width;
      // Width deviation greater than 1px is considered overflow, to avoid misjudgment due to pixel density or scaling
      if (contentWidth + actionWidth + gap - wrapperWidth > 1) {
        setForceBlock(true);
      } else {
        setForceBlock(false);
      }
    });
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Cancel editing
  const handleCancel = async () => {
    form.resetFields();
    try {
      await onCancel?.();
    } catch (error) {
      console.error(error);
    }
  };
  // Pressing the Escape key to cancel editing
  const handleEscape: InputProps['onKeyUp'] = async (e) => {
    if (e.key === 'Escape') {
      await handleCancel();
      cancelProps?.onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
    }
  };
  // Submit editing
  const handleSubmit = async (values: { value: string }) => {
    const { value } = values;
    try {
      setSaving(true);
      await onOk?.(value);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={wrapperRef} className={names(`${prefixCls}-form`, classNames?.wrapper)} style={styleNames?.wrapper}>
      <Form
        component="div" // Do not use form tag to avoid conflicts with external form, which may be nested in other forms
        layout="inline"
        form={form}
        initialValues={{ value }}
        autoComplete="off"
        onFinish={handleSubmit}
        {...formProps}
        style={{
          visibility,
          ...formProps?.style,
        }}
      >
        {/* Input box */}
        <Form.Item
          rules={[{ required, message: t('components.EditableText.requiredMsg') }]}
          {...formItemProps}
          className={names(formItemProps?.className, { [`${getAntPrefixCls('form-item-block')}`]: block })}
          style={{
            marginInlineEnd: defaultInputActionGap,
            ...formItemProps?.style,
          }}
          name="value"
        >
          <InputComp
            ref={inputRef}
            placeholder={t('components.EditableText.placeholder')}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...(inputProps as any)}
            style={{
              width: block ? undefined : inputWidth, // Width is 100% in block mode, no need to set width
              ...inputProps?.style,
            }}
            onPressEnter={() => form.submit()}
            onKeyUp={handleEscape}
          />
        </Form.Item>
        {/* Used to calculate the width of the text content */}
        <span
          ref={detectorRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            height: 0,
            whiteSpace: 'pre',
          }}
        >
          {value}
        </span>

        {/* Action buttons */}
        <Space ref={actionRef} className={`${prefixCls}-form-btns`} align={actionAlign} size={4}>
          <Button
            type="text"
            disabled={saving}
            loading={saving}
            title={t('components.EditableText.save')}
            icon={<CheckSquareFilled className={classNames?.submitIcon} style={styleNames?.submitIcon} />}
            style={styleNames?.submitButton}
            onClick={() => form.submit()}
            {...submitProps}
            className={names(
              `${prefixCls}-form-btn`,
              `${prefixCls}-form-btn-save`,
              classNames?.submitButton,
              submitProps?.className
            )}
          />
          <Button
            type="text"
            style={styleNames?.cancelButton}
            className={names(`${prefixCls}-form-btn`, `${prefixCls}-form-btn-close`, classNames?.cancelButton)}
            title={t('components.EditableText.cancel')}
            icon={<CloseSquareFilled className={classNames?.cancelIcon} style={styleNames?.cancelIcon} />}
            onClick={async (e) => {
              await handleCancel();
              cancelProps?.onClick?.(e);
            }}
            {...cancelProps}
          />
        </Space>
      </Form>
    </div>
  );
};

function pxToNumber(px: string | number | null | undefined) {
  return px ? parseFloat(px.toString().replace('px', '')) : 0;
}

export default EditableTextForm;
