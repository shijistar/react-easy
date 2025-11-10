import type { ComponentType, FC, ForwardedRef, ReactNode, RefAttributes } from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ButtonProps, FormInstance, ModalProps, SwitchProps } from 'antd';
import { Button, Form, Modal, Switch, Typography } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import { isForwardRef } from 'react-is';
import useContextValidator from '../../hooks/useContextValidator';

/**
 * - **EN:** Symbol for not closing the dialog when submitting the form, which takes effect when
 *   returning in the `onSave` event of the editing form component
 * - **CN:** 提交表单时不关闭弹框的Symbol，在编辑表单组件的`onSave`事件中返回时生效
 */
export const SubmitWithoutClosingSymbol = Symbol('[SubmitWithoutClose]');

export type ModalActionProps<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
> = Omit<ModalProps, 'onOk'> &
  ModalActionTrigger<FormData, P, TriggerProp, Event> & {
    /**
     * - **EN:** Form editing component, do not use the Form component inside the component, the form
     *   component and form instance are automatically created by the parent component
     * - **CN:** 表单编辑组件，组件内部不要使用Form组件，表单组件及表单实例由父组件自动创建
     */
    formComp: ComponentType<P & RefAttributes<Ref>>;
    /**
     * - **EN:** Props of the form editing component
     * - **CN:** 表单编辑组件的Props属性
     */
    formProps?: Omit<P, keyof FormCompPropsConstraint<FormData>>;
    /**
     * - **EN:** The callback when clicks the confirmation button, support asynchronous saving, return
     *   `SubmitWithoutClosingSymbol` can prevent the dialog from closing, return other values will
     *   be passed to the `afterOk` event, if any
     * - **CN:** 点击确认按钮的回调，支持异步保存，返回`SubmitWithoutClosingSymbol`可以阻止弹框关闭，返回其他值会传递给`afterOk`事件，如果有的话
     */
    onOk?: (
      formData: FormData,
      // @ts-expect-error: because TP[E] should be a function type
      ...args: Parameters<TriggerProp[Event]>
    ) => unknown | Promise<unknown>;
    /**
     * - **EN:** The callback after the confirmation event is completed, it will not be triggered when
     *   it fails, the parameter is the return value of `onOk`
     * - **CN:** 确认事件完成后的回调，失败时不会触发，参数为`onOk`的返回值
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterOk?: (data?: any) => void;
  };

export interface FormCompPropsConstraint<FormData> {
  /**
   * - **EN:** Automatically generated form instance, use this form instance in FormComp, do not
   *   create a new instance
   * - **CN:** 自动生成的表单实例，编辑表单要使用这个表单实例，不要新创建实例
   */
  form: FormInstance<FormData>;
  /**
   * - **EN:** Register the form save event, the callback function passed in will be called when the
   *   confirm button is clicked, support asynchronous saving
   * - **CN:** 注册表单保存事件，传入的回调函数会在点击确认按钮时被调用，支持异步保存
   *
   * @param handler Event handler | 事件处理函数
   */
  onSave: (
    handler: (
      /**
       * - **EN:** Form data
       * - **CN:** 表单数据
       */
      formData: FormData,
      /**
       * - **EN:** Trigger click event data, for example, for the `Switch` type trigger, you can get
       *   the value of the switch; for the `Button` type trigger, you can get the click event
       *   object of the button
       * - **CN:** 触发器点击的事件数据，例如，对于`Switch`类型的触发器，可以获取点击开关的值；对于`Button`类型的触发器，可以获取按钮的点击事件对象
       */
      ...triggerEventData: any[]
    ) => unknown | Promise<unknown>
  ) => void;
  /**
   * - **EN:** Listen to the open and close status of the dialog. When `destroyOnHidden` is set to
   *   false, the form component instance is cached, and the dialog can only be listened to in this
   *   way
   * - **CN:** 监听弹框打开关闭状态。当`destroyOnHidden`设置为false时，表单组件实例被缓存，只能通过这种方式监听弹框
   *
   * @param handler Event handler | 事件处理函数
   */
  onOpenChange: (handler: ModalProps['afterOpenChange']) => void;
  /**
   * - **EN:** Set the dialog open status
   * - **CN:** 设置弹框打开状态
   *
   * @param open Whether is open or not | 弹窗是否打开
   */
  setOpen: (open: boolean) => void;
  /**
   * - **EN:** Modify the properties of the dialog, such as title, width, button properties, etc.
   * - **CN:** 修改弹窗的属性，例如标题、宽度，按钮属性等
   */
  updateModalProps: (props: Partial<ModalProps>) => void;
  /**
   * - **EN:** Trigger click event data, for example, for the `Switch` type trigger, you can get the
   *   value of the switch; for the `Button` type trigger, you can get the click event object of the
   *   button
   * - **CN:** 触发器点击的事件数据，例如，对于`Switch`类型的触发器，可以获取点击开关的值，对于`Button`类型的触发器，可以获取按钮的点击事件对象
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggerEventData?: any[];
}

export interface ModalActionTrigger<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
> {
  /**
   * - **EN:** Trigger component, click to show the dialog
   * - **CN:** 弹窗触发器组件，点击触发显示弹框
   */
  triggerComponent?: ComponentType<TriggerProp> | FC<TriggerProp>;
  /**
   * - **EN:** Props of the trigger component
   * - **CN:** 触发器组件的Props属性
   */
  triggerProps?: TriggerProp & {
    /**
     * - **EN:** Set a custom function to determine whether to show the trigger button
     * - **CN:** 设置一个自定义函数，用于判断是否显示触发器按钮
     *
     * @default true
     *
     * @param formProps Form component props | 表单组件的props
     */
    show?: boolean | ((formProps?: Omit<P, keyof FormCompPropsConstraint<FormData>>) => boolean);
  };
  /**
   * - **EN:** The event name that triggers the dialog
   * - **CN:** 触发弹窗的事件名称
   * - `Button`: 'onClick'
   * - `Switch`: 'onChange'
   * - `Link`: 'onClick'
   */
  triggerEvent?: Event;
  /**
   * - **EN:** Custom trigger content
   * - **CN:** 自定义触发器内容
   */
  children?: ReactNode;
}
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type ModalActionRef<R = {}, FormData extends object = any> = R & {
  form: FormInstance<FormData> | undefined;
  /**
   * - **EN:** Show the dialog
   * - **CN:** 显示弹框
   */
  show: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const genModalActionRenderer = (defaultProps: Partial<ModalActionProps<any, any, any, never, never>>) => {
  const ModalActionRenderer = <
    FormData extends object,
    P extends FormCompPropsConstraint<FormData>,
    TriggerProp extends object,
    Event extends keyof TriggerProp,
    Ref extends object,
  >(
    props: ModalActionProps<FormData, P, TriggerProp, Event, Ref>,
    ref: ForwardedRef<ModalActionRef<Ref, FormData>>
  ) => {
    const [userModalProps, setUserModalProps] = useState<Partial<ModalProps>>({});
    let mergedProps = mergeProps<FormData, P, TriggerProp, Event, Ref>(defaultProps, props);
    mergedProps = mergeProps(mergedProps, userModalProps as typeof props);
    const {
      formComp,
      formProps,
      triggerComponent: Trigger = Button,
      triggerEvent = 'onClick' as Event,
      triggerProps,
      open: openInProps,
      destroyOnClose = true,
      destroyOnHidden = true,
      maskClosable = false,
      okButtonProps,
      cancelButtonProps,
      onOk,
      afterOk,
      onCancel,
      afterClose,
      children,
      ...restProps
    } = mergedProps;
    useContextValidator();
    const FormComp = formComp as ComponentType<FormCompPropsConstraint<FormData> & RefAttributes<Ref>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerEventArgsRef = useRef<any[]>(undefined);
    const [open, setOpen] = useState(false);
    const saveFuncRef = useRef<(formData: FormData, ...args: any[]) => unknown>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [formCompRef, setFormCompRef] = useState<Ref | null>(null);
    const [form, setForm] = useState<FormInstance<FormData>>();
    const formRef = useRef<FormInstance<FormData>>(form);
    formRef.current = form;
    const destroyOnCloseRef = useRef(destroyOnClose);
    destroyOnCloseRef.current = destroyOnClose || destroyOnHidden;
    const openListenerRef = useRef<ModalProps['afterOpenChange']>(undefined);

    // Listen to the open props changes
    useEffect(() => {
      if (openInProps) {
        setOpen(openInProps);
      }
    }, [openInProps]);

    // Reset the form after closed
    useEffect(() => {
      if (!destroyOnCloseRef.current && open && formRef.current) {
        formRef.current.resetFields();
      }
    }, [open]);

    // show trigger
    const showInProps = triggerProps?.show;
    const showTrigger = useMemo(() => {
      if (typeof showInProps === 'boolean') {
        return showInProps;
      } else if (typeof showInProps === 'function') {
        return showInProps(formProps);
      }
      return true;
    }, [showInProps, formProps]);

    // Show the dialog
    const showModal = useCallback(() => {
      setOpen(true);
      openListenerRef.current?.(true);
    }, []);
    // Hide the dialog
    const hideModal = useCallback(() => {
      setOpen(false);
      openListenerRef.current?.(false);
    }, []);
    // Set the dialog status listener
    const setOpenListener = useCallback(
      (listener: ModalProps['afterOpenChange']) => {
        openListenerRef.current = listener;
        // Call once when initialized
        openListenerRef.current?.(open);
      },
      [open]
    );
    // Receive the onSave callback method passed by the form component
    const setOnSaveHandler: FormCompPropsConstraint<FormData>['onSave'] = useCallback((handler) => {
      saveFuncRef.current = handler;
    }, []);
    // Set the dialog status and trigger the onOpenChange event of the form component
    const handleSetOpen = useCallback((open: boolean) => {
      setOpen(open);
      openListenerRef.current?.(open);
    }, []);

    // Output ref
    useImperativeHandle(ref, () => ({ ...formCompRef, form, show: showModal }) as ModalActionRef<Ref, FormData>, [
      formCompRef,
      showModal,
      form,
    ]);

    // Render the trigger component
    return (
      <>
        {showTrigger && (
          <Trigger
            {...triggerProps}
            // Trigger event
            {...((triggerEvent
              ? {
                  [triggerEvent]: (...args: any[]) => {
                    triggerEventArgsRef.current = args;
                    showModal();
                    if (triggerProps && typeof triggerProps[triggerEvent] === 'function') {
                      (triggerProps[triggerEvent] as (...args: any[]) => void)(...args);
                    }
                  },
                }
              : {}) as TriggerProp)}
          >
            {(triggerProps as { children?: ReactNode }).children ?? children}
          </Trigger>
        )}
        <Modal
          open={open}
          confirmLoading={isSaving}
          destroyOnClose={destroyOnClose}
          destroyOnHidden={destroyOnHidden}
          maskClosable={maskClosable}
          okButtonProps={{
            loading: isSaving,
            ...okButtonProps,
          }}
          cancelButtonProps={{
            disabled: isSaving,
            ...cancelButtonProps,
          }}
          onOk={async () => {
            let formData: FormData;
            try {
              formData = (await form?.validateFields()) as FormData;
            } catch (e) {
              // Validation error, should not throw error
              return;
            }
            if (Object.keys(formData).length === 0) {
              console.warn(
                'form.getFieldsValue() is empty. Please use the form instance passed to formComp instead of creating the form instance yourself.'
              );
            }
            try {
              setIsSaving(true);
              // First call onSave of the form component
              let result = await saveFuncRef.current?.(formData, ...(triggerEventArgsRef.current ?? []));
              // The onSave of the form component has the ability to prevent the dialog from closing
              if (result === SubmitWithoutClosingSymbol) {
                throw new Error('SubmitWithoutClosing');
              }
              // Then call onOk of the dialog, support asynchronous, and will pass the return value of onSave, if any
              if (onOk) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result = await onOk((result as FormData) ?? formData, ...((triggerEventArgsRef.current ?? []) as any));
              }
              // onOk also has the ability to prevent the dialog from closing
              if (result === SubmitWithoutClosingSymbol) {
                throw new Error('SubmitWithoutClosing');
              }
              // If onOK is successful, close the dialog and trigger the afterOk event
              hideModal();
              afterOk?.(result);
            } catch (error) {
              console.error(error);
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={async (e) => {
            hideModal();
            onCancel?.(e);
          }}
          afterClose={() => {
            hideModal();
            afterClose?.();
          }}
          {...restProps}
        >
          <FormCreator<FormData> onCreate={setForm} />
          {form && (
            <FormComp
              ref={isForwardRef(FormComp) ? setFormCompRef : undefined}
              {...formProps}
              form={form}
              onOpenChange={setOpenListener}
              onSave={setOnSaveHandler}
              triggerEventData={triggerEventArgsRef.current}
              setOpen={handleSetOpen}
              updateModalProps={setUserModalProps}
            />
          )}
        </Modal>
      </>
    );
  };
  return ModalActionRenderer;
};

function mergeProps<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
>(
  first?: Partial<ModalActionProps<FormData, P, TriggerProp, Event, Ref>>,
  second?: Partial<ModalActionProps<FormData, P, TriggerProp, Event, Ref>>
) {
  return {
    ...first,
    ...second,
    okButtonProps: {
      ...first?.okButtonProps,
      ...second?.okButtonProps,
    },
    cancelButtonProps: {
      ...first?.cancelButtonProps,
      ...second?.cancelButtonProps,
    },
    bodyProps: {
      ...first?.bodyProps,
      ...second?.bodyProps,
    },
    maskProps: {
      ...first?.maskProps,
      ...second?.maskProps,
    },
    wrapProps: {
      ...first?.wrapProps,
      ...second?.wrapProps,
    },
    formProps: {
      ...first?.formProps,
      ...second?.formProps,
    },
    triggerProps: {
      ...first?.triggerProps,
      ...second?.triggerProps,
      style: {
        ...(first?.triggerProps && 'style' in first.triggerProps && typeof first.triggerProps.style === 'object'
          ? first.triggerProps.style
          : {}),
        ...(second?.triggerProps && 'style' in second.triggerProps && typeof second.triggerProps.style === 'object'
          ? second.triggerProps.style
          : {}),
      },
    },
  } as unknown as ModalActionProps<FormData, P, TriggerProp, Event, Ref>;
}

function FormCreator<FD extends object>(props: { onCreate: (form: FormInstance<FD> | undefined) => void }) {
  const { onCreate } = props;
  const onCreateRef = useRef(onCreate);
  onCreateRef.current = onCreate;
  const [form] = Form.useForm<FD>();

  // output ref
  useEffect(() => {
    onCreateRef.current(form);
    return () => {
      onCreateRef.current(undefined);
    };
  }, [form]);

  return null;
}

/**
 * - **EN:** Add default properties to the ModalAction component
 * - **CN:** 给ModalAction组件添加默认属性
 *
 * @param WrappedComponent ModalAction component | ModalAction组件
 * @param defaultProps Default properties | 默认属性
 */
export const withDefaultModalActionProps = <
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
>(
  WrappedComponent: ComponentType<
    ModalActionProps<FormData, P, TriggerProp, Event, Ref> & RefAttributes<ModalActionRef<Ref, FormData>>
  >,
  defaultProps?:
    | Partial<ModalActionProps<FormData, P, TriggerProp, Event, Ref>>
    | ((
        /**
         * - **EN:** Actual properties passed to the ModalAction component
         * - **CN:** 实际传递给ModalAction组件的属性
         */
        actualProps: ModalActionProps<FormData, P, TriggerProp, Event, Ref>,
        /**
         * - **EN:** Ref of the ModalAction component. Note that this ref may be null because the
         *   component has not been rendered yet when executed for the first time.
         * - **CN:** ModalAction组件的ref对象。注意，该ref可能为null，因为第一次执行时组件还未渲染。
         */
        ref: ModalActionRef<Ref, FormData> | null
      ) => Partial<ModalActionProps<FormData, P, TriggerProp, Event, Ref>>)
) => {
  const WithDefaultProps = forwardRef<
    ModalActionRef<Ref, FormData>,
    ModalActionProps<FormData, P, TriggerProp, Event, Ref>
  >((props, ref) => {
    const modalActionRef = useRef<ModalActionRef<Ref, FormData>>(null);
    const useDefaultProps = typeof defaultProps === 'function' ? defaultProps : () => defaultProps;
    const defaults = useDefaultProps(props, modalActionRef.current);
    const mergedProps = typeof defaultProps === 'function' ? mergeProps(props, defaults) : mergeProps(defaults, props);
    WithDefaultProps.displayName = 'ForwardRef(WithDefaultProps)';

    useImperativeHandle(ref, () => modalActionRef.current as ModalActionRef<Ref, FormData>, []);

    return <WrappedComponent ref={modalActionRef} {...mergedProps} />;
  });
  return WithDefaultProps;
};

const renderModalAction = genModalActionRenderer({});
const forwardedModalAction = forwardRef(renderModalAction);
forwardedModalAction.displayName = 'ForwardRef(ModalAction)';
/**
 * - **EN:** ModalAction component type
 * - **CN:** ModalAction组件的类型
 */
export type ModalActionInterface<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
> = ComponentType<
  ModalActionProps<FormData, P, TriggerProp, Event, Ref> & RefAttributes<ModalActionRef<Ref, FormData>>
>;
/**
 * - **EN:** ModalAction component with generic type
 * - **CN:** ModalAction泛型组件的类型
 */
export type GenericModalActionInterface = <
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
>(
  props: ModalActionProps<FormData, P, TriggerProp, Event, Ref> & RefAttributes<ModalActionRef<Ref, FormData>>
) => ReactNode;
/**
 * - **EN:** ModalAction with specified trigger type (specified form component)
 * - **CN:** 已指定Trigger类型的ModalAction（并且已指定表单组件）
 */
type ModalActionWithTrigger<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
  OMIT extends string = never,
> = ComponentType<
  Omit<ModalActionProps<FormData, P, TriggerProp, Event, Ref>, 'triggerComponent' | 'triggerEvent' | OMIT> &
    RefAttributes<ModalActionRef<Ref, FormData>>
>;

/**
 * - **EN:** ModalAction with specified trigger type (unspecified form component, keep generic)
 * - **CN:** 已指定Trigger类型的ModalAction（未指定表单组件，保持泛型）
 */
type GenericModalActionWithTrigger<TP extends object, E extends keyof TP, OMIT extends string = never> = <
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  Ref extends object,
>(
  props: Omit<ModalActionProps<FormData, P, TP, E, Ref>, 'triggerComponent' | 'triggerEvent' | OMIT> &
    RefAttributes<ModalActionRef<Ref, FormData>>
) => ReactNode;

/**
 * - **EN:** Built-in trigger types (specified form components)
 * - **CN:** 内置的几种触发器类型（已指定表单组件）
 */
export interface TypedTriggers<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  Ref extends object,
  OMIT extends string = never,
> {
  /**
   * - **EN:** Dialog with button type trigger
   * - **CN:** 按钮类型的弹窗
   */
  Button: ModalActionWithTrigger<FormData, P, ButtonProps, 'onClick', Ref, 'triggerComponent' | 'triggerEvent' | OMIT>;
  /**
   * - **EN:** Dialog with switch type trigger
   * - **CN:** 开关类型的弹窗
   */
  Switch: ModalActionWithTrigger<FormData, P, SwitchProps, 'onChange', Ref, 'triggerComponent' | 'triggerEvent' | OMIT>;
  /**
   * - **EN:** Dialog with link type trigger
   * - **CN:** 链接类型的弹窗
   */
  Link: ModalActionWithTrigger<FormData, P, LinkProps, 'onClick', Ref, 'triggerComponent' | 'triggerEvent' | OMIT>;
}
/**
 * - **EN:** Built-in trigger types (generic types, unspecified form components)
 * - **CN:** 内置的几种触发器类型（泛型类型，未指定表单组件）
 */
interface GenericTypedTriggers<OMIT extends string = never> {
  /**
   * - **EN:** Dialog with button type trigger
   * - **CN:** 按钮类型的弹窗
   */
  Button: GenericModalActionWithTrigger<ButtonProps, 'onClick', 'triggerComponent' | 'triggerEvent' | OMIT>;
  /**
   * - **EN:** Dialog with switch type trigger
   * - **CN:** 开关类型的弹窗
   */
  Switch: GenericModalActionWithTrigger<SwitchProps, 'onChange', 'triggerComponent' | 'triggerEvent' | OMIT>;
  /**
   * - **EN:** Dialog with link type trigger
   * - **CN:** 链接类型的弹窗
   */
  Link: GenericModalActionWithTrigger<LinkProps, 'onClick', 'triggerComponent' | 'triggerEvent' | OMIT>;
}
type WithGenericTriggers<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  Ref extends object,
  OMIT extends string = never,
> = (<TriggerProp extends object, Event extends keyof TriggerProp>(
  props: Omit<ModalActionProps<FormData, P, TriggerProp, Event, Ref>, OMIT> &
    RefAttributes<ModalActionRef<Ref, FormData>>
) => ReactNode) &
  (P extends never ? GenericTypedTriggers<OMIT> : TypedTriggers<FormData, P, Ref, OMIT>);

/**
 * - **EN:** Add trigger types to the ModalAction component
 * - **CN:** 给ModalAction组件添加子触发器类型
 */
const addTriggers = <
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  OuterTriggerProp extends object,
  OuterEvent extends keyof OuterTriggerProp,
  Ref extends object,
  OMIT extends string = never,
>(
  comp: ComponentType<
    ModalActionProps<FormData, P, OuterTriggerProp, OuterEvent, Ref> & RefAttributes<ModalActionRef<Ref, FormData>>
  >
) => {
  const patchedComp = comp as WithGenericTriggers<FormData, P, Ref, OMIT>;
  // Type of button trigger
  patchedComp.Button = withDefaultModalActionProps(
    comp as ModalActionInterface<FormData, P, ButtonProps, 'onClick', Ref>,
    {
      triggerComponent: Button,
      triggerEvent: 'onClick',
      triggerProps: {},
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // Type of switch trigger
  patchedComp.Switch = withDefaultModalActionProps(
    comp as ModalActionInterface<FormData, P, SwitchProps, 'onChange', Ref>,
    {
      triggerComponent: Switch,
      triggerEvent: 'onChange',
      triggerProps: {},
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // Type of link trigger
  patchedComp.Link = withDefaultModalActionProps(comp as ModalActionInterface<FormData, P, LinkProps, 'onClick', Ref>, {
    triggerComponent: Typography.Link,
    triggerEvent: 'onClick',
    triggerProps: {
      style: { whiteSpace: 'nowrap' },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
  return patchedComp;
};

/**
 * - **EN:** Dialog component with trigger
 * - **CN:** 带触发器的弹窗组件
 */
const ModalAction = addTriggers(forwardedModalAction);

/**
 * - **EN:** Dialog component with trigger
 * - **CN:** 带触发器的弹窗组件
 */
export type ModalActionWithStatic = typeof ModalAction & {
  /**
   * - **EN:** Symbol for not closing the dialog when submitting the form, which takes effect when
   *   returning in the `onSave` event of the editing form component
   * - **CN:** 提交表单时不关闭弹框的Symbol，在编辑表单组件的`onSave`事件中返回时生效
   */
  SubmitWithoutClosing: symbol;
};
(ModalAction as ModalActionWithStatic).SubmitWithoutClosing = SubmitWithoutClosingSymbol;

/**
 * - **EN:** Generate a dialog component based on the editing form component
 * - **CN:** 基于编辑表单组件生成一个弹框组件
 *
 * @template FormData Form data type | 表单数据类型
 * @template P Form component props type | 表单组件的props类型
 * @template OuterTriggerProp Outer trigger props type | 外部触发器的props类型
 * @template OuterEvent Outer trigger event type | 外部触发器的事件类型
 * @template Ref Form component ref type | 表单组件的ref类型
 *
 * @param formComp Component of dialog content | 弹窗内容组件
 * @param defaultProps Default properties of the dialog | 弹窗的默认属性
 */
export function withModalAction<
  FormData extends object,
  P extends FormCompPropsConstraint<FormData>,
  OuterTriggerProp extends object,
  OuterEvent extends keyof OuterTriggerProp,
  Ref extends object,
>(
  formComp: ComponentType<P & FormCompPropsConstraint<FormData> & RefAttributes<Ref>>,
  defaultProps?:
    | Partial<ModalActionProps<FormData, P, OuterTriggerProp, OuterEvent, Ref>>
    | ((
        /**
         * - **EN:** Actual properties passed to the ModalAction component
         * - **CN:** 实际传递给ModalAction组件的属性
         */
        actualProps: ModalActionProps<FormData, P, OuterTriggerProp, OuterEvent, Ref>,
        /**
         * - **EN:** Ref of the ModalAction component. Note that this ref may be null because the
         *   component has not been rendered yet when executed for the first time.
         * - **CN:** ModalAction组件的ref对象。注意，该ref可能为null，因为第一次执行时组件还未渲染。
         */
        ref: ModalActionRef<Ref, FormData> | null
      ) => Partial<ModalActionProps<FormData, P, OuterTriggerProp, OuterEvent, Ref>>)
) {
  const ForwardedModalAction = forwardedModalAction as unknown as ModalActionInterface<
    FormData,
    P,
    OuterTriggerProp,
    OuterEvent,
    Ref
  >;
  const WithDefaultProps = forwardRef<
    ModalActionRef<Ref, FormData>,
    ModalActionProps<FormData, P, OuterTriggerProp, OuterEvent, Ref>
  >((props, ref) => {
    const modalActionRef = useRef<ModalActionRef<Ref, FormData>>(null);
    const useDefaultProps = typeof defaultProps === 'function' ? defaultProps : () => defaultProps;
    const defaults = useDefaultProps(props, modalActionRef.current);
    const mergedProps = typeof defaultProps === 'function' ? mergeProps(props, defaults) : mergeProps(defaults, props);
    WithDefaultProps.displayName = 'ForwardRef(WithDefaultProps)';

    useImperativeHandle(ref, () => modalActionRef.current as ModalActionRef<Ref, FormData>, []);

    return (
      <ForwardedModalAction
        ref={modalActionRef}
        formComp={formComp}
        {...(mergedProps as Partial<ModalActionProps<FormData, P, OuterTriggerProp, OuterEvent, Ref>>)}
      />
    );
  });
  return addTriggers<FormData, P, OuterTriggerProp, OuterEvent, Ref, 'formComp'>(WithDefaultProps);
}

export default ModalAction as ModalActionWithStatic;
